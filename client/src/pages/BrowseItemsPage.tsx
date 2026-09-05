import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, Item, Category, Location as CampusLocation } from '../services/api';
import { ItemCard } from '../components/ItemCard';
import { Search, Filter, RefreshCw, X, PackageCheck } from 'lucide-react';

export const BrowseItemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });

  // Filter States
  const [reportType, setReportType] = useState<string>(searchParams.get('type') || '');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category_id') || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('location_id') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync URL search params to local state
  useEffect(() => {
    setReportType(searchParams.get('type') || '');
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category_id') || '');
    setSelectedLocation(searchParams.get('location_id') || '');
    setSelectedStatus(searchParams.get('status') || '');
  }, [searchParams]);

  // Load master data
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.getCategories(),
          api.getLocations()
        ]);
        setCategories(catRes.categories);
        setLocations(locRes.locations);
      } catch (err) {
        console.error('Failed to load master filters:', err);
      }
    };

    loadMaster();
  }, []);

  // Fetch Items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: '12'
      };
      if (reportType) params.report_type = reportType;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedLocation) params.location_id = selectedLocation;
      if (selectedStatus) params.status = selectedStatus;

      const res = await api.getItems(params);
      setItems(res.items);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [reportType, searchTerm, selectedCategory, selectedLocation, selectedStatus, currentPage]);

  const handleClearFilters = () => {
    setReportType('');
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedStatus('');
    setCurrentPage(1);
    setSearchParams({});
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Campus Lost & Found Directory</h1>
          <p className="text-xs text-gray-500">Query and filter active lost and found reports logged across campus</p>
        </div>

        {/* Report Type Toggle Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl flex items-center space-x-1 shrink-0">
          <button
            onClick={() => updateFilter('type', '')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              !reportType ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Notices ({pagination.total})
          </button>

          <button
            onClick={() => updateFilter('type', 'LOST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              reportType === 'LOST' ? 'bg-[#D97706] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lost Items
          </button>

          <button
            onClick={() => updateFilter('type', 'FOUND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              reportType === 'FOUND' ? 'bg-[#1E3A2B] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Found Items
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', searchTerm)}
              placeholder="Search keyword..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => updateFilter('category_id', e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none text-gray-700"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => updateFilter('location_id', e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none text-gray-700"
            >
              <option value="">All Campus Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.building_name} ({l.campus_zone})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1E3A2B] focus:outline-none text-gray-700"
            >
              <option value="">All Item Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="POSSIBLE_MATCH">Match Detected</option>
              <option value="CLAIM_PENDING">Claim Pending</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

        </div>

        {/* Clear Filters Indicator */}
        {(reportType || searchTerm || selectedCategory || selectedLocation || selectedStatus) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500">Filters applied</span>
            <button
              onClick={handleClearFilters}
              className="text-[#D97706] hover:text-[#B45309] font-bold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Item Grid Results */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1E3A2B]" />
          <span>Searching campus database...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
          <PackageCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Item Reports Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            We couldn't find any reports matching your filter criteria. Try adjusting your keyword or clearing category filters.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-2 inline-flex items-center space-x-1 text-xs font-bold text-white bg-[#1E3A2B] hover:bg-[#15291E] px-4 py-2 rounded-xl transition-colors"
          >
            <span>Reset Search Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
