export type UserRole = 'user' | 'volunteer' | 'admin' | 'superadmin';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  district?: string;
  upazila?: string;
  role: UserRole;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type HelpCategory = 'medical' | 'education' | 'food' | 'clothing' | 'emergency' | 'other';
export type HelpRequestStatus = 'pending' | 'under_review' | 'approved' | 'in_progress' | 'completed' | 'rejected';

export interface HelpRequest {
  id: string;
  referenceNo: string;
  ownerId: string;
  applicantName: string;
  phone: string;
  category: HelpCategory;
  title: string;
  description: string;
  amountNeeded?: number;
  district: string;
  upazila: string;
  address?: string;
  isPublic?: boolean;
  consentGiven: boolean;
  status: HelpRequestStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodDonor {
  id: string;
  userId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  district: string;
  upazila: string;
  phone: string;
  isAvailable: boolean;
  lastDonationDate?: string;
  totalDonations?: number;
  consent: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type BloodUrgency = 'critical' | 'emergency' | 'standard';
export type BloodRequestStatus = 'active' | 'fulfilled' | 'cancelled';

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName?: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  hospital: string;
  district: string;
  upazila: string;
  urgency: BloodUrgency;
  neededDate: string;
  contactName: string;
  contactPhone: string;
  reason?: string;
  status: BloodRequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export type VolunteerStatus = 'pending' | 'approved' | 'rejected';

export interface VolunteerApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  skills: string;
  district: string;
  upazila: string;
  preferredTeam: string;
  hoursPerWeek?: number;
  status: VolunteerStatus;
  assignedTeamId?: string;
  points?: number;
  volunteerIdCard?: string;
  optOutLeaderboard?: boolean;
  createdAt: string;
}

export type CampaignCategory = 
  | 'flood_relief' 
  | 'winter_clothes' 
  | 'medical_fund' 
  | 'education_scholarship' 
  | 'iftar_food' 
  | 'general_welfare';

export type CampaignStatus = 'active' | 'completed' | 'paused' | 'draft';

export interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: CampaignCategory;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  featured?: boolean;
  bannerUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
export type DonationStatus = 'pending_verification' | 'verified' | 'rejected';

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  senderAccount?: string;
  status: DonationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  receiptNo?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  campaignId: string;
  title: string;
  amount: number;
  category: string;
  voucherNo?: string;
  date: string;
  description?: string;
  approvedBy?: string;
  createdAt: string;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  district: string;
  date: string;
  capacity?: number;
  registeredCount: number;
  status: EventStatus;
  completionReport?: string;
  bannerUrl?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle?: string;
  userId: string;
  userName: string;
  phone: string;
  rolePreference?: string;
  status: 'confirmed' | 'attended' | 'cancelled';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'urgent' | 'info' | 'success';
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

// ==========================================
// NEW FEATURE TYPES (FEATURES 1 TO 20)
// ==========================================

export type NotificationType = 'help_status' | 'donation_verified' | 'volunteer' | 'event' | 'announcement' | 'receipt';

export interface AppNotification {
  id: string;
  recipientId: string; // user UID or 'all'
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  requestId: string;
  applicantId: string;
  applicantName: string;
  requestTitle: string;
  lastMessage?: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'applicant' | 'admin' | 'support';
  text: string;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  idType: 'nid' | 'birth_cert' | 'passport';
  idNumberMasked: string; // e.g. 1990xxxx8901
  reason: string;
  status: VerificationStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  submittedAt: string;
}

export type ItemCategory = 'food' | 'clothes' | 'books' | 'medical_equipment' | 'essentials';
export type ItemCondition = 'new' | 'good_used' | 'clean';
export type ItemStatus = 'available' | 'reserved' | 'distributed';

export interface ItemListing {
  id: string;
  title: string;
  category: ItemCategory;
  quantity: number;
  condition: ItemCondition;
  district: string;
  upazila?: string;
  offeredBy: string;
  donorName: string;
  status: ItemStatus;
  createdAt: string;
}

export interface ItemClaim {
  id: string;
  itemId: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  phone: string;
  quantity: number;
  status: 'pending' | 'approved' | 'distributed' | 'rejected';
  createdAt: string;
}

export type ComplaintTargetType = 'help_request' | 'blood_donor' | 'campaign' | 'user' | 'other';
export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface Complaint {
  id: string;
  reporterId: string;
  targetType: ComplaintTargetType;
  targetId: string;
  reason: string;
  details: string;
  status: ComplaintStatus;
  resolutionNotes?: string;
  createdAt: string;
}

export interface VolunteerActivityLedgerEntry {
  id: string;
  userId: string;
  volunteerName: string;
  activityTitle: string;
  points: number;
  approvedBy: string;
  timestamp: string;
}

export interface VolunteerCertificate {
  id: string;
  certificateNo: string;
  userId: string;
  volunteerName: string;
  role: string;
  pointsEarned: number;
  issuedAt: string;
}

export interface ReliefDistribution {
  id: string;
  campaignId: string;
  itemType: string;
  quantity: number;
  location: string;
  district: string;
  handlerName: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface PublishedStory {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'medical' | 'flood' | 'education' | 'blood' | 'general';
  location: string;
  authorName: string;
  isApproved: boolean;
  publishedAt: string;
}

export interface PartnerOrganization {
  id: string;
  name: string;
  registrationNo: string;
  representativeName: string;
  phone: string;
  email: string;
  district: string;
  focusArea: string;
  status: 'pending' | 'verified' | 'suspended';
  createdAt: string;
}

// ==========================================
// GEOGRAPHIC & LABEL CONSTANTS
// ==========================================

export const BD_DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
];

export const BD_DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'নারায়ণগঞ্জ', 'গাজীপুর', 'বগুড়া', 'নোয়াখালী', 'পাবনা', 'দিনাজপুর',
  'যশোর', 'কক্সবাজার', 'ব্রাহ্মণবাড়িয়া', 'ফেনী', 'চাঁদপুর', 'লক্ষ্মীপুর', 'টাঙ্গাইল',
  'কিশোরগঞ্জ', 'ফরিদপুর', 'নরসিংদী', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'শরীয়তপুর', 'মাদারীপুর',
  'গোপালগঞ্জ', 'রাজবাড়ী', 'নেত্রকোণা', 'জামালপুর', 'শেরপুর', 'সিরাজগঞ্জ', 'নাটোর',
  'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট', 'কুষ্টিয়া', 'ঝিনাইদহ', 'মাগুরা', 'নড়াইল',
  'সাতক্ষীরা', 'বাগেরহাট', 'চুয়াডাঙ্গা', 'মেহেরপুর', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর',
  'বরগুনা', 'ঝালকাঠি', 'সুনামগঞ্জ', 'হবিগঞ্জ', 'মৌলভীবাজার', 'কুড়িগ্রাম', 'গাইবান্ধা',
  'নীলফামারী', 'লালমনিরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়', 'খাগড়াছড়ি', 'রাঙ্গামাটি', 'বান্দরবান'
];

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
  medical: 'চিকিৎসা সহায়তা',
  education: 'শিক্ষা ও খাতা-কলম সহায়তা',
  food: 'জরুরি খাদ্য ও রেশন',
  clothing: 'বস্ত্র ও শীতবস্ত্র সহায়তা',
  emergency: 'জরুরি দুর্যোগ ও পুনর্বাসন',
  other: 'অন্যান্য মানবিক সাহায্য'
};

export const HELP_STATUS_LABELS: Record<HelpRequestStatus, { label: string; color: string }> = {
  pending: { label: 'অপেক্ষমাণ', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_review: { label: 'পর্যালোচনাধীন', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  approved: { label: 'অনুমোদিত', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  in_progress: { label: 'সহায়তা চলমান', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  completed: { label: 'সম্পন্ন', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  rejected: { label: 'বাতিল', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const CAMPAIGN_CATEGORY_LABELS: Record<CampaignCategory, string> = {
  flood_relief: 'বন্যা ও প্রাকৃতিক দুর্যোগ ত্রাণ',
  winter_clothes: 'শীতবস্ত্র বিতরণ কর্মসূচি',
  medical_fund: 'জরুরি চিকিৎসা তহবিল',
  education_scholarship: 'সুবিধাবঞ্চিতদের শিক্ষাবৃত্তি',
  iftar_food: 'রমজান খাদ্য ও পুষ্টি তহবিল',
  general_welfare: 'সাধারণ কল্যাণ তহবিল'
};

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  food: 'শুকনো খাবার ও শিশু খাদ্য',
  clothes: 'বস্ত্র ও কম্বল/শীতবস্ত্র',
  books: 'পাঠ্যবই ও শিক্ষা উপকরণ',
  medical_equipment: 'চিকিৎসা সামগ্রী ও হুইলচেয়ার',
  essentials: 'জরুরি গৃহস্থালি সরঞ্জাম'
};

// ==========================================
// SYSTEM SETTINGS (বেসিক সেটিংস)
// ==========================================

export interface SystemSettings {
  platformName: string;
  tagline: string;
  helplinePhone: string;
  helplineAltPhone?: string;
  contactEmail: string;
  officeAddress: string;
  emergencyNoticeActive: boolean;
  emergencyNoticeText: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankRoutingNo: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  apkDownloadUrl?: string;
  appVersion?: string;
  appReleaseDate?: string;
  apkFileSize?: string;
  appReleaseNotes?: string;
  appDownloadActive?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  platformName: 'মানবতার সেবা',
  tagline: 'একসঙ্গে মানুষের পাশে',
  helplinePhone: '+৮৮০ ১৭১১-০০০০০০ / ৯৯৯',
  helplineAltPhone: '+৮৮০ ১৯০০-০০০০০০',
  contactEmail: 'help@manobotarsheba.org',
  officeAddress: 'বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা - ১২০৯, বাংলাদেশ',
  emergencyNoticeActive: true,
  emergencyNoticeText: 'জরুরি পরিস্থিতিতে নিকটস্থ স্বেচ্ছাসেবক দলের সাথে যোগাযোগ করুন অথবা ২৪/৭ হেল্পলাইনে কল করুন।',
  bkashNumber: '01700-000000 (মার্চেন্ট)',
  nagadNumber: '01800-000000 (পার্সোনাল)',
  rocketNumber: '01900-000000 (মার্চেন্ট)',
  bankAccountName: 'মানবতার সেবা ফাউন্ডেশন',
  bankName: 'ইসলামী ব্যাংক বাংলাদেশ লিমিটেড',
  bankAccountNumber: '২০৫০১২৩৪৫৬৭৮৯০১০০',
  bankBranch: 'ধানমন্ডি শাখা, ঢাকা',
  bankRoutingNo: '১২৫২৬৩৪৮১',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  apkDownloadUrl: '/downloads/manobotar-sheba-v1.2.0.apk',
  appVersion: 'v1.2.0',
  appReleaseDate: 'অক্টোবর ২০২৬',
  apkFileSize: '১৪.৮ মেগাবাইট (MB)',
  appReleaseNotes: 'অফলাইন হেল্পলাইন ডিরেক্টরি, রক্তের জরুরি পুশ এলার্ট, এক ক্লিকে অনুদান ও ভেরিফাইড রসিদ ডাউনলোড সুবিধা যুক্ত করা হয়েছে।',
  appDownloadActive: true
};

