import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, Item } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClaimModal } from '../components/ClaimModal';
import { ShieldCheck, MapPin, Calendar, Tag, Lock, AlertCircle, RefreshCw, ArrowLeft, PackageCheck, User as UserIcon, Sparkles } from 'lucide-react';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState(false);

  const loadItemDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getItemById(parseInt(id, 10));
      setItem(data.item);
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch item details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItemDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500 text-sm flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#1E3A2B]" />
        <span>Loading item record...</span>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Item Not Found</h2>
        <p className="text-xs text-gray-600">{error || 'The requested item report does not exist or has been removed.'}</p>
        <Link to="/browse" className="inline-flex items-center space-x-1 text-xs font-bold text-white bg-[#1E3A2B] px-4 py-2 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const isLost = item.report_type === 'LOST';
  const isOwner = user && user.id === item.reporter_id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation & Success Alert */}
      <div className="flex items-center justify-between">
        <Link to="/browse" className="inline-flex items-center space-x-1 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>

        {claimSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2 rounded-xl border border-emerald-200 font-bold flex items-center space-x-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>Verification claim submitted successfully! Track status in My Claims.</span>
          </div>
        )}
      </div>

      {/* Main Item Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Item Image Preview */}
        <div className="relative bg-gray-100 min-h-[300px] flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-200">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="max-h-[380px] w-auto object-contain rounded-xl shadow-xs"
            />
          ) : (
            <div className="text-center text-gray-400 p-8">
              <PackageCheck className="w-16 h-16 mx-auto mb-2 text-gray-300" />
              <span className="text-xs font-semibold">No Photograph Attached</span>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-sm ${isLost ? 'bg-[#D97706]' : 'bg-[#1E3A2B]'}`}>
              {isLost ? 'Lost Item' : 'Found Item'}
            </span>
          </div>
        </div>

        {/* Item Metadata */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#1E3A2B] bg-[#1E3A2B]/10 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {item.category_name}
              </span>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                Status: {item.status}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{item.title}</h1>

            <p className="text-xs text-gray-700 leading-relaxed bg-[#FAFAF7] p-4 rounded-xl border border-gray-200">
              {item.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="flex items-center space-x-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Campus Building</span>
                  <span className="font-semibold text-gray-800">{item.building_name} ({item.campus_zone})</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Incident Date</span>
                  <span className="font-semibold text-gray-800">{item.incident_date} {item.incident_time || ''}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-semibold">
                Color: {item.primary_color}
              </span>
              {item.brand && (
                <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-semibold">
                  Brand: {item.brand}
                </span>
              )}
              {item.distinguishing_features && (
                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md font-semibold">
                  Features: {item.distinguishing_features}
                </span>
              )}
            </div>
          </div>

          {/* Reporter & Action Section */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#1E3A2B] text-white flex items-center justify-center font-bold text-[10px]">
                  {item.reporter_name ? item.reporter_name.charAt(0) : 'U'}
                </div>
                <span>Reported by: <strong className="text-gray-800">{item.reporter_name || 'Verified Campus User'}</strong> ({item.reporter_role})</span>
              </div>
              <span className="text-[11px] text-gray-400">{item.created_at}</span>
            </div>

            {/* Action Buttons */}
            {!isOwner && (
              <div>
                {user ? (
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    disabled={item.status === 'RETURNED' || item.status === 'CLOSED'}
                    className="w-full bg-[#1E3A2B] hover:bg-[#15291E] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                    <span>Claim Ownership of This Item</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full bg-[#D97706] hover:bg-[#B45309] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2 text-center"
                  >
                    <span>Log In to File Ownership Claim</span>
                  </Link>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Hidden Details Verification Section */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-gray-900 font-bold text-sm">
          <Lock className="w-4 h-4 text-[#D97706]" />
          <h3>Hidden Identification Attribute</h3>
        </div>

        {item.hidden_details ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 font-mono space-y-1">
            <span className="font-bold block uppercase text-[10px] text-amber-700">Verified Hidden Detail (Owner / Admin Access Only):</span>
            <p>{item.hidden_details}</p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs text-gray-500 leading-relaxed">
            Hidden verification details (such as cash amounts, key ring inscriptions, or serial numbers) are masked from public view to prevent unauthorized claims.
          </div>
        )}
      </div>

      {/* Suggested Rule-Based Matches Section */}
      {matches.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-[#1E3A2B] font-bold text-base">
            <Sparkles className="w-5 h-5 text-[#D97706]" />
            <h3>Rule-Based Suggested Potential Matches ({matches.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div key={m.match_id} className="bg-[#FAFAF7] rounded-xl p-4 border border-gray-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#D97706] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {m.match_score}% Confidence Match
                    </span>
                    <span className="text-xs text-gray-500">{m.building_name}</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{m.title}</h4>
                  <p className="text-xs text-gray-500">Date: {m.incident_date} | Color: {m.primary_color}</p>
                </div>

                <Link
                  to={`/items/${m.matched_item_id}`}
                  className="bg-[#1E3A2B] hover:bg-[#15291E] text-white text-xs font-bold px-3 py-2 rounded-lg shrink-0"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {item && (
        <ClaimModal
          item={item}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={() => {
            setClaimSuccessMsg(true);
            loadItemDetails();
          }}
        />
      )}

    </div>
  );
};
