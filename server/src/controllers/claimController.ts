import { Response } from 'express';
import { z } from 'zod';
import db from '../db/index.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const claimSchema = z.object({
  verification_answers: z.object({
    ownership_proof: z.string().min(10, 'Detailed ownership proof is required (at least 10 characters)'),
    lost_date_approx: z.string().optional(),
    distinguishing_marks: z.string().optional(),
    additional_notes: z.string().optional()
  })
});

export function submitClaim(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const itemIdStr = req.params.itemId as string;
  const itemId = parseInt(itemIdStr, 10);
  if (isNaN(itemId)) {
    res.status(400).json({ error: 'Invalid item ID.' });
    return;
  }

  try {
    const validatedData = claimSchema.parse(req.body);

    const item = db.prepare('SELECT id, report_type, status, reporter_id, title FROM items WHERE id = ?').get(itemId) as { id: number; report_type: string; status: string; reporter_id: number; title: string } | undefined;

    if (!item) {
      res.status(404).json({ error: 'Item report not found.' });
      return;
    }

    if (item.reporter_id === req.user.id) {
      res.status(400).json({ error: 'You cannot file a claim on your own reported item.' });
      return;
    }

    if (item.status === 'RETURNED' || item.status === 'CLOSED') {
      res.status(400).json({ error: 'This item has already been marked as returned or closed.' });
      return;
    }

    // Check existing pending claim by user
    const existingClaim = db.prepare("SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status = 'PENDING'").get(itemId, req.user.id);
    if (existingClaim) {
      res.status(400).json({ error: 'You already have an active pending claim for this item.' });
      return;
    }

    // Insert claim
    const answersJson = JSON.stringify(validatedData.verification_answers);
    const result = db.prepare(`
      INSERT INTO claims (item_id, claimant_id, verification_answers_json, status)
      VALUES (?, ?, ?, 'PENDING')
    `).run(itemId, req.user.id, answersJson);

    const claimId = Number(result.lastInsertRowid);

    // Update item status
    db.prepare("UPDATE items SET status = 'CLAIM_PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(itemId);

    // Notify item reporter (finder)
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, reference_id)
      VALUES (?, 'New Claim Filed!', ?, 'CLAIM_UPDATE', ?)
    `).run(
      item.reporter_id,
      `${req.user.full_name} has submitted an ownership claim for your found report: "${item.title}".`,
      claimId
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES (?, 'SUBMIT_CLAIM', 'CLAIM', ?, ?)
    `).run(req.user.id, claimId, `Claim filed for item ID ${itemId}`);

    res.status(201).json({
      message: 'Claim submitted successfully. The finder or campus admin will review your verification proof.',
      claimId
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error('submitClaim error details:', error);
    res.status(500).json({ error: (error as Error).message || 'Failed to submit claim.' });
  }
}

export function getMyClaims(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const claims = db.prepare(`
      SELECT 
        claims.id, claims.item_id, claims.status, claims.verification_answers_json, claims.created_at, claims.admin_notes,
        items.title as item_title, items.report_type, items.image_url, items.primary_color,
        c.name as category_name, l.building_name,
        u.full_name as reporter_name
      FROM claims
      JOIN items ON claims.item_id = items.id
      JOIN categories c ON items.category_id = c.id
      JOIN locations l ON items.location_id = l.id
      JOIN users u ON items.reporter_id = u.id
      WHERE claims.claimant_id = ?
      ORDER BY claims.created_at DESC
    `).all(req.user.id);

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user claims.' });
  }
}

export function getReceivedClaims(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const claims = db.prepare(`
      SELECT 
        claims.id, claims.item_id, claims.status, claims.verification_answers_json, claims.created_at, claims.admin_notes,
        items.title as item_title, items.report_type, items.image_url,
        claimant.full_name as claimant_name, claimant.email as claimant_email, claimant.phone_number as claimant_phone
      FROM claims
      JOIN items ON claims.item_id = items.id
      JOIN users claimant ON claims.claimant_id = claimant.id
      WHERE items.reporter_id = ? OR ? = 'admin'
      ORDER BY claims.created_at DESC
    `).all(req.user.id, req.user.role);

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch received claims.' });
  }
}

export function processClaimDecision(req: AuthRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const claimIdStr = req.params.claimId as string;
  const claimId = parseInt(claimIdStr, 10);
  const { decision, admin_notes } = req.body; // 'APPROVED' or 'REJECTED'

  if (!['APPROVED', 'REJECTED'].includes(decision)) {
    res.status(400).json({ error: 'Decision must be APPROVED or REJECTED.' });
    return;
  }

  try {
    const claim = db.prepare(`
      SELECT claims.*, items.reporter_id, items.title as item_title
      FROM claims
      JOIN items ON claims.item_id = items.id
      WHERE claims.id = ?
    `).get(claimId) as any;

    if (!claim) {
      res.status(404).json({ error: 'Claim record not found.' });
      return;
    }

    if (claim.reporter_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to process this claim decision.' });
      return;
    }

    db.prepare(`
      UPDATE claims
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(decision, admin_notes || null, claimId);

    if (decision === 'APPROVED') {
      // Mark item as RETURNED
      db.prepare("UPDATE items SET status = 'RETURNED', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(claim.item_id);

      // Notify claimant of approval and return instructions
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, reference_id)
        VALUES (?, 'Claim Approved', ?, 'CLAIM_UPDATE', ?)
      `).run(
        claim.claimant_id,
        `Your claim for "${claim.item_title}" was APPROVED! Please report to Security Desk with your ID to collect your item.`,
        claim.item_id
      );

      // Reject all other pending claims on this item
      db.prepare("UPDATE claims SET status = 'REJECTED', admin_notes = 'Item returned to verified owner.' WHERE item_id = ? AND id != ? AND status = 'PENDING'").run(claim.item_id, claimId);

    } else {
      // Notify claimant of rejection
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, reference_id)
        VALUES (?, 'Claim Review Update', ?, 'CLAIM_UPDATE', ?)
      `).run(
        claim.claimant_id,
        `Your claim for "${claim.item_title}" was reviewed and could not be verified. ${admin_notes || ''}`,
        claim.item_id
      );

      // Reset item status to ACTIVE if no other pending claims
      const remainingClaims = db.prepare("SELECT COUNT(*) as count FROM claims WHERE item_id = ? AND status = 'PENDING'").get(claim.item_id) as { count: number };
      if (remainingClaims.count === 0) {
        db.prepare("UPDATE items SET status = 'ACTIVE' WHERE id = ?").run(claim.item_id);
      }
    }

    res.json({ message: `Claim decision updated to ${decision}.` });
  } catch (error) {
    console.error('processClaimDecision error:', error);
    res.status(500).json({ error: 'Failed to process claim decision.' });
  }
}
