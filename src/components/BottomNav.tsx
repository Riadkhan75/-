import React from 'react';
import { HeartHandshake, FolderHeart, Droplet, HandHeart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth
}) => {
  const { user } = useAuth();

  const items = [
    { id: 'home', label: 'হোম', icon: HeartHandshake },
    { id: 'campaigns', label: 'ক্যাম্পেইন', icon: FolderHeart },
    { id: 'blood', label: 'রক্তদান', icon: Droplet },
    { id: 'help', label: 'সাহায্য', icon: HandHeart },
    { id: user ? 'dashboard' : 'auth', label: user ? 'প্রোফাইল' : 'লগইন', icon: User },
  ];

  const handleClick = (id: string) => {
    if (id === 'auth') {
      onOpenAuth();
    } else {
      setCurrentTab(id);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
