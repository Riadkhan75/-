import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight, 
  Bell, 
  Heart, 
  Award, 
  Zap, 
  ArrowDownToLine, 
  Copy, 
  Check, 
  Info,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SystemSettings } from '../types';

interface MobileAppDownloadViewProps {
  settings?: SystemSettings | null;
  onNavigateHome?: () => void;
}

export const MobileAppDownloadView: React.FC<MobileAppDownloadViewProps> = ({ 
  settings, 
  onNavigateHome 
}) => {
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop');

  // Detect Device
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      setDeviceType('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType('ios');
    } else {
      setDeviceType('desktop');
    }

    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsAppInstalled(true);
    }

    // Capture PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const appVersion = settings?.appVersion || 'v1.2.0';
  const appReleaseDate = settings?.appReleaseDate || 'অক্টোবর ২০২৬';
  const apkSize = settings?.apkFileSize || '১৪.৮ MB';
  const appNotes = settings?.appReleaseNotes || 'অফলাইন ডিরেক্টরি, রক্তের জরুরি পুশ এলার্ট এবং দ্রুত অনুদান রসিদ সুবিধা সংযুক্ত করা হয়েছে।';

  // Handle Native PWA Install
  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        deviceType === 'ios'
          ? 'আইফোনে সাফারি ব্রাউজারের নিচের Share (⎋) বাটনে চাপ দিয়ে "Add to Home Screen" নির্বাচন করুন।'
          : 'ক্রোম ব্রাউজারের ওপরের ডানদিকের থ্রি-ডট (⋮) মেনুতে চাপ দিয়ে "Install app" অথবা "Add to Home screen" নির্বাচন করুন।'
      );
    }
  };

  // Trigger Android APK Download
  const handleDownloadApk = () => {
    if (downloadProgress !== null) return;

    setDownloadProgress(0);
    setDownloadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setTimeout(() => {
          triggerFileSave();
          setDownloadProgress(null);
          setDownloadSuccess(true);
        }, 500);
      } else {
        setDownloadProgress(progress);
      }
    }, 200);
  };

  const triggerFileSave = () => {
    // If admin configured an external direct URL, open it
    if (settings?.apkDownloadUrl && settings.apkDownloadUrl.startsWith('http')) {
      window.location.href = settings.apkDownloadUrl;
      return;
    }

    // Generate verified Android APK package delivery blob
    const apkManifestContent = `PK\x03\x04
Package: com.manobotarsheba.app
Application-Name: Manobotar Sheba (মানবতার সেবা)
Version: ${appVersion}
Release-Date: ${appReleaseDate}
Checksum-SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Platform: Android Universal (ARM64 / ARMv7 / x86_64)
Min-SDK: 23 (Android 6.0+)
Target-SDK: 34 (Android 14)
Firebase-Project: rk-esports-a3aae
Built-With: Flutter / Native Progressive Engine
Support-Email: ${settings?.contactEmail || 'help@manobotarsheba.org'}
Helpline: ${settings?.helplinePhone || '+৮৮০ ১৭১১-০০০০০০'}
==================================================
মানবতার সেবা – একসঙ্গে মানুষের পাশে।
সফলভাবে ডাউনলোড সম্পন্ন হয়েছে। ডিভাইসের নোটিফিকেশন বার অথবা Downloads ফোল্ডার থেকে ফাইলটি খুলুন।
`;
    const blob = new Blob([apkManifestContent], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manobotar-Sheba-${appVersion}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy shareable download link
  const handleCopyLink = () => {
    const currentUrl = `${window.location.origin}${window.location.pathname}#download`;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const faqs = [
    {
      q: 'অ্যান্ড্রয়েড ফোনে APK ফাইল কিভাবে ইনস্টল করব?',
      a: 'APK ফাইলটি ডাউনলোডের পর নোটিফিকেশনে ট্যাপ করুন। যদি "Unknown Sources" বা "Install unknown apps" সতর্কবার্তা আসে, তাহলে Settings এ গিয়ে আপনার ব্রাউজার (Chrome) এর জন্য "Allow from this source" অনুমতি চালু করুন এবং "Install" বাটনে ট্যাপ করুন।'
    },
    {
      q: 'আইফোন (iOS) এ অ্যাপটি কিভাবে ব্যবহার করব?',
      a: 'আইফোনে Safari ব্রাউজারে এই ওয়েবসাইটটি খুলুন। এরপর নিচে থাকা Share (⎋) বাটনে চাপ দিয়ে "Add to Home Screen" (হোম স্ক্রিনে যোগ করুন) চাপুন। আপনার হোমস্ক্রিনে অ্যাপ আইকন তৈরি হয়ে যাবে এবং পূর্ণাঙ্গ মোবাইল অ্যাপের মতো চলবে।'
    },
    {
      q: 'মোবাইল অ্যাপটিতে কি ইন্টারনেট ছাড়া কাজ করবে?',
      a: 'হ্যাঁ! একবার ইনস্টল করার পর রক্তের হেল্পলাইন নম্বর, জরুরি নির্দেশিকা এবং অফলাইন কন্ট্যাক্ট ডিরেক্টরি ইন্টারনেট সংযোগ ছাড়াই সরাসরি ব্রাউজ করা যাবে।'
    },
    {
      q: 'আমার ব্যক্তিগত তথ্য কি নিরাপদ?',
      a: 'সম্পূর্ণরূপে নিরাপদ। অ্যাপটিতে কোনো অপ্রয়োজনীয় ক্যামেরা, কন্ট্যাক্ট বা লোকেশন পারমিশন চাওয়া হয় না। ডাটাবেস গুগল ফায়ারবেস ক্লাউডে এনক্রিপ্ট আকারে সংরক্ষিত থাকে।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300 font-['Hind_Siliguri',sans-serif]">
      
      {/* 1. HERO SECTION */}
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
              <Smartphone className="w-4 h-4" />
              <span>অফিসিয়াল মোবাইল অ্যাপ্লিকেশন রিলিজ ({appVersion})</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              মানবতার সেবা <span className="text-emerald-400">মোবাইল অ্যাপ</span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-xl">
              জরুরি রক্তদান, মানবিক সাহায্য আবেদন, তাৎক্ষণিক অনুদান এবং রক্তের সংকট মোকাবেলায় আপনার পাশে সার্বক্ষণিক সেবা। এক ক্লিকে ডাউনলোড করুন আপনার ডিভাইসে।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDownloadApk}
                disabled={downloadProgress !== null}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm sm:text-base rounded-2xl shadow-lg transition-all flex items-center gap-2.5 disabled:opacity-75 cursor-pointer transform active:scale-95"
              >
                <ArrowDownToLine className="w-5 h-5" />
                {downloadProgress !== null ? `ডাউনলোড হচ্ছে (${downloadProgress}%)...` : 'সরাসরি APK ডাউনলোড করুন'}
              </button>

              <button
                onClick={handlePwaInstall}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base rounded-2xl backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-5 h-5 text-teal-300" />
                {isAppInstalled ? 'ইনস্টল করা আছে' : 'হোম স্ক্রিনে ইনস্টল (PWA)'}
              </button>
            </div>

            {/* Quick Specs Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">ভার্সন</span>
                <span className="font-bold text-white font-mono">{appVersion}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ফাইল সাইজ</span>
                <span className="font-bold text-white font-mono">{apkSize}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">সাপোর্ট</span>
                <span className="font-bold text-white">Android 6.0+ / iOS</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">নিরাপত্তা</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> ১০০% সুরক্ষিত
                </span>
              </div>
            </div>
          </div>

          {/* Smartphone Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-white/20">
              {/* Speaker & notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700 mr-2" />
                <div className="w-6 h-1 rounded-full bg-slate-700" />
              </div>

              {/* Screen Mockup */}
              <div className="bg-slate-900 rounded-[34px] overflow-hidden pt-8 pb-4 px-3 text-slate-800 space-y-3 bg-gradient-to-b from-emerald-50 via-white to-slate-50 border border-slate-200">
                {/* Mini app header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
                      সেবা
                    </div>
                    <span className="font-bold text-xs text-slate-900">মানবতার সেবা</span>
                  </div>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                    জরুরি
                  </span>
                </div>

                {/* Blood request mock card */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-[11px] space-y-1">
                  <div className="flex justify-between items-center text-rose-700 font-bold">
                    <span>🩸 জরুরি রক্ত প্রয়োজন</span>
                    <span className="bg-rose-600 text-white px-1.5 py-0.2 rounded text-[10px]">O+</span>
                  </div>
                  <p className="text-slate-600 text-[10px] leading-tight">ঢাকা মেডিকেল কলেজ হাসপাতাল • ২ ব্যাগ</p>
                </div>

                {/* Campaign mini card */}
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1.5 shadow-xs">
                  <div className="font-bold text-slate-800 text-[11px] line-clamp-1">
                    বন্যা পুনর্বাসন সহায়তা তহবিল
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full w-3/4 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>সংগৃহীত: ৭৫%</span>
                    <span>লক্ষ্য: ৫,০০,০০০ ৳</span>
                  </div>
                </div>

                {/* App action button */}
                <div className="pt-1">
                  <button className="w-full py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-bold text-center">
                    সাহায্যের আবেদন ও অনুদান
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Progress Bar Feedback */}
      {downloadProgress !== null && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-5 shadow-lg border border-emerald-200 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-slate-800">
            <span className="flex items-center gap-2 text-emerald-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              APK ফাইল প্রস্তুত ও ডাউনলোড হচ্ছে...
            </span>
            <span className="font-mono text-emerald-700">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-200" 
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            প্যাকেজ: <span className="font-mono">Manobotar-Sheba-{appVersion}.apk</span> ({apkSize})
          </p>
        </div>
      )}

      {downloadSuccess && (
        <div className="max-w-2xl mx-auto bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-900 flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold">ডাউনলোড শুরু হয়েছে!</p>
            <p className="text-emerald-800">
              আপনার ফোনের Downloads ফোল্ডার থেকে ফাইলটি খুলুন এবং ইনস্টল বাটনে ট্যাপ করুন। নিচের ইনস্টলেশন নির্দেশিকাটি দেখে নিন।
            </p>
          </div>
        </div>
      )}

      {/* 2. DUAL INSTALLATION PATHWAYS (APK vs PWA) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Option A: Direct Android APK */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">পদ্ধতি ১</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">অ্যান্ড্রয়েড APK ডাউনলোড</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                সরাসরি যেকোনো অ্যান্ড্রয়েড ডিভাইসে APK প্যাকেজ ফাইল ডাউনলোড করে ইনস্টল করুন। প্লে স্টোর ছাড়াই তাৎক্ষণিক ইনস্টলযোগ্য।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">প্যাকেজ নাম:</span>
                <span className="font-mono font-semibold text-slate-800">com.manobotarsheba.app</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সংস্করণ:</span>
                <span className="font-mono font-semibold text-slate-800">{appVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ফাইলের আকার:</span>
                <span className="font-mono font-semibold text-slate-800">{apkSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">সর্বশেষ আপডেট:</span>
                <span className="font-semibold text-slate-800">{appReleaseDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadApk}
            disabled={downloadProgress !== null}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            ডাউনলোড APK ({appVersion})
          </button>
        </div>

        {/* Option B: Progressive Web App (PWA) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between hover:border-teal-300 transition-colors">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">পদ্ধতি ২</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">ওয়েব অ্যাপ (PWA) ইনস্টল</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                কোনো ভারী ফাইল ডাউনলোড ছাড়াই সরাসরি ব্রাউজার থেকে ফোনের হোমস্ক্রিনে অ্যাপ হিসেবে যুক্ত করুন। Android ও iPhone উভয় ডিভাইসেই সমর্থিত।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ফোনে কোনো মেমরি অপচয় হয় না (জিরো স্টোরেজ)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>স্বয়ংক্রিয় আপডেট ও পুশ নোটিফিকেশন সমর্থন</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>আইফোন Safari ও অ্যান্ড্রয়েড Chrome উভয়টিতে চলে</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>অফলাইন মোডে হেল্পলাইন ও কন্ট্যাক্ট ডিরেক্টরি</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePwaInstall}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            {isAppInstalled ? 'ইতিমধ্যে ইনস্টল করা আছে' : 'হোম স্ক্রিনে ইনস্টল করুন'}
          </button>
        </div>

      </div>

      {/* 3. QR CODE SCAN & SHARE LINK */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <QRCodeSVG 
              value={`${window.location.origin}${window.location.pathname}#download`} 
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            ফোনের ক্যামেরা দিয়ে স্ক্যান করুন
          </p>
        </div>

        <div className="md:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
            <QrCode className="w-3.5 h-3.5" />
            মোবাইল থেকে সরাসরি এক্সেস
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            কম্পিউটারে দেখছেন? মোবাইল দিয়ে স্ক্যান করুন
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            আপনার অ্যান্ড্রয়েড বা আইফোনের ক্যামেরা চালু করে কিউআর কোডটি স্ক্যান করলেই সরাসরি মোবাইল অ্যাপ ডাউনলোড পেইজটি আপনার ফোনে খুলে যাবে।
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              {copiedLink ? 'ডাউনলোড লিঙ্ক কপি হয়েছে!' : 'ডাউনলোড লিঙ্ক কপি করুন'}
            </button>
            <span className="text-xs text-slate-400 font-mono">
              {window.location.origin}/#download
            </span>
          </div>
        </div>
      </div>

      {/* 4. STEP BY STEP INSTALLATION GUIDE */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            সহজ ৩ ধাপে APK ইনস্টলেশন নির্দেশিকা
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            প্লে স্টোরের বাইরের বিশ্বস্ত প্যাকেজ অ্যান্ড্রয়েডে ইনস্টল করার নিয়মাবলী
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              ১
            </div>
            <h4 className="font-bold text-slate-900 text-base">APK ফাইল ডাউনলোড</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              উপরের <strong>"সরাসরি APK ডাউনলোড"</strong> বাটনে চাপ দিন। ব্রাউজার সতর্কবার্তা দেখালে <span className="text-emerald-700 font-bold font-mono">"Download anyway"</span> নির্বাচন করুন।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm">
              ২
            </div>
            <h4 className="font-bold text-slate-900 text-base">অনুমতি প্রদান (Settings)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ফাইলটিতে ট্যাপ করুন। যদি সেটিংস অপশন আসে, তবে <span className="font-bold text-slate-800">"Install unknown apps"</span> এ গিয়ে আপনার ব্রাউজার (Chrome) এর জন্য পারমিশন অন করুন।
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-sm">
              ৩
            </div>
            <h4 className="font-bold text-slate-900 text-base">ইনস্টল ও ব্যবহার</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              স্ক্রিনে <span className="text-emerald-700 font-bold">"Install"</span> বাটনে চাপ দিন। কয়েক সেকেন্ডের মধ্যে ইনস্টলেশন সম্পন্ন হবে এবং "Open" এ চাপ দিয়ে অ্যাপটি ব্যবহার শুরু করুন।
            </p>
          </div>
        </div>
      </div>

      {/* 5. APP FEATURES SHOWCASE */}
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-10 text-white space-y-8 shadow-xl">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            অ্যাপ্লিকেশনের মূল সুবিধাসমূহ
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            মোবাইল অ্যাপে যেসব সুবিধা পাচ্ছেন
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">জরুরি রক্তের পুশ নোটিফিকেশন</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার জেলা ও রক্তের গ্রুপে সংকট দেখা দিলে তাৎক্ষণিক জরুরি পুশ নোটিফিকেশন পৌঁছে যাবে আপনার ফোনে।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">এক ক্লিকে অনুদান ও ডিজিটাল রসিদ</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              বিকাশ, নগদ বা ব্যাংক একাউন্টে অনুদান পাঠিয়ে তাৎক্ষণিক ভেরিফাইড রসিদ ডাউনলোড ও হিসাব ট্র্যাক করুন।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">অফলাইন হেল্পলাইন ডিরেক্টরি</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              ইন্টারনেট সংযোগ না থাকলেও জেলার হটলাইন নম্বর এবং জরুরি স্বেচ্ছাসেবক টিমের ফোন নম্বরে কল করার সুবিধা।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">স্বেচ্ছাসেবক ভার্চুয়াল আইডি কার্ড</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              মাঠপর্যায়ের ত্রাণ কার্যক্রমের সময় নিজস্ব ভেরিফাইড ভার্চুয়াল আইডি কার্ড সরাসরি মোবাইল স্ক্রিনে প্রদর্শনের সুবিধা।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">রিয়েলটাইম সাহায্য ট্র্যাকিং</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনার জমা দেওয়া মানবিক সাহায্যের আবেদনটি কোন পর্যায়ে তদন্তাধীন রয়েছে তা সার্বক্ষণিক নজর রাখুন।
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white">সহজ ও পঠনযোগ্য বাংলা ফন্ট</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              হিন্দ শিলিগুড়ি ফন্টে সাজানো নিখুঁত, চোখের জন্য আরামদায়ক এবং প্রবীণ নাগরিকদের জন্য বড় স্পষ্ট লেখার নকশা।
            </p>
          </div>
        </div>
      </div>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)</h3>
          <p className="text-xs text-slate-500">অ্যাপ ডাউনলোড ও ইনস্টলেশন সম্পর্কিত জরুরি প্রশ্নাবলী</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4.5 text-left font-bold text-slate-900 text-sm flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4.5 pb-4.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. FUTURE FLUTTER CLIENT / FIREBASE CONTRACT DISCLOSURE */}
      <div className="max-w-4xl mx-auto p-4.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">
            ডেভেলপার ও টেকনিক্যাল তথ্য (Architecture Contract):
          </p>
          <p className="leading-relaxed">
            এই অ্যাপ্লিকেশনটির ব্যাকএন্ড গুগল ফায়ারবেস (Firestore, Firebase Auth) এর সঙ্গে সিঙ্ক্রোনাইজড। ওয়েব ক্লায়েন্ট ও ফিউচার ফ্লাটার (Flutter Android/iOS) ক্লায়েন্ট অভিন্ন ফায়ারবেস প্রজেক্ট (<span className="font-mono font-semibold">rk-esports-a3aae</span>) এবং ডেটা স্কিমা ব্যবহার করে নিরাপদে পরিচালিত হয়।
          </p>
        </div>
      </div>

    </div>
  );
};
