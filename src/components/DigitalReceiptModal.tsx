import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Donation } from '../types';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  donation
}) => {
  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptUrl = `${window.location.origin}/#receipt-${donation.receiptNo || donation.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <h3 className="text-lg font-bold">অফিশিয়াল ডিজিটাল অনুদান রসিদ</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Header & Logo */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white shadow-md mb-2">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-950">মানবতার সেবা</h2>
            <p className="text-xs text-emerald-800 font-medium">একসঙ্গে মানুষের পাশে • সামাজিক কল্যাণ সংস্থা</p>
            <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              যাচাইকৃত অনুদান রসিদ (Verified Digital Receipt)
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <p className="text-xs text-slate-500 font-medium">রসিদ নম্বর</p>
              <p className="font-mono font-bold text-emerald-900 text-base">{donation.receiptNo || 'RC-MS-PENDING'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">তারিখ ও সময়</p>
              <p className="font-medium text-slate-700">
                {donation.verifiedAt 
                  ? new Date(donation.verifiedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
                  : new Date(donation.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">দানকারীর নাম</p>
              <p className="font-semibold text-slate-900">{donation.donorName || 'সম্মানিত শুভাকাঙ্ক্ষী'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">পেমেন্ট মাধ্যম</p>
              <p className="font-medium text-slate-700 capitalize">{donation.paymentMethod} (TrxID: {donation.transactionId})</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-500 font-medium">ক্যাম্পেইন / খাত</p>
              <p className="font-semibold text-emerald-900">{donation.campaignTitle || 'সার্বজনীন কল্যাণ তহবিল'}</p>
            </div>
          </div>

          {/* Amount Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-center">
            <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">গৃহীত অনুদানের পরিমাণ</p>
            <p className="text-3xl font-extrabold text-emerald-900 mt-1">
              {Number(donation.amount).toLocaleString('bn-BD')} ৳
            </p>
            <p className="text-xs text-emerald-700 mt-1">
              স্ট্যাটাস: <span className="font-bold text-emerald-800">যাচাইকৃত ও তহবিলে অন্তর্ভুক্ত</span>
            </p>
          </div>

          {/* QR Code Verification Section */}
          <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
            <div className="space-y-1 pr-4">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ডিজিটাল কিউআর যাচাইকরণ
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                যেকোনো স্মার্টফোন দিয়ে কিউআর স্ক্যান করে রসিদের সত্যতা যাচাই করা যাবে।
              </p>
            </div>
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
              <QRCodeSVG value={receiptUrl} size={84} level="M" />
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            এটি একটি সিস্টেম-জেনারেটেড অফিশিয়াল ডিজিটাল রশিদ। এটি কোনো ধরনের করযোগ্য বিক্রয় রসিদ নয়, একটি অলাভজনক মানবিক অনুদান স্বীকৃতি।
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            রসিদ প্রিন্ট বা পিডিএফ সংরক্ষণ
          </button>
        </div>
      </div>
    </div>
  );
};
