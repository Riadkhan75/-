import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  Target, 
  Users, 
  Receipt, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Filter, 
  TrendingUp, 
  FileText 
} from 'lucide-react';
import { getCampaigns, getCampaignExpenses } from '../services/firestoreService';
import { Campaign, Expense, CampaignCategory, CAMPAIGN_CATEGORY_LABELS } from '../types';
import { formatTaka, toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';

interface CampaignsViewProps {
  onSelectDonate: (campaign: Campaign) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onSelectDonate }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Expense transparency modal state
  const [activeExpenseCampaign, setActiveExpenseCampaign] = useState<Campaign | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState<boolean>(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const list = await getCampaigns();
        setCampaigns(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleOpenExpenses = async (camp: Campaign) => {
    setActiveExpenseCampaign(camp);
    setLoadingExpenses(true);
    try {
      const expList = await getCampaignExpenses(camp.id);
      setExpenses(expList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const filtered = selectedCategory === 'all'
    ? campaigns
    : campaigns.filter(c => c.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
            <FolderHeart className="w-3.5 h-3.5" />
            ১০০% স্বচ্ছ মানবিক তহবিল
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            ত্রাণ ও মানবিক কল্যাণ ক্যাম্পেইন
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            প্রতিটি টাকার পাই-টু-পাই হিসাব উন্মুক্ত। সুবিধাবঞ্চিতদের শিক্ষা, চিকিৎসা ও দুর্যোগ পুনর্বাসনে আপনার দান পৌঁছে যাবে সরাসরি সুবিধাভোগীদের হাতে।
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          সকল ক্যাম্পেইন ({toBengaliNumber(campaigns.length)})
        </button>
        {Object.entries(CAMPAIGN_CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === key
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">
            এই মুহূর্তে কোনো সক্রিয় ক্যাম্পেইন নেই
          </h4>
          <p className="text-xs text-slate-500">
            অ্যাডমিন প্যানেল থেকে নতুন ক্যাম্পেইন যুক্ত হলে এখানে প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((camp) => {
            const target = camp.targetAmount || 1;
            const collected = camp.collectedAmount || 0;
            const percentage = Math.min(100, Math.round((collected / target) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Campaign Header banner or gradient */}
                  <div className="h-44 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-800 p-5 flex flex-col justify-between text-white relative">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold">
                        {CAMPAIGN_CATEGORY_LABELS[camp.category] || 'সাধারণ কল্যাণ'}
                      </span>
                      {camp.status === 'active' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-400 text-emerald-950 font-bold text-[10px] rounded-full">
                          চলমান
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 font-bold text-[10px] rounded-full">
                          সম্পন্ন
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold font-['Hind_Siliguri',sans-serif] leading-snug line-clamp-2">
                        {camp.title}
                      </h3>
                      {camp.subtitle && (
                        <p className="text-xs text-emerald-100 line-clamp-1 mt-1">
                          {camp.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {camp.description}
                    </p>

                    {/* Progress Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400">সংগৃহীত: </span>
                          <span className="font-bold text-emerald-800">{formatTaka(collected)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">লক্ষ্য: </span>
                          <span className="font-bold text-slate-700">{formatTaka(target)}</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {toBengaliNumber(percentage)}% পূরণ
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {toBengaliNumber(camp.donorCount || 0)} জন অনুদানদাতা
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDonate(camp)}
                    className="grow py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    অনুদান দিন
                  </button>

                  <button
                    onClick={() => handleOpenExpenses(camp)}
                    className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="খরচের বিবরণী দেখুন"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    হিসাব
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transparency & Expenses Modal */}
      {activeExpenseCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setActiveExpenseCampaign(null)}
                className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                <Receipt className="w-4 h-4" />
                আর্থিক স্বচ্ছতা ও ব্যয়ের ভাউচার হিসাব
              </div>
              <h3 className="text-xl font-bold font-['Hind_Siliguri',sans-serif]">
                {activeExpenseCampaign.title}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">মোট সংগৃহীত অনুদান:</span>
                  <div className="text-base font-bold text-emerald-700">
                    {formatTaka(activeExpenseCampaign.collectedAmount)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">ক্যাম্পেইন অবস্থা:</span>
                  <div className="text-base font-bold text-slate-800">
                    {activeExpenseCampaign.status === 'active' ? 'চলমান' : 'সম্পন্ন'}
                  </div>
                </div>
              </div>

              {loadingExpenses ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  ব্যয়ের হিসাব লোড হচ্ছে...
                </div>
              ) : expenses.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                  এই ক্যাম্পেইনে এখনও পর্যন্ত কোনো ব্যয়ের হিসাব যুক্ত করা হয়নি। ত্রাণ বা প্রকল্প কার্যক্রম চলাকালীন নিয়মিত ভাউচার যুক্ত করা হবে।
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">আইটেমভিত্তিক খরচের তালিকা:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {expenses.map((exp) => (
                      <div key={exp.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <div className="text-slate-500 text-[11px]">
                            {exp.category} | তারিখ: {toBengaliDate(exp.date)} {exp.voucherNo ? `| ভাউচার: ${exp.voucherNo}` : ''}
                          </div>
                          {exp.description && (
                            <p className="text-slate-600 text-[11px] mt-0.5">{exp.description}</p>
                          )}
                        </div>
                        <div className="font-bold text-rose-700 shrink-0 ml-3">
                          -{formatTaka(exp.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveExpenseCampaign(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
