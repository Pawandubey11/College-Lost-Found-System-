import React, { useState, useEffect } from 'react';
import { api, AdminStats, User, Item, Claim } from '../services/api';
import { ShieldCheck, Users, FileText, Activity, MapPin, RefreshCw, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [hotspots, setHotspots] = useState<{ building_name: string; item_count: number }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'claims' | 'audit'>('users');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, repRes, claimsRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminReports(),
        api.getAdminClaims(),
        api.getAdminAuditLogs()
      ]);

      setStats(statsRes.stats);
      setHotspots(statsRes.hotspots);
      setUsers(usersRes.users);
      setReports(repRes.reports);
      setClaims(claimsRes.claims);
      setLogs(auditRes.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleItemStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await api.updateItemStatus(itemId, newStatus);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update item status.');
    }
  };

  const handleClaimDecision = async (claimId: number, decision: 'APPROVED' | 'REJECTED') => {
    try {
      await api.processClaimDecision(claimId, decision, 'Admin review decision.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to process claim.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#1F2923] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#2A3830]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#D97706]">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Institutional Governance Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold">Campus Administrator Console</h1>
          <p className="text-xs text-gray-300">Centralized system oversight, user role management, report moderation, and audit compliance</p>
        </div>

        <button
          onClick={loadAdminData}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20 transition-all flex items-center space-x-1.5 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Console</span>
        </button>
      </div>

      {/* Metrics Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-2xl font-extrabold text-gray-900">{stats.totalUsers}</span>
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Total Users</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-2xl font-extrabold text-[#D97706]">{stats.activeLost}</span>
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Lost</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-2xl font-extrabold text-[#1E3A2B]">{stats.activeFound}</span>
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Active Found</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-2xl font-extrabold text-emerald-700">{stats.returnedCount}</span>
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Recovered Items</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
            <span className="text-2xl font-extrabold text-amber-600">{stats.pendingClaims}</span>
            <span className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-1">Pending Claims</span>
          </div>
        </div>
      )}

      {/* Loss Hotspots Bar */}
      {hotspots.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-gray-900 font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#D97706]" />
            <span>Campus Loss Hotspots (Most Displaced Items)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {hotspots.map((h, idx) => (
              <div key={idx} className="bg-[#FAFAF7] p-3 rounded-xl border border-gray-200 text-center">
                <span className="block font-extrabold text-sm text-gray-900">{h.item_count} Items</span>
                <span className="text-xs text-gray-600 truncate block">{h.building_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Admin Tabbed Panels */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'users' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'reports' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Item Moderation Queue ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'claims' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Claim Arbitration ({claims.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 bg-gray-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>System Audit Logs ({logs.length})</span>
          </button>
        </div>

        {/* Tab 1: User Accounts Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#FAFAF7] text-gray-900 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Institutional Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Registered</th>
                  <th className="p-3 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">#{u.id}</td>
                    <td className="p-3 font-bold text-gray-900">{u.full_name}</td>
                    <td className="p-3 font-mono text-gray-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : u.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.department || 'N/A'}</td>
                    <td className="p-3 text-gray-500">{u.created_at || 'N/A'}</td>
                    <td className="p-3 text-right space-x-1">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleRoleChange(u.id, 'admin')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                        >
                          Make Admin
                        </button>
                      )}
                      {u.role !== 'staff' && (
                        <button
                          onClick={() => handleRoleChange(u.id, 'staff')}
                          className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-[10px] font-bold"
                        >
                          Make Staff
                        </button>
                      )}
                      {u.role !== 'student' && (
                        <button
                          onClick={() => handleRoleChange(u.id, 'student')}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-[10px] font-bold"
                        >
                          Make Student
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Item Moderation Queue */}
        {activeTab === 'reports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#FAFAF7] text-gray-900 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {reports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono">#{item.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${item.report_type === 'LOST' ? 'bg-[#D97706]' : 'bg-[#1E3A2B]'}`}>
                        {item.report_type}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-900 truncate max-w-[200px]">{item.title}</td>
                    <td className="p-3">{item.category_name}</td>
                    <td className="p-3">{item.building_name}</td>
                    <td className="p-3">{item.reporter_name}</td>
                    <td className="p-3 font-bold">{item.status}</td>
                    <td className="p-3 text-right space-x-1">
                      {item.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleItemStatusChange(item.id, 'RETURNED')}
                          className="px-2 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                        >
                          Returned
                        </button>
                      )}
                      {item.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleItemStatusChange(item.id, 'REJECTED')}
                          className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Claim Arbitration */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {claims.map((c) => {
              let answers: any = {};
              try { answers = JSON.parse(c.verification_answers_json); } catch {}
              return (
                <div key={c.id} className="p-4 bg-[#FAFAF7] rounded-xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">Claim ID #{c.id} for Item "{c.item_title}"</span>
                      <p className="text-gray-500">Claimant: {c.claimant_name} ({c.claimant_email}) | Finder: {c.reporter_name}</p>
                    </div>
                    <span className="font-bold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-[10px]">
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 font-mono text-gray-700">
                    <span className="font-bold block text-[10px] text-gray-400 uppercase">Verification Proof Answer:</span>
                    {answers.ownership_proof || 'No answer provided'}
                  </div>

                  {c.status === 'PENDING' && (
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={() => handleClaimDecision(c.id, 'REJECTED')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded font-bold"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleClaimDecision(c.id, 'APPROVED')}
                        className="px-3 py-1 bg-[#1E3A2B] text-white rounded font-bold"
                      >
                        Approve Claim
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#FAFAF7] text-gray-900 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3">#{l.id}</td>
                    <td className="p-3 text-gray-500">{l.created_at}</td>
                    <td className="p-3 font-bold">{l.user_name || 'System'}</td>
                    <td className="p-3 text-[#D97706] font-bold">{l.action}</td>
                    <td className="p-3">{l.target_type} #{l.target_id || 0}</td>
                    <td className="p-3 text-gray-600">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
