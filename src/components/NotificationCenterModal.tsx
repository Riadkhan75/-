import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  FileCheck, 
  Heart, 
  Calendar, 
  Users, 
  Receipt,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { getUserNotifications, markNotificationRead } from '../services/firestoreService';
import { AppNotification } from '../types';
import { useAuth } from '../context/AuthContext';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;
    async function fetchNotifs() {
      setLoading(true);
      try {
        const list = await getUserNotifications(user!.uid);
        if (isMounted) setNotifications(list);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }

    fetchNotifs();
    return () => { isMounted = false; };
  }, [isOpen, user]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleRequestPush = async () => {
    if (!('Notification' in window)) {
      alert('আপনার ব্রাউজার পুশ নোটিফিকেশন সমর্থন করে না।');
      return;
    }
    const permission = await Notification.requestPermission();
    setPushStatus(permission);
    if (permission === 'granted') {
      new Notification('মানবতার সেবা', {
        body: 'পুশ নোটিফিকেশন সফলভাবে সক্রিয় হয়েছে!',
        icon: '/favicon.ico'
      });
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'help_status': return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'donation_verified': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'volunteer': return <Users className="w-4 h-4 text-purple-600" />;
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'receipt': return <Receipt className="w-4 h-4 text-amber-600" />;
      default: return <Bell className="w-4 h-4 text-teal-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100 flex flex-col h-[580px] max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-emerald-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold">বিজ্ঞপ্তি ও নোটিফিকেশন সেন্টার</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Card */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-700 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800 block">স্মার্ট ব্রাউজার / মোবাইল পুশ</span>
              <span className="text-[11px] text-slate-500">
                {pushStatus === 'granted' ? 'সক্রিয় রয়েছে' : 'জরুরি আপডেটের জন্য পুশ নোটিফিকেশন চালু করুন'}
              </span>
            </div>
          </div>
          {pushStatus !== 'granted' && (
            <button
              onClick={handleRequestPush}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0"
            >
              অনুমতি দিন
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto grow space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">নোটিফিকেশন লোড হচ্ছে...</div>
          ) : !user ? (
            <div className="text-center py-12 text-slate-500 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p>আপনার নোটিফিকেশন দেখতে অনুগ্রহ করে লগইন করুন।</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <CheckCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p>বর্তমানে কোনো নতুন নোটিফিকেশন নেই।</p>
              <p className="text-[11px] text-slate-400">সাহায্য আবেদন ও অনুদান যাচাই হলে নোটিফিকেশন এখানে প্রদর্শিত হবে।</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) handleMarkAsRead(notif.id);
                  if (notif.link && onNavigate) {
                    onNavigate(notif.link);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  notif.isRead 
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                    : 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="grow space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span>বিস্তারিত দেখুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          সিস্টেমের গুরুত্বপূর্ণ আপডেট স্বয়ংক্রিয়ভাবে আপনার একাউন্টে যুক্ত হয়
        </div>
      </div>
    </div>
  );
};
