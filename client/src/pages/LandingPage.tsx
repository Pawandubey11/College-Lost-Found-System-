import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Item, Category } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { Search, PlusCircle, ShieldCheck, RefreshCw, BookOpen, Scale, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 4, activeLost: 2, activeFound: 2, returnedCount: 1, recoveryRate: 20 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, catRes, adminStatsRes] = await Promise.all([
          api.getItems({ limit: '6' }),
          api.getCategories(),
          api.getAdminStats().catch(() => ({ stats: { totalUsers: 4, activeLost: 2, activeFound: 2, returnedCount: 1, recoveryRate: 20 } }))
        ]);
        setRecentItems(itemsRes.items);
        setCategories(catRes.categories);
        if (adminStatsRes?.stats) {
          setStats(adminStatsRes.stats);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative bg-[#1E3A2B] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-lg border-b border-[#2A4D3B]">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAFAF7_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center space-x-2 bg-white/10 text-[#A7F3D0] px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs border border-white/15">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>Campus Security & Student Services</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Centralized Lost & Found Portal <br />
            <span className="text-[#FBBF24]">Official Campus Recovery Desk</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Search reported items, submit lost or found notices, and verify ownership through official campus administrative channels.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-white rounded-2xl p-2 shadow-2xl border border-gray-100">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items by name, color, brand, or location (e.g. Black Wallet, Sony Headphones, Library)..."
              className="w-full text-sm text-gray-900 px-3 py-2 focus:outline-none placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all shrink-0"
            >
              Search Items
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/report-lost"
              className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-transform hover:scale-105 flex items-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report-found"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-bold border border-white/20 transition-all flex items-center space-x-2"
            >
              <Search className="w-5 h-5" />
              <span>I Found Something</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Metrics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="block text-2xl font-extrabold text-[#1E3A2B]">{stats.activeLost}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Lost Notices</span>
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-[#D97706]">{stats.activeFound}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Found Notices</span>
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-emerald-700">{stats.returnedCount}</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items Returned</span>
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-[#1E3A2B]">{stats.recoveryRate}%</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recovery Success Rate</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Item Categories</h2>
            <p className="text-xs text-gray-500">Filter lost and found reports by campus category</p>
          </div>
          <Link to="/browse" className="text-xs font-bold text-[#1E3A2B] hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/browse?category_id=${cat.id}`}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs hover:shadow-md hover:border-[#1E3A2B] transition-all text-center group"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-[#1E3A2B]/10 text-[#1E3A2B] flex items-center justify-center font-bold mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-[#1E3A2B]">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Recently Reported Reports</h2>
            <p className="text-xs text-gray-500">Latest active lost and found entries on campus</p>
          </div>
          <Link to="/browse" className="text-xs font-bold text-[#1E3A2B] hover:underline flex items-center space-x-1">
            <span>Browse Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 text-sm">Loading campus listings...</div>
        ) : recentItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 text-gray-500 text-xs">
            No item reports logged yet. Be the first to report a lost or found item.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="bg-white border-y border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">How the Recovery System Works</h2>
            <p className="text-xs text-gray-500">A secure 4-step verified workflow ensuring items reach genuine owners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#FAFAF7] p-6 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E3A2B] text-white flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-bold text-sm text-gray-900">Report Notice</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Log item details with location, date, attributes, and optional photo.</p>
            </div>

            <div className="bg-[#FAFAF7] p-6 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-bold text-sm">2</div>
              <h3 className="font-bold text-sm text-gray-900">Rule-Based Match Scan</h3>
              <p className="text-xs text-gray-600 leading-relaxed">System automatically scores similarity between lost & found entries.</p>
            </div>

            <div className="bg-[#FAFAF7] p-6 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#15803D] text-white flex items-center justify-center font-bold text-sm">3</div>
              <h3 className="font-bold text-sm text-gray-900">Ownership Claim Proof</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Claimant provides hidden identifying details to verify true ownership.</p>
            </div>

            <div className="bg-[#FAFAF7] p-6 rounded-2xl border border-gray-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#1F2923] text-white flex items-center justify-center font-bold text-sm">4</div>
              <h3 className="font-bold text-sm text-gray-900">Safe Handover</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Item is collected at Central Security Desk or verified meetup.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic SDG Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1E3A2B] text-white rounded-2xl p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2 text-[#FBBF24] text-xs font-bold uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>UN Sustainable Development Goals Alignment</span>
            </div>
            <h3 className="text-xl font-bold">Supporting Institutional Governance & Quality Education</h3>
            <p className="text-xs text-gray-200 leading-relaxed">
              Mapped directly to <strong>SDG 4 (Quality Education)</strong> by ensuring students do not lose critical academic tools, and <strong>SDG 16 (Peace, Justice & Strong Institutions)</strong> through transparent, audited lost item governance.
            </p>
          </div>
          <Link
            to="/browse"
            className="bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-sm transition-transform hover:scale-105 shrink-0"
          >
            Explore System Directory
          </Link>
        </div>
      </section>

    </div>
  );
};
