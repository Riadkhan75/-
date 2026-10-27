import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Building, 
  PhoneCall, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitDonation } from '../services/firestoreService';
import { Campaign, PaymentMethod } from '../types';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  campaign
}) => {
  const { user, userProfile } = useAuth();

  const [amount, setAmount] = useState<string>('500');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [donorName, setDonorName] = useState(userProfile?.displayName || user?.displayName || '');
  const [donorPhone, setDonorPhone] = useState(userProfile?.phone || '');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [200, 500, 1000, 2500, 5000, 10000];

  const handleCopy = (text: string, key: string) => {
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
      await submitDonation({
        campaignId: campaign ? campaign.id : 'general',
        campaignTitle: campaign ? campaign.title : 'সাধারণ মানবকল্যাণ তহবিল',
        donorId: user ? user.uid : 'guest',
        donorName: donorName.trim() || 'উদার শুভানুধ্যায়ী',
        donorEmail: user?.email || '',
        donorPhone: donorPhone.trim(),
        amount: parsedAmount,
        paymentMethod,
        transactionId: transactionId.trim().toUpperCase(),
        senderAccount: senderAccount.trim()
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('অনুদান জমা প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setTransactionId('');
    setSenderAccount('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-6 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
              নিরাপদ অনুদান
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-['Hind_Siliguri',sans-serif]">
            {campaign ? campaign.title : 'সাধারণ কল্যাণ তহবিল'}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            আপনার সদকা ও মানবিক সাহায্য সরাসরি অসহায় মানুষের মুখে হাসি ফোটাবে
          </p>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-800">
                অনুদান তথ্য সফলভাবে জমা হয়েছে!
              </h4>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                ধন্যবাদ আপনার মহানুভবতার জন্য। আমাদের অর্থ ও হিসাব কমিটি ব্যাংক/এমএফএস স্টেটমেন্টের সাথে TrxID যাচাই করার পরপরই এটি ক্যাম্পেইনে যোগ হবে ও রসিদ তৈরি হবে।
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>অনুদান পরিমাণ:</span>
                <span className="font-bold text-slate-800">{toBengaliNumber(amount)} ৳</span>
              </div>
              <div className="flex justify-between">
                <span>মাধ্যম:</span>
                <span className="uppercase font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>TrxID:</span>
                <span className="font-bold text-emerald-700">{transactionId.toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-all"
            >
              সম্পন্ন করুন
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Manual Payment Accounts */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  ধাপ ১: অফিশিয়াল একাউন্টে টাকা পাঠান (ম্যানুয়াল অনুদান)
                </span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  ভেরিফায়েড
                </span>
              </div>

              {/* Account Selector Tabs */}
              <div className="grid grid-cols-4 gap-2">
                {(['bkash', 'nagad', 'rocket', 'bank'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all uppercase ${
                      paymentMethod === method
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Dynamic Payment Instruction Card */}
              <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs text-slate-700 space-y-2">
                {paymentMethod === 'bkash' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-rose-700">বিকাশ মার্চেন্ট (Send Money / Payment):</div>
                      <div className="font-mono text-sm font-bold text-slate-900">01711-000001</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('01711000001', 'bkash')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedKey === 'bkash' ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>
                )}

                {paymentMethod === 'nagad' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-orange-600">নগদ একাউন্ট:</div>
                      <div className="font-mono text-sm font-bold text-slate-900">01711-000002</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('01711000002', 'nagad')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedKey === 'nagad' ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>
                )}

                {paymentMethod === 'rocket' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-purple-700">রকেট একাউন্ট:</div>
                      <div className="font-mono text-sm font-bold text-slate-900">01711-000003-9</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('017110000039', 'rocket')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedKey === 'rocket' ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">ইসলামী ব্যাংক বাংলাদেশ লিমিটেড</div>
                        <div className="text-slate-600">হিসাবের নাম: মানবতার সেবা ট্রাস্ট ফান্ড</div>
                        <div className="font-mono font-bold text-emerald-800">A/C: 2050 1480 2000 78600</div>
                        <div className="text-[11px] text-slate-500">ধানমন্ডি শাখা, ঢাকা | রাউটিং: 125271844</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('20501480200078600', 'bank')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedKey === 'bank' ? 'কপি হয়েছে' : 'কপি'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Submit Details Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ধাপ ২: অনুদানের পরিমাণ (টাকায়) <span className="text-rose-500">*</span>
                </label>
                
                {/* Quick amount chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        amount === String(q)
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {toBengaliNumber(q)} ৳
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  required
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="পরিমাণ লিখুন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ট্রানজেকশন আইডি (TrxID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="উদাঃ 9H7K8P12XY"
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    প্রেরকের নম্বর (যে নম্বর থেকে পাঠিয়েছেন)
                  </label>
                  <input
                    type="text"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    placeholder="নম্বরের শেষ ৪ ডিজিট বা পুরো নম্বর"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    দাতার নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="নাম প্রকাশ না করতে চাইলে খালি রাখুন"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মোবাইল নম্বর (রসিদের জন্য)
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    অনুদান যাচাইয়ের জন্য জমা দিন
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                * কোনো পেমেন্ট গেটওয়ের ফাঁদে না ফেলে শতভাগ ব্যাংক ও এমএফএস স্টেটমেন্টের সাথে TrxID সরাসরি যাচাই করে অনুদান গ্রহণ করা হয়।
              </p>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
