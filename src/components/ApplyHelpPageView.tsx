import React, { useState } from 'react';
import { 
  HandHeart, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  DollarSign, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Copy, 
  Sparkles,
  FileText,
  User,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createHelpRequest } from '../services/firestoreService';
import { BD_DISTRICTS, HelpCategory, HELP_CATEGORY_LABELS } from '../types';

interface ApplyHelpPageViewProps {
  onBack: () => void;
  onRequireAuth: () => void;
  onNavigateToDashboard: () => void;
}

export const ApplyHelpPageView: React.FC<ApplyHelpPageViewProps> = ({
  onBack,
  onRequireAuth,
  onNavigateToDashboard
}) => {
  const { user, userProfile } = useAuth();

  const [applicantName, setApplicantName] = useState(userProfile?.displayName || user?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [category, setCategory] = useState<HelpCategory>('medical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountNeeded, setAmountNeeded] = useState<string>('');
  const [district, setDistrict] = useState(userProfile?.district || 'ঢাকা');
  const [upazila, setUpazila] = useState(userProfile?.upazila || '');
  const [address, setAddress] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRefNo, setSubmittedRefNo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!consentGiven) {
      setErrorMsg('মানবিক অনুসন্ধানের স্বার্থে তথ্য যাচাইয়ের অনুমতি (সম্মতি) প্রদান আবশ্যক।');
      return;
    }

    if (!phone || phone.length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (কমপক্ষে ১১ ডিজিট)।');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setErrorMsg('শিরোনাম এবং বিস্তারিত বিবরণ প্রদান করা আবশ্যক।');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const parsedAmount = amountNeeded ? parseFloat(amountNeeded) : 0;
      const refNo = await createHelpRequest({
        ownerId: user.uid,
        applicantName: applicantName.trim(),
        phone: phone.trim(),
        category,
        title: title.trim(),
        description: description.trim(),
        amountNeeded: parsedAmount,
        district,
        upazila: upazila.trim() || district,
        address: address.trim(),
        consentGiven: true,
        isPublic
      });

      // Show success screen with generated reference number
      setSubmittedRefNo(`MS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('আবেদন জমা দিতে সমস্যা হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submittedRefNo) {
      navigator.clipboard.writeText(submittedRefNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-2xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          পূর্ববর্তী পাতায় ফিরে যান
        </button>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          হোম &gt; মানবিক সাহায্য আবেদন
        </span>
      </div>

      {submittedRefNo ? (
        /* Full-page Success / Submission Acknowledgment */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              আপনার সাহায্য আবেদন সফলভাবে গৃহীত হয়েছে!
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              ধন্যবাদ। আপনার প্রদত্ত তথ্য আমাদের যাচাইকরণ টিমের কাছে প্রেরণ করা হয়েছে। আমাদের স্বেচ্ছাসেবক আপনার সাথে ফোনে বা সরাসরি যোগাযোগ করবে।
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              আপনার আবেদনের ট্র্যাকিং রেফারেন্স নম্বর
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-800 tracking-wider">
              {submittedRefNo}
            </div>
            <button
              type="button"
              onClick={copyRefToClipboard}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95"
            >
              <Copy className="w-4 h-4 text-emerald-700" />
              {copied ? 'রেফারেন্স নম্বর কপি হয়েছে!' : 'নম্বরটি কপি করে রাখুন'}
            </button>
          </div>

          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl max-w-lg mx-auto text-xs text-emerald-900 text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              পরবর্তী ধাপসমূহ:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
              <li>আমাদের জেলা প্রতিনিধি ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আবেদনকারী বা রোগীর সাথে যোগাযোগ করবে।</li>
              <li>অনুমোদনের পর এই আবেদনটি সাহায্য তালিকায় যুক্ত হবে।</li>
              <li>আপনার প্রোফাইল ড্যাশবোর্ড থেকে রিয়েল-টাইমে অগ্রগতির আপডেট দেখতে পাবেন।</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              আমার ড্যাশবোর্ডে স্ট্যাটাস দেখুন
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              মূল পাতায় ফিরে যান
            </button>
          </div>
        </div>
      ) : (
        /* The Full Page Form */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 sm:p-10 text-white relative">
            <div className="flex items-center gap-2 mb-2">
              <HandHeart className="w-6 h-6 text-emerald-300" />
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
                জরুরি আবেদন ফর্ম
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
              মানবিক ও চিকিৎসা সাহায্য আবেদন
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-2xl leading-relaxed">
              চিকিৎসার খরচ, শিক্ষা সহায়তা, খাদ্য সহায়তা কিংবা যেকোনো আকস্মিক মানবিক দুর্যোগে পাশে দাঁড়াতে আমরা প্রস্তুত। সঠিক ও নির্ভরযোগ্য তথ্য দিয়ে ফর্মটি পূরণ করুন।
            </p>
          </div>

          {/* 3 Step Process Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-emerald-50/60 border-b border-emerald-100 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">১</div>
              <div>
                <span className="font-bold text-slate-900 block">তথ্য প্রদান:</span>
                <span className="text-slate-600">রোগী বা আবেদনকারীর সঠিক বিবরণ ও ফোন নম্বর দিন।</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">২</div>
              <div>
                <span className="font-bold text-slate-900 block">মাঠপর্যায়ে যাচাই:</span>
                <span className="text-slate-600">আমাদের স্বেচ্ছাসেবী টিম তথ্য ও সত্যতা তদন্ত করবে।</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">৩</div>
              <div>
                <span className="font-bold text-slate-900 block">সরাসরি সহায়তা:</span>
                <span className="text-slate-600">অনুমোদন শেষে দ্রুততার সাথে মানবিক সাহায্য পৌঁছে দেওয়া হবে।</span>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="p-6 sm:p-10 space-y-6">
            {!user && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>সাহায্যের আবেদন ট্র্যাক করতে এবং আপনার একাউন্টে যুক্ত রাখতে লগইন আবশ্যক।</span>
                </div>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0"
                >
                  লগইন / নিবন্ধন করুন
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  আবেদনকারী ও রোগীর তথ্য
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      আবেদনকারী বা রোগীর পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="উদাঃ মোঃ আব্দুল করিম"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      যোগাযোগের সক্রিয় মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="০১৭১১-XXXXXX"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance Category & Amount */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  সাহায্যের বিভাগ ও প্রয়োজনীয়তা
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      সাহায্যের বিভাগ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as HelpCategory)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
                    >
                      {Object.entries(HELP_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      আনুমানিক প্রয়োজনীয় টাকার পরিমাণ (ঐচ্ছিক)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="number"
                        min={0}
                        value={amountNeeded}
                        onChange={(e) => setAmountNeeded(e.target.value)}
                        placeholder="উদাঃ ২০০০০"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    আবেদনের সংক্ষিপ্ত শিরোনাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="উদাঃ দরিদ্র পরিবারের স্কুলপড়ুয়া শিক্ষার্থীর হার্ট সার্জারির জন্য সাহায্য"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পরিস্থিতির বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="রোগীর শারীরিক বর্তমান অবস্থা, পরিবারের মোট সদস্য সংখ্যা, উপার্জনের উৎস এবং কী ধরনের জরুরি সহায়তা প্রয়োজন তা পরিষ্কারভাবে লিখুন..."
                    className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Geographic location */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  এলাকা ও যোগাযোগের ঠিকানা
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      জেলা <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
                    >
                      {BD_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      উপজেলা / থানা
                    </label>
                    <input
                      type="text"
                      value={upazila}
                      onChange={(e) => setUpazila(e.target.value)}
                      placeholder="উপজেলার নাম লিখুন"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    গ্রাম / ওয়ার্ড / বিস্তারিত ঠিকানা (তদন্তের স্বার্থে নিরাপদ রাখা হবে)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="সরেজমিনে তদন্তের সুবিধার্থে সঠিক বাড়ির ঠিকানা বা ল্যান্ডমার্ক লিখুন"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Legal Consent & Verification Checkboxes */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="leading-relaxed">
                    আমি ঘোষণা করছি যে উল্লেখিত সমস্ত তথ্য সত্য ও নির্ভুল। মানবিক সাহায্যের প্রয়োজনে স্বেচ্ছাসেবক টিমের নিরপেক্ষ যাচাই প্রক্রিয়ায় আমার পূর্ণ সম্মতি রয়েছে। <span className="text-rose-500 font-bold">*</span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="leading-relaxed">
                    অনুমোদন সাপেক্ষে যাচাইকৃত এই আবেদনটি জনসাধারণের সাহায্য সংগ্রহের উদ্দেশ্যে উন্মুক্ত তালিকায় প্রদর্শনের সম্মতি দিচ্ছি (ব্যক্তিগত পূর্ণ ফোন নম্বর ও গোপন ঠিকানা গোপন রাখা হবে)।
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !consentGiven}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <HandHeart className="w-5 h-5" />
                      সাহায্য আবেদন সম্পন্ন করুন
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};
