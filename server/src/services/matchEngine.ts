import db from '../db/index.js';

interface ItemForMatch {
  id: number;
  report_type: 'LOST' | 'FOUND';
  title: string;
  category_id: number;
  location_id: number;
  description: string;
  incident_date: string;
  primary_color: string;
  brand: string | null;
  reporter_id: number;
  building_name?: string;
  campus_zone?: string;
}

export function runMatchEngineForItem(targetItemId: number): number {
  const target = db.prepare(`
    SELECT i.*, l.building_name, l.campus_zone
    FROM items i
    JOIN locations l ON i.location_id = l.id
    WHERE i.id = ?
  `).get(targetItemId) as ItemForMatch | undefined;

  if (!target) return 0;

  const oppositeType = target.report_type === 'LOST' ? 'FOUND' : 'LOST';

  const candidates = db.prepare(`
    SELECT i.*, l.building_name, l.campus_zone
    FROM items i
    JOIN locations l ON i.location_id = l.id
    WHERE i.report_type = ?
      AND i.status IN ('ACTIVE', 'POSSIBLE_MATCH')
      AND i.reporter_id != ?
  `).all(oppositeType, target.reporter_id) as ItemForMatch[];

  let matchesGenerated = 0;

  const insertMatch = db.prepare(`
    INSERT INTO matches (lost_item_id, found_item_id, match_score, status)
    VALUES (?, ?, ?, 'SUGGESTED')
    ON CONFLICT(lost_item_id, found_item_id) DO UPDATE SET
      match_score = excluded.match_score,
      detected_at = CURRENT_TIMESTAMP
  `);

  const updateItemStatus = db.prepare(`
    UPDATE items SET status = 'POSSIBLE_MATCH' WHERE id = ? AND status = 'ACTIVE'
  `);

  const createNotification = db.prepare(`
    INSERT INTO notifications (user_id, title, message, type, reference_id)
    VALUES (?, ?, ?, 'MATCH', ?)
  `);

  for (const candidate of candidates) {
    let score = 0;

    // 1. Category match (30 pts)
    if (target.category_id === candidate.category_id) {
      score += 30;
    }

    // 2. Location match (25 pts building, 15 pts zone)
    if (target.location_id === candidate.location_id) {
      score += 25;
    } else if (target.campus_zone === candidate.campus_zone) {
      score += 15;
    }

    // 3. Date proximity (up to 20 pts)
    const targetDate = new Date(target.incident_date).getTime();
    const candidateDate = new Date(candidate.incident_date).getTime();
    const diffDays = Math.abs(targetDate - candidateDate) / (1000 * 3600 * 24);

    if (diffDays === 0) {
      score += 20;
    } else if (diffDays <= 3) {
      score += 15;
    } else if (diffDays <= 7) {
      score += 10;
    }

    // 4. Color match (10 pts)
    if (target.primary_color.toLowerCase() === candidate.primary_color.toLowerCase()) {
      score += 10;
    }

    // 5. Brand match (10 pts)
    if (target.brand && candidate.brand && target.brand.toLowerCase() === candidate.brand.toLowerCase()) {
      score += 10;
    }

    // 6. Keyword overlap (up to 15 pts)
    const targetTokens = new Set(`${target.title} ${target.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const candidateTokens = new Set(`${candidate.title} ${candidate.description}`.toLowerCase().split(/\W+/).filter(w => w.length > 3));

    let commonCount = 0;
    targetTokens.forEach(token => {
      if (candidateTokens.has(token)) commonCount++;
    });

    if (commonCount > 0) {
      score += Math.min(15, commonCount * 5);
    }

    // Threshold score >= 45 triggers a Suggested Match
    if (score >= 45) {
      const lostId = target.report_type === 'LOST' ? target.id : candidate.id;
      const foundId = target.report_type === 'FOUND' ? target.id : candidate.id;

      insertMatch.run(lostId, foundId, score);
      updateItemStatus.run(target.id);
      updateItemStatus.run(candidate.id);

      // Notify target reporter
      createNotification.run(
        target.reporter_id,
        'Potential Match Discovered!',
        `System identified a potential match (${score}% confidence) for "${target.title}".`,
        target.id
      );

      // Notify candidate reporter
      createNotification.run(
        candidate.reporter_id,
        'Potential Match Discovered!',
        `System identified a potential match (${score}% confidence) for "${candidate.title}".`,
        candidate.id
      );

      matchesGenerated++;
    }
  }

  return matchesGenerated;
}
