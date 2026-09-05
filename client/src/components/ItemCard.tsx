import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../services/api';
import { MapPin, Calendar, Tag, ShieldCheck, HelpCircle, PackageCheck } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isLost = item.report_type === 'LOST';

  const getStatusBadge = (status: Item['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Active Listing</span>;
      case 'POSSIBLE_MATCH':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Match Detected</span>;
      case 'CLAIM_PENDING':
        return <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Claim Pending Review</span>;
      case 'RETURNED':
        return <span className="bg-green-100 text-green-900 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><PackageCheck className="w-3 h-3"/> Recovered / Returned</span>;
      case 'CLOSED':
        return <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-medium">Closed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden group">
      
      {/* Image / Header Banner */}
      <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <PackageCheck className="w-12 h-12 mb-1 text-gray-300" />
            <span className="text-xs font-medium">No Image Uploaded</span>
          </div>
        )}

        {/* Report Type Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm text-white ${
              isLost ? 'bg-[#D97706]' : 'bg-[#1E3A2B]'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>
        </div>

        {/* Color Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-gray-200 shadow-xs">
            {item.primary_color}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[#1E3A2B] bg-[#1E3A2B]/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {item.category_name || 'Item Category'}
            </span>
            {getStatusBadge(item.status)}
          </div>

          <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-[#1E3A2B] transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date Details */}
        <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-500">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate font-medium text-gray-700">{item.building_name || 'Campus Location'}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{item.incident_date}</span>
            </div>
            {item.brand && (
              <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                {item.brand}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-2">
          <Link
            to={`/items/${item.id}`}
            className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#1F2923] hover:bg-[#1E3A2B] text-white py-2 px-3 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>View Full Details & Action</span>
          </Link>
        </div>

      </div>

    </div>
  );
};
