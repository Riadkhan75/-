import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  HelpRequest,
  BloodDonor,
  BloodRequest,
  VolunteerApplication,
  Campaign,
  Donation,
  Expense,
  Event,
  EventRegistration,
  Announcement,
  AuditLog,
  HelpRequestStatus,
  VolunteerStatus,
  AppNotification,
  NotificationType,
  Conversation,
  ChatMessage,
  VerificationRequest,
  VerificationStatus,
  ItemListing,
  ItemClaim,
  Complaint,
  VolunteerActivityLedgerEntry,
  VolunteerCertificate,
  ReliefDistribution,
  PublishedStory,
  PartnerOrganization,
  SystemSettings,
  DEFAULT_SYSTEM_SETTINGS
} from '../types';

// ==========================================
// 1. HELP REQUESTS
// ==========================================

export async function createHelpRequest(data: Omit<HelpRequest, 'id' | 'referenceNo' | 'createdAt' | 'status'>): Promise<string> {
  const collectionPath = 'help_requests';
  const refNo = `MS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const payload = {
    ...data,
    referenceNo: refNo,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, collectionPath), payload);
    
    // Automatically send notification to user
    await createNotification({
      recipientId: data.ownerId,
      title: 'সাহায্য আবেদন গৃহীত হয়েছে',
      message: `আপনার আবেদন #${refNo} সফলভাবে গৃহীত হয়েছে। আমাদের টিম পর্যালোচনা করবে।`,
      type: 'help_status',
      link: 'dashboard'
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getMyHelpRequests(userId: string): Promise<HelpRequest[]> {
  const collectionPath = 'help_requests';
  try {
    const q = query(
      collection(db, collectionPath),
      where('ownerId', '==', userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function getPublicHelpRequests(): Promise<HelpRequest[]> {
  const collectionPath = 'help_requests';
  try {
    const q = query(
      collection(db, collectionPath),
      where('isPublic', '==', true)
    );
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
    return results.filter(r => r.status === 'approved' || r.status === 'completed');
  } catch (error) {
    console.warn('Notice: loading public help requests:', error);
    return [];
  }
}

export async function getAllHelpRequestsAdmin(): Promise<HelpRequest[]> {
  const collectionPath = 'help_requests';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as HelpRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function updateHelpRequestStatus(
  requestId: string,
  status: HelpRequestStatus,
  adminNotes?: string,
  isPublic?: boolean
): Promise<void> {
  const docPath = `help_requests/${requestId}`;
  try {
    const ref = doc(db, 'help_requests', requestId);
    const snap = await getDoc(ref);
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    await updateDoc(ref, updates);

    // Send targeted notification to request owner
    if (snap.exists()) {
      const data = snap.data() as HelpRequest;
      const statusBn = status === 'approved' ? 'অনুমোদিত' : status === 'rejected' ? 'বাতিল' : status;
      await createNotification({
        recipientId: data.ownerId,
        title: `সাহায্য আবেদন আপডেট: ${statusBn}`,
        message: `আপনার সাহায্য আবেদন #${data.referenceNo} এর স্ট্যাটাস পরিবর্তিত হয়েছে: ${statusBn}`,
        type: 'help_status',
        link: 'dashboard'
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// ==========================================
// 2. BLOOD DONORS & BLOOD REQUESTS
// ==========================================

export async function registerBloodDonor(data: Omit<BloodDonor, 'id' | 'createdAt'>): Promise<string> {
  const collectionPath = 'blood_donors';
  try {
    const payload = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getMyBloodDonor(userId: string): Promise<BloodDonor | null> {
  const collectionPath = 'blood_donors';
  try {
    const q = query(collection(db, collectionPath), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as BloodDonor;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function searchBloodDonors(bloodGroup?: string, district?: string): Promise<BloodDonor[]> {
  const collectionPath = 'blood_donors';
  try {
    let q = query(collection(db, collectionPath), where('isAvailable', '==', true));
    if (bloodGroup && bloodGroup !== 'all') {
      q = query(q, where('bloodGroup', '==', bloodGroup));
    }
    const snap = await getDocs(q);
    let results = snap.docs.map(d => ({ id: d.id, ...d.data() } as BloodDonor));
    if (district && district !== 'all') {
      results = results.filter(d => d.district === district);
    }
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function toggleBloodDonorAvailability(donorId: string, isAvailable: boolean): Promise<void> {
  const path = `blood_donors/${donorId}`;
  try {
    await updateDoc(doc(db, 'blood_donors', donorId), {
      isAvailable,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createBloodRequest(data: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const collectionPath = 'blood_requests';
  try {
    const payload = {
      ...data,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getActiveBloodRequests(): Promise<BloodRequest[]> {
  const collectionPath = 'blood_requests';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BloodRequest));
    return list.filter(r => r.status === 'active');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function updateBloodRequestStatus(requestId: string, status: 'fulfilled' | 'cancelled'): Promise<void> {
  const path = `blood_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'blood_requests', requestId), {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// 3. VOLUNTEER APPLICATIONS & REWARDS
// ==========================================

export async function submitVolunteerApplication(data: Omit<VolunteerApplication, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const collectionPath = 'volunteer_applications';
  try {
    const payload = {
      ...data,
      status: 'pending' as const,
      points: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getMyVolunteerApplication(userId: string): Promise<VolunteerApplication | null> {
  const collectionPath = 'volunteer_applications';
  try {
    const q = query(collection(db, collectionPath), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as VolunteerApplication;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function getAllVolunteerApplicationsAdmin(): Promise<VolunteerApplication[]> {
  const collectionPath = 'volunteer_applications';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as VolunteerApplication));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function updateVolunteerStatusAdmin(
  appId: string,
  status: VolunteerStatus,
  assignedTeamId?: string
): Promise<void> {
  const path = `volunteer_applications/${appId}`;
  try {
    const ref = doc(db, 'volunteer_applications', appId);
    const snap = await getDoc(ref);
    const updates: Record<string, any> = { status };
    if (assignedTeamId) updates.assignedTeamId = assignedTeamId;

    if (status === 'approved' && snap.exists()) {
      const volData = snap.data() as VolunteerApplication;
      // Generate official unique volunteer ID card number
      updates.volunteerIdCard = `VOL-MS-${Math.floor(100000 + Math.random() * 900000)}`;

      // Send approval notification
      await createNotification({
        recipientId: volData.userId,
        title: 'স্বেচ্ছাসেবক হিসেবে অনুমোদন!',
        message: `অভিনন্দন! আপনার আবেদন অনুমোদিত হয়েছে। টিম: ${assignedTeamId || volData.preferredTeam}। আইডি: ${updates.volunteerIdCard}`,
        type: 'volunteer',
        link: 'volunteer'
      });
    }

    await updateDoc(ref, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function awardVolunteerPointsAdmin(
  volunteerAppId: string,
  volunteerUid: string,
  volunteerName: string,
  activityTitle: string,
  points: number,
  adminUid: string
): Promise<void> {
  try {
    const volRef = doc(db, 'volunteer_applications', volunteerAppId);
    const volSnap = await getDoc(volRef);
    if (volSnap.exists()) {
      const curPoints = volSnap.data().points || 0;
      await updateDoc(volRef, { points: curPoints + points });
    }

    // Write to append-only activity ledger
    await addDoc(collection(db, 'volunteer_activity_ledger'), {
      userId: volunteerUid,
      volunteerName,
      activityTitle,
      points,
      approvedBy: adminUid,
      timestamp: new Date().toISOString()
    });

    // Notify volunteer
    await createNotification({
      recipientId: volunteerUid,
      title: 'সেবামূলক পয়েন্ট অর্জিত হয়েছে!',
      message: `"${activityTitle}" কার্যক্রমে অংশগ্রহণের জন্য ${points} পয়েন্ট যুক্ত হয়েছে।`,
      type: 'volunteer',
      link: 'volunteer'
    });
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

export async function getVolunteerLeaderboard(): Promise<VolunteerApplication[]> {
  try {
    const snap = await getDocs(collection(db, 'volunteer_applications'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as VolunteerApplication));
    return list
      .filter(v => v.status === 'approved' && !v.optOutLeaderboard)
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (error) {
    console.warn('Error fetching leaderboard:', error);
    return [];
  }
}

export async function issueVolunteerCertificateAdmin(
  userId: string,
  volunteerName: string,
  role: string,
  pointsEarned: number
): Promise<string> {
  const certNo = `CERT-MS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    await addDoc(collection(db, 'certificates'), {
      certificateNo: certNo,
      userId,
      volunteerName,
      role,
      pointsEarned,
      issuedAt: new Date().toISOString()
    });

    await createNotification({
      recipientId: userId,
      title: 'অফিসিয়াল স্বীকৃতি সনদ ইস্যু করা হয়েছে!',
      message: `আপনার সেবামূলক অবদানের জন্য সম্মাননা সার্টিফিকেট (${certNo}) ইস্যু হয়েছে।`,
      type: 'volunteer',
      link: 'volunteer'
    });

    return certNo;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'certificates');
  }
}

export async function getCertificateByNo(certificateNo: string): Promise<VolunteerCertificate | null> {
  try {
    const q = query(collection(db, 'certificates'), where('certificateNo', '==', certificateNo));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as VolunteerCertificate;
  } catch (error) {
    return null;
  }
}

export async function getMyCertificates(userId: string): Promise<VolunteerCertificate[]> {
  try {
    const q = query(collection(db, 'certificates'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as VolunteerCertificate));
  } catch (error) {
    return [];
  }
}

// ==========================================
// 4. CAMPAIGNS & EXPENSES
// ==========================================

export async function getCampaigns(): Promise<Campaign[]> {
  const collectionPath = 'campaigns';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Campaign));
  } catch (error) {
    console.warn('Notice loading campaigns:', error);
    return [];
  }
}

export async function createCampaignAdmin(data: Omit<Campaign, 'id' | 'collectedAmount' | 'donorCount' | 'createdAt'>): Promise<string> {
  const collectionPath = 'campaigns';
  try {
    const payload = {
      ...data,
      collectedAmount: 0,
      donorCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function updateCampaignAdmin(campaignId: string, data: Partial<Campaign>): Promise<void> {
  const path = `campaigns/${campaignId}`;
  try {
    await updateDoc(doc(db, 'campaigns', campaignId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaignAdmin(campaignId: string): Promise<void> {
  const path = `campaigns/${campaignId}`;
  try {
    await deleteDoc(doc(db, 'campaigns', campaignId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}


export async function getCampaignExpenses(campaignId: string): Promise<Expense[]> {
  const collectionPath = 'expenses';
  try {
    const q = query(collection(db, collectionPath), where('campaignId', '==', campaignId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function addCampaignExpenseAdmin(data: Omit<Expense, 'id' | 'createdAt'>): Promise<string> {
  const collectionPath = 'expenses';
  try {
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

// ==========================================
// 5. DONATIONS & DIGITAL RECEIPTS
// ==========================================

export async function submitDonation(data: Omit<Donation, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const collectionPath = 'donations';
  try {
    const payload = {
      ...data,
      status: 'pending_verification' as const,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getMyDonations(userId: string): Promise<Donation[]> {
  const collectionPath = 'donations';
  try {
    const q = query(collection(db, collectionPath), where('donorId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function getAllDonationsAdmin(): Promise<Donation[]> {
  const collectionPath = 'donations';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function getDonationByReceiptNo(receiptNo: string): Promise<Donation | null> {
  try {
    const q = query(collection(db, 'donations'), where('receiptNo', '==', receiptNo));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Donation;
  } catch (error) {
    return null;
  }
}

export async function verifyDonationAdmin(
  donationId: string,
  adminUid: string
): Promise<string> {
  const donationRef = doc(db, 'donations', donationId);
  const receiptNumber = `RC-MS-${Date.now().toString().slice(-6)}`;

  try {
    let donorUidToNotify = '';
    let donAmount = 0;

    await runTransaction(db, async (transaction) => {
      const donDoc = await transaction.get(donationRef);
      if (!donDoc.exists()) {
        throw new Error('Donation document not found');
      }
      const donData = donDoc.data() as Donation;
      if (donData.status === 'verified') {
        throw new Error('Donation is already verified');
      }

      donorUidToNotify = donData.donorId;
      donAmount = Number(donData.amount);

      transaction.update(donationRef, {
        status: 'verified',
        verifiedBy: adminUid,
        verifiedAt: new Date().toISOString(),
        receiptNo: receiptNumber
      });

      if (donData.campaignId && donData.campaignId !== 'general') {
        const campaignRef = doc(db, 'campaigns', donData.campaignId);
        const campDoc = await transaction.get(campaignRef);
        if (campDoc.exists()) {
          const campData = campDoc.data() as Campaign;
          const newCollected = (campData.collectedAmount || 0) + Number(donData.amount);
          const newDonors = (campData.donorCount || 0) + 1;
          transaction.update(campaignRef, {
            collectedAmount: newCollected,
            donorCount: newDonors,
            updatedAt: new Date().toISOString()
          });
        }
      }
    });

    if (donorUidToNotify && donorUidToNotify !== 'guest') {
      await createNotification({
        recipientId: donorUidToNotify,
        title: 'অনুদান যাচাই সম্পন্ন ও ডিজিটাল রসিদ ইস্যু!',
        message: `আপনার ${donAmount} ৳ অনুদান সফলভাবে যাচাই হয়েছে। অফিশিয়াল রসিদ নম্বর: ${receiptNumber}`,
        type: 'receipt',
        link: 'dashboard'
      });
    }

    return receiptNumber;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `donations/${donationId}`);
  }
}

export async function rejectDonationAdmin(
  donationId: string,
  adminUid: string,
  reason: string
): Promise<void> {
  const path = `donations/${donationId}`;
  try {
    await updateDoc(doc(db, 'donations', donationId), {
      status: 'rejected',
      verifiedBy: adminUid,
      verifiedAt: new Date().toISOString(),
      rejectionReason: reason
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// 6. EVENTS & REGISTRATIONS
// ==========================================

export async function getEvents(): Promise<Event[]> {
  const collectionPath = 'events';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Event));
  } catch (error) {
    console.warn('Notice loading events:', error);
    return [];
  }
}

export async function registerForEvent(
  data: Omit<EventRegistration, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const collectionPath = 'event_registrations';
  try {
    const payload = {
      ...data,
      status: 'confirmed' as const,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);

    const eventRef = doc(db, 'events', data.eventId);
    const eventSnap = await getDoc(eventRef);
    if (eventSnap.exists()) {
      const cur = eventSnap.data().registeredCount || 0;
      await updateDoc(eventRef, { registeredCount: cur + 1 });
    }

    await createNotification({
      recipientId: data.userId,
      title: 'ইভেন্ট রেজিস্ট্রেশন নিশ্চিত হয়েছে!',
      message: `আপনি "${data.eventTitle || 'সেবামূলক ইভেন্ট'}" এ সফলভাবে নিবন্ধিত হয়েছেন।`,
      type: 'event',
      link: 'events'
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function getMyEventRegistrations(userId: string): Promise<EventRegistration[]> {
  const collectionPath = 'event_registrations';
  try {
    const q = query(collection(db, collectionPath), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EventRegistration));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

export async function createEventAdmin(data: Omit<Event, 'id' | 'registeredCount' | 'createdAt'>): Promise<string> {
  const collectionPath = 'events';
  try {
    const payload = {
      ...data,
      registeredCount: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function updateEventAdmin(eventId: string, data: Partial<Event>): Promise<void> {
  const path = `events/${eventId}`;
  try {
    await updateDoc(doc(db, 'events', eventId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==========================================
// 7. SMART NOTIFICATIONS
// ==========================================

export async function createNotification(data: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): Promise<string> {
  const collectionPath = 'notifications';
  try {
    const payload = {
      ...data,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    console.warn('Error creating notification:', error);
    return '';
  }
}

export async function getUserNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', 'in', [userId, 'all'])
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Notice loading notifications:', error);
    return [];
  }
}

export async function markNotificationRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (error) {
    console.warn('Error marking notification read:', error);
  }
}

// ==========================================
// 8. PROFILE VERIFICATION WORKFLOW
// ==========================================

export async function submitProfileVerification(data: Omit<VerificationRequest, 'id' | 'status' | 'submittedAt'>): Promise<string> {
  try {
    const payload = {
      ...data,
      status: 'pending' as const,
      submittedAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'verification_requests'), payload);
    
    // Update user profile status
    await updateDoc(doc(db, 'users', data.userId), {
      verificationStatus: 'pending'
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'verification_requests');
  }
}

export async function getMyVerificationRequest(userId: string): Promise<VerificationRequest | null> {
  try {
    const q = query(collection(db, 'verification_requests'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as VerificationRequest;
  } catch (error) {
    return null;
  }
}

export async function getAllVerificationRequestsAdmin(): Promise<VerificationRequest[]> {
  try {
    const snap = await getDocs(collection(db, 'verification_requests'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as VerificationRequest));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'verification_requests');
  }
}

export async function reviewVerificationRequestAdmin(
  requestId: string,
  userId: string,
  status: VerificationStatus,
  reviewerNotes: string,
  reviewerUid: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'verification_requests', requestId), {
      status,
      reviewerNotes,
      reviewedBy: reviewerUid
    });

    const isVerified = status === 'verified';
    await updateDoc(doc(db, 'users', userId), {
      isVerified,
      verificationStatus: status
    });

    await createNotification({
      recipientId: userId,
      title: isVerified ? 'প্রোফাইল ভেরিফিকেশন সফল!' : 'ভেরিফিকেশন আবেদন পর্যালোচনা',
      message: isVerified
        ? 'অভিনন্দন! আপনার প্রোফাইলে নীল ভেরিফায়েড ব্যাজ যুক্ত হয়েছে।'
        : `আপনার ভেরিফিকেশন স্ট্যাটাস: ${status}। মন্তব্য: ${reviewerNotes}`,
      type: 'help_status',
      link: 'dashboard'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `verification_requests/${requestId}`);
  }
}

// ==========================================
// 9. SECURE HELP CHAT
// ==========================================

export async function getOrCreateConversation(
  requestId: string,
  applicantId: string,
  applicantName: string,
  requestTitle: string
): Promise<string> {
  try {
    const q = query(collection(db, 'conversations'), where('requestId', '==', requestId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }

    const payload = {
      requestId,
      applicantId,
      applicantName,
      requestTitle,
      lastMessage: 'সহায়তা চ্যাট থ্রেড শুরু হয়েছে',
      updatedAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'conversations'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'conversations');
  }
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    console.warn('Notice loading messages:', error);
    return [];
  }
}

export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'applicant' | 'admin' | 'support',
  text: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId,
      senderName,
      senderRole,
      text,
      createdAt: new Date().toISOString()
    });

    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text.slice(0, 80),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'messages');
  }
}

export async function getMyConversations(userId: string, isSuperAdmin: boolean): Promise<Conversation[]> {
  try {
    let q;
    if (isSuperAdmin) {
      q = query(collection(db, 'conversations'));
    } else {
      q = query(collection(db, 'conversations'), where('applicantId', '==', userId));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Conversation));
  } catch (error) {
    console.warn('Error loading conversations:', error);
    return [];
  }
}

// ==========================================
// 10. CLOTHES AND FOOD BANK
// ==========================================

export async function getItemListings(category?: string, district?: string): Promise<ItemListing[]> {
  try {
    let q = query(collection(db, 'item_listings'), where('status', 'in', ['available', 'reserved']));
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ItemListing));
    if (category && category !== 'all') {
      list = list.filter(i => i.category === category);
    }
    if (district && district !== 'all') {
      list = list.filter(i => i.district === district);
    }
    return list;
  } catch (error) {
    console.warn('Error fetching item listings:', error);
    return [];
  }
}

export async function createItemListing(data: Omit<ItemListing, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const payload = {
      ...data,
      status: 'available' as const,
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'item_listings'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'item_listings');
  }
}

export async function submitItemClaim(data: Omit<ItemClaim, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const payload = {
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'item_claims'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'item_claims');
  }
}

export async function getAllItemClaimsAdmin(): Promise<ItemClaim[]> {
  try {
    const snap = await getDocs(collection(db, 'item_claims'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ItemClaim));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'item_claims');
  }
}

export async function updateItemClaimStatusAdmin(
  claimId: string,
  itemId: string,
  status: 'approved' | 'distributed' | 'rejected',
  claimedQty: number
): Promise<void> {
  try {
    await updateDoc(doc(db, 'item_claims', claimId), { status });
    if (status === 'distributed') {
      const itemRef = doc(db, 'item_listings', itemId);
      const itemSnap = await getDoc(itemRef);
      if (itemSnap.exists()) {
        const curQty = itemSnap.data().quantity || 0;
        const newQty = Math.max(0, curQty - claimedQty);
        await updateDoc(itemRef, {
          quantity: newQty,
          status: newQty === 0 ? 'distributed' : 'available'
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `item_claims/${claimId}`);
  }
}

// ==========================================
// 11. COMPLAINTS & REPORT SYSTEM
// ==========================================

export async function submitComplaint(data: Omit<Complaint, 'id' | 'createdAt' | 'status'>): Promise<string> {
  try {
    const payload = {
      ...data,
      status: 'open' as const,
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'complaints'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'complaints');
  }
}

export async function getAllComplaintsAdmin(): Promise<Complaint[]> {
  try {
    const snap = await getDocs(collection(db, 'complaints'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'complaints');
  }
}

export async function updateComplaintStatusAdmin(
  complaintId: string,
  status: Complaint['status'],
  resolutionNotes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'complaints', complaintId), {
      status,
      resolutionNotes
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `complaints/${complaintId}`);
  }
}

// ==========================================
// 12. RELIEF INVENTORY & DISTRIBUTIONS
// ==========================================

export async function getReliefDistributions(): Promise<ReliefDistribution[]> {
  try {
    const snap = await getDocs(collection(db, 'relief_distributions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ReliefDistribution));
  } catch (error) {
    console.warn('Error fetching relief distributions:', error);
    return [];
  }
}

export async function addReliefDistributionAdmin(data: Omit<ReliefDistribution, 'id' | 'createdAt'>): Promise<string> {
  try {
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'relief_distributions'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'relief_distributions');
  }
}

// ==========================================
// 13. STORIES (SHARE A GOOD DEED)
// ==========================================

export async function getPublishedStories(): Promise<PublishedStory[]> {
  try {
    const q = query(collection(db, 'published_stories'), where('isApproved', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublishedStory));
  } catch (error) {
    console.warn('Error fetching stories:', error);
    return [];
  }
}

export async function submitPublishedStory(data: Omit<PublishedStory, 'id' | 'isApproved' | 'publishedAt'>): Promise<string> {
  try {
    const payload = {
      ...data,
      isApproved: false,
      publishedAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'published_stories'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'published_stories');
  }
}

export async function getAllStoriesAdmin(): Promise<PublishedStory[]> {
  try {
    const snap = await getDocs(collection(db, 'published_stories'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublishedStory));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'published_stories');
  }
}

export async function updateStoryStatusAdmin(storyId: string, isApproved: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'published_stories', storyId), { isApproved });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `published_stories/${storyId}`);
  }
}

// ==========================================
// 14. PARTNER ORGANIZATIONS
// ==========================================

export async function getPartnerOrganizations(): Promise<PartnerOrganization[]> {
  try {
    const q = query(collection(db, 'organizations'), where('status', '==', 'verified'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PartnerOrganization));
  } catch (error) {
    console.warn('Error fetching organizations:', error);
    return [];
  }
}

export async function submitOrganizationApplication(data: Omit<PartnerOrganization, 'id' | 'status' | 'createdAt'>): Promise<string> {
  try {
    const payload = {
      ...data,
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };
    const ref = await addDoc(collection(db, 'organizations'), payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'organizations');
  }
}

export async function getAllOrganizationsAdmin(): Promise<PartnerOrganization[]> {
  try {
    const snap = await getDocs(collection(db, 'organizations'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PartnerOrganization));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'organizations');
  }
}

export async function updateOrganizationStatusAdmin(orgId: string, status: PartnerOrganization['status']): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}`);
  }
}

// ==========================================
// 15. ANNOUNCEMENTS & AUDIT LOGS
// ==========================================

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const collectionPath = 'announcements';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
    return list.filter(a => a.isActive);
  } catch (error) {
    console.warn('Notice loading announcements:', error);
    return [];
  }
}

export async function createAnnouncementAdmin(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
  const collectionPath = 'announcements';
  try {
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, collectionPath), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function logAdminAudit(
  action: string,
  performedBy: string,
  targetEntity: string,
  targetId: string,
  details: string
): Promise<void> {
  const collectionPath = 'audit_logs';
  try {
    const payload = {
      action,
      performedBy,
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, collectionPath), payload);
  } catch (error) {
    console.warn('Audit logging notice:', error);
  }
}

export async function getAuditLogsAdmin(): Promise<AuditLog[]> {
  const collectionPath = 'audit_logs';
  try {
    const snap = await getDocs(collection(db, collectionPath));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

// ==========================================
// 16. LIVE STATS & PUBLIC IMPACT METRICS
// ==========================================

export interface LiveStatsSummary {
  totalHelpRequests: number;
  pendingHelpRequests: number;
  approvedHelpRequests: number;
  totalDonors: number;
  availableDonors: number;
  activeBloodRequests: number;
  totalCampaigns: number;
  totalVerifiedDonationsAmount: number;
  pendingDonationsCount: number;
  totalEvents: number;
  totalVolunteers: number;
  pendingVolunteers: number;
  totalItemsInBank: number;
  pendingComplaintsCount: number;
  pendingVerificationsCount: number;
}

export async function getAdminLiveStats(): Promise<LiveStatsSummary> {
  try {
    const [helpSnap, donorSnap, bloodReqSnap, campSnap, donSnap, eventSnap, volSnap, itemsSnap, compSnap, verifSnap] = await Promise.all([
      getDocs(collection(db, 'help_requests')),
      getDocs(collection(db, 'blood_donors')),
      getDocs(collection(db, 'blood_requests')),
      getDocs(collection(db, 'campaigns')),
      getDocs(collection(db, 'donations')),
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'volunteer_applications')),
      getDocs(collection(db, 'item_listings')),
      getDocs(collection(db, 'complaints')),
      getDocs(collection(db, 'verification_requests'))
    ]);

    const helpList = helpSnap.docs.map(d => d.data() as HelpRequest);
    const donorList = donorSnap.docs.map(d => d.data() as BloodDonor);
    const bloodReqList = bloodReqSnap.docs.map(d => d.data() as BloodRequest);
    const donationList = donSnap.docs.map(d => d.data() as Donation);
    const volList = volSnap.docs.map(d => d.data() as VolunteerApplication);
    const compList = compSnap.docs.map(d => d.data() as Complaint);
    const verifList = verifSnap.docs.map(d => d.data() as VerificationRequest);

    const verifiedAmount = donationList
      .filter(d => d.status === 'verified')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return {
      totalHelpRequests: helpList.length,
      pendingHelpRequests: helpList.filter(h => h.status === 'pending').length,
      approvedHelpRequests: helpList.filter(h => h.status === 'approved' || h.status === 'completed').length,
      totalDonors: donorList.length,
      availableDonors: donorList.filter(d => d.isAvailable).length,
      activeBloodRequests: bloodReqList.filter(b => b.status === 'active').length,
      totalCampaigns: campSnap.size,
      totalVerifiedDonationsAmount: verifiedAmount,
      pendingDonationsCount: donationList.filter(d => d.status === 'pending_verification').length,
      totalEvents: eventSnap.size,
      totalVolunteers: volList.length,
      pendingVolunteers: volList.filter(v => v.status === 'pending').length,
      totalItemsInBank: itemsSnap.size,
      pendingComplaintsCount: compList.filter(c => c.status === 'open').length,
      pendingVerificationsCount: verifList.filter(v => v.status === 'pending').length
    };
  } catch (error) {
    console.warn('Notice: admin stats requires superadmin authorization:', error);
    return {
      totalHelpRequests: 0,
      pendingHelpRequests: 0,
      approvedHelpRequests: 0,
      totalDonors: 0,
      availableDonors: 0,
      activeBloodRequests: 0,
      totalCampaigns: 0,
      totalVerifiedDonationsAmount: 0,
      pendingDonationsCount: 0,
      totalEvents: 0,
      totalVolunteers: 0,
      pendingVolunteers: 0,
      totalItemsInBank: 0,
      pendingComplaintsCount: 0,
      pendingVerificationsCount: 0
    };
  }
}

// ==========================================
// 17. SYSTEM SETTINGS (বেসিক সেটিংস)
// ==========================================

export async function getSystemSettings(): Promise<SystemSettings> {
  const docPath = 'system_settings/general';
  try {
    const snap = await getDoc(doc(db, 'system_settings', 'general'));
    if (snap.exists()) {
      return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
    }
    return DEFAULT_SYSTEM_SETTINGS;
  } catch (error) {
    console.warn('Notice loading system settings:', error);
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>, updatedByAdmin?: string): Promise<void> {
  const docPath = 'system_settings/general';
  try {
    // Explicitly clean any undefined values
    const cleanPayload: Record<string, any> = {};
    for (const [key, val] of Object.entries(settings)) {
      if (val !== undefined) {
        cleanPayload[key] = val;
      }
    }

    cleanPayload.updatedAt = new Date().toISOString();
    if (updatedByAdmin) {
      cleanPayload.updatedBy = updatedByAdmin;
    }

    await setDoc(doc(db, 'system_settings', 'general'), cleanPayload, { merge: true });

    // Non-blocking security audit log
    if (updatedByAdmin) {
      logAdminAudit('update_system_settings', updatedByAdmin, 'system_settings', 'general', 'সিস্টেম সাধারণ সেটিংস হালনাগাদ করা হয়েছে').catch(() => {});
    }

    // Broadcast update event for instant cross-component synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manobotar_settings_updated', { detail: cleanPayload }));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

