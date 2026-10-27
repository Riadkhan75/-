import React from 'react';
import { ShieldCheck, FileText, HelpCircle, ArrowLeft } from 'lucide-react';

interface NoticePagesProps {
  type: 'privacy' | 'terms' | 'faq';
  onBack: () => void;
}

export const NoticePages: React.FC<NoticePagesProps> = ({ type, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        মূল পাতায় ফিরে যান
      </button>

      {/* PRIVACY POLICY */}
      {type === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif] text-slate-900">
                গোপনীয়তা নীতি ও ডেটা সুরক্ষা (Privacy Policy)
              </h1>
              <p className="text-xs text-slate-500">সর্বশেষ আপডেট: অক্টোবর ২০২৬</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed divide-y divide-slate-100">
            <div className="pt-2 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">১. তথ্যের সংগ্রহ ও উদ্দেশ্য</h3>
              <p>
                “মানবতার সেবা” প্ল্যাটফর্ম শুধুমাত্র প্রকৃত সামাজিক ও মানবিক সহায়তা পরিচালনার উদ্দেশ্যে ব্যবহারকারীর নাম, ইমেইল, মোবাইল নম্বর এবং জেলা/উপজেলা সংক্রান্ত তথ্য সংগ্রহ করে। কোনো বাণিজ্যিক বিপণন বা তৃতীয় পক্ষের বিজ্ঞাপনী সংস্থাকে এই ডেটা প্রদান করা হয় না।
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">২. রক্তদাতা ও সাহায্যপ্রার্থীদের ব্যক্তিগত তথ্যের সুরক্ষা</h3>
              <p>
                রক্তদাতাদের ফোন নম্বর পাবলিক ওয়েব ক্রলার এবং বটদের হাত থেকে বাঁচাতে অথেন্টিকেশন ও নিরাপদ ইন্টারফেসের মাধ্যমে সুরক্ষিত রাখা হয়। সাহায্য প্রার্থীদের ব্যক্তিগত চিকিৎসাপত্র ও পূর্ণ গ্রাম্য ঠিকানা শুধুমাত্র অনুমোদিত যাচাইকারী স্বেচ্ছাসেবকদের কাছে উন্মুক্ত থাকে।
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">৩. পাসওয়ার্ড ও ক্রেডেনশিয়াল নিরাপত্তা</h3>
              <p>
                ব্যবহারকারীর পাসওয়ার্ড কখনো ফায়ারস্টোর ডাটাবেসে বা সোর্স কোডে প্লেইন টেক্সট হিসেবে সংরক্ষিত থাকে না। এটি ফায়ারবেস অথেন্টিকেশন সার্ভারের মাধ্যমে ক্রিপ্টোগ্রাফিক হ্যাশিং দ্বারা সুরক্ষিত থাকে।
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">৪. অ্যাকাউন্ট ডিলিট ও ডেটা অপসারণের অধিকার</h3>
              <p>
                যেকোনো নিবন্ধিত সদস্য তার প্রোফাইল তথ্য অপসারণ বা অ্যাকাউন্ট নিষ্ক্রিয় করার জন্য আমাদের কেন্দ্রীয় হেল্পডেস্কে (<span className="font-mono text-emerald-800 font-bold">privacy@manobotarsheba.org</span>) অনুরোধ জানাতে পারবেন। অনুরোধ প্রাপ্তির ৭ কার্যদিবসের মধ্যে তার রেকর্ড স্থায়ীভাবে ডিলিট করা হবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE */}
      {type === 'terms' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-teal-800">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif] text-slate-900">
                ব্যবহারের সাধারণ শর্তাবলী (Terms of Service)
              </h1>
              <p className="text-xs text-slate-500">কার্যকরী তারিখ: অক্টোবর ২০২৬</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed divide-y divide-slate-100">
            <div className="pt-2 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">১. অরাজনৈতিক ও অলাভজনক অঙ্গীকার</h3>
              <p>
                “মানবতার সেবা” একটি সম্পূর্ণ অরাজনৈতিক, অসাম্প্রদায়িক ও অলাভজনক স্বেচ্ছাসেবী সমাজকল্যাণমূলক প্ল্যাটফর্ম। এই প্ল্যাটফর্মের কোনো মাধ্যম ব্যবহার করে রাজনৈতিক প্রচারণা বা অর্থ আত্মসাতের চেষ্টা কঠোরভাবে আইনানুগ অপরাধ হিসেবে গণ্য হবে।
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">২. রক্তদান বিষয়ক দায়মুক্তি ও স্বাস্থ্য সতর্কতা</h3>
              <p>
                রক্তদাতা ও গ্রহীতার মধ্যে কোনো রক্তের নিশ্চয়তা প্ল্যাটফর্ম বহন করে না। রক্ত গ্রহণের পূর্বে হাসপাতাল বা ল্যাবরেটরিতে ক্রস-ম্যাচিং, হেপাটাইটিস ও এইচআইভি সহ আবশ্যকীয় রক্ত পরীক্ষা নিশ্চিত করার সম্পূর্ণ দায়িত্ব রোগী ও তার পরিবারের।
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">৩. ভুয়া সাহায্য আবেদন ও প্রতারণা প্রতিরোধ</h3>
              <p>
                কোনো ব্যক্তি অসত্য তথ্য, ভুয়া প্রেসক্রিপশন বা অতিরঞ্জিত অর্থ দাবি করে আবেদন করলে তার আবেদন বাতিল করা হবে এবং জাতীয় আইন অনুযায়ী প্রচলিত ডিজিটাল নিরাপত্তা বিধিমালার আওতায় ব্যবস্থা গ্রহণ করা হবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      {type === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif] text-slate-900">
                সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)
              </h1>
              <p className="text-xs text-slate-500">মানবতার সেবার কার্যক্রম ও নিয়মাবলী</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <h3 className="font-bold text-slate-900">১. আমি কীভাবে চিকিৎসার জন্য সাহায্য আবেদন করতে পারি?</h3>
              <p className="text-slate-600">
                মেন্যু থেকে "সাহায্য আবেদন" বা হোমপেজের "সাহায্য চান" বাটনে ক্লিক করে আবেদন ফর্মটি পূরণ করুন। আপনার যোগাযোগের নম্বর ও সঠিক জেলার নাম দিন। আমাদের টিম আপনার সাথে ফোনে যোগাযোগ করবে।
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <h3 className="font-bold text-slate-900">২. অনুদান পাঠানোর পর কীভাবে নিশ্চিত হব?</h3>
              <p className="text-slate-600">
                বিকাশ, নগদ বা ব্যাংক একাউন্টে টাকা পাঠানোর পর TrxID টি অনুদান ফর্মে সাবমিট করুন। আমাদের অ্যাকাউন্ট টিম যাচাই সম্পন্ন করলে আপনার ড্যাশবোর্ডে "যাচাইকৃত" স্ট্যাটাস ও রসিদ নম্বর প্রদর্শিত হবে।
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <h3 className="font-bold text-slate-900">৩. স্বেচ্ছাসেবক হিসেবে কাজের জন্য কি পারিশ্রমিক পাওয়া যাবে?</h3>
              <p className="text-slate-600">
                না, এটি একটি সম্পূর্ণ স্বেচ্ছাসেবী মানবিক কাজ। তবে মাঠপর্যায়ের বিশেষ জরুরি দুর্যোগ মিশনে যাতায়াত ও খাবার খরচ প্ল্যাটফর্মের পক্ষ থেকে বহন করা হয়।
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
