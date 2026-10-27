import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Droplet, 
  HandHeart, 
  FolderHeart, 
  Users, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  PhoneCall,
  Clock,
  ChevronRight,
  FileSearch,
  Receipt,
  Smartphone,
  Download
} from 'lucide-react';
import { Campaign, HelpRequest, BloodRequest } from '../types';
import { getCampaigns, getPublicHelpRequests, getActiveBloodRequests } from '../services/firestoreService';
import { formatTaka, toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  onOpenHelpModal: () => void;
  onSelectDonate: (campaign: Campaign) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenHelpModal,
  onSelectDonate
}) => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [recentHelp, setRecentHelp] = useState<HelpRequest[]>([]);
  const [bloodAlerts, setBloodAlerts] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [cList, hList, bList] = await Promise.all([
          getCampaigns(),
          getPublicHelpRequests(),
          getActiveBloodRequests()
        ]);
        setFeaturedCampaigns(cList.slice(0, 3));
        setRecentHelp(hList.slice(0, 3));
        setBloodAlerts(bList.slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-12 animate-in fade-in duration-300">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-teal-900 to-emerald-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-emerald-200 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>একসঙ্গে মানুষের পাশে – একটি নিঃস্বার্থ মানবিক উদ্যোগ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-['Hind_Siliguri',sans-serif] max-w-4xl mx-auto leading-tight sm:leading-tight">
            অসহায় মানুষের মুখে হাসি ফোটাতে <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-white">
              মানবতার সেবায় একতাবদ্ধ আমরা
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            জরুরি রক্তদান, দুর্যোগের ত্রাণ বিতরণ, চিকিৎসা সহায়তা ও সুবিধাবঞ্চিত শিশুদের শিক্ষাবৃত্তি—১০০% স্বচ্ছ হিসাব ও সরাসরি মাঠে পৌঁছে দেওয়ার নির্ভরযোগ্য প্ল্যাটফর্ম।
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('donate')}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              <HeartHandshake className="w-5 h-5 text-emerald-950" />
              অনুদান দিন
            </button>

            <button
              onClick={() => onNavigate('apply-help')}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-rose-950/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              <HandHeart className="w-5 h-5" />
              সাহায্য আবেদন করুন
            </button>

            <button
              onClick={() => onNavigate('blood')}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base rounded-2xl backdrop-blur-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Droplet className="w-5 h-5 text-rose-400 fill-rose-400" />
              রক্তদাতা খুঁজুন
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-emerald-200/80 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>১০০% অডিটকৃত ব্যাংক হিসাব</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>মাঠপর্যায়ে সরজমিনে তদন্ত</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>কোনো মধ্যস্বত্বভোগী নেই</span>
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY BLOOD TICKER (IF ACTIVE REQUESTS) */}
      {bloodAlerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-rose-700 tracking-wider">জরুরি রক্তের নোটিশ</span>
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {bloodAlerts[0].hospital} - <span className="font-mono text-rose-700 font-extrabold">{bloodAlerts[0].bloodGroup}</span> রক্তের প্রয়োজন ({toBengaliNumber(bloodAlerts[0].bagsNeeded)} ব্যাগ)
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('blood')}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              বিস্তারিত ও যোগাযোগ করুন
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* 4 CORE PILLARS OF SERVICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">আমাদের সেবাসমূহ</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri',sans-serif]">
            মানবতার সেবার মূল সেতুবন্ধন
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            সমাজের প্রতিটি প্রান্তে অসহায় মানুষের প্রয়োজন মেটাতে আমাদের নিবেদিত কর্মসূচি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            onClick={() => onNavigate('blood')}
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-rose-400 hover:shadow-xl transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Droplet className="w-6 h-6 fill-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              জরুরি রক্তদান নেটওয়ার্ক
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              স্বেচ্ছাসেবী রক্তদাতাদের সরাসরি ডাটাবেস। জেলা ও গ্রুপ অনুযায়ী তাৎক্ষণিক রক্তের সন্ধান ও নোটিশ প্রকাশ।
            </p>
            <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 group-hover:underline">
              রক্তদাতা খুঁজুন <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('help')}
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-xl transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HandHeart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              চিকিৎসা ও মানবিক অনুদান
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              অসহায় জটিল রোগী ও পঙ্গু মানুষদের চিকিৎসা খরচ বহনে ফিল্ড ভেরিফিকেশনের মাধ্যমে সরাসরি আর্থিক সহায়তা।
            </p>
            <span className="text-xs font-bold text-teal-700 inline-flex items-center gap-1 group-hover:underline">
              আবেদন দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('campaigns')}
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              বন্যা ও দুর্যোগ পুনর্বাসন
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বন্যা, শীত ও আকস্মিক দুর্যোগে খাদ্য ও বস্ত্রের বিশেষ তহবিল। ১০০% হিসাব এবং ব্যয়ের ভাউচার অনলাইনে উন্মুক্ত।
            </p>
            <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 group-hover:underline">
              ক্যাম্পেইন দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={() => onNavigate('volunteer')}
            className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              স্বেচ্ছাসেবক প্ল্যাটফর্ম
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              দেশের তরুণ সমাজকে মানবকল্যাণে একতাবদ্ধ করে মাঠপর্যায়ে প্রত্যক্ষ কাজের সুযোগ ও প্রশিক্ষণ প্রদান।
            </p>
            <span className="text-xs font-bold text-purple-700 inline-flex items-center gap-1 group-hover:underline">
              যুক্ত হন <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* FEATURED CAMPAIGNS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">সক্রিয় তহবিল</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              চলমান ত্রাণ ও মানবিক ক্যাম্পেইন
            </h2>
          </div>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:underline flex items-center gap-1"
          >
            সকল ক্যাম্পেইন দেখুন <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {featuredCampaigns.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            বর্তমানে কোনো ক্যাম্পেইন তালিকাভুক্ত নেই। নতুন ক্যাম্পেইনের জন্য অপেক্ষা করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((camp) => {
              const target = camp.targetAmount || 1;
              const collected = camp.collectedAmount || 0;
              const percentage = Math.min(100, Math.round((collected / target) * 100));

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="h-40 bg-gradient-to-br from-emerald-700 to-teal-800 p-5 text-white flex flex-col justify-between">
                    <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold w-fit">
                      {camp.category}
                    </span>
                    <h3 className="text-base font-bold font-['Hind_Siliguri',sans-serif] line-clamp-2">
                      {camp.title}
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {camp.description}
                    </p>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-800">{formatTaka(collected)}</span>
                        <span className="text-slate-400">লক্ষ্য: {formatTaka(target)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">
                        {toBengaliNumber(percentage)}% পূরণকৃত
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectDonate(camp)}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                    >
                      অনুদান পাঠান
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS / TRANSPARENCY PIPELINE */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
              স্বচ্ছ ও নিরপেক্ষ কর্মপ্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Hind_Siliguri',sans-serif]">
              কিভাবে আমাদের মানবিক সেবা পরিচালিত হয়?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              আপনার একটি টাকাও অপচয় হবে না। প্রতি স্তরে কঠোর যাচাই ও অডিট নিশ্চিত করা হয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center font-mono">
                ১
              </div>
              <h3 className="text-base font-bold font-['Hind_Siliguri',sans-serif]">
                আবেদন ও তথ্য গ্রহণ
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                চিকিৎসা, শিক্ষা বা দুর্যোগে ক্ষতিগ্রস্তরা ডিজিটাল পোর্টালে সরাসরি আবেদন করেন এবং অনন্য ট্র্যাকিং রেফারেন্স নম্বর লাভ করেন।
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center font-mono">
                ২
              </div>
              <h3 className="text-base font-bold font-['Hind_Siliguri',sans-serif]">
                মাঠপর্যায়ে নিরপেক্ষ তদন্ত
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                আমাদের এলাকার নিবন্ধিত স্বেচ্ছাসেবক টিম সরাসরি হাসপাতালে বা বাড়িতে গিয়ে রোগীর প্রেসক্রিপশন ও পারিবারিক অবস্থা যাচাই করেন।
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-lg flex items-center justify-center font-mono">
                ৩
              </div>
              <h3 className="text-base font-bold font-['Hind_Siliguri',sans-serif]">
                সরাসরি প্রদান ও উন্মুক্ত অডিট
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                অনুমোদিত সাহায্য সরাসরি চিকিৎসকের বিল বা সুবিধাভোগীর হাতে হস্তান্তর হয় এবং ব্যয়ের প্রতিটি ভাউচার ওয়েবসাইটে উন্মুক্ত রাখা হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE APP DOWNLOAD CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-emerald-800/40 relative overflow-hidden">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>স্মার্টফোন অ্যাপ্লিকেশন (Android & iOS)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              স্মার্টফোনে মানবতার সেবা অ্যাপ ইনস্টল করুন
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              জরুরি রক্তের পুশ নোটিফিকেশন এলার্ট, অফলাইন হটলাইন ডিরেক্টরি, এক ক্লিকে অনুদান ও সাহায্য আবেদন ট্র্যাকিং সুবিধা এবার আরও দ্রুত আপনার হাতের মুঠোয়।
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('download')}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                সরাসরি APK ডাউনলোড ও ইনস্টল
              </button>
              <button
                onClick={() => onNavigate('download')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-teal-300" />
                PWA / কিউআর স্ক্যান নির্দেশিকা
              </button>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-xs font-bold font-mono">v1.2.0 • 14.8 MB</div>
              <div className="text-[11px] text-emerald-300">১০০% ফ্রি ও নিরাপদ</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENT FAQ PREVIEW & CONTACT CALLOUT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">জরুরি তথ্য</span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-['Hind_Siliguri',sans-serif]">
            সাধারণ প্রশ্নোত্তর ও দায়বদ্ধতা
          </h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
            <h4 className="font-bold text-slate-800 text-sm">
              প্রশ্ন: আমি কীভাবে নিশ্চিত হব যে আমার অনুদান সঠিক মানুষের কাছে পৌঁছেছে?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              উত্তর: আমাদের প্রতিটি ক্যাম্পেইনে "ব্যয়ের হিসাব" বাটন রয়েছে। সেখানে প্রতিটি খরচের ভাউচার নম্বর, তারিখ এবং বিবরণ উন্মুক্ত রাখা হয়। এছাড়াও আপনার নামে ব্যাংক/এমএফএস ভেরিফিকেশনের পর অফিশিয়াল রসিদ ইস্যু করা হয়।
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-2xs">
            <h4 className="font-bold text-slate-800 text-sm">
              প্রশ্ন: রক্তদাতা কি কোনো টাকা দাবি করতে পারে?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              উত্তর: সম্পূর্ণ নিষিদ্ধ। মানবতার সেবা প্ল্যাটফর্মের কোনো রক্তদাতা কোনো প্রকার আর্থিক দাবি করতে পারবে না। রক্ত সম্পূর্ণ বিনামূল্যে দান করা হয়। কেউ টাকা দাবি করলে অবিলম্বে আমাদের হেল্পলাইনে অভিযোগ জানান।
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
