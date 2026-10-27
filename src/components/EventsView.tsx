import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getEvents, registerForEvent, getMyEventRegistrations } from '../services/firestoreService';
import { Event, EventRegistration } from '../types';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface EventsViewProps {
  onRequireAuth: () => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onRequireAuth }) => {
  const { user, userProfile } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [regPhone, setRegPhone] = useState(userProfile?.phone || '');
  const [regName, setRegName] = useState(userProfile?.displayName || user?.displayName || '');
  const [regRole, setRegRole] = useState('স্বেচ্ছাসেবক হিসেবে অংশ নেব');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [user]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const list = await getEvents();
      setEvents(list);
      if (user) {
        const myRegs = await getMyEventRegistrations(user.uid);
        setMyRegistrations(myRegs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !registeringEvent) {
      onRequireAuth();
      return;
    }

    setSubmittingReg(true);
    try {
      await registerForEvent({
        eventId: registeringEvent.id,
        eventTitle: registeringEvent.title,
        userId: user.uid,
        userName: regName.trim(),
        phone: regPhone.trim(),
        rolePreference: regRole
      });

      setRegSuccess(true);
      await loadEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReg(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
            <Calendar className="w-3.5 h-3.5" />
            মাঠপর্যায়ে সেবামূলক কর্মসূচি
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            সেবামূলক ইভেন্ট ও মানবিক ক্যাম্প
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            বিনামূল্যে বিশেষজ্ঞ চিকিৎসকদের সমন্বয়ে মেডিকেল ক্যাম্প, চক্ষু পরীক্ষা, রক্তদান উৎসব এবং শীতবস্ত্র বিতরণে সরাসরি অংশ নিন।
          </p>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">
            এই মুহূর্তে কোনো নির্ধারিত ইভেন্ট নেই
          </h4>
          <p className="text-xs text-slate-500">
            নতুন মেডিকেল ক্যাম্প ও ত্রাণ বিতরণ কর্মসূচি ঘোষণা করা হলে এখানে প্রকাশ করা হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isRegistered = myRegistrations.some(r => r.eventId === evt.id);
            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-bold rounded-full border border-teal-200">
                      {evt.district}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {evt.date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif] leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{evt.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      নিবন্ধিত: {toBengaliNumber(evt.registeredCount || 0)} জন
                    </span>
                    {evt.capacity ? (
                      <span>ধারণক্ষমতা: {toBengaliNumber(evt.capacity)}</span>
                    ) : null}
                  </div>

                  {isRegistered ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      আপনি এই ইভেন্টে নিবন্ধিত
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) {
                          onRequireAuth();
                        } else {
                          setRegisteringEvent(evt);
                          setRegSuccess(false);
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      অংশগ্রহণের জন্য নাম লেখান
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
                ইভেন্ট রেজিস্ট্রেশন
              </h4>
              <button
                onClick={() => setRegisteringEvent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {regSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-slate-800">রেজিস্ট্রেশন সফল হয়েছে!</h5>
                <p className="text-xs text-slate-600">
                  ইভেন্টের নির্ধারিত দিনে উপস্থিত হয়ে মানবতার সেবায় অংশ নিন।
                </p>
                <button
                  onClick={() => setRegisteringEvent(null)}
                  className="w-full py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইভেন্ট:</label>
                  <div className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-800">
                    {registeringEvent.title}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">আপনার নাম:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর:</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="০১৭১১-XXXXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">অংশগ্রহণের ভূমিকা:</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    <option value="স্বেচ্ছাসেবক হিসেবে অংশ নেব">স্বেচ্ছাসেবক হিসেবে সেবা প্রদান করব</option>
                    <option value="সেবাগ্রহীতা / অংশগ্রহণকারী">ক্যাম্প থেকে সেবা গ্রহণ করব</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-xs hover:bg-emerald-800 disabled:opacity-50"
                >
                  {submittingReg ? 'জমা হচ্ছে...' : 'রেজিস্ট্রেশন নিশ্চিত করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
