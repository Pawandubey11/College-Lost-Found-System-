import React, { useState } from 'react';
import { api, Item } from '../services/api';
import { ShieldCheck, AlertCircle, X, CheckCircle, Lock } from 'lucide-react';

interface ClaimModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, isOpen, onClose, onSuccess }) => {
  const [ownershipProof, setOwnershipProof] = useState('');
  const [lostDateApprox, setLostDateApprox] = useState('');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ownershipProof.trim().length < 10) {
      setError('Please provide a detailed ownership proof (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitClaim(item.id, {
        ownership_proof: ownershipProof,
        lost_date_approx: lostDateApprox,
        distinguishing_marks: distinguishingMarks,
        additional_notes: additionalNotes
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 border-b border-gray-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Submit Ownership Verification Claim</h2>
            <p className="text-xs text-gray-500">For item: <span className="font-semibold text-gray-800">{item.title}</span></p>
          </div>
        </div>

        {/* Security Privacy Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start space-x-2 text-xs text-amber-900">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Verification Security Policy</p>
            <p className="text-amber-800 mt-0.5">
              Your answers will be reviewed exclusively by the item finder and campus security admin to verify authentic ownership.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl mb-4 border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              1. Detailed Ownership Proof <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={ownershipProof}
              onChange={(e) => setOwnershipProof(e.target.value)}
              placeholder="Describe specific unmentioned details (e.g., wallet contents, phone lock screen wallpaper, engraving text, scratch marks, exact keys on key ring)..."
              className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                2. Approximate Date/Time Lost
              </label>
              <input
                type="text"
                value={lostDateApprox}
                onChange={(e) => setLostDateApprox(e.target.value)}
                placeholder="e.g. Sept 3, around 2:30 PM"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                3. Unique Serial / Brand Details
              </label>
              <input
                type="text"
                value={distinguishingMarks}
                onChange={(e) => setDistinguishingMarks(e.target.value)}
                placeholder="e.g. Model number, specific sticker"
                className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              4. Additional Notes for Reviewer
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Can meet at Gate 1 security desk after 4 PM"
              className="w-full text-xs p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A2B] hover:bg-[#15291E] rounded-xl shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              <span>{submitting ? 'Submitting Claim...' : 'Confirm & Submit Claim'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
