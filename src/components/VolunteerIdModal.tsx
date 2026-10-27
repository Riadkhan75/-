import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Award, ShieldCheck, HeartHandshake, MapPin } from 'lucide-react';
import { VolunteerApplication } from '../types';

interface VolunteerIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  volunteer: VolunteerApplication | null;
}

export const VolunteerIdModal: React.FC<VolunteerIdModalProps> = ({
  isOpen,
  onClose,
  volunteer
}) => {
  if (!isOpen || !volunteer) return null;

  const handlePrint = () => {
    window.print();
  };

  const idCardNo = volunteer.volunteerIdCard || `VOL-MS-${volunteer.id.slice(0, 6).toUpperCase()}`;
  const verifyUrl = `${window.location.origin}/#volunteer-${idCardNo}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-teal-100 flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-300" />
            <h3 className="text-base font-bold">ডিজিটাল ভলান্টিয়ার আইডি কার্ড</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Card Mockup */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 text-white p-5 shadow-xl border border-teal-600/30">
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-teal-500/20 rounded-full blur-xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">মানবতার সেবা</h4>
                  <p className="text-[10px] text-teal-200">অফিশিয়াল স্বেচ্ছাসেবক শাখা</p>
                </div>
              </div>
              <div className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-[10px] font-semibold text-emerald-300">
                স্বীকৃত ভলান্টিয়ার
              </div>
            </div>

            {/* Card Body Profile */}
            <div className="py-4 flex gap-4 items-center">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-900 font-bold flex items-center justify-center text-2xl shadow-md border-2 border-white/40 shrink-0">
                {volunteer.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h5 className="text-lg font-bold text-white flex items-center gap-1.5">
                  {volunteer.name}
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                </h5>
                <p className="text-xs text-teal-200 font-medium">দল: {volunteer.preferredTeam || 'সাধারণ স্বেচ্ছাসেবক'}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  {volunteer.district}, {volunteer.upazila}
                </p>
              </div>
            </div>

            {/* Details & QR */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div>
                  <span className="text-[10px] text-teal-300 block">আইডি কার্ড নম্বর:</span>
                  <span className="font-mono font-bold tracking-wider text-white text-xs">{idCardNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-300 block">অর্জিত সেবা পয়েন্ট:</span>
                  <span className="font-bold text-amber-300 text-xs">{volunteer.points || 0} পয়েন্ট</span>
                </div>
              </div>
              <div className="p-1.5 bg-white rounded-xl shadow-xs">
                <QRCodeSVG value={verifyUrl} size={64} level="L" />
              </div>
            </div>
          </div>

          {/* Verification info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              সরাসরি ফিল্ড ভেরিফিকেশন নির্দেশিকা
            </p>
            <p className="text-[11px] text-slate-500">
              ত্রাণ বিতরণ, ফ্রি মেডিকেল ক্যাম্প অথবা রক্তদান সমন্বয়ের সময় ফিল্ড সুপারভাইজার বা সাধারণ নাগরিকরা এই কার্ডের কিউআর কোড স্ক্যান করে অনলাইন ডাটাবেজের সাথে সত্যতা মিলিয়ে নিতে পারবেন।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl"
          >
            বন্ধ করুন
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            আইডি কার্ড প্রিন্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
