import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  HandHeart, 
  FolderHeart, 
  Receipt, 
  Users, 
  Droplet, 
  Calendar, 
  Megaphone, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  PlusCircle, 
  Eye, 
  Trash2, 
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Lock,
  BadgeCheck,
  Package,
  ShieldAlert,
  Sparkles,
  Building2,
  Settings,
  Save,
  Smartphone
} from 'lucide-react';
import { useAuth, SUPER_ADMIN_EMAIL } from '../context/AuthContext';
import { 
  getAdminLiveStats, 
  getAllHelpRequestsAdmin, 
  updateHelpRequestStatus,
  getAllDonationsAdmin,
  verifyDonationAdmin,
  rejectDonationAdmin,
  getCampaigns,
  createCampaignAdmin,
  updateCampaignAdmin,
  deleteCampaignAdmin,
  addCampaignExpenseAdmin,
  getAllVolunteerApplicationsAdmin,
  updateVolunteerStatusAdmin,
  awardVolunteerPointsAdmin,
  getEvents,
  createEventAdmin,
  getActiveAnnouncements,
  createAnnouncementAdmin,
  getAuditLogsAdmin,
  logAdminAudit,
  getAllVerificationRequestsAdmin,
  reviewVerificationRequestAdmin,
  getAllComplaintsAdmin,
  updateComplaintStatusAdmin,
  getAllItemClaimsAdmin,
  updateItemClaimStatusAdmin,
  getReliefDistributions,
  addReliefDistributionAdmin,
  getAllStoriesAdmin,
  updateStoryStatusAdmin,
  getAllOrganizationsAdmin,
  updateOrganizationStatusAdmin,
  getSystemSettings,
  updateSystemSettings,
  LiveStatsSummary
} from '../services/firestoreService';
import { 
  HelpRequest, 
  Donation, 
  Campaign, 
  VolunteerApplication, 
  Event, 
  Announcement, 
  AuditLog, 
  HelpRequestStatus,
  VolunteerStatus,
  VerificationRequest,
  Complaint,
  ItemClaim,
  ReliefDistribution,
  PublishedStory,
  PartnerOrganization,
  SystemSettings,
  DEFAULT_SYSTEM_SETTINGS,
  CAMPAIGN_CATEGORY_LABELS,
  HELP_STATUS_LABELS,
  HELP_CATEGORY_LABELS,
  BD_DISTRICTS,
  CampaignCategory
} from '../types';
import { formatTaka, toBengaliNumber, toBengaliDate } from '../utils/bengaliUtils';

export const SuperAdminDashboard: React.FC = () => {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'help_requests' | 'donations' | 'campaigns' | 'volunteers' | 'events' | 
    'announcements' | 'verifications' | 'complaints' | 'claims' | 'relief_log' | 'stories' | 
    'organizations' | 'audit_logs' | 'settings'
  >('overview');
  
  const [stats, setStats] = useState<LiveStatsSummary | null>(null);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Additional 20 advanced modules state
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [reliefDistributions, setReliefDistributions] = useState<ReliefDistribution[]>([]);
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [organizations, setOrganizations] = useState<PartnerOrganization[]>([]);

  // Relief distribution log modal form state
  const [showNewReliefModal, setShowNewReliefModal] = useState(false);
  const [reliefItemType, setReliefItemType] = useState('');
  const [reliefQty, setReliefQty] = useState('');
  const [reliefDistrict, setReliefDistrict] = useState('ঢাকা');
  const [reliefLocation, setReliefLocation] = useState('');
  const [reliefHandler, setReliefHandler] = useState(user?.displayName || 'ফিল্ড সমন্বয়কারী');
  const [reliefDate, setReliefDate] = useState(new Date().toISOString().slice(0, 10));
  const [reliefNotes, setReliefNotes] = useState('');

  // Basic Settings State
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal / action forms
  const [selectedHelpReq, setSelectedHelpReq] = useState<HelpRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // New campaign modal
  const [showNewCampModal, setShowNewCampModal] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampDesc, setNewCampDesc] = useState('');
  const [newCampTarget, setNewCampTarget] = useState('');
  const [newCampCategory, setNewCampCategory] = useState<CampaignCategory>('flood_relief');

  // New expense modal
  const [selectedCampForExpense, setSelectedCampForExpense] = useState<Campaign | null>(null);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseVoucher, setExpenseVoucher] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  // New event modal
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [newEventDistrict, setNewEventDistrict] = useState('ঢাকা');
  const [newEventDate, setNewEventDate] = useState('');

  // Announcement modal
  const [showNewAnnounceModal, setShowNewAnnounceModal] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [announceType, setAnnounceType] = useState<'urgent' | 'info' | 'success'>('urgent');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        liveStats, 
        hList, 
        dList, 
        cList, 
        vList, 
        eList, 
        aList, 
        logs,
        verifList,
        compList,
        claimList,
        reliefList,
        storyList,
        orgList,
        sysSettings
      ] = await Promise.all([
        getAdminLiveStats(),
        getAllHelpRequestsAdmin(),
        getAllDonationsAdmin(),
        getCampaigns(),
        getAllVolunteerApplicationsAdmin(),
        getEvents(),
        getActiveAnnouncements(),
        getAuditLogsAdmin(),
        getAllVerificationRequestsAdmin(),
        getAllComplaintsAdmin(),
        getAllItemClaimsAdmin(),
        getReliefDistributions(),
        getAllStoriesAdmin(),
        getAllOrganizationsAdmin(),
        getSystemSettings()
      ]);

      setStats(liveStats);
      setHelpRequests(hList);
      setDonations(dList);
      setCampaigns(cList);
      setVolunteers(vList);
      setEvents(eList);
      setAnnouncements(aList);
      setAuditLogs(logs);
      setVerifications(verifList);
      setComplaints(compList);
      setClaims(claimList);
      setReliefDistributions(reliefList);
      setStories(storyList);
      setOrganizations(orgList);
      setSettings(sysSettings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const showMsg = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Guard: if not authorized
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 font-['Hind_Siliguri',sans-serif]">
          অ্যাডমিন প্রবেশাধিকার সংরক্ষিত
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          এই ড্যাশবোর্ড শুধুমাত্র অনুমোদিত সুপার অ্যাডমিন ও কর্তৃপক্ষের জন্য সংরক্ষিত। সুপার অ্যাডমিন অ্যাকাউন্টে (<span className="font-mono text-emerald-700 font-bold">{SUPER_ADMIN_EMAIL}</span>) লগইন করুন।
        </p>
      </div>
    );
  }

  // Action: Approve Help Request
  const handleApproveHelp = async (req: HelpRequest) => {
    try {
      await updateHelpRequestStatus(req.id, 'approved', adminNote || 'সরেজমিনে তথ্য যাচাই করে আবেদনটি অনুমোদিত হয়েছে।', true);
      if (user) {
        await logAdminAudit('approve_help_request', user.uid, 'help_requests', req.id, `আবেদন #${req.referenceNo} অনুমোদিত`);
      }
      showMsg('success', `আবেদন ${req.referenceNo} সফলভাবে অনুমোদিত হয়েছে।`);
      setSelectedHelpReq(null);
      await loadAllData();
    } catch (err: any) {
      showMsg('error', 'অনুমোদন ব্যর্থ হয়েছে।');
    }
  };

  // Action: Reject Help Request
  const handleRejectHelp = async (req: HelpRequest) => {
    if (!rejectReason.trim()) {
      showMsg('error', 'বাতিল করার কারণ উল্লেখ করা আবশ্যক।');
      return;
    }
    try {
      await updateHelpRequestStatus(req.id, 'rejected', rejectReason.trim(), false);
      if (user) {
        await logAdminAudit('reject_help_request', user.uid, 'help_requests', req.id, `আবেদন #${req.referenceNo} বাতিল। কারণ: ${rejectReason}`);
      }
      showMsg('success', `আবেদন ${req.referenceNo} বাতিল করা হয়েছে।`);
      setSelectedHelpReq(null);
      setRejectReason('');
      await loadAllData();
    } catch (err: any) {
      showMsg('error', 'বাতিলকরণ ব্যর্থ হয়েছে।');
    }
  };

  // Action: Verify Donation
  const handleVerifyDonation = async (d: Donation) => {
    if (!user) return;
    try {
      const receipt = await verifyDonationAdmin(d.id, user.uid);
      await logAdminAudit('verify_donation', user.uid, 'donations', d.id, `অনুদান TrxID ${d.transactionId} যাচাইকৃত (${d.amount} ৳)। রসিদ: ${receipt}`);
      showMsg('success', `অনুদান সফলভাবে যাচাইকৃত হয়েছে! ইস্যুকৃত রসিদ নম্বর: ${receipt}`);
      await loadAllData();
    } catch (err: any) {
      showMsg('error', 'অনুদান যাচাইয়ে ত্রুটি হয়েছে।');
    }
  };

  // Action: Reject Donation
  const handleRejectDonation = async (d: Donation) => {
    if (!user) return;
    const reason = prompt('অনুদান বাতিলের কারণ লিখুন (উদাঃ স্টেটমেন্টে TrxID পাওয়া যায়নি):');
    if (!reason) return;
    try {
      await rejectDonationAdmin(d.id, user.uid, reason);
      await logAdminAudit('reject_donation', user.uid, 'donations', d.id, `অনুদান TrxID ${d.transactionId} প্রত্যাখ্যাত। কারণ: ${reason}`);
      showMsg('success', 'অনুদান বাতিল রেকর্ড সংরক্ষণ করা হয়েছে।');
      await loadAllData();
    } catch (err: any) {
      showMsg('error', 'বাতিলকরণ ব্যর্থ হয়েছে।');
    }
  };

  // Action: Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createCampaignAdmin({
        title: newCampTitle.trim(),
        description: newCampDesc.trim(),
        category: newCampCategory,
        targetAmount: parseFloat(newCampTarget) || 0,
        status: 'active',
        featured: true,
        createdBy: user.uid
      });
      await logAdminAudit('create_campaign', user.uid, 'campaigns', 'new', `নতুন ক্যাম্পেইন তৈরি: ${newCampTitle}`);
      showMsg('success', 'নতুন ক্যাম্পেইন সফলভাবে তৈরি হয়েছে!');
      setShowNewCampModal(false);
      setNewCampTitle('');
      setNewCampDesc('');
      setNewCampTarget('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ক্যাম্পেইন তৈরিতে সমস্যা হয়েছে।');
    }
  };

  // Action: Delete Campaign
  const handleDeleteCampaign = async (campId: string, title: string) => {
    if (!user) return;
    const confirm = window.confirm(
      `আপনি কি নিশ্চিতভাবে "${title}" ক্যাম্পেইনটি মুছে ফেলতে চান?\n\nসতর্কতা: এই পদক্ষেপটি অপরিবর্তনীয় এবং ডাটাবেস থেকে এটি স্থায়ীভাবে মুছে যাবে।`
    );
    if (!confirm) return;

    try {
      await deleteCampaignAdmin(campId);
      await logAdminAudit('delete_campaign', user.uid, 'campaigns', campId, `ক্যাম্পেইন "${title}" মুছে ফেলা হয়েছে`);
      showMsg('success', `ক্যাম্পেইন "${title}" সফলভাবে মুছে ফেলা হয়েছে!`);
      await loadAllData();
    } catch (err: any) {
      showMsg('error', 'ক্যাম্পেইন ডিলিট করতে ব্যর্থ হয়েছে।');
    }
  };

  // Action: Save System Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);
    try {
      await updateSystemSettings(settings, user.uid);
      await logAdminAudit('update_settings', user.uid, 'system_settings', 'general', 'বেসিক সিস্টেম সেটিংস ও পেমেন্ট তথ্য আপডেট করা হয়েছে');
      showMsg('success', 'প্ল্যাটফর্মের বেসিক সেটিংস সফলভাবে সংরক্ষিত ও আপডেট হয়েছে!');
    } catch (err: any) {
      showMsg('error', 'সেটিংস সংরক্ষণে সমস্যা দেখা দিয়েছে।');
    } finally {
      setSavingSettings(false);
    }
  };

  // Action: Add Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCampForExpense) return;
    try {
      await addCampaignExpenseAdmin({
        campaignId: selectedCampForExpense.id,
        title: expenseTitle.trim(),
        amount: parseFloat(expenseAmount) || 0,
        category: 'ত্রাণ বিতরণ সামগ্রী ও লজিস্টিকস',
        voucherNo: expenseVoucher.trim() || `VOUCH-${Date.now().toString().slice(-4)}`,
        date: expenseDate || new Date().toISOString(),
        approvedBy: user.uid
      });
      await logAdminAudit('add_expense', user.uid, 'expenses', selectedCampForExpense.id, `ব্যয় যুক্ত: ${expenseTitle} (${expenseAmount} ৳)`);
      showMsg('success', 'ব্যয়ের হিসাব ও ভাউচার সফলভাবে যুক্ত হয়েছে!');
      setSelectedCampForExpense(null);
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseVoucher('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ব্যয় যুক্ত হতে ব্যর্থ হয়েছে।');
    }
  };

  // Action: Update Volunteer Status
  const handleVolunteerAction = async (vol: VolunteerApplication, status: VolunteerStatus) => {
    if (!user) return;
    try {
      await updateVolunteerStatusAdmin(vol.id, status, vol.preferredTeam);
      await logAdminAudit('update_volunteer_status', user.uid, 'volunteer_applications', vol.id, `স্বেচ্ছাসেবক ${vol.name} এর স্ট্যাটাস: ${status}`);
      showMsg('success', `স্বেচ্ছাসেবক আবেদন আপডেট করা হয়েছে।`);
      await loadAllData();
    } catch (err) {
      showMsg('error', 'আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Action: Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createEventAdmin({
        title: newEventTitle.trim(),
        description: newEventDesc.trim(),
        location: newEventLoc.trim(),
        district: newEventDistrict,
        date: newEventDate.trim(),
        status: 'upcoming'
      });
      await logAdminAudit('create_event', user.uid, 'events', 'new', `নতুন ইভেন্ট: ${newEventTitle}`);
      showMsg('success', 'নতুন ইভেন্ট সফলভাবে তৈরি হয়েছে!');
      setShowNewEventModal(false);
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventLoc('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ইভেন্ট তৈরিতে সমস্যা হয়েছে।');
    }
  };

  // Action: Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await createAnnouncementAdmin({
        title: announceTitle.trim(),
        content: announceContent.trim(),
        type: announceType,
        isActive: true
      });
      await logAdminAudit('create_announcement', user.uid, 'announcements', 'new', `নোটিশ প্রকাশ: ${announceTitle}`);
      showMsg('success', 'জরুরি নোটিশ সফলভাবে প্রকাশ করা হয়েছে!');
      setShowNewAnnounceModal(false);
      setAnnounceTitle('');
      setAnnounceContent('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'নোটিশ প্রকাশে সমস্যা হয়েছে।');
    }
  };

  // Action: Review Verification Request
  const handleReviewVerification = async (req: VerificationRequest, status: 'verified' | 'rejected') => {
    if (!user) return;
    const notes = prompt(status === 'verified' ? 'অনুমোদন নোট লিখুন:' : 'বাতিলের কারণ লিখুন:', status === 'verified' ? 'জাতীয় পরিচয়পত্র তথ্য সঠিক পাওয়া গেছে' : 'পরিচয়পত্র অস্পষ্ট বা মিল নেই');
    if (notes === null) return;

    try {
      await reviewVerificationRequestAdmin(req.id, req.userId, status, notes, user.uid);
      await logAdminAudit('review_verification', user.uid, 'verification_requests', req.id, `ইউজার ${req.userName} ভেরিফিকেশন: ${status}`);
      showMsg('success', `ভেরিফিকেশন স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে: ${status === 'verified' ? 'নীল ব্যাজ প্রদান করা হয়েছে' : 'বাতিল'}`);
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ভেরিফিকেশন পর্যালোচনায় ত্রুটি হয়েছে।');
    }
  };

  // Action: Update Complaint Status
  const handleUpdateComplaint = async (comp: Complaint, status: Complaint['status']) => {
    if (!user) return;
    const notes = prompt('অভিযোগ সমাধানের অগ্রগতি বা সিদ্ধান্তের বিবরণ লিখুন:', comp.resolutionNotes || 'অ্যাডমিন টিম বিষয়টি তদন্ত করে প্রয়োজনীয় পদক্ষেপ নিয়েছে');
    if (notes === null) return;

    try {
      await updateComplaintStatusAdmin(comp.id, status, notes);
      await logAdminAudit('update_complaint', user.uid, 'complaints', comp.id, `অভিযোগ #${comp.id.slice(0, 6)} স্ট্যাটাস: ${status}`);
      showMsg('success', 'অভিযোগ স্ট্যাটাস সফলভাবে আপডেট হয়েছে।');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'অভিযোগ আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Action: Update Item Claim Status
  const handleClaimStatus = async (claim: ItemClaim, status: 'approved' | 'distributed' | 'rejected') => {
    if (!user) return;
    try {
      await updateItemClaimStatusAdmin(claim.id, claim.itemId, status, claim.quantity);
      await logAdminAudit('update_item_claim', user.uid, 'item_claims', claim.id, `দাবি #${claim.id.slice(0, 6)} স্ট্যাটাস: ${status}`);
      showMsg('success', `সামগ্রী দাবি স্ট্যাটাস আপডেট হয়েছে: ${status}`);
      await loadAllData();
    } catch (err) {
      showMsg('error', 'দাবি আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Action: Create Field Relief Distribution Record
  const handleCreateReliefLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!reliefItemType.trim() || !reliefQty) return;

    try {
      await addReliefDistributionAdmin({
        campaignId: 'general',
        itemType: reliefItemType.trim(),
        quantity: Number(reliefQty) || 1,
        district: reliefDistrict,
        location: reliefLocation.trim() || 'উপজেলা চত্বর',
        handlerName: reliefHandler.trim() || user.displayName || 'ফিল্ড সমন্বয়কারী',
        date: reliefDate || new Date().toISOString().slice(0, 10),
        notes: reliefNotes.trim() || undefined
      });
      await logAdminAudit('add_relief_distribution', user.uid, 'relief_distributions', 'new', `ত্রাণ বিতরণ রেকর্ড: ${reliefQty} টি ${reliefItemType} (${reliefDistrict})`);
      showMsg('success', 'ফিল্ড ত্রাণ বিতরণের রেকর্ড সফলভাবে যুক্ত হয়েছে!');
      setShowNewReliefModal(false);
      setReliefItemType('');
      setReliefQty('');
      setReliefLocation('');
      setReliefNotes('');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ত্রাণ রেকর্ড যুক্ত করতে ব্যর্থ হয়েছে।');
    }
  };

  // Action: Moderate Story
  const handleStoryStatus = async (story: PublishedStory, isApproved: boolean) => {
    if (!user) return;
    try {
      await updateStoryStatusAdmin(story.id, isApproved);
      await logAdminAudit('moderate_story', user.uid, 'published_stories', story.id, `গল্প "${story.title}" প্রকাশ স্ট্যাটাস: ${isApproved}`);
      showMsg('success', isApproved ? 'গল্পটি সফলভাবে প্রকাশিত হয়েছে!' : 'গল্পটির প্রকাশনা স্থগিত করা হয়েছে।');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'গল্পের স্ট্যাটাস হালনাগাদে সমস্যা হয়েছে।');
    }
  };

  // Action: Verify Partner Organization
  const handleOrgStatus = async (org: PartnerOrganization, status: PartnerOrganization['status']) => {
    if (!user) return;
    try {
      await updateOrganizationStatusAdmin(org.id, status);
      await logAdminAudit('update_organization', user.uid, 'organizations', org.id, `অংশীদার সংস্থা "${org.name}" স্ট্যাটাস: ${status}`);
      showMsg('success', `অংশীদার সংগঠনের স্ট্যাটাস আপডেট হয়েছে: ${status}`);
      await loadAllData();
    } catch (err) {
      showMsg('error', 'সংস্থার স্ট্যাটাস হালনাগাদ ব্যর্থ হয়েছে।');
    }
  };

  // Action: Award Volunteer Activity Points
  const handleAwardVolunteerPoints = async (vol: VolunteerApplication) => {
    if (!user) return;
    const ptsStr = prompt(`স্বেচ্ছাসেবক "${vol.name}" কে অর্জিত সমাজসেবা পয়েন্ট প্রদান করুন:`, '25');
    if (!ptsStr) return;
    const pts = parseInt(ptsStr, 10);
    if (isNaN(pts) || pts <= 0) {
      alert('সঠিক পয়েন্ট সংখ্যা উল্লেখ করুন।');
      return;
    }
    const activity = prompt('কার্যক্রমের নাম লিখুন (উদাঃ বন্যাদুর্গত এলাকায় ৩ দিনব্যাপী খাদ্য বিতরণ সহায়তা):', 'মাঠপর্যায়ের ত্রাণ কার্যক্রম সমন্বয়');
    if (!activity) return;

    try {
      await awardVolunteerPointsAdmin(vol.id, vol.userId, vol.name, activity, pts, user.uid);
      await logAdminAudit('award_volunteer_points', user.uid, 'volunteer_applications', vol.id, `স্বেচ্ছাসেবক ${vol.name} কে ${pts} পয়েন্ট প্রদান। কার্যক্রম: ${activity}`);
      showMsg('success', `সফলভাবে ${pts} পয়েন্ট যুক্ত হয়েছে! লেজার ও নোটিফিকেশন হালনাগাদ সম্পন্ন।`);
      await loadAllData();
    } catch (err) {
      showMsg('error', 'পয়েন্ট যুক্ত করতে ব্যর্থ হয়েছে।');
    }
  };

  // Optional clearly labelled demo data seeder (strictly non-mixed, optional for testing)
  const handleSeedDemoData = async () => {
    if (!user) return;
    const confirm = window.confirm('আপনি কি টেস্ট ও প্রদর্শনের স্বার্থে ৩টি ডেমো ক্যাম্পেইন ও ইভেন্ট যুক্ত করতে চান? এটি যেকোনো সময় ড্যাশবোর্ড থেকে পরিচালনা করা যাবে।');
    if (!confirm) return;

    try {
      await createCampaignAdmin({
        title: '[ডেমো] সিলেট ও সুনামগঞ্জ বন্যা পুনর্বাসন তহবিল ২০২৬',
        subtitle: 'বন্যার্ত পরিবারগুলোর মাঝে জরুরি খাদ্য ও বিশুদ্ধ পানি বিতরণ',
        description: 'উত্তরাঞ্চলের সাম্প্রতিক বন্যায় প্লাবিত অঞ্চলের ৫ হাজার পরিবারের মাঝে জরুরি শুকনো খাবার, বিশুদ্ধ খাবার পানি, পানি বিশুদ্ধকরণ ট্যাবলেট এবং নগদ সহায়তা পৌঁছে দেওয়ার মানবিক কর্মসূচি।',
        category: 'flood_relief',
        targetAmount: 500000,
        status: 'active',
        featured: true,
        createdBy: user.uid
      });

      await createCampaignAdmin({
        title: '[ডেমো] সুবিধাবঞ্চিত শিশুদের শীতবস্ত্র ও কম্বল বিতরণ ২০২৬',
        subtitle: 'উত্তরাঞ্চলের তীব্র শীতে পথশিশু ও বৃদ্ধদের পাশে দাঁড়ান',
        description: 'দিনাজপুর, কুড়িগ্রাম ও পঞ্চগড়ের শীতার্ত মানুষের মাঝে মানসম্মত উলের চাদর, জ্যাকেট ও কম্বল বিতরণের মানবিক উদ্যোগ।',
        category: 'winter_clothes',
        targetAmount: 200000,
        status: 'active',
        featured: true,
        createdBy: user.uid
      });

      await createEventAdmin({
        title: '[ডেমো] বিনামূল্যে বিশেষজ্ঞ চিকিৎসাসেবা ও ওষুধ বিতরণ ক্যাম্প',
        description: 'অভিজ্ঞ মেডিসিন, শিশু ও চক্ষু বিশেষজ্ঞদের উপস্থিতিতে দিনব্যাপী বিনামূল্যে চিকিৎসাপত্র ও প্রয়োজনীয় জরুরি অ্যান্টিবায়োটিক এবং প্রেসক্রিপশন প্রদান।',
        location: 'উপজেলা পরিষদ চত্বর, শ্রীমঙ্গল',
        district: 'মৌলভীবাজার',
        date: '১৫ নভেম্বর ২০২৬, সকাল ৯টা - বিকাল ৪টা',
        status: 'upcoming'
      });

      await createAnnouncementAdmin({
        title: 'জরুরি রক্তের হেল্পলাইন সেল সক্রিয়',
        content: 'যেকোনো স্থানে জরুরি রক্তের প্রয়োজনে সরাসরি রক্তদাতা ডিরেক্টরি থেকে গ্রুপ ও জেলা বাছাই করুন অথবা হেল্পলাইনে যোগাযোগ করুন।',
        type: 'urgent',
        isActive: true
      });

      await logAdminAudit('seed_demo_data', user.uid, 'system', 'seed', 'ঐচ্ছিক ডেমো ডাটা ইনিশিয়ালাইজেশন সম্পন্ন');
      showMsg('success', 'ঐচ্ছিক ডেমো ক্যাম্পেইন ও ইভেন্ট সফলভাবে ডাটাবেসে যোগ হয়েছে!');
      await loadAllData();
    } catch (err) {
      showMsg('error', 'ডেমো ডাটা যোগ করতে সমস্যা হয়েছে।');
    }
  };

  // CSV Export utility
  const exportDonationsCSV = () => {
    const headers = ['Receipt No', 'Campaign', 'Donor Name', 'Phone', 'Amount (BDT)', 'Method', 'TrxID', 'Status', 'Date'];
    const rows = donations.map(d => [
      d.receiptNo || 'N/A',
      `"${d.campaignTitle.replace(/"/g, '""')}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      d.donorPhone || '',
      d.amount,
      d.paymentMethod,
      d.transactionId,
      d.status,
      d.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `manobotar_sheba_donations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-300" />
            <span className="text-xs font-bold tracking-wider uppercase text-purple-200">
              কেন্দ্রীয় সুপার অ্যাডমিন কনসোল
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Hind_Siliguri',sans-serif]">
            মানবতার সেবা ব্যবস্থাপনা প্যানেল
          </h1>
          <p className="text-xs text-purple-200 mt-1 font-mono">
            লগইনকৃত অ্যাডমিন: {user?.email} ({isSuperAdmin ? 'Super Administrator' : 'Administrator'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedDemoData}
            className="px-3 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl border border-emerald-500 transition-all flex items-center gap-1.5"
            title="পরীক্ষার জন্য ৩টি ডেমো ক্যাম্পেইন ও ইভেন্ট যোগ করুন"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            ডেমো ডাটা যোগ (ঐচ্ছিক)
          </button>
          <button
            onClick={exportDonationsCSV}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            অনুদানের CSV রিপোর্ট
          </button>
          <button
            onClick={loadAllData}
            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            ডাটা রিফ্রেশ
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Live Counts Cards (Derived 100% from Firestore - Zero Fabrication) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">মোট সাহায্য আবেদন</div>
          <div className="text-xl font-bold text-slate-800 font-mono mt-1">
            {toBengaliNumber(stats?.totalHelpRequests || 0)}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            অপেক্ষমাণ: {toBengaliNumber(stats?.pendingHelpRequests || 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">যাচাইকৃত মোট অনুদান</div>
          <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
            {formatTaka(stats?.totalVerifiedDonationsAmount || 0)}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            যাচাই বাকি: {toBengaliNumber(stats?.pendingDonationsCount || 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">নিবন্ধিত রক্তদাতা</div>
          <div className="text-xl font-bold text-rose-700 font-mono mt-1">
            {toBengaliNumber(stats?.totalDonors || 0)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            প্রস্তুত: {toBengaliNumber(stats?.availableDonors || 0)} জন
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">জরুরি রক্তের নোটিশ</div>
          <div className="text-xl font-bold text-red-600 font-mono mt-1">
            {toBengaliNumber(stats?.activeBloodRequests || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">সক্রিয় রিকুয়েস্ট</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">স্বেচ্ছাসেবক আবেদন</div>
          <div className="text-xl font-bold text-teal-700 font-mono mt-1">
            {toBengaliNumber(stats?.totalVolunteers || 0)}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            অপেক্ষমাণ: {toBengaliNumber(stats?.pendingVolunteers || 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">সক্রিয় ক্যাম্পেইন</div>
          <div className="text-xl font-bold text-purple-700 font-mono mt-1">
            {toBengaliNumber(stats?.totalCampaigns || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ইভেন্ট: {toBengaliNumber(stats?.totalEvents || 0)}
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'ওভারভিউ ও সারাংশ', icon: Activity },
          { id: 'donations', label: `অনুদান যাচাই (${toBengaliNumber(stats?.pendingDonationsCount || 0)})`, icon: Receipt },
          { id: 'help_requests', label: `সাহায্য আবেদন (${toBengaliNumber(stats?.pendingHelpRequests || 0)})`, icon: HandHeart },
          { id: 'verifications', label: `ভেরিফিকেশন (${toBengaliNumber(verifications.filter(v => v.status === 'pending').length)})`, icon: BadgeCheck },
          { id: 'complaints', label: `অভিযোগ ও অডিট (${toBengaliNumber(complaints.filter(c => c.status === 'open').length)})`, icon: ShieldAlert },
          { id: 'claims', label: `সামগ্রী দাবি (${toBengaliNumber(claims.filter(c => c.status === 'pending').length)})`, icon: Package },
          { id: 'relief_log', label: `ত্রাণ বিতরণ রেজিস্টার (${toBengaliNumber(reliefDistributions.length)})`, icon: TrendingUp },
          { id: 'stories', label: `গল্প অনুমোদন (${toBengaliNumber(stories.filter(s => !s.isApproved).length)})`, icon: Sparkles },
          { id: 'organizations', label: `অংশীদার সংস্থা (${toBengaliNumber(organizations.length)})`, icon: Building2 },
          { id: 'campaigns', label: 'ক্যাম্পেইন ও ব্যয়', icon: FolderHeart },
          { id: 'volunteers', label: `স্বেচ্ছাসেবক (${toBengaliNumber(stats?.pendingVolunteers || 0)})`, icon: Users },
          { id: 'events', label: 'ইভেন্ট ও ক্যাম্প', icon: Calendar },
          { id: 'announcements', label: 'জরুরি নোটিশ', icon: Megaphone },
          { id: 'settings', label: 'বেসিক সেটিংস', icon: Settings },
          { id: 'audit_logs', label: 'নিরাপত্তা অডিট লগ', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pending triage quick list */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  যাচাই অপেক্ষমাণ অনুদান
                </h3>
                <button
                  onClick={() => setActiveTab('donations')}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  সব দেখুন
                </button>
              </div>

              {donations.filter(d => d.status === 'pending_verification').length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  এই মুহূর্তে কোনো অমীমাংসিত অনুদান নেই।
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {donations.filter(d => d.status === 'pending_verification').slice(0, 4).map(d => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{d.donorName}</div>
                        <div className="text-slate-500 font-mono">
                          TrxID: {d.transactionId} ({d.paymentMethod.toUpperCase()})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800">{formatTaka(d.amount)}</span>
                        <button
                          onClick={() => handleVerifyDonation(d)}
                          className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700"
                        >
                          ভেরিফাই
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Help Requests triage quick list */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HandHeart className="w-4 h-4 text-amber-600" />
                  নতুন মানবিক সাহায্য আবেদন
                </h3>
                <button
                  onClick={() => setActiveTab('help_requests')}
                  className="text-xs font-bold text-purple-700 hover:underline"
                >
                  সব দেখুন
                </button>
              </div>

              {helpRequests.filter(h => h.status === 'pending').length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  কোনো অপেক্ষমাণ সাহায্য আবেদন নেই।
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {helpRequests.filter(h => h.status === 'pending').slice(0, 4).map(req => (
                    <div key={req.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{req.title}</div>
                        <div className="text-slate-500">
                          {req.applicantName} | {req.district} | Ref: {req.referenceNo}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedHelpReq(req)}
                        className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold text-[11px] rounded-lg hover:bg-purple-200"
                      >
                        তদন্ত ও অনুমোদন
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Super Admin Bootstrap & Security Notice */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-purple-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              সুপার অ্যাডমিন নিরাপত্তা ও ভূমিকা ব্যবস্থাপনা (RBAC Architecture)
            </h4>
            <div className="text-xs text-purple-900/90 leading-relaxed space-y-2">
              <p>
                ১. <span className="font-bold">ক্লাউড সিকিউরিটি রুলস:</span> ক্লায়েন্ট কোডে কোনো হার্ডকোডেড পাসওয়ার্ড বা গোপন চাবি সংরক্ষিত নেই। শুধুমাত্র <span className="font-mono font-bold text-purple-950">{SUPER_ADMIN_EMAIL}</span> অথবা ফায়ারস্টোর <span className="font-mono">admins</span> কালেকশনে তালিকাভুক্ত ইউজাররাই সার্ভার-সাইড অনুমোদন ও আর্থিক ভেরিফিকেশন সম্পাদন করতে পারে।
              </p>
              <p>
                ২. <span className="font-bold">আর্থিক অখণ্ডতা ও অ্যাটোমিক ট্রানজেকশন:</span> কোনো ক্লায়েন্ট নিজে থেকে অনুদান যোগ করতে পারে না। ব্যাংক স্টেটমেন্ট মিলিয়ে অ্যাডমিন অনুমোদন দিলে <span className="font-mono">runTransaction</span> এর মাধ্যমে ক্যাম্পেইনের সংগৃহীত পরিমাণ আপডেট হয় এবং রসিদ তৈরি হয়।
              </p>
              <p>
                ৩. <span className="font-bold">Flutter Android অ্যাপ প্রস্তুতি:</span> সমস্ত ডেটা মডেল ও কালেকশন ফায়ারস্টোরে স্ট্রিং-লেন্থ ভ্যালিডেশন ও সিকিউর রুলস সহ তৈরি, যা যেকোনো অ্যান্ড্রয়েড ফ্লাটার ক্লায়েন্টে হুবহু ব্যবহারযোগ্য।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DONATIONS TRIAGE */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              সমস্ত অনুদান লেনদেন তালিকা ({toBengaliNumber(donations.length)})
            </h3>
            <button
              onClick={exportDonationsCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV ডাউনলোড
            </button>
          </div>

          {donations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              কোনো অনুদান রেকর্ড এখনও পর্যন্ত নেই।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">ক্যাম্পেইন</th>
                    <th className="p-3.5">দাতার নাম ও ফোন</th>
                    <th className="p-3.5">পরিমাণ</th>
                    <th className="p-3.5">মাধ্যম</th>
                    <th className="p-3.5">TrxID / প্রেরক</th>
                    <th className="p-3.5">অবস্থা</th>
                    <th className="p-3.5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-medium max-w-[180px] truncate">{d.campaignTitle}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{d.donorName}</div>
                        <div className="text-[11px] text-slate-400">{d.donorPhone || 'ফোন নেই'}</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800">{formatTaka(d.amount)}</td>
                      <td className="p-3.5 uppercase font-mono font-semibold">{d.paymentMethod}</td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="font-bold text-slate-900">{d.transactionId}</span>
                        {d.senderAccount && <div className="text-slate-400">প্রেরক: {d.senderAccount}</div>}
                      </td>
                      <td className="p-3.5">
                        {d.status === 'verified' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                            যাচাইকৃত ({d.receiptNo})
                          </span>
                        )}
                        {d.status === 'pending_verification' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                            যাচাই বাকি
                          </span>
                        )}
                        {d.status === 'rejected' && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                            বাতিল
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1">
                        {d.status === 'pending_verification' && (
                          <>
                            <button
                              onClick={() => handleVerifyDonation(d)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => handleRejectDonation(d)}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-lg text-[11px]"
                            >
                              বাতিল
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: HELP REQUESTS TRIAGE */}
      {activeTab === 'help_requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              নাগরিক সাহায্য আবেদনসমূহ ({toBengaliNumber(helpRequests.length)})
            </h3>
          </div>

          {helpRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              কোনো সাহায্য আবেদন জমা পড়েনি।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3.5">রেফারেন্স</th>
                    <th className="p-3.5">বিভাগ ও শিরোনাম</th>
                    <th className="p-3.5">আবেদনকারী ও ফোন</th>
                    <th className="p-3.5">এলাকা</th>
                    <th className="p-3.5">প্রয়োজনীয় পরিমাণ</th>
                    <th className="p-3.5">অবস্থা</th>
                    <th className="p-3.5 text-right">তদন্ত ও পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {helpRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{req.referenceNo}</td>
                      <td className="p-3.5 max-w-[200px]">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">
                          {HELP_CATEGORY_LABELS[req.category]}
                        </span>
                        <div className="font-bold text-slate-800 truncate">{req.title}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{req.applicantName}</div>
                        <div className="font-mono text-slate-500">{req.phone}</div>
                      </td>
                      <td className="p-3.5">{req.upazila ? `${req.upazila}, ` : ''}{req.district}</td>
                      <td className="p-3.5 font-bold text-emerald-800">
                        {req.amountNeeded ? formatTaka(req.amountNeeded) : 'ঐচ্ছিক'}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${HELP_STATUS_LABELS[req.status]?.color}`}>
                          {HELP_STATUS_LABELS[req.status]?.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedHelpReq(req)}
                          className="px-2.5 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold text-[11px] rounded-lg"
                        >
                          বিস্তারিত ও যাচাই
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: CAMPAIGNS & EXPENSES */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              ত্রাণ ও উন্নয়ন তহবিল ক্যাম্পেইনসমূহ
            </h3>
            <button
              onClick={() => setShowNewCampModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন ক্যাম্পেইন খুলুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div key={camp.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {CAMPAIGN_CATEGORY_LABELS[camp.category] || 'ক্যাম্পেইন'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">{camp.status}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{camp.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{camp.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>সংগৃহীত:</span>
                    <span className="font-bold text-emerald-800">{formatTaka(camp.collectedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>লক্ষ্যমাত্রা:</span>
                    <span className="font-bold text-slate-700">{formatTaka(camp.targetAmount)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCampForExpense(camp)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ব্যয় ও ভাউচার যোগ
                  </button>

                  <button
                    onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="ক্যাম্পেইন মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    ক্যাম্পেইন মুছুন
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VOLUNTEERS */}
      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              স্বেচ্ছাসেবক আবেদন ও টিম তালিকা ({toBengaliNumber(volunteers.length)})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">নাম</th>
                  <th className="p-3.5">ফোন ও ইমেইল</th>
                  <th className="p-3.5">এলাকা</th>
                  <th className="p-3.5">পছন্দের টিম</th>
                  <th className="p-3.5">দক্ষতা</th>
                  <th className="p-3.5">অবস্থা</th>
                  <th className="p-3.5 text-right">অনুমোদন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {volunteers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-bold text-slate-900">{v.name}</td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div>{v.phone}</div>
                      <div className="text-slate-400">{v.email}</div>
                    </td>
                    <td className="p-3.5">{v.district}</td>
                    <td className="p-3.5 font-semibold text-emerald-800">{v.preferredTeam}</td>
                    <td className="p-3.5 max-w-[150px] truncate text-slate-500">{v.skills || 'উল্লেখ নেই'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100">
                        {v.status === 'approved' ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      {v.status !== 'approved' && (
                        <button
                          onClick={() => handleVolunteerAction(v, 'approved')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                        >
                          টিমে অনুমোদন
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              সেবামূলক ইভেন্টসমূহ
            </h3>
            <button
              onClick={() => setShowNewEventModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন ইভেন্ট ঘোষণা করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold">
                    {evt.district}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{evt.date}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{evt.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                <div className="text-xs text-slate-500 pt-1">
                  নিবন্ধিত অংশগ্রহণকারী: <span className="font-bold text-emerald-800">{toBengaliNumber(evt.registeredCount)} জন</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              জরুরি ব্রডকাস্ট নোটিশ ও ব্যানার
            </h3>
            <button
              onClick={() => setShowNewAnnounceModal(true)}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন নোটিশ প্রকাশ করুন
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full uppercase">
                      {a.type}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              অপরিবর্তনযোগ্য অ্যাডমিন নিরাপত্তা অডিট ট্রেইল (Immutable Audit Logs)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">তারিখ ও সময়</th>
                  <th className="p-3.5">অ্যাকশন</th>
                  <th className="p-3.5">কালেকশন / টার্গেট</th>
                  <th className="p-3.5">সম্পাদনকারী</th>
                  <th className="p-3.5">বিবরণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                    <td className="p-3.5 font-bold text-purple-700">{log.action}</td>
                    <td className="p-3.5 text-slate-600">{log.targetEntity}/{log.targetId}</td>
                    <td className="p-3.5 text-slate-500 truncate max-w-[120px]">{log.performedBy}</td>
                    <td className="p-3.5 font-['Hind_Siliguri',sans-serif] text-slate-800">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: VERIFICATIONS */}
      {activeTab === 'verifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
                নাগরিক প্রোফাইল ভেরিফিকেশন আবেদন ({verifications.length})
              </h3>
              <p className="text-xs text-slate-500">জাতীয় পরিচয়পত্র/পাসপোর্ট তথ্য যাচাই ও নীল ব্যাজ প্রদান</p>
            </div>
          </div>

          {verifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো ভেরিফিকেশন আবেদন জমা নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">নাগরিকের নাম</th>
                    <th className="py-3 px-4">আইডি ধরন</th>
                    <th className="py-3 px-4">মাস্কড নম্বর</th>
                    <th className="py-3 px-4">উদ্দেশ্য</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifications.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{v.userName}</td>
                      <td className="py-3.5 px-4 uppercase font-semibold text-slate-700">{v.idType}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">{v.idNumberMasked}</td>
                      <td className="py-3.5 px-4 text-slate-600">{v.reason}</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(v.submittedAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                          v.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.status === 'verified' ? 'যাচাইকৃত (ব্লু ব্যাজ)' : v.status === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {v.status !== 'verified' && (
                          <button
                            onClick={() => handleReviewVerification(v, 'verified')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                          >
                            অনুমোদন ও ব্যাজ দিন
                          </button>
                        )}
                        {v.status !== 'rejected' && (
                          <button
                            onClick={() => handleReviewVerification(v, 'rejected')}
                            className="px-2.5 py-1 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                          >
                            বাতিল
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 10: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                অভিযোগ ও অভ্যন্তরীণ অপব্যবহার তদন্ত ({complaints.length})
              </h3>
              <p className="text-xs text-slate-500">ভুয়া তথ্য, অনিয়ম বা অনৈতিক আচরণের রিপোর্ট খতিয়ে দেখা</p>
            </div>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো অভিযোগ জমা নেই।</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c.id} className="p-5 space-y-2 hover:bg-slate-50/70">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{c.reason}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md">
                        খাত: {c.targetType} (আইডি: {c.targetId})
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'investigating' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status === 'resolved' ? 'মীমাংসিত' : c.status === 'investigating' ? 'তদন্তাধীন' : 'উন্মুক্ত অভিযোগ'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {c.details}
                  </p>

                  {c.resolutionNotes && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
                      অ্যাডমিন পদক্ষেপ নোট: {c.resolutionNotes}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>দাখিলের তারিখ: {new Date(c.createdAt).toLocaleDateString('bn-BD')}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateComplaint(c, 'investigating')}
                        className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100"
                      >
                        তদন্তাধীন হিসেবে চিহ্নিত
                      </button>
                      <button
                        onClick={() => handleUpdateComplaint(c, 'resolved')}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                      >
                        মীমাংসিত ঘোষণা
                      </button>
                      <button
                        onClick={() => handleUpdateComplaint(c, 'dismissed')}
                        className="px-2.5 py-1 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-100"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 11: FOOD & CLOTHES BANK CLAIMS */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                খাদ্য ও বস্ত্র ব্যাংক সংগ্রহ দাবি ({claims.length})
              </h3>
              <p className="text-xs text-slate-500">অনুদানের সামগ্রী বিতরণ ও স্টক সমন্বয়</p>
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো সামগ্রী দাবি জমা নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">সামগ্রীর নাম</th>
                    <th className="py-3 px-4">দাবিকারীর নাম</th>
                    <th className="py-3 px-4">যোগাযোগ নম্বর</th>
                    <th className="py-3 px-4">পরিমাণ</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{claim.itemTitle}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{claim.claimantName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-800">{claim.phone}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{claim.quantity} টি</td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(claim.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          claim.status === 'distributed' ? 'bg-teal-100 text-teal-800' :
                          claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          claim.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {claim.status === 'distributed' ? 'বিতরণ সম্পন্ন' :
                           claim.status === 'approved' ? 'অনুমোদিত' :
                           claim.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {claim.status !== 'distributed' && (
                          <button
                            onClick={() => handleClaimStatus(claim, 'distributed')}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
                          >
                            বিতরণ নিশ্চিত (স্টক মাইনাস)
                          </button>
                        )}
                        {claim.status === 'pending' && (
                          <button
                            onClick={() => handleClaimStatus(claim, 'rejected')}
                            className="px-2 py-1 border border-rose-300 text-rose-700 rounded-lg text-xs hover:bg-rose-50"
                          >
                            বাতিল
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 12: RELIEF DISTRIBUTION LOG */}
      {activeTab === 'relief_log' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
                ফিল্ড ত্রাণ সামগ্রী বিতরণ রেজিস্টার ({reliefDistributions.length})
              </h3>
              <p className="text-xs text-slate-500">বাস্তব ত্রাণ বিতরণের প্রমাণ্য রেকর্ড ও প্রকাশ্য রিপোর্ট এন্ট্রি</p>
            </div>
            <button
              onClick={() => setShowNewReliefModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              নতুন ত্রাণ বিতরণ লগ যুক্ত করুন
            </button>
          </div>

          {reliefDistributions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো বিতরণ রেকর্ড যুক্ত নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">সামগ্রীর বিবরণ</th>
                    <th className="py-3 px-4">পরিমাণ</th>
                    <th className="py-3 px-4">জেলা ও স্থান</th>
                    <th className="py-3 px-4">দায়িত্বপ্রাপ্ত সমন্বয়কারী</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reliefDistributions.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.itemType}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">{r.quantity} টি</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-semibold text-slate-900">{r.district}</span> ({r.location})
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.handlerName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{r.date}</td>
                      <td className="py-3.5 px-4 text-slate-500">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 13: STORIES MODERATION */}
      {activeTab === 'stories' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                ভালো কাজের গল্প মডারেশন ({stories.length})
              </h3>
              <p className="text-xs text-slate-500">নাগরিকদের পাঠানো গল্প যাচাই ও ওয়েবসাইটে উন্মুক্তকরণ</p>
            </div>
          </div>

          {stories.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো গল্প জমা নেই।</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stories.map((story) => (
                <div key={story.id} className="p-5 space-y-2 hover:bg-slate-50/70">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{story.title}</h4>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      story.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {story.isApproved ? 'ওয়েবসাইটে প্রকাশিত' : 'অনুমোদন অপেক্ষমাণ'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {story.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>লেখক: {story.authorName} ({story.location})</span>
                    <div className="space-x-2">
                      {!story.isApproved ? (
                        <button
                          onClick={() => handleStoryStatus(story, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          অনুমোদন ও প্রকাশ করুন
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStoryStatus(story, false)}
                          className="px-3 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                        >
                          প্রকাশনা স্থগিত করুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 14: PARTNER ORGANIZATIONS */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                সহযোগী ও অংশীদার সংগঠনসমূহ ({organizations.length})
              </h3>
              <p className="text-xs text-slate-500">স্থানীয় এনজিও, ক্লাব ও পার্টনার যাচাইকরণ</p>
            </div>
          </div>

          {organizations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">কোনো পার্টনার সংস্থা যুক্ত নেই।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">সংগঠনের নাম</th>
                    <th className="py-3 px-4">রেজিস্ট্রেশন নম্বর</th>
                    <th className="py-3 px-4">প্রতিনিধি</th>
                    <th className="py-3 px-4">জেলা</th>
                    <th className="py-3 px-4">কার্যক্ষেত্র</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {organizations.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{org.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{org.registrationNo}</td>
                      <td className="py-3.5 px-4 text-slate-700">{org.representativeName} ({org.phone})</td>
                      <td className="py-3.5 px-4 text-slate-700">{org.district}</td>
                      <td className="py-3.5 px-4 text-slate-600">{org.focusArea}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          org.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          org.status === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {org.status === 'verified' ? 'অনুমোদিত পার্টনার' : org.status === 'suspended' ? 'স্থগিত' : 'অপেক্ষমাণ'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {org.status !== 'verified' && (
                          <button
                            onClick={() => handleOrgStatus(org, 'verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            অনুমোদন দিন
                          </button>
                        )}
                        {org.status !== 'suspended' && (
                          <button
                            onClick={() => handleOrgStatus(org, 'suspended')}
                            className="px-2 py-1 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                          >
                            স্থগিত
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 15: BASIC SETTINGS (বেসিক সেটিংস) */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-700" />
                প্ল্যাটফর্মের বেসিক সেটিংস ও নিয়ন্ত্রণ
              </h3>
              <p className="text-xs text-slate-500">
                সংগঠনের প্রাতিষ্ঠানিক তথ্য, হেল্পলাইন, বিকাশ/নগদ/ব্যাংক একাউন্ট নম্বর এবং জরুরি ঘোষণা নিয়ন্ত্রণ
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="p-6 space-y-8 text-xs">
            {/* 1. General Organization Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                ১. প্ল্যাটফর্ম ও প্রাতিষ্ঠানিক বিবরণ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">সংগঠনের / প্ল্যাটফর্মের নাম</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">স্লোগান / ট্যাগলাইন</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">জরুরি হেল্পলাইন নম্বর (২৪/৭)</label>
                  <input
                    type="text"
                    value={settings.helplinePhone}
                    onChange={(e) => setSettings({ ...settings, helplinePhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">বিকল্প হটলাইন নম্বর</label>
                  <input
                    type="text"
                    value={settings.helplineAltPhone || ''}
                    onChange={(e) => setSettings({ ...settings, helplineAltPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">অফিসিয়াল ইমেইল</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">প্রধান কার্যালয়ের ঠিকানা</label>
                  <input
                    type="text"
                    value={settings.officeAddress}
                    onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Donation Payment Accounts */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                ২. অনুদান গ্রহণের অফিসিয়াল একাউন্টসমূহ
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">বিকাশ নম্বর (মার্চেন্ট / পার্সোনাল)</label>
                  <input
                    type="text"
                    value={settings.bkashNumber}
                    onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">নগদ নম্বর</label>
                  <input
                    type="text"
                    value={settings.nagadNumber}
                    onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">রকেট নম্বর</label>
                  <input
                    type="text"
                    value={settings.rocketNumber}
                    onChange={(e) => setSettings({ ...settings, rocketNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Bank Transfer Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">ব্যাংক ট্রান্সফার বিবরণ (অনুদানের ব্যাংক একাউন্ট)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">হিসাবের নাম (Account Title)</label>
                    <input
                      type="text"
                      value={settings.bankAccountName}
                      onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">ব্যাংকের নাম (Bank Name)</label>
                    <input
                      type="text"
                      value={settings.bankName}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">হিসাব নম্বর (Account Number)</label>
                    <input
                      type="text"
                      value={settings.bankAccountNumber}
                      onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">শাখা (Branch)</label>
                    <input
                      type="text"
                      value={settings.bankBranch}
                      onChange={(e) => setSettings({ ...settings, bankBranch: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">রাউটিং নম্বর (Routing Number)</label>
                    <input
                      type="text"
                      value={settings.bankRoutingNo}
                      onChange={(e) => setSettings({ ...settings, bankRoutingNo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Emergency Announcement Banner Controls */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-600" />
                ৩. প্ল্যাটফর্মের সাধারণ ঘোষণা ও সতর্কতা
              </h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emergency-toggle"
                    checked={settings.emergencyNoticeActive}
                    onChange={(e) => setSettings({ ...settings, emergencyNoticeActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                  />
                  <label htmlFor="emergency-toggle" className="font-bold text-slate-800 cursor-pointer">
                    জরুরি নোটিস সক্রিয় রাখুন
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-slate-600">সাধারণ নোটিশ বার্তা</label>
                  <textarea
                    rows={2}
                    value={settings.emergencyNoticeText}
                    onChange={(e) => setSettings({ ...settings, emergencyNoticeText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Mobile App & APK Download Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                ৪. মোবাইল অ্যাপ ও APK ডাউনলোড নিয়ন্ত্রণ
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="app-download-toggle"
                    checked={settings.appDownloadActive ?? true}
                    onChange={(e) => setSettings({ ...settings, appDownloadActive: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="app-download-toggle" className="font-bold text-slate-800 cursor-pointer">
                    মোবাইল অ্যাপ ডাউনলোড পেজ ও ব্যানার সক্রিয় রাখুন
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">অ্যাপ সংস্করণ (Version)</label>
                    <input
                      type="text"
                      value={settings.appVersion || 'v1.2.0'}
                      onChange={(e) => setSettings({ ...settings, appVersion: e.target.value })}
                      placeholder="v1.2.0"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">ফাইলের আকার (File Size)</label>
                    <input
                      type="text"
                      value={settings.apkFileSize || '১৪.৮ MB'}
                      onChange={(e) => setSettings({ ...settings, apkFileSize: e.target.value })}
                      placeholder="১৪.৮ MB"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600">আপডেট প্রকাশের তারিখ</label>
                    <input
                      type="text"
                      value={settings.appReleaseDate || 'অক্টোবর ২০২৬'}
                      onChange={(e) => setSettings({ ...settings, appReleaseDate: e.target.value })}
                      placeholder="অক্টোবর ২০২৬"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">সরাসরি APK ডাউনলোড লিংক (ঐচ্ছিক এক্সটার্নাল URL বা ড্রাইভ লিংক)</label>
                  <input
                    type="text"
                    value={settings.apkDownloadUrl || ''}
                    onChange={(e) => setSettings({ ...settings, apkDownloadUrl: e.target.value })}
                    placeholder="উদাঃ https://drive.google.com/... অথবা খালি রাখলে লোকাল প্যাকেজ ডাউনলোড হবে"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    খালি রাখলে সিস্টেম স্বয়ংক্রিয়ভাবে প্রজেক্টের ভেরিফাইড প্যাকেজ জেনারেট করে ব্যবহারকারীকে ডাউনলোড করাবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-600">নতুন সংস্করণের রিলিজ নোটস (ফিচারসমূহ)</label>
                  <textarea
                    rows={2}
                    value={settings.appReleaseNotes || ''}
                    onChange={(e) => setSettings({ ...settings, appReleaseNotes: e.target.value })}
                    placeholder="উদাঃ অফলাইন হেল্পলাইন ডিরেক্টরি, রক্তের জরুরি পুশ এলার্ট ও দ্রুত রসিদ ডাউনলোড..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস হালনাগাদ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
      {selectedHelpReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">
                সাহায্য আবেদন বিস্তারিত ও তদন্ত রিপোর্ট
              </h4>
              <button
                onClick={() => setSelectedHelpReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between font-bold">
                <span>রেফারেন্স: {selectedHelpReq.referenceNo}</span>
                <span className="uppercase text-emerald-700">{selectedHelpReq.category}</span>
              </div>
              <div><span className="text-slate-500">শিরোনাম:</span> <span className="font-semibold text-slate-800">{selectedHelpReq.title}</span></div>
              <div><span className="text-slate-500">আবেদনকারী:</span> {selectedHelpReq.applicantName} ({selectedHelpReq.phone})</div>
              <div><span className="text-slate-500">ঠিকানা:</span> {selectedHelpReq.address || 'ঠিকানা দেওয়া হয়নি'}, {selectedHelpReq.upazila}, {selectedHelpReq.district}</div>
              <div className="pt-1 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">পরিস্থিতির বর্ণনা:</span>
                <p className="text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200">{selectedHelpReq.description}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">তদন্ত নোট (Admin Notes):</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="যাচাইকরণ ফলাফল ও অনুমোদনের কারণ লিখুন..."
                className="w-full p-2 border border-slate-300 rounded-xl outline-none resize-none"
              />
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-rose-700">বাতিল করার কারণ (যদি বাতিল করা হয়):</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="উদাঃ ভুয়া বা অসম্পূর্ণ তথ্য..."
                className="w-full px-3 py-2 border border-rose-300 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleApproveHelp(selectedHelpReq)}
                className="grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                অনুমোদন ও প্রকাশ
              </button>
              <button
                onClick={() => handleRejectHelp(selectedHelpReq)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Campaign */}
      {showNewCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">নতুন ত্রাণ ক্যাম্পেইন তৈরি</h4>
              <button onClick={() => setShowNewCampModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ক্যাম্পেইন শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={newCampTitle}
                  onChange={(e) => setNewCampTitle(e.target.value)}
                  placeholder="উদাঃ সিলেট ও সুনামগঞ্জ বন্যা পুনর্বাসন ২০২৬"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ক্যাটাগরি:</label>
                <select
                  value={newCampCategory}
                  onChange={(e) => setNewCampCategory(e.target.value as CampaignCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                >
                  {Object.entries(CAMPAIGN_CATEGORY_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">লক্ষ্যমাত্রা (টাকায়):</label>
                <input
                  type="number"
                  required
                  value={newCampTarget}
                  onChange={(e) => setNewCampTarget(e.target.value)}
                  placeholder="উদাঃ ১০০০০০০"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">ক্যাম্পেইনের বিস্তারিত:</label>
                <textarea
                  rows={3}
                  required
                  value={newCampDesc}
                  onChange={(e) => setNewCampDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800"
              >
                ক্যাম্পেইন প্রকাশ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Campaign Expense */}
      {selectedCampForExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">ব্যয়ের ভাউচার যুক্ত করুন</h4>
              <button onClick={() => setSelectedCampForExpense(null)}>✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">খরচের খাত:</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="উদাঃ ৫০০ প্যাকেট জরুরি শুকনো খাবার ক্রয়"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">পরিমাণ (৳):</label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="উদাঃ ২৫০০০"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ভাউচার নম্বর:</label>
                  <input
                    type="text"
                    value={expenseVoucher}
                    onChange={(e) => setExpenseVoucher(e.target.value)}
                    placeholder="VCH-102"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800"
              >
                ব্যয় সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Event */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">নতুন সেবামূলক ইভেন্ট</h4>
              <button onClick={() => setShowNewEventModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">ইভেন্ট শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="উদাঃ বিনামূল্যে বিশেষজ্ঞ মেডিকেল ক্যাম্প"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">জেলা:</label>
                  <select
                    value={newEventDistrict}
                    onChange={(e) => setNewEventDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">তারিখ ও সময়:</label>
                  <input
                    type="text"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="১৫ নভেম্বর, সকাল ৯টা"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">স্থানের নাম:</label>
                <input
                  type="text"
                  required
                  value={newEventLoc}
                  onChange={(e) => setNewEventLoc(e.target.value)}
                  placeholder="উদাঃ সরকারি পাইলট উচ্চ বিদ্যালয় মাঠ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">বিবরণ:</label>
                <textarea
                  rows={2}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800"
              >
                ইভেন্ট ঘোষণা করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Announcement */}
      {showNewAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">জরুরি নোটিশ প্রচার</h4>
              <button onClick={() => setShowNewAnnounceModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">শিরোনাম:</label>
                <input
                  type="text"
                  required
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  placeholder="উদাঃ সিলেট অঞ্চলের জন্য জরুরি মেডিকেল টিম প্রস্তুত"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">নোটিশের ধরন:</label>
                <select
                  value={announceType}
                  onChange={(e) => setAnnounceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                >
                  <option value="urgent">অতীব জরুরি (Urgent Red)</option>
                  <option value="info">তথ্যমূলক (Info Blue)</option>
                  <option value="success">কৃতজ্ঞতা / সাফল্য (Green)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">বার্তা বিষয়বস্তু:</label>
                <textarea
                  rows={3}
                  required
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-700 text-white font-bold rounded-xl hover:bg-rose-800"
              >
                ওয়েবসাইটে সম্প্রচার করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Relief Distribution Entry */}
      {showNewReliefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900">ফিল্ড ত্রাণ সামগ্রী বিতরণ লগ</h4>
              <button onClick={() => setShowNewReliefModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateReliefLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">বিতরণকৃত সামগ্রীর বিবরণ *:</label>
                <input
                  type="text"
                  required
                  value={reliefItemType}
                  onChange={(e) => setReliefItemType(e.target.value)}
                  placeholder="উদাঃ ৫০০ প্যাকেট শুকনো খাবার ও ওরস্যালাইন"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">পরিমাণ (সংখ্যা) *:</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={reliefQty}
                    onChange={(e) => setReliefQty(e.target.value)}
                    placeholder="৫০০"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">জেলা *:</label>
                  <select
                    value={reliefDistrict}
                    onChange={(e) => setReliefDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    {BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">নির্দিষ্ট স্থান / এলাকা *:</label>
                <input
                  type="text"
                  required
                  value={reliefLocation}
                  onChange={(e) => setReliefLocation(e.target.value)}
                  placeholder="উদাঃ তাহিরপুর বন্যা আশ্রয়কেন্দ্র"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">ফিল্ড কর্মকর্তা / সমন্বয়কারী:</label>
                  <input
                    type="text"
                    value={reliefHandler}
                    onChange={(e) => setReliefHandler(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">তারিখ:</label>
                  <input
                    type="date"
                    value={reliefDate}
                    onChange={(e) => setReliefDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">বিশেষ মন্তব্য (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={reliefNotes}
                  onChange={(e) => setReliefNotes(e.target.value)}
                  placeholder="উদাঃ স্থানীয় প্রশাসনের উপস্থিতিতে স্বচ্ছভাবে বণ্টিত"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800"
              >
                ত্রাণ বিতরণ রেকর্ড সংরক্ষণ করুন
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
