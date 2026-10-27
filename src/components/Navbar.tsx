import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  LogOut, 
  Droplet, 
  HandHeart, 
  Calendar, 
  Users, 
  HelpCircle,
  FolderHeart,
  Package,
  TrendingUp,
  Sparkles,
  Bell,
  Heart,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenHelpModal: () => void;
  onOpenNotifications?: () => void;
  unreadNotifsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenHelpModal,
  onOpenNotifications,
  unreadNotifsCount = 0
}) => {
  const { user, userProfile, isAdmin, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'হোম', icon: HeartHandshake },
    { id: 'campaigns', label: 'ত্রাণ ক্যাম্পেইন', icon: FolderHeart },
    { id: 'blood', label: 'রক্তদান', icon: Droplet },
    { id: 'help', label: 'সাহায্য আবেদন', icon: HandHeart },
    { id: 'bank', label: 'খাদ্য ও বস্ত্র ব্যাংক', icon: Package },
    { id: 'impact', label: 'স্বচ্ছতা ও প্রভাব', icon: TrendingUp },
    { id: 'stories', label: 'মানবিক গল্প', icon: Sparkles },
    { id: 'events', label: 'ইভেন্ট', icon: Calendar },
    { id: 'volunteer', label: 'স্বেচ্ছাসেবা', icon: Users },
    { id: 'download', label: 'মোবাইল অ্যাপ', icon: Smartphone },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-teal-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-2xl font-bold tracking-tight text-emerald-950 font-['Hind_Siliguri',sans-serif]">
                  মানবতার সেবা
                </span>
                <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                  সার্বজনীন কল্যাণ
                </span>
              </div>
              <p className="text-[11px] text-teal-800 font-medium hidden sm:block">
                একসঙ্গে মানুষের পাশে
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="বিজ্ঞপ্তি ও নোটিফিকেশন"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('donate')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
            >
              <Heart className="w-4 h-4 fill-white" />
              অনুদান দিন
            </button>

            <button
              onClick={() => handleNavClick('apply-help')}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
            >
              <HandHeart className="w-4 h-4 text-rose-600" />
              সাহায্য চান
            </button>

            <button
              onClick={() => handleNavClick('download')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 ${
                currentTab === 'download'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
              title="মোবাইল অ্যাপ ডাউনলোড করুন"
            >
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>অ্যাপ ডাউনলোড</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                }`}
                title="সুপার অ্যাডমিন ড্যাশবোর্ড"
              >
                <ShieldCheck className="w-4 h-4" />
                অ্যাডমিন
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-teal-50 border-teal-300 text-teal-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">
                    {userProfile?.displayName || user.displayName || 'প্রোফাইল'}
                  </span>
                </button>
                <button
                  onClick={signOutUser}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <User className="w-4 h-4" />
                লগইন / নিবন্ধন
              </button>
            )}
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 text-slate-600 hover:text-emerald-800 rounded-lg"
              title="নোটিফিকেশন"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute 0 right-0 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('donate')}
              className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-2xs"
            >
              অনুদান
            </button>
            <button
              onClick={() => handleNavClick('apply-help')}
              className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg"
            >
              সাহায্য চান
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 focus:outline-none"
              aria-label="মেনু খুলুন"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pt-1 pb-3 border-b border-slate-100">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-800 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold"
              >
                <ShieldCheck className="w-4 h-4" />
                সুপার অ্যাডমিন ড্যাশবোর্ড
              </button>
            )}

            {user ? (
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-2 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {userProfile?.displayName || user.displayName || 'প্রোফাইল'}
                    </div>
                    <div className="text-[10px] text-slate-500">আমার ড্যাশবোর্ড দেখুন</div>
                  </div>
                </button>
                <button
                  onClick={signOutUser}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                লগইন অথবা নতুন একাউন্ট
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
