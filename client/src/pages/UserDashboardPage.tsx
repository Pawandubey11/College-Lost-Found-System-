import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Item, Claim } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Search, PackageCheck, ShieldCheck, RefreshCw, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState<Item[]>([]);
  const [receivedClaims, setReceivedClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'claims'>('reports');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [repRes, claimRes] = await Promise.all([
        api.getMyReports(),
        api.getReceivedClaims().catch(() => ({ claims: [] }))
      ]);
      setReports(repRes.reports);
      setReceivedClaims(claimRes.claims);
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await api.updateItemStatus(itemId, newStatus);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to update item status.');
    }
  };

  const handleClaimDecision = async (claimId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.processClaimDecision(claimId, decision);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to process claim.');
    }
  };

  const activeLostCount = reports.filter((r) => r.report_type === 'LOST' && r.status !== 'RETURNED').length;
  const activeFoundCount = reports.filter((r) => r.report_type === 'FOUND' && r.status !== 'RETURNED').length;
  const returnedCount = reports.filter((r) => r.status === 'RETURNED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#1E3A2B] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#2A4D3B]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-[#D97706]" />
            <h1 className="text-2xl font-extrabold">Welcome back, {user?.full_name}</h1>
          </div>
          <p className="text-xs text-gray-200">
            Role: <strong className="uppercase text-amber-300">{user?.role}</strong> | Department: {user?.department || 'General Campus Member'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/report-lost"
            className="bg-[#D97706] hover:bg-[#B45309] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report-found"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-2xl font-extrabold text-gray-900">{reports.length}</span>
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Reports Logged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-2xl font-extrabold text-[#D97706]">{activeLostCount}</span>
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Lost Items</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-2xl font-extrabold text-[#1E3A2B]">{activeFoundCount}</span>
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Found Items</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-2xl font-extrabold text-emerald-600">{returnedCount}</span>
          <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Items Recovered</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reports' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
              }`}
            >
              My Reported Items ({reports.length})
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'claims' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
              }`}
            >
              Claims Received on My Items ({receivedClaims.length})
            </button>
          </div>

          <button onClick={loadDashboard} className="text-xs text-gray-500 hover:text-gray-800 flex items-center space-x-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Content: My Reports */}
        {activeTab === 'reports' && (
          <div>
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500">Loading user reports...</div>
            ) : reports.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                You have not submitted any lost or found item reports yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reports.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center border border-gray-200">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <PackageCheck className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${item.report_type === 'LOST' ? 'bg-[#D97706]' : 'bg-[#1E3A2B]'}`}>
                            {item.report_type}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">{item.category_name}</span>
                          <span className="text-xs text-gray-400">• {item.incident_date}</span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 mt-0.5">{item.title}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-md">{item.building_name} ({item.campus_zone})</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        to={`/items/${item.id}`}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg"
                      >
                        Inspect
                      </Link>

                      {item.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'RETURNED')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Returned</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Claims Received */}
        {activeTab === 'claims' && (
          <div>
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500">Loading received claims...</div>
            ) : receivedClaims.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
                No ownership verification claims submitted for your items yet.
              </div>
            ) : (
              <div className="space-y-4">
                {receivedClaims.map((c) => {
                  let answers: any = {};
                  try { answers = JSON.parse(c.verification_answers_json); } catch {}
                  return (
                    <div key={c.id} className="p-4 bg-[#FAFAF7] rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">Claim for Item: <strong className="text-gray-900">{c.item_title}</strong></span>
                          <p className="text-xs text-gray-700">Claimant: <strong>{c.claimant_name}</strong> ({c.claimant_email})</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          c.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          c.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-800 space-y-1">
                        <span className="font-bold text-[10px] text-gray-400 uppercase block">Verification Proof Provided by Claimant:</span>
                        <p className="font-mono text-gray-700">{answers.ownership_proof || 'No answer provided'}</p>
                        {answers.distinguishing_marks && <p className="text-gray-500">Marks: {answers.distinguishing_marks}</p>}
                      </div>

                      {c.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleClaimDecision(c.id, 'REJECTED')}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => handleClaimDecision(c.id, 'APPROVED')}
                            className="px-4 py-1.5 bg-[#1E3A2B] hover:bg-[#15291E] text-white text-xs font-bold rounded-lg flex items-center space-x-1"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                            <span>Approve Ownership Proof</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
