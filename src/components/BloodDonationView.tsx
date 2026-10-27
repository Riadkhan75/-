import React, { useState, useEffect } from 'react';
import { 
  Droplet, 
  Search, 
  MapPin, 
  Phone, 
  PlusCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Clock, 
  CheckCircle,
  Filter,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  searchBloodDonors, 
  getActiveBloodRequests, 
  registerBloodDonor, 
  createBloodRequest,
  getMyBloodDonor,
  toggleBloodDonorAvailability 
} from '../services/firestoreService';
import { BloodDonor, BloodRequest, BloodGroup, BD_DISTRICTS, BloodUrgency } from '../types';
import { toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';

interface BloodDonationViewProps {
  onRequireAuth: () => void;
}

export const BloodDonationView: React.FC<BloodDonationViewProps> = ({ onRequireAuth }) => {
  const { user, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'search' | 'requests' | 'register_donor' | 'post_request'>('search');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [myDonorRecord, setMyDonorRecord] = useState<BloodDonor | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Donor registration form state
  const [donorName, setDonorName] = useState(userProfile?.displayName || '');
  const [donorPhone, setDonorPhone] = useState(userProfile?.phone || '');
  const [donorGroup, setDonorGroup] = useState<BloodGroup>('O+');
  const [donorDistrict, setDonorDistrict] = useState(userProfile?.district || 'ঢাকা');
  const [donorUpazila, setDonorUpazila] = useState(userProfile?.upazila || '');
  const [donorConsent, setDonorConsent] = useState(false);
  const [submittingDonor, setSubmittingDonor] = useState(false);

  // Blood request form state
  const [reqPatient, setReqPatient] = useState('');
  const [reqGroup, setReqGroup] = useState<BloodGroup>('O+');
  const [reqBags, setReqBags] = useState<number>(1);
  const [reqHospital, setReqHospital] = useState('');
  const [reqDistrict, setReqDistrict] = useState('ঢাকা');
  const [reqUrgency, setReqUrgency] = useState<BloodUrgency>('emergency');
  const [reqNeededDate, setReqNeededDate] = useState('');
  const [reqContactName, setReqContactName] = useState(userProfile?.displayName || '');
  const [reqContactPhone, setReqContactPhone] = useState(userProfile?.phone || '');
  const [reqReason, setReqReason] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Protected contact reveal state for authenticated safety
  const [revealedDonors, setRevealedDonors] = useState<{ [id: string]: boolean }>({});

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const loadData = async () => {
    setLoading(true);
    try {
      const [donorList, reqList] = await Promise.all([
        searchBloodDonors(selectedGroup, selectedDistrict),
        getActiveBloodRequests()
      ]);
      setDonors(donorList);
      setBloodRequests(reqList);

      if (user) {
        const myDoc = await getMyBloodDonor(user.uid);
        setMyDonorRecord(myDoc);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGroup, selectedDistrict, user]);

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    if (!donorConsent) {
      setActionError('রক্তদানের জন্য যোগাযোগের সম্মতি প্রদান আবশ্যক।');
      return;
    }

    setSubmittingDonor(true);
    setActionError('');
    setActionSuccess('');

    try {
      await registerBloodDonor({
        userId: user.uid,
        donorName: donorName.trim() || 'স্বেচ্ছাসেবী রক্তদাতা',
        bloodGroup: donorGroup,
        district: donorDistrict,
        upazila: donorUpazila.trim() || donorDistrict,
        phone: donorPhone.trim(),
        isAvailable: true,
        consent: true
      });

      setActionSuccess('অভিনন্দন! আপনি সফলভাবে রক্তদাতা হিসেবে নিবন্ধিত হয়েছেন।');
      setActiveTab('search');
      await loadData();
    } catch (err: any) {
      setActionError('রক্তদাতা নিবন্ধন জমা হতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSubmittingDonor(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setSubmittingReq(true);
    setActionError('');
    setActionSuccess('');

    try {
      await createBloodRequest({
        requesterId: user.uid,
        patientName: reqPatient.trim(),
        bloodGroup: reqGroup,
        bagsNeeded: Number(reqBags),
        hospital: reqHospital.trim(),
        district: reqDistrict,
        upazila: reqDistrict,
        urgency: reqUrgency,
        neededDate: reqNeededDate.trim() || 'জরুরি ভিত্তিতে',
        contactName: reqContactName.trim(),
        contactPhone: reqContactPhone.trim(),
        reason: reqReason.trim()
      });

      setActionSuccess('রক্তের আবেদন সফলভাবে পোস্ট করা হয়েছে। তালিকাভুক্ত দাতারা সরাসরি দেখতে পারবেন।');
      setActiveTab('requests');
      await loadData();
    } catch (err: any) {
      setActionError('রক্তের আবেদন পোস্ট করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleToggleMyAvailability = async () => {
    if (!myDonorRecord) return;
    try {
      const nextState = !myDonorRecord.isAvailable;
      await toggleBloodDonorAvailability(myDonorRecord.id, nextState);
      setMyDonorRecord({ ...myDonorRecord, isAvailable: nextState });
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevealContact = (donorId: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setRevealedDonors(prev => ({ ...prev, [donorId]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-rose-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-rose-100">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            এক ব্যাগ রক্ত বাঁচায় একটি অমূল্য জীবন
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            সার্বজনীন রক্তদান সেবা নেটওয়ার্ক
          </h1>
          <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
            কোনো ধরনের আর্থিক লেনদেন ব্যতীত সম্পূর্ণ নিঃস্বার্থ স্বেচ্ছাসেবী রক্তদাতাদের সরাসরি অনুসন্ধান করুন অথবা জরুরি রক্তের আবেদন জানান।
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab('register_donor')}
              className="px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-rose-600" />
              রক্তদাতা হিসেবে নাম লিখুন
            </button>
            <button
              onClick={() => setActiveTab('post_request')}
              className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-900 text-white border border-rose-300/40 font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              জরুরি রক্তের প্রয়োজন?
            </button>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Donor Status Bar if logged in donor */}
      {myDonorRecord && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold font-mono">
              {myDonorRecord.bloodGroup}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                আপনার রক্তদাতা প্রোফাইল সক্রিয়
              </div>
              <div className="text-xs text-slate-600">
                অবস্থা: {myDonorRecord.isAvailable ? (
                  <span className="text-emerald-700 font-bold">রক্তদানে প্রস্তুত</span>
                ) : (
                  <span className="text-rose-700 font-bold">এই মুহূর্তে স্থগিত</span>
                )} ({myDonorRecord.district})
              </div>
            </div>
          </div>

          <button
            onClick={handleToggleMyAvailability}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              myDonorRecord.isAvailable
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
            }`}
          >
            {myDonorRecord.isAvailable ? 'অস্থায়ীভাবে স্থগিত করুন' : 'রক্তদানের জন্য প্রস্তুত করুন'}
          </button>
        </div>
      )}

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Search className="w-4 h-4" />
          রক্তদাতা খুঁজুন ({toBengaliNumber(donors.length)})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          জরুরি রক্তের নোটিশ ({toBengaliNumber(bloodRequests.length)})
        </button>

        <button
          onClick={() => setActiveTab('register_donor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'register_donor'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          রক্তদাতা ফর্ম
        </button>

        <button
          onClick={() => setActiveTab('post_request')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'post_request'
              ? 'bg-red-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          রক্তের রিকুয়েস্ট পোস্ট করুন
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: SEARCH DONORS */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Filters Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
              <Filter className="w-4 h-4 text-emerald-600" />
              গ্রুপ এবং এলাকা অনুযায়ী ফিল্টার করুন
            </div>

            {/* Blood group pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGroup === 'all'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সকল গ্রুপ
              </button>
              {bloodGroups.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedGroup(bg)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedGroup === bg
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            {/* District select */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1">জেলা নির্বাচন</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="all">সমগ্র বাংলাদেশ</option>
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Donor Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : donors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Droplet className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                এই গ্রুপ ও এলাকায় নিবন্ধিত কোনো রক্তদাতা পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                আপনি অথবা আপনার পরিচিত কাউকে রক্তদাতা হিসেবে যুক্ত করতে "রক্তদাতা ফর্ম" এ ক্লিক করে নিবন্ধন করুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((donor) => {
                const isRevealed = revealedDonors[donor.id];
                return (
                  <div
                    key={donor.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 font-['Hind_Siliguri',sans-serif]">
                          {donor.donorName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{donor.upazila ? `${donor.upazila}, ` : ''}{donor.district}</span>
                        </div>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-mono font-black text-lg shadow-2xs shrink-0">
                        {donor.bloodGroup}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        রক্তদানে প্রস্তুত
                      </span>

                      {/* Secure Contact Reveal with Auth Protection */}
                      {isRevealed ? (
                        <a
                          href={`tel:${donor.phone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white font-mono font-bold rounded-lg shadow-xs hover:bg-emerald-700 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {donor.phone}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevealContact(donor.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg font-semibold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          নম্বর দেখুন
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy & Anti-Scraping Notice */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs text-teal-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">রক্তদাতা গোপনীয়তা ও নীতি:</span> রক্তদাতাদের নম্বর পাবলিক ওয়েব বট ও স্ক্যামারদের থেকে নিরাপদ রাখতে একাউন্টে প্রবেশ আবশ্যক। কোনো বাণিজ্যিক বা অপ্রাসঙ্গিক কাজে রক্তদাতাদের ফোন দেওয়া সম্পূর্ণ নিষিদ্ধ।
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE BLOOD REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {bloodRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                এই মুহূর্তে কোনো রক্তের জরুরি রিকুয়েস্ট নেই
              </h4>
              <p className="text-xs text-slate-500">
                নতুন জরুরি রক্তের আবেদন থাকলে "রক্তের রিকুয়েস্ট পোস্ট করুন" বাটনে গিয়ে তথ্য দিন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bloodRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 ${
                    req.urgency === 'critical' ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-bold text-xs rounded-md">
                          {req.bloodGroup}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {toBengaliNumber(req.bagsNeeded)} ব্যাগ প্রয়োজন
                        </span>
                        {req.urgency === 'critical' && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                            অতীব জরুরি
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-2">
                        {req.hospital}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.district}</span>
                      </div>
                    </div>

                    <div className="text-right text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.neededDate}</span>
                      </div>
                    </div>
                  </div>

                  {req.reason && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-700">কারণ/রোগী:</span> {req.reason}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600">যোগাযোগ: {req.contactName}</span>
                    <a
                      href={`tel:${req.contactPhone}`}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {req.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGISTER AS DONOR FORM */}
      {activeTab === 'register_donor' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-rose-700">
            <Heart className="w-6 h-6 fill-rose-600" />
            <h3 className="text-xl font-bold font-['Hind_Siliguri',sans-serif] text-slate-900">
              রক্তদাতা হিসেবে নিবন্ধন
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-6">
            আপনার এক ব্যাগ রক্ত পারে মৃত্যুপথযাত্রী একজন মানুষকে নতুন জীবন উপহার দিতে।
          </p>

          <form onSubmit={handleRegisterDonor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                আপনার নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="পূর্ণ নাম"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রক্তের গ্রুপ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={donorGroup}
                  onChange={(e) => setDonorGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
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
                  value={donorDistrict}
                  onChange={(e) => setDonorDistrict(e.target.value)}
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
                  value={donorUpazila}
                  onChange={(e) => setDonorUpazila(e.target.value)}
                  placeholder="উপজেলার নাম"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={donorConsent}
                  onChange={(e) => setDonorConsent(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span>
                  আমি স্বেচ্ছায় ও কোনো আর্থিক প্রত্যাশা ছাড়া জরুরি প্রয়োজনে রক্তদানের জন্য আমার রক্তের গ্রুপ ও এলাকার তালিকাভুক্তি অনুমোদন করছি। <span className="text-rose-500">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingDonor || !donorConsent}
              className="w-full py-3 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {submittingDonor ? 'নিবন্ধন করা হচ্ছে...' : 'রক্তদাতা তালিকায় যুক্ত হন'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: POST BLOOD REQUEST */}
      {activeTab === 'post_request' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-red-700">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="text-xl font-bold font-['Hind_Siliguri',sans-serif] text-slate-900">
              জরুরি রক্তের প্রয়োজন পোস্ট করুন
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-6">
            সঠিক হাসপাতাল ও রোগীর তথ্য দিয়ে রক্তের নোটিশ প্রকাশ করুন।
          </p>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  প্রয়োজনীয় রক্তের গ্রুপ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reqGroup}
                  onChange={(e) => setReqGroup(e.target.value as BloodGroup)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কয় ব্যাগ প্রয়োজন? <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={reqBags}
                  onChange={(e) => setReqBags(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                হাসপাতালের নাম ও ঠিকানা <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reqHospital}
                onChange={(e) => setReqHospital(e.target.value)}
                placeholder="উদাঃ ঢাকা মেডিকেল কলেজ হাসপাতাল, নতুন ভবন"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জেলা <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reqDistrict}
                  onChange={(e) => setReqDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  জরুরি মাত্রা <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value as BloodUrgency)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  <option value="critical">অতীব জরুরি (১-২ ঘণ্টার মধ্যে)</option>
                  <option value="emergency">জরুরি (আজকের মধ্যে)</option>
                  <option value="standard">সাধারণ (নির্ধারিত অপারেশনের জন্য)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  যোগাযোগকারীর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reqContactName}
                  onChange={(e) => setReqContactName(e.target.value)}
                  placeholder="নাম"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  যোগাযোগের মোবাইল <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={reqContactPhone}
                  onChange={(e) => setReqContactPhone(e.target.value)}
                  placeholder="০১৭১১-XXXXXX"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                কখন রক্ত প্রয়োজন? (তারিখ ও সময়) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reqNeededDate}
                onChange={(e) => setReqNeededDate(e.target.value)}
                placeholder="উদাঃ আজ বিকাল ৫টা / কাল সকাল ১০টা"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                রোগীর অবস্থা বা সংক্ষিপ্ত কারণ
              </label>
              <input
                type="text"
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                placeholder="উদাঃ সিজারিয়ান অপারেশন / থ্যালাসেমিয়া"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReq}
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {submittingReq ? 'পোস্ট করা হচ্ছে...' : 'রক্তের নোটিশ প্রকাশ করুন'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
