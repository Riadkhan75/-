import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const translateFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('user-not-found')) return 'এই ইমেইল দিয়ে কোনো একাউন্ট পাওয়া যায়নি।';
    if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
    if (code.includes('email-already-in-use')) return 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে।';
    if (code.includes('weak-password')) return 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।';
    if (code.includes('invalid-email')) return 'অনুগ্রহ করে সঠিক ইমেইল ঠিকানা প্রদান করুন।';
    if (code.includes('popup-closed-by-user')) return 'লগইন উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।';
    return err?.message || 'একটি ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          setErrorMsg('আপনার সম্পূর্ণ নাম লিখুন।');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, name.trim());
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।');
      }
    } catch (err: any) {
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-200">
              নিরাপদ প্রবেশাধিকার
            </span>
          </div>
          <h3 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif]">
            {mode === 'login' && 'অ্যাকাউন্টে প্রবেশ করুন'}
            {mode === 'register' && 'নতুন সদস্য নিবন্ধন'}
            {mode === 'forgot' && 'পাসওয়ার্ড উদ্ধার'}
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            মানবতার সেবা প্ল্যাটফর্মে আপনাকে স্বাগতম
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Google Sign-in button */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 text-sm font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google অ্যাকাউন্ট দিয়ে সরাসরি প্রবেশ
              </button>

              <div className="relative flex py-3 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-4 text-xs font-medium text-slate-400">
                  অথবা ইমেইল দিয়ে
                </span>
                <div className="grow border-t border-slate-200"></div>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ইমেইল ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    পাসওয়ার্ড <span className="text-rose-500">*</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' && 'লগইন করুন'}
                  {mode === 'register' && 'নিবন্ধন সম্পন্ন করুন'}
                  {mode === 'forgot' && 'রিসেট লিঙ্ক পাঠান'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle modes */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            {mode === 'login' && (
              <p>
                নতুন সদস্য?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  বিনামূল্যে নিবন্ধন করুন
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p>
                ইতোমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  সরাসরি লগইন করুন
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                মনে পড়েছে?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  লগইনে ফিরে যান
                </button>
              </p>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            আপনার ডেটা সুরক্ষিত। কোনো গোপন পাসওয়ার্ড বা সংবেদনশীল তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
          </p>
        </div>

      </div>
    </div>
  );
};
