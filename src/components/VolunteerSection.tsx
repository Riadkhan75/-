import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitVolunteerApplication, getMyVolunteerApplication } from '../services/firestoreService';
import { VolunteerApplication, BD_DISTRICTS } from '../types';

interface VolunteerSectionProps {
  onRequireAuth: () => void;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({ onRequireAuth }) => {
  const { user, userProfile } = useAuth();

  const [myApplication, setMyApplication] = useState<VolunteerApplication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [name, setName] = useState(userProfile?.displayName || user?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [occupation, setOccupation] = useState('');
  const [skills, setSkills] = useState('');
  const [district, setDistrict] = useState(userProfile?.district || 'ঢাকা');
  const [upazila, setUpazila] = useState(userProfile?.upazila || '');
  const [preferredTeam, setPreferredTeam] = useState('ত্রাণ ও খাদ্য বিতরণ টিম');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(4);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const volunteerTeams = [
    'ত্রাণ ও খাদ্য বিতরণ টিম',
    'রক্তদান ও জরুরি রোগী সহায়তা সেল',
    'বিনামূল্যে মেডিকেল ক্যাম্প ও প্রাথমিক চিকিৎসা',
    'শীতবস্ত্র ও পুনর্বাসন টিম',
    'আইটি, মিডিয়া ও প্রচারণা সেল',
    'জরুরি দুর্যোগ অনুসন্ধান ও স্বেচ্ছাসেবক টিম'
  ];

  useEffect(() => {
    const fetchMyApp = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const app = await getMyVolunteerApplication(user.uid);
        setMyApplication(app);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApp();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!phone || phone.length < 11) {
      setErrorMsg('সঠিক মোবাইল নম্বর প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await submitVolunteerApplication({
        userId: user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occupation: occupation.trim() || 'শিক্ষার্থী/পেশাজীবী',
        skills: skills.trim(),
        district,
        upazila: upazila.trim() || district,
        preferredTeam,
        hoursPerWeek: Number(hoursPerWeek)
      });

      setSuccessMsg('আপনার স্বেচ্ছাসেবক আবেদন সফলভাবে গৃহীত হয়েছে! শীঘ্রই যাচাইকরণ সম্পন্ন করে টিমে যুক্ত করা হবে।');
      const updated = await getMyVolunteerApplication(user.uid);
      setMyApplication(updated);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            মানবতার সেবক
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            স্বেচ্ছাসেবক হিসেবে যোগদান করুন
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            আপনার অবসর সময়, মেধা ও মানবিক শ্রম দিয়ে অসহায় মানুষের মুখে হাসি ফোটান। বন্যার্তদের মাঝে ত্রাণ পৌঁছানো থেকে শুরু করে বিনামূল্যে ওষুধ বিতরণ—আপনার প্রতিটি পদক্ষেপ পরিবর্তন আনবে সমাজে।
          </p>
        </div>
      </div>

      {/* Active Application Status if applied */}
      {myApplication && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  আপনার স্বেচ্ছাসেবক আবেদন সক্রিয় রয়েছে
                </h3>
                <p className="text-xs text-slate-600">
                  টিম: <span className="font-semibold text-emerald-800">{myApplication.preferredTeam}</span> ({myApplication.district})
                </p>
              </div>
            </div>

            <div>
              {myApplication.status === 'pending' && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
                  যাচাইকরণ অপেক্ষমাণ
                </span>
              )}
              {myApplication.status === 'approved' && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  অনুমোদিত সদস্য
                </span>
              )}
              {myApplication.status === 'rejected' && (
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full border border-rose-300">
                  স্থগিত
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid: Pillars & Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 Col: Ethics & Volunteer Duties */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              স্বেচ্ছাসেবকের অঙ্গীকার
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>যেকোনো ধর্ম, বর্ণ বা রাজনৈতিক পরিচয়ের ঊর্ধ্বে উঠে মানুষের পাশে দাঁড়ানো।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>ত্রাণ ও অনুদান বিতরণে শতভাগ সততা ও নিরপেক্ষতা বজায় রাখা।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>অসহায় ও বিপন্ন মানুষের আত্মসম্মানহানি ঘটে এমন কোনো ছবি বা আচরণ না করা।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>জরুরি দুর্যোগে টিম লিডারের নির্দেশ মেনে সুশৃঙ্খলভাবে দায়িত্ব পালন।</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-teal-50 border border-teal-200 rounded-3xl text-xs text-teal-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-700" />
              স্বেচ্ছাসেবক সুবিধার স্বীকৃতি
            </h4>
            <p className="leading-relaxed">
              সক্রিয় সদস্যদের বাৎসরিক সেবামূলক সার্টিফিকেট, বিশেষ টি-শার্ট ও জাতীয় দুর্যোগ উদ্ধার ও ফার্স্ট এইড প্রশিক্ষণের সুযোগ প্রদান করা হয়।
            </p>
          </div>
        </div>

        {/* Right 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
              স্বেচ্ছাসেবক নিবন্ধন আবেদন
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              সঠিক তথ্য প্রদান করুন। আমাদের জেলা সমন্বয়ক আপনার সাথে সরাসরি যোগাযোগ করবেন।
            </p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদাঃ মোঃ নাজমুল হোসেন"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেশা / প্রতিষ্ঠান
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="উদাঃ শিক্ষার্থী, ঢাকা বিশ্ববিদ্যালয়"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
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
                  placeholder="উপজেলার নাম"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পছন্দের সেবামূলক টিম <span className="text-rose-500">*</span>
                </label>
                <select
                  value={preferredTeam}
                  onChange={(e) => setPreferredTeam(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  {volunteerTeams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  সাপ্তাহিক সম্ভাব্য সময় (ঘণ্টায়)
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                দক্ষতা ও পূর্ববর্তী অভিজ্ঞতা (যদি থাকে)
              </label>
              <textarea
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="উদাঃ প্রাথমিক চিকিৎসা প্রশিক্ষণ, সাঁতার, গ্রাফিক্স ডিজাইন, ড্রাইভিং, দুর্যোগ ত্রাণ কাজ..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  আবেদন সম্পন্ন করুন
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
