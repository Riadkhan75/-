import React, { useState, useEffect } from 'react';
import { Megaphone, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { getActiveAnnouncements } from '../services/firestoreService';
import { Announcement } from '../types';

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const list = await getActiveAnnouncements();
        setAnnouncements(list);
      } catch (err) {
        console.warn('Error fetching announcements:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  if (closed || announcements.length === 0) return null;

  const current = announcements[0];

  const bgStyles = {
    urgent: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
    info: 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white',
    success: 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white'
  }[current.type] || 'bg-slate-900 text-white';

  return (
    <div className={`relative px-4 py-2.5 shadow-xs transition-all ${bgStyles}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="p-1 rounded-md bg-white/20 shrink-0">
            <Megaphone className="w-4 h-4" />
          </span>
          <span className="font-bold underline decoration-white/40 underline-offset-2 shrink-0">
            {current.title}:
          </span>
          <span className="truncate text-white/90">
            {current.content}
          </span>
        </div>

        <button
          onClick={() => setClosed(true)}
          className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white shrink-0 ml-2"
          aria-label="নোটিশ বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
