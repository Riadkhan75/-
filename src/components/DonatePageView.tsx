import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Building, 
  PhoneCall, 
  FileCheck,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Sparkles,
  Receipt,
  HelpCircle,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  submitDonation, 
  getCampaigns, 
  getSystemSettings 
} from '../services/firestoreService';
import { Campaign, PaymentMethod, SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/bengaliUtils';

interface DonatePageViewProps {
  initialCampaign?: Campaign | null;
  onBack: () => void;
  onNavigateToDashboard: () => void;
  onRequireAuth?: () => void;
}

export const DonatePageView: React.FC<DonatePageViewProps> = ({
  initialCampaign,
  onBack,
  onNavigateToDashboard,
  onRequireAuth
}) => {
  const { user, userProfile } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    initialCampaign ? initialCampaign.id : 'general'
  );
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  const [amount, setAmount] = useState<string>('1000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [donorName, setDonorName] = useState(userProfile?.displayName || user?.displayName || '');
  const [donorPhone, setDonorPhone] = useState(userProfile?.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedDonationInfo, setSubmittedDonationInfo] = useState<{
    amount: number;
    trxId: string;
    campaignTitle: string;
    date: string;
  } | null>(null);

  // Load active campaigns and system settings
  useEffect(() => {
    async function loadData() {
      try {
        const [camps, sysSettings] = await Promise.all([
          getCampaigns(),
          getSystemSettings()
        ]);
        setCampaigns(camps.filter(c => c.status === 'active'));
        setSettings(sysSettings);
      } catch (err) {
        console.warn('Error fetching donate page data:', err);
      }
    }
    loadData();
  }, []);

  // Sync initial campaign
  useEffect(() => {
    if (initialCampaign) {
      setSelectedCampaignId(initialCampaign.id);
    }
  }, [initialCampaign]);

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const quickAmounts = [200, 500, 1000, 2500, 5000, 10000];

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('অনুগ্রহ করে সঠিক অনুদানের পরিমাণ উল্লেখ করুন।');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('লেনদেনের ট্রানজেকশন আইডি (TrxID) বা ব্যাংক রেফারেন্স নম্বর আবশ্যক।');
      return;
    }

    setSubmitting(true);
    try {
      const campTitle = activeCampaign ? activeCampaign.title : 'সাধারণ মানবকল্যাণ তহবিল';
      const effectiveDonorName = isAnonymous 
        ? 'উদার শুভানুধ্যায়ী (অজ্ঞাতনামা)' 
        : (donorName.trim() || 'উদার শুভানুধ্যায়ী');

      await submitDonation({
        campaignId: selectedCampaignId,
        campaignTitle: campTitle,
        donorId: user ? user.uid : 'guest',
        donorName: effectiveDonorName,
        donorEmail: user?.email || '',
        donorPhone: donorPhone.trim(),
        amount: parsedAmount,
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        senderAccount: senderAccount.trim()
      });

      setSubmittedDonationInfo({
        amount: parsedAmount,
        trxId: transactionId.trim().toUpperCase(),
        campaignTitle: campTitle,
        date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('অনুদান তথ্য সংরক্ষণে ত্রুটি দেখা দিয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb / Back */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            পূর্ববর্তী পেজে ফিরে যান
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>১০০% নিরাপদ ও স্বচ্ছ অনুদান ব্যবস্থা</span>
          </div>
        </div>

        {/* Success Confirmation View */}
        {success ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Hind_Siliguri',sans-serif]">
                জাযাকাল্লাহু খাইরান! আপনার অনুদান তথ্য জমা হয়েছে
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                মানবতার সেবায় আপনার এই মহান অবদান অসহায় মানুষের মুখে হাসি ফোটাবে। অ্যাডমিন প্যানেল থেকে ব্যাংক বা এমএফএস স্টেটমেন্ট মিলিয়ে আপনার অনুদান ভেরিফাই করে ডিজিটাল রসিদ ইস্যু করা হবে।
              </p>
            </div>

            {submittedDonationInfo && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">ক্যাম্পেইন:</span>
                  <span className="font-bold text-slate-800 text-right">{submittedDonationInfo.campaignTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">অনুদানের পরিমাণ:</span>
                  <span className="font-bold text-emerald-700 font-mono text-base">{formatTaka(submittedDonationInfo.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">ট্রানজেকশন আইডি:</span>
                  <span className="font-bold text-slate-800 font-mono">{submittedDonationInfo.trxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">তারিখ:</span>
                  <span className="font-semibold text-slate-700">{submittedDonationInfo.date}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {user ? (
                <button
                  onClick={onNavigateToDashboard}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  আমার ড্যাশবোর্ড ও অনুদান রসিদ দেখুন
                </button>
              ) : (
                <button
                  onClick={onRequireAuth}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  লগইন করে রসিদ সংরক্ষণ করুন
                </button>
              )}

              <button
                onClick={() => {
                  setSuccess(false);
                  setTransactionId('');
                  setSenderAccount('');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                আরো অনুদান দিন
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Form Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Heart className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
                      মানবতার সেবায় অনুদান দিন
                    </h1>
                    <p className="text-xs text-slate-500">
                      আপনার সামান্য দান বাঁচাতে পারে একটি অসহায় পরিবারের জীবন
                    </p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs sm:text-sm flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Campaign Target Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ১. কোন ফান্ড বা ক্যাম্পেইনে অনুদান দিতে চান?
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="general">সাধারণ মানবকল্যাণ ও জরুরি ত্রাণ তহবিল</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title} (লক্ষ্য: {formatTaka(camp.targetAmount)})
                      </option>
                    ))}
                  </select>

                  {activeCampaign && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>সংগৃহীত: {formatTaka(activeCampaign.collectedAmount || 0)}</span>
                        <span>লক্ষ্য: {formatTaka(activeCampaign.targetAmount || 0)}</span>
                      </div>
                      <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round(((activeCampaign.collectedAmount || 0) / (activeCampaign.targetAmount || 1)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Amount Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ২. অনুদানের পরিমাণ (টাকা)
                  </label>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          amount === amt.toString()
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }`}
                      >
                        {toBengaliNumber(amt)} ৳
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">৳</span>
                    <input
                      type="number"
                      min="10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="অন্য যেকোনো পরিমাণ লিখুন..."
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
                      required
                    />
                  </div>
                </div>

                {/* 3. Payment Method Tabs */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ৩. পেমেন্ট মাধ্যম নির্বাচন করুন
                  </label>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'bkash', label: 'বিকাশ', color: 'border-pink-300 text-pink-700 bg-pink-50' },
                      { id: 'nagad', label: 'নগদ', color: 'border-orange-300 text-orange-700 bg-orange-50' },
                      { id: 'rocket', label: 'রকেট', color: 'border-purple-300 text-purple-700 bg-purple-50' },
                      { id: 'bank', label: 'ব্যাংক', color: 'border-teal-300 text-teal-700 bg-teal-50' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaymentMethod(tab.id as PaymentMethod)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                          paymentMethod === tab.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : `${tab.color} hover:shadow-xs`
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Payment Details Box with copy buttons */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
                    {paymentMethod === 'bkash' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">বিকাশ পেমেন্ট / সেন্ড মানি নম্বর:</span>
                          <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">বিকাশ</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-sm text-slate-900">{settings.bkashNumber || '01700-000000'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.bkashNumber || '01700-000000', 'bkash')}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            {copiedKey === 'bkash' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'bkash' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          * বিকাশ অ্যাপের 'Make Payment' বা 'Send Money' অপশনে গিয়ে উল্লেখিত নম্বরে অনুদান পাঠান। লেনদেন সম্পন্ন হওয়ার পর প্রাপ্ত TrxID নিচে লিখুন।
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'nagad' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">নগদ সেন্ড মানি / মার্চেন্ট নম্বর:</span>
                          <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">নগদ</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-sm text-slate-900">{settings.nagadNumber || '01800-000000'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.nagadNumber || '01800-000000', 'nagad')}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            {copiedKey === 'nagad' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'nagad' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          * নগদ অ্যাপ বা ইউএসএসডি (*167#) কোড ব্যবহার করে টাকা পাঠিয়ে ৮ বা ১০ ডিজিটের TrxID সংরক্ষণ করুন।
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'rocket' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">রকেট নম্বর:</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">রকেট</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                          <span className="font-mono font-bold text-sm text-slate-900">{settings.rocketNumber || '01900-000000'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(settings.rocketNumber || '01900-000000', 'rocket')}
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            {copiedKey === 'rocket' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'rocket' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'bank' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-600">অফিসিয়াল ব্যাংক একাউন্ট বিবরণ:</span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">ব্যাংক ট্রান্সফার</span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs text-slate-800">
                          <div><span className="text-slate-500 font-['Hind_Siliguri']">হিসাবের নাম:</span> <strong className="font-['Hind_Siliguri']">{settings.bankAccountName}</strong></div>
                          <div><span className="text-slate-500 font-['Hind_Siliguri']">ব্যাংক:</span> <strong className="font-['Hind_Siliguri']">{settings.bankName}</strong></div>
                          <div className="flex items-center justify-between">
                            <span><span className="text-slate-500 font-['Hind_Siliguri']">হিসাব নম্বর:</span> <strong>{settings.bankAccountNumber}</strong></span>
                            <button
                              type="button"
                              onClick={() => handleCopy(settings.bankAccountNumber, 'bank')}
                              className="text-[10px] font-bold text-emerald-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" /> কপি
                            </button>
                          </div>
                          <div><span className="text-slate-500 font-['Hind_Siliguri']">শাখা ও রাউটিং:</span> {settings.bankBranch} (রাউটিং: {settings.bankRoutingNo})</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Transaction ID & Sender Account */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      ট্রানজেকশন আইডি (TrxID) *
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="যেমন: BL72XK9M31"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      প্রেরকের নম্বর / একাউন্ট
                    </label>
                    <input
                      type="text"
                      value={senderAccount}
                      onChange={(e) => setSenderAccount(e.target.value)}
                      placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 5. Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      আপনার নাম {isAnonymous && '(অজ্ঞাতনামা নির্বাচিত)'}
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      value={isAnonymous ? 'উদার শুভানুধ্যায়ী' : donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="আপনার নাম..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      মোবাইল নম্বর (এসএমএস ও রসিদ পাওয়ার জন্য)
                    </label>
                    <input
                      type="tel"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anon-check"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="anon-check" className="text-xs text-slate-600 font-medium cursor-pointer">
                    আমার নাম গোপন রাখুন (পাবলিক তালিকায় নাম প্রকাশ করা হবে না)
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  {submitting ? 'অনুদান জমা হচ্ছে...' : `${formatTaka(parseFloat(amount) || 0)} অনুদান নিশ্চিত করুন`}
                </button>
              </form>
            </div>

            {/* Right Information & Trust Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Trust & Transparency Card */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">স্বচ্ছতা ও অঙ্গীকার</span>
                </div>

                <h3 className="text-lg font-bold font-['Hind_Siliguri',sans-serif]">
                  আপনার প্রতিটি টাকার শতভাগ হিসাব উন্মুক্ত
                </h3>

                <ul className="space-y-3 text-xs text-emerald-100/90 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>কোনো প্রশাসনিক ফি কর্তন ছাড়া সরাসরি মাঠপর্যায়ে ভুক্তভোগীদের সহায়তায় ব্যয়।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>প্রতিটি ব্যয়ের রসিদ ও ভাউচার প্ল্যাটফর্মের 'স্বচ্ছতা ও প্রভাব' পেজে উন্মুক্ত।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>যাচাইয়ের পর কিউআর কোডসহ ডাউনলোডযোগ্য অফিসিয়াল ডিজিটাল অনুদান রসিদ।</span>
                  </li>
                </ul>

                <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300">
                  <span>জরুরি হেল্পলাইন:</span>
                  <span className="font-mono font-bold text-white">{settings.helplinePhone}</span>
                </div>
              </div>

              {/* Need Help Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>সাহায্য প্রয়োজন?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  যদি আপনি নিজে বা আপনার পরিচিত কেউ চিকিৎসা, শিক্ষা বা খাদ্য সংকটে থাকেন, তবে সাহায্য আবেদন পেজে গিয়ে এখনই আবেদন জমা দিন।
                </p>
                <button
                  type="button"
                  onClick={() => window.location.hash = 'apply-help'}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors"
                >
                  সাহায্য আবেদন করুন
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
