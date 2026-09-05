import React from 'react';
import { ShieldCheck, BookOpen, Scale, Lock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1F2923] text-gray-300 pt-12 pb-8 border-t border-[#2A3830]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded bg-[#D97706] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base">Campus Lost & Found</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Official institutional lost & found resolution engine. Centralizing item recovery, matching, and verified ownership returns across campus.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">System Access</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/browse?type=LOST" className="hover:text-white transition-colors">Reported Lost Items</a></li>
              <li><a href="/browse?type=FOUND" className="hover:text-white transition-colors">Found Items Board</a></li>
              <li><a href="/report-lost" className="hover:text-white transition-colors">Submit Lost Item Notice</a></li>
              <li><a href="/report-found" className="hover:text-white transition-colors">Submit Found Item Notice</a></li>
            </ul>
          </div>

          {/* SDG Alignment */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">SDG Alignment</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#D97706]" />
                <span>SDG 4: Quality Education</span>
              </li>
              <li className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-[#15803D]" />
                <span>SDG 16: Strong Institutions</span>
              </li>
              <li className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Privacy-First Architecture</span>
              </li>
            </ul>
          </div>

          {/* Institutional Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Campus Desk Support</h4>
            <p className="text-xs text-gray-400 mb-2">Central Security & Administrative Services</p>
            <p className="text-xs text-gray-300 font-mono">Location: Gate 1 Admin Building</p>
            <p className="text-xs text-gray-300 font-mono">Hours: Mon - Sat (08:00 - 18:00)</p>
            <p className="text-xs text-[#A7F3D0] mt-2 font-medium">Emergency Security Desk Contact Available</p>
          </div>

        </div>

        <div className="border-t border-[#2A3830] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Smart College Lost & Found System. Academic Mini-Project Production Build.</p>
          <div className="flex items-center space-x-1 mt-2 md:mt-0">
            <span>Built with care for institutional campus recovery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
