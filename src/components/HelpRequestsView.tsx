import React, { useState, useEffect } from 'react';
import { 
  HandHeart, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  FileSearch,
  AlertCircle
} from 'lucide-react';
import { getPublicHelpRequests } from '../services/firestoreService';
import { HelpRequest, HelpCategory, HELP_CATEGORY_LABELS, HELP_STATUS_LABELS, BD_DISTRICTS } from '../types';
import { formatTaka, toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';

interface HelpRequestsViewProps {
  onOpenHelpModal?: () => void;
  onNavigate?: (tab: string) => void;
}

export const HelpRequestsView: React.FC<HelpRequestsViewProps> = ({ onOpenHelpModal, onNavigate }) => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchRef, setSearchRef] = useState<string>('');
  const [searchedRequest, setSearchedRequest] = useState<HelpRequest | null>(null);
  const [searchNotFound, setSearchNotFound] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const list = await getPublicHelpRequests();
        setRequests(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleSearchRef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    const found = requests.find(r => r.referenceNo.toLowerCase() === searchRef.trim().toLowerCase());
    if (found) {
      setSearchedRequest(found);
      setSearchNotFound(false);
    } else {
      setSearchedRequest(null);
      setSearchNotFound(true);
    }
  };

  const filtered = requests.filter(r => {
    const catMatch = selectedCategory === 'all' || r.category === selectedCategory;
    const distMatch = selectedDistrict === 'all' || r.district === selectedDistrict;
    return catMatch && distMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-teal-100">
            <HandHeart className="w-3.5 h-3.5" />
            যাচাইকৃত মানবিক সাহায্য পোর্টাল
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            নাগরিক সাহায্য আবেদন ও অনুসন্ধান
          </h1>
          <p className="text-sm sm:text-base text-teal-100 leading-relaxed">
            অসহায় মানুষের চিকিৎসা, শিক্ষা ও বেঁচে থাকার লড়াইয়ে সহমর্মিতার হাত বাড়িয়ে দিন। প্রতিটি আবেদন মাঠপর্যায়ে তদন্তের পর অনুমোদিত হয়।
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate ? onNavigate('apply-help') : onOpenHelpModal?.()}
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              নতুন সাহায্যের আবেদন জমা দিন
            </button>
          </div>
        </div>
      </div>

      {/* Reference Search Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchRef} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="grow w-full relative">
            <FileSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              placeholder="আবেদনের রেফারেন্স নম্বর দিয়ে ট্র্যাক করুন (উদাঃ MS-2026-XXXX)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            অবস্থা খুঁজুন
          </button>
        </form>

        {searchedRequest && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{searchedRequest.title}</span>
              <span className={`px-2 py-0.5 rounded-full font-bold border ${HELP_STATUS_LABELS[searchedRequest.status]?.color}`}>
                {HELP_STATUS_LABELS[searchedRequest.status]?.label}
              </span>
            </div>
            <div className="text-slate-600">রেফারেন্স: {searchedRequest.referenceNo} | এলাকা: {searchedRequest.district}</div>
            {searchedRequest.adminNotes && (
              <p className="text-slate-700 font-medium">যাচাইকরণ নোট: {searchedRequest.adminNotes}</p>
            )}
          </div>
        )}

        {searchNotFound && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>এই রেফারেন্স নম্বরের কোনো অনুমোদিত আবেদন পাওয়া যায়নি। আপনার রেফারেন্স নম্বর ঠিক আছে কিনা যাচাই করুন।</span>
          </div>
        )}
      </div>

      {/* Filter and Content Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              সকল বিভাগ
            </button>
            {Object.entries(HELP_CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === key
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-48 shrink-0">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none bg-white font-medium"
            >
              <option value="all">সকল জেলা</option>
              {BD_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <HandHeart className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">
              এই ক্যাটাগরিতে কোনো যাচাইকৃত আবেদন মেলেনি
            </h4>
            <p className="text-xs text-slate-500">
              আপনার এলাকায় কোনো মানবিক সাহায্য প্রয়োজন হলে সরাসরি আবেদন জমা দিন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold">
                      {req.referenceNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${HELP_STATUS_LABELS[req.status]?.color}`}>
                      {HELP_STATUS_LABELS[req.status]?.label}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase">
                      {HELP_CATEGORY_LABELS[req.category]}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2 mt-0.5">
                      {req.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {req.upazila ? `${req.upazila}, ` : ''}{req.district}
                    </span>
                    {req.amountNeeded ? (
                      <span className="font-bold text-emerald-800">
                        প্রয়োজন: {formatTaka(req.amountNeeded)}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>আবেদনকারী: {req.applicantName}</span>
                    <span>{toBengaliDate(req.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
