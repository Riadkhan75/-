import React, { useState, useEffect } from 'react';
import { 
  User, 
  HandHeart, 
  Droplet, 
  Heart, 
  Calendar, 
  Users, 
  Receipt, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Save, 
  ShieldCheck,
  FileText,
  BadgeCheck,
  Award,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getMyHelpRequests, 
  getMyDonations, 
  getMyBloodDonor, 
  getMyVolunteerApplication,
  getMyEventRegistrations,
  submitProfileVerification,
  getMyVerificationRequest
} from '../services/firestoreService';
import { 
  HelpRequest, 
  Donation, 
  BloodDonor, 
  VolunteerApplication, 
  EventRegistration,
  VerificationRequest,
  BD_DISTRICTS,
  HELP_STATUS_LABELS,
  HELP_CATEGORY_LABELS
} from '../types';
import { formatTaka, toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';
import { DigitalReceiptModal } from './DigitalReceiptModal';
import { VolunteerIdModal } from './VolunteerIdModal';
import { HelpChatModal } from './HelpChatModal';
import { ComplaintsModal } from './ComplaintsModal';

interface UserDashboardViewProps {
  onOpenHelpModal: () => void;
  onNavigate: (tab: string) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  onOpenHelpModal,
  onNavigate
}) => {
  const { user, userProfile, updateUserProfileData, isSuperAdmin, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'requests' | 'donations' | 'blood' | 'volunteer' | 'events' | 'verification' | 'profile'>('requests');
  
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [bloodDonor, setBloodDonor] = useState<BloodDonor | null>(null);
  const [volunteerApp, setVolunteerApp] = useState<VolunteerApplication | null>(null);
  const [eventRegs, setEventRegs] = useState<EventRegistration[]>([]);
  const [verificationReq, setVerificationReq] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [volunteerIdModalOpen, setVolunteerIdModalOpen] = useState(false);
  
  // Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatRequest, setChatRequest] = useState<HelpRequest | null>(null);

  // Complaint Modal State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintTarget, setComplaintTarget] = useState<{ id: string; title: string }>({ id: '', title: '' });

  // Verification Form State
  const [idType, setIdType] = useState<'nid' | 'birth_cert' | 'passport'>('nid');
  const [idNumberMasked, setIdNumberMasked] = useState('');
  const [verifReason, setVerifReason] = useState('');
  const [verifSubmitting, setVerifSubmitting] = useState(false);
  const [verifSuccess, setVerifSuccess] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState(userProfile?.displayName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editDistrict, setEditDistrict] = useState(userProfile?.district || 'ঢাকা');
  const [editUpazila, setEditUpazila] = useState(userProfile?.upazila || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [hList, dList, bDoc, vDoc, eList, verifDoc] = await Promise.all([
          getMyHelpRequests(user.uid),
          getMyDonations(user.uid),
          getMyBloodDonor(user.uid),
          getMyVolunteerApplication(user.uid),
          getMyEventRegistrations(user.uid),
          getMyVerificationRequest(user.uid)
        ]);
        setHelpRequests(hList);
        setDonations(dList);
        setBloodDonor(bDoc);
        setVolunteerApp(vDoc);
        setEventRegs(eList);
        setVerificationReq(verifDoc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleOpenReceipt = (d: Donation) => {
    setSelectedDonationForReceipt(d);
    setReceiptModalOpen(true);
  };

  const handleOpenChat = (req: HelpRequest) => {
    setChatRequest(req);
    setChatModalOpen(true);
  };

  const handleOpenComplaint = (req: HelpRequest) => {
    setComplaintTarget({ id: req.referenceNo, title: req.title });
    setComplaintModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateUserProfileData({
        displayName: editName.trim(),
        phone: editPhone.trim(),
        district: editDistrict,
        upazila: editUpazila.trim()
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumberMasked.trim() || !user) return;

    setVerifSubmitting(true);
    try {
      await submitProfileVerification({
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'সম্মানিত নাগরিক',
        idType,
        idNumberMasked: idNumberMasked.trim(),
        reason: verifReason.trim() || 'নাগরিক সেবা ও বিশ্বাসযোগ্যতা নিশ্চিতকরণ'
      });
      setVerifSuccess(true);
      const vDoc = await getMyVerificationRequest(user.uid);
      setVerificationReq(vDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">
          আপনার ড্যাশবোর্ড দেখতে অনুগ্রহ করে লগইন করুন
        </h3>
        <p className="text-xs text-slate-500">
          আবেদন ও অনুদানের সমস্ত রেকর্ড আপনার অ্যাকাউন্টে সুরক্ষিত রয়েছে।
        </p>
      </div>
    );
  }

  const isProfileVerified = userProfile?.isVerified || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-bold font-mono border border-white/20 shadow-inner shrink-0">
            {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-['Hind_Siliguri',sans-serif]">
                {userProfile?.displayName || user.displayName || 'সম্মানিত নাগরিক'}
              </h1>
              {isProfileVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/90 text-white text-[11px] font-bold rounded-full shadow-xs">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  যাচাইকৃত প্রোফাইল
                </span>
              )}
              {isSuperAdmin && (
                <span className="px-2.5 py-0.5 bg-purple-500/80 text-white text-[11px] font-bold rounded-full">
                  সুপার অ্যাডমিন
                </span>
              )}
              {!isSuperAdmin && isAdmin && (
                <span className="px-2.5 py-0.5 bg-blue-500/80 text-white text-[11px] font-bold rounded-full">
                  অ্যাডমিন
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100 font-mono mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 text-xs text-emerald-200 mt-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{userProfile?.district || 'বাংলাদেশ'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('apply-help')}
            className="px-4 py-2 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
          >
            <HandHeart className="w-4 h-4 text-emerald-700" />
            সাহায্য আবেদন করুন
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              সুপার অ্যাডমিন প্যানেল
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HandHeart className="w-4 h-4" />
          আমার সাহায্য আবেদন ({toBengaliNumber(helpRequests.length)})
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'donations'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          আমার অনুদান ও রসিদ ({toBengaliNumber(donations.length)})
        </button>

        <button
          onClick={() => setActiveTab('blood')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'blood'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplet className="w-4 h-4" />
          রক্তদাতা কার্ড
        </button>

        <button
          onClick={() => setActiveTab('volunteer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'volunteer'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          স্বেচ্ছাসেবক আইডি ও পয়েন্ট
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          ইভেন্ট ({toBengaliNumber(eventRegs.length)})
        </button>

        <button
          onClick={() => setActiveTab('verification')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'verification'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          প্রোফাইল ভেরিফিকেশন
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          প্রোফাইল পরিবর্তন
        </button>
      </div>

      {/* TAB 1: HELP REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
          ) : helpRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <HandHeart className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                আপনি এখনও কোনো সাহায্যের আবেদন জমা দেননি
              </h4>
              <p className="text-xs text-slate-500">
                চিকিৎসা, শিক্ষা বা দুর্যোগ ত্রাণের জন্য যেকোনো সময় আবেদন করতে পারেন।
              </p>
              <button
                onClick={() => onNavigate('apply-help')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                আবেদন ফর্ম খুলুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {helpRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                        {req.referenceNo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${HELP_STATUS_LABELS[req.status]?.color}`}>
                        {HELP_STATUS_LABELS[req.status]?.label}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">
                        {HELP_CATEGORY_LABELS[req.category]}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{req.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">{req.description}</p>
                    </div>

                    {req.adminNotes && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-emerald-800">অ্যাডমিন নোট: </span>
                        {req.adminNotes}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>তারিখ: {toBengaliDate(req.createdAt)}</span>
                      {req.amountNeeded ? (
                        <span className="font-bold text-emerald-800">{formatTaka(req.amountNeeded)}</span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenChat(req)}
                        className="grow py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        সহায়তা চ্যাট ও মেসেজ
                      </button>
                      <button
                        onClick={() => handleOpenComplaint(req)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="অসঙ্গতি রিপোর্ট করুন"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DONATIONS & RECEIPTS */}
      {activeTab === 'donations' && (
        <div className="space-y-4">
          {donations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">কোনো অনুদানের রেকর্ড পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500">আপনার প্রতিটি অনুদান সমাজ পরিবর্তনের শক্তি।</p>
              <button
                onClick={() => onNavigate('campaigns')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                চলমান ক্যাম্পেইন দেখুন
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              {donations.map((d) => (
                <div key={d.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{d.campaignTitle}</span>
                      {d.status === 'verified' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          যাচাইকৃত (অফিসিয়াল)
                        </span>
                      )}
                      {d.status === 'pending_verification' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                          যাচাইকরণ প্রক্রিয়াধীন
                        </span>
                      )}
                      {d.status === 'rejected' && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full">
                          অস্বীকৃত
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      মাধ্যম: <span className="uppercase font-bold">{d.paymentMethod}</span> | TrxID: {d.transactionId}
                    </div>
                    {d.receiptNo && (
                      <div className="text-xs text-emerald-700 font-semibold font-mono">
                        রসিদ নম্বর: {d.receiptNo}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-800 font-['Hind_Siliguri',sans-serif]">
                        +{formatTaka(d.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {toBengaliDate(d.createdAt)}
                      </div>
                    </div>
                    {d.status === 'verified' && (
                      <button
                        onClick={() => handleOpenReceipt(d)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                        ডিজিটাল রসিদ দেখুন
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BLOOD DONOR CARD */}
      {activeTab === 'blood' && (
        <div className="max-w-md mx-auto">
          {bloodDonor ? (
            <div className="bg-gradient-to-br from-rose-700 to-red-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs tracking-wider uppercase font-semibold text-rose-200">
                  ডিজিটাল রক্তদাতা পরিচয়পত্র
                </span>
                <span className="w-12 h-12 rounded-2xl bg-white text-rose-800 flex items-center justify-center font-mono font-black text-xl shadow-md">
                  {bloodDonor.bloodGroup}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold font-['Hind_Siliguri',sans-serif]">
                  {bloodDonor.donorName}
                </h3>
                <p className="text-xs text-rose-100 mt-1">
                  এলাকা: {bloodDonor.upazila ? `${bloodDonor.upazila}, ` : ''}{bloodDonor.district}
                </p>
                <p className="text-xs font-mono text-rose-200 mt-0.5">
                  ফোন: {bloodDonor.phone}
                </p>
              </div>

              <div className="pt-3 border-t border-rose-600/60 flex items-center justify-between text-xs">
                <span>অবস্থা: {bloodDonor.isAvailable ? 'রক্তদানে প্রস্তুত' : 'সাময়িক স্থগিত'}</span>
                <span className="text-[10px] text-rose-200">মানবতার সেবা রক্ত নেটওয়ার্ক</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Droplet className="w-10 h-10 text-rose-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                আপনি এখনও রক্তদাতা হিসেবে নিবন্ধিত নন
              </h4>
              <p className="text-xs text-slate-500">
                আপনার রক্তের গ্রুপ যুক্ত করে জরুরি সময়ে একজন মানুষের জীবন বাঁচাতে এগিয়ে আসুন।
              </p>
              <button
                onClick={() => onNavigate('blood')}
                className="px-4 py-2 bg-rose-700 text-white text-xs font-bold rounded-xl hover:bg-rose-800"
              >
                রক্তদাতা নিবন্ধন করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: VOLUNTEER STATUS & DIGITAL ID */}
      {activeTab === 'volunteer' && (
        <div className="max-w-xl mx-auto space-y-4">
          {volunteerApp ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">স্বেচ্ছাসেবক প্রোফাইল ও পয়েন্ট</h4>
                  <p className="text-xs text-slate-500">মাঠপর্যায়ের মানবিক অংশগ্রহণ স্বীকৃতি</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {volunteerApp.status === 'approved' ? 'অনুমোদিত ভলান্টিয়ার' : 'পর্যালোচনাধীন'}
                </span>
              </div>

              {/* Point Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-800 font-medium">অর্জিত সমাজসেবা পয়েন্ট</p>
                  <p className="text-2xl font-black text-teal-950 mt-0.5">{volunteerApp.points || 0} পয়েন্ট</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <div>টিম: <span className="font-bold text-slate-800">{volunteerApp.preferredTeam}</span></div>
                <div>দায়িত্বপ্রাপ্ত এলাকা: <span className="font-bold text-slate-800">{volunteerApp.district}</span></div>
                {volunteerApp.skills && (
                  <div>বিশেষ দক্ষতা: <span className="text-slate-700">{volunteerApp.skills}</span></div>
                )}
                <div>আবেদনের তারিখ: {toBengaliDate(volunteerApp.createdAt)}</div>
              </div>

              {volunteerApp.status === 'approved' && (
                <div className="pt-2">
                  <button
                    onClick={() => setVolunteerIdModalOpen(true)}
                    className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Award className="w-4 h-4 text-teal-300" />
                    ডিজিটাল ভলান্টিয়ার আইডি কার্ড দেখুন ও প্রিন্ট করুন
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Users className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">
                স্বেচ্ছাসেবক আবেদন পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500">
                আমাদের মাঠপর্যায়ের সেবামূলক টিমে যুক্ত হতে আবেদন করুন।
              </p>
              <button
                onClick={() => onNavigate('volunteer')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                স্বেচ্ছাসেবক ফর্ম পূরণ করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {eventRegs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">কোনো ইভেন্টে অংশগ্রহণ রেকর্ড নেই</h4>
              <p className="text-xs text-slate-500">আসন্ন মেডিকেল ক্যাম্প ও ত্রাণ বিতরণ ইভেন্টে অংশ নিন।</p>
              <button
                onClick={() => onNavigate('events')}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800"
              >
                ইভেন্টসমূহ দেখুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventRegs.map((reg) => (
                <div key={reg.id} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">{reg.eventTitle || 'সেবামূলক ইভেন্ট'}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      নিশ্চিত
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">ভূমিকা: {reg.rolePreference}</div>
                  <div className="text-[11px] text-slate-400">নিবন্ধিত তারিখ: {toBengaliDate(reg.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROFILE VERIFICATION (FEATURE 2) */}
      {activeTab === 'verification' && (
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-blue-600" />
            <h4 className="text-base font-bold text-slate-900">নাগরিক প্রোফাইল ভেরিফিকেশন</h4>
          </div>

          {isProfileVerified ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
              <h5 className="font-bold text-blue-900 text-sm">আপনার প্রোফাইল সম্পূর্ণ ভেরিফায়েড</h5>
              <p className="text-xs text-blue-700">
                জাতীয় পরিচয়পত্র/পাসপোর্ট তথ্য যাচাইয়ের পর আপনার প্রোফাইলে নীল ব্যাজ সক্রিয় করা হয়েছে।
              </p>
            </div>
          ) : verificationReq ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
              <div className="flex items-center justify-between font-bold">
                <span>আবেদনের অবস্থা: {verificationReq.status === 'pending' ? 'পর্যালোচনাধীন' : verificationReq.status}</span>
                <span className="text-[10px] text-amber-700">
                  {new Date(verificationReq.submittedAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <p className="text-amber-800">
                আইডি ধরন: <span className="uppercase font-semibold">{verificationReq.idType}</span> | নম্বর: {verificationReq.idNumberMasked}
              </p>
              {verificationReq.reviewerNotes && (
                <div className="p-2 bg-white/80 rounded-lg text-slate-700 mt-2">
                  অ্যাডমিন মন্তব্য: {verificationReq.reviewerNotes}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
              <p className="text-slate-500">
                জরুরি সাহায্য গ্রহণ, রক্তদাতা হিসেবে আস্থা বৃদ্ধি এবং নিরাপদ অনুদান সংগ্রহের জন্য আপনার প্রোফাইল ভেরিফাই করুন।
              </p>

              {verifSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">
                  আবেদন সফলভাবে গৃহীত হয়েছে! অ্যাডমিন পর্যালোচনা করবেন।
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পরিচয়পত্রের ধরন:</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  <option value="nid">জাতীয় পরিচয়পত্র (NID)</option>
                  <option value="birth_cert">জন্ম নিবন্ধন সনদ (Birth Certificate)</option>
                  <option value="passport">পাসপোর্ট (Passport)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  নম্বর (গোপনীয়তার জন্য মাস্কড যেমন: 1990xxxx8901):
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 1992xxxx5678"
                  value={idNumberMasked}
                  onChange={(e) => setIdNumberMasked(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ভেরিফিকেশনের উদ্দেশ্য:</label>
                <input
                  type="text"
                  placeholder="যেমন: নিয়মিত রক্তদাতা হিসেবে আস্থা বৃদ্ধি"
                  value={verifReason}
                  onChange={(e) => setVerifReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={verifSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <BadgeCheck className="w-4 h-4" />
                {verifSubmitting ? 'জমা হচ্ছে...' : 'ভেরিফিকেশন আবেদন দাখিল করুন'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 7: EDIT PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-base font-bold text-slate-900">ব্যক্তিগত তথ্য আপডেট করুন</h4>

          {profileSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">পূর্ণ নাম:</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর:</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="০১৭১১-XXXXXX"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">জেলা:</label>
                <select
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">উপজেলা:</label>
                <input
                  type="text"
                  value={editUpazila}
                  onChange={(e) => setEditUpazila(e.target.value)}
                  placeholder="উপজেলা"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </form>
        </div>
      )}

      {/* Sub-modals */}
      <DigitalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        donation={selectedDonationForReceipt}
      />

      <VolunteerIdModal
        isOpen={volunteerIdModalOpen}
        onClose={() => setVolunteerIdModalOpen(false)}
        volunteer={volunteerApp}
      />

      {chatRequest && (
        <HelpChatModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setChatRequest(null);
          }}
          requestId={chatRequest.id}
          applicantId={chatRequest.ownerId}
          applicantName={chatRequest.applicantName}
          requestTitle={chatRequest.title}
        />
      )}

      <ComplaintsModal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        defaultTargetType="help_request"
        defaultTargetId={complaintTarget.id}
        defaultTargetTitle={complaintTarget.title}
      />

    </div>
  );
};
