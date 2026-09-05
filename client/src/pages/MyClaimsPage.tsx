import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Claim } from '../services/api';
import { FileText, ShieldCheck, Clock, CheckCircle2, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const MyClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyClaims = async () => {
    setLoading(true);
    try {
      const res = await api.getMyClaims();
      setClaims(res.claims);
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyClaims();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Ownership Verification Claims</h1>
          <p className="text-xs text-gray-500">Track status of claims filed on found campus items</p>
        </div>

        <button onClick={loadMyClaims} className="text-xs text-gray-500 hover:text-gray-800 flex items-center space-x-1">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Loading your submitted claims...</div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Claims Submitted Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When you see a found item report that belongs to you, click "Claim Ownership" to submit your proof.
          </p>
          <Link to="/browse?type=FOUND" className="inline-flex items-center space-x-1 text-xs font-bold text-white bg-[#1E3A2B] px-4 py-2 rounded-xl">
            <span>Browse Found Items Board</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            let answers: any = {};
            try { answers = JSON.parse(claim.verification_answers_json); } catch {}

            return (
              <div key={claim.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Claim ID #{claim.id} • Filed on {claim.created_at}</span>
                    <h3 className="font-bold text-base text-gray-900">{claim.item_title}</h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {claim.status === 'APPROVED' && (
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claim Approved - Ready for Pickup</span>
                      </span>
                    )}
                    {claim.status === 'REJECTED' && (
                      <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Claim Rejected</span>
                      </span>
                    )}
                    {claim.status === 'PENDING' && (
                      <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Under Verification Review</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Proof Submitted */}
                <div className="bg-[#FAFAF7] p-4 rounded-xl border border-gray-200 text-xs space-y-1">
                  <span className="font-bold text-[10px] text-gray-400 uppercase block">Your Submitted Ownership Proof:</span>
                  <p className="font-mono text-gray-800">{answers.ownership_proof || 'N/A'}</p>
                  {answers.lost_date_approx && <p className="text-gray-500">Approx Date: {answers.lost_date_approx}</p>}
                </div>

                {/* Admin / Finder Notes */}
                {claim.admin_notes && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900">
                    <strong>Reviewer Instructions:</strong> {claim.admin_notes}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500">Item Found Location: <strong>{claim.building_name}</strong></span>
                  <Link to={`/items/${claim.item_id}`} className="text-[#1E3A2B] font-bold hover:underline">
                    View Item Page →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
