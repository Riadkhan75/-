import React, { useState } from 'react';
import { 
  X, 
  HandHeart, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  DollarSign, 
  FileText, 
  ShieldCheck,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createHelpRequest } from '../services/firestoreService';
import { BD_DISTRICTS, HelpCategory, HELP_CATEGORY_LABELS } from '../types';

interface HelpRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}

export const HelpRequestModal: React.FC<HelpRequestModalProps> = ({
  isOpen,
  onClose,
  onRequireAuth
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

  if (!isOpen) return null;

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

    setErrorMsg('');
    setSubmitting(true);

    try {
      const parsedAmount = amountNeeded ? parseFloat(amountNeeded) : 0;
      await createHelpRequest({
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

      // Generate a representative ref for immediate feedback
      setSubmittedRefNo(`MS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('আবেদন জমা দিতে সমস্যা হয়েছে। আপনার ইন্টারনেট ও তথ্য পুনঃযাচাই করুন।');
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

  const handleResetAndClose = () => {
    setSubmittedRefNo(null);
    setTitle('');
    setDescription('');
    setAmountNeeded('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <HandHeart className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
              মানবিক আবেদন ফর্ম
            </span>
          </div>
          <h3 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif]">
            জরুরি সাহায্য ও কল্যাণ আবেদন
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            প্রকৃত অসহায় ও দুস্থদের পাশে দাঁড়াতে সঠিক তথ্য দিয়ে সহায়তা করুন
          </p>
        </div>

        {submittedRefNo ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-800">
                আপনার আবেদন সফলভাবে গৃহীত হয়েছে!
              </h4>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                আমাদের স্বেচ্ছাসেবী টিম ও যাচাইকরণ কমিটি দ্রুততম সময়ে সরেজমিনে বা ফোনে তথ্য অনুসন্ধান করবে।
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto">
              <div className="text-xs text-slate-500 font-medium">আবেদন ট্র্যাকিং রেফারেন্স নম্বর:</div>
              <div className="text-xl font-mono font-bold text-emerald-800 my-1">
                {submittedRefNo}
              </div>
              <button
                type="button"
                onClick={copyRefToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-xs font-medium text-slate-700 rounded-lg shadow-2xs hover:bg-slate-50 active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'কপি হয়েছে!' : 'নম্বরটি কপি করুন'}
              </button>
            </div>

            <p className="text-xs text-slate-500">
              আপনার একাউন্টের <span className="font-semibold text-emerald-700">"ড্যাশবোর্ড"</span> থেকে যেকোনো সময় আবেদনের সার্বিক অগ্রগতি ট্র্যাক করতে পারবেন।
            </p>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        ) : (
          /* Form Content */
          <div className="p-6">
            {!user && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span>আবেদন জমা দিতে ও পরবর্তীতে ট্র্যাকিং করতে আপনার অ্যাকাউন্টে লগইন প্রয়োজন।</span>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-lg shrink-0 ml-2"
                >
                  লগইন করুন
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আবেদনকারী বা রোগীর নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    যোগাযোগের মোবাইল নম্বর <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১৭১১-XXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সাহায্যের বিভাগ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HelpCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    {Object.entries(HELP_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আনুমানিক প্রয়োজনীয় টাকার পরিমাণ (৳)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      value={amountNeeded}
                      onChange={(e) => setAmountNeeded(e.target.value)}
                      placeholder="উদাঃ ১৫০০০"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সংক্ষিপ্ত শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদাঃ কিডনি রোগীর জন্য জরুরি ডায়ালাইসিস ও ওষুধ সহায়তা"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পরিস্থিতির বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="পরিবারের আর্থিক অবস্থা, সমস্যার গভীরতা ও সহায়তার ধরন বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    জেলা <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    উপজেলা / থানা
                  </label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    placeholder="উপজেলা বা থানার নাম"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  গ্রাম / ইউনিয়ন / বিস্তারিত ঠিকানা (গোপন রাখা হবে)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="সরেজমিনে তদন্তের জন্য সঠিক ঠিকানা লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    আমি সত্যায়িত করছি যে উল্লেখিত সমস্ত তথ্য সত্য এবং মানবিক অনুসন্ধানের স্বার্থে স্বেচ্ছাসেবী টিমের যাচাই প্রক্রিয়ায় আমার পূর্ণ সম্মতি রয়েছে। <span className="text-rose-500">*</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    অনুমোদন সাপেক্ষে যাচাইকৃত আবেদন জনসাধারণের জন্য উন্মুক্ত তালিকায় প্রদর্শন করা যেতে পারে (ব্যক্তিগত মোবাইল ও পূর্ণ ঠিকানা গোপন থাকবে)।
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting || !consentGiven}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <HandHeart className="w-4 h-4" />
                      আবেদন জমা দিন
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
