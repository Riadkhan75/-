import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { submitComplaint } from '../services/firestoreService';
import { ComplaintTargetType } from '../types';
import { useAuth } from '../context/AuthContext';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTargetType?: ComplaintTargetType;
  defaultTargetId?: string;
  defaultTargetTitle?: string;
}

export const ComplaintsModal: React.FC<ComplaintsModalProps> = ({
  isOpen,
  onClose,
  defaultTargetType = 'help_request',
  defaultTargetId = '',
  defaultTargetTitle = ''
}) => {
  const { user } = useAuth();
  const [targetType, setTargetType] = useState<ComplaintTargetType>(defaultTargetType);
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('অনুগ্রহ করে অভিযোগের মূল কারণ উল্লেখ করুন');
      return;
    }
    if (!details.trim()) {
      setErrorMsg('অনুগ্রহ করে বিস্তারিত বিবরণ প্রদান করুন');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await submitComplaint({
        reporterId: user ? user.uid : 'anonymous',
        targetType,
        targetId: targetId.trim() || 'unspecified',
        reason: reason.trim(),
        details: details.trim()
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'অভিযোগ জমা দেওয়ার সময় ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setReason('');
    setDetails('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-700 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-200" />
            <h3 className="text-lg font-bold">অভিযোগ ও অপব্যবহার রিপোর্ট</h3>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="p-1 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">অভিযোগ সফলভাবে নথিভুক্ত হয়েছে</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                মানবতার সেবাকে স্বচ্ছ ও নিরাপদ রাখতে আপনার সতর্কতার জন্য ধন্যবাদ। আমাদের অ্যাডমিন টিম দ্রুত এটি খতিয়ে দেখে প্রয়োজনীয় ব্যবস্থা গ্রহণ করবে।
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all"
              >
                ঠিক আছে, বন্ধ করুন
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                কোনো ভুয়া তথ্য, আর্থিক অসঙ্গতি বা অসদাচরণের সন্ধান পেলে সরাসরি সুপার অ্যাডমিনের নিকট অভিযোগ জানান।
              </p>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Target Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রিপোর্টের বিভাগ
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as ComplaintTargetType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="help_request">সাহায্য আবেদন সম্পর্কিত অসঙ্গতি</option>
                  <option value="blood_donor">রক্তদাতা / রক্তের আবেদন সংক্রান্ত ভুয়া তথ্য</option>
                  <option value="campaign">ত্রাণ ক্যাম্পেইন সম্পর্কিত অভিযোগ</option>
                  <option value="user">কোনো ব্যবহারকারী বা ভলান্টিয়ারের অসদাচরণ</option>
                  <option value="other">অন্যান্য অনিয়ম</option>
                </select>
              </div>

              {/* Reference ID or Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নির্দিষ্ট রেফারেন্স বা আইডি (যদি জানা থাকে)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আবেদন রেফারেন্স #MS-2026-xxxx বা রক্তদাতার ফোন"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  অভিযোগের বিষয় বা মূল কারণ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ভুয়া প্রেসক্রিপশন, অর্থ আত্মসাতের চেষ্টা, ফোন বন্ধ পাওয়া ইত্যাদি"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিস্তারিত তথ্য ও প্রমাণাদির বিবরণ *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="ঘটনার পূর্ণ বিবরণ লিখুন যাতে অ্যাডমিন যাচাই করতে পারে..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'জমা হচ্ছে...' : 'অভিযোগ দাখিল করুন'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
