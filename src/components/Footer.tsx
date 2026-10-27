import React from 'react';
import { HeartHandshake, PhoneCall, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-24 md:pb-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">
                  মানবতার সেবা
                </span>
                <p className="text-xs text-emerald-400 font-medium">একসঙ্গে মানুষের পাশে</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              স্বচ্ছতা, সততা ও নিবেদিত প্রাণ সেবায় সুবিধাবঞ্চিত মানুষের পাশে দাঁড়ানোর একটি উন্মুক্ত ও নিরপেক্ষ সামাজিক সেবামূলক প্ল্যাটফর্ম।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>১০০% স্বচ্ছ হিসাব ও ব্যাংক/বিকাশ যাচাইকৃত অনুদান ব্যবস্থা</span>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white">জরুরি যোগাযোগ ও হেল্পলাইন</h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <div className="text-white font-medium">হটলাইন (২৪/৭ জরুরি সেবা):</div>
                  <div className="text-slate-400 font-mono">+৮৮০ ১৭১১-০০০০০০ / ৯৯৯</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <div className="text-white font-medium">ইমেইল:</div>
                  <div className="text-slate-400">help@manobotarsheba.org</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <div>
                  <div className="text-white font-medium">কেন্দ্রীয় কার্যালয়:</div>
                  <div className="text-slate-400">ধানমন্ডি, ঢাকা - ১২০৯, বাংলাদেশ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white">সেবাসমূহ ও তথ্য</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('campaigns')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  চলমান ত্রাণ ও পুনর্বাসন ক্যাম্পেইন
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('blood')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  জরুরি রক্তদাতা খুঁজুন ও নিবন্ধন করুন
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('bank')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  খাদ্য, বস্ত্র ও সামগ্রী ব্যাংক
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('impact')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  বাস্তব প্রভাব ও প্রকাশ্য অডিট
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('stories')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  ভালো কাজের মানবিক গল্প
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('help')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  চিকিৎসা ও মানবিক সাহায্য আবেদন
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('volunteer')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  স্বেচ্ছাসেবক হিসেবে যোগদান
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('events')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  সেবামূলক ক্যাম্প ও ইভেন্ট
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Notices */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white">নীতিমালা ও জিজ্ঞাসা</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => onNavigate('privacy')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  গোপনীয়তা নীতি ও ডেটা সুরক্ষা
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('terms')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  ব্যবহারের শর্তাবলী
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('faq')} 
                  className="hover:text-emerald-400 transition-colors"
                >
                  সাধারণ জিজ্ঞাসা ও স্বচ্ছতা রিপোর্ট
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('download')} 
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>📱</span>
                  <span>মোবাইল অ্যাপ ডাউনলোড (APK / PWA)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left leading-relaxed max-w-2xl">
            <span className="text-slate-400 font-semibold">সতর্কতা ও দায়মুক্তি:</span> রক্তদানের ক্ষেত্রে রক্তদাতা ও গ্রহীতার পারস্পরিক সমন্বয় এবং হাসপাতালে প্রাথমিক ক্রস-ম্যাচিং নিশ্চিত করা বাঞ্ছনীয়। মানবতার সেবা সরাসরি কোনো রক্তের নিশ্চয়তা প্রদান করে না। অনুদানের সমস্ত হিসাব অডিটকৃত।
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>কপিরাইট © ২০২৬</span>
            <span className="text-emerald-400 font-semibold">মানবতার সেবা</span>
            <span>| সর্বস্বত্ব সংরক্ষিত</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
