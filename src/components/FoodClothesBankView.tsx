import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  MapPin, 
  PlusCircle, 
  HandHeart, 
  CheckCircle2, 
  Shirt, 
  Apple, 
  BookOpen, 
  Stethoscope, 
  Layers,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  getItemListings, 
  createItemListing, 
  submitItemClaim 
} from '../services/firestoreService';
import { 
  ItemListing, 
  ItemCategory, 
  ItemCondition, 
  ITEM_CATEGORY_LABELS, 
  BD_DISTRICTS 
} from '../types';
import { useAuth } from '../context/AuthContext';

interface FoodClothesBankViewProps {
  onRequireAuth: () => void;
}

export const FoodClothesBankView: React.FC<FoodClothesBankViewProps> = ({ onRequireAuth }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<ItemListing | null>(null);

  // Offer Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCategory, setOfferCategory] = useState<ItemCategory>('clothes');
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [offerCondition, setOfferCondition] = useState<ItemCondition>('new');
  const [offerDistrict, setOfferDistrict] = useState('ঢাকা');
  const [offerUpazila, setOfferUpazila] = useState('');
  const [offerDonorName, setOfferDonorName] = useState(user?.displayName || '');
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  // Claim Form State
  const [claimName, setClaimName] = useState(user?.displayName || '');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimQty, setClaimQty] = useState(1);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getItemListings(selectedCategory, selectedDistrict);
      setItems(data);
    } catch (err) {
      console.error('Error fetching bank items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [selectedCategory, selectedDistrict]);

  const handleOpenClaim = (item: ItemListing) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setSelectedItemForClaim(item);
    setClaimQty(1);
    setClaimSuccess(false);
    setClaimError('');
    setClaimModalOpen(true);
  };

  const handleOpenOffer = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setOfferSuccess(false);
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim() || !user) return;

    setOfferSubmitting(true);
    try {
      await createItemListing({
        title: offerTitle.trim(),
        category: offerCategory,
        quantity: Number(offerQuantity) || 1,
        condition: offerCondition,
        district: offerDistrict,
        upazila: offerUpazila.trim() || undefined,
        offeredBy: user.uid,
        donorName: offerDonorName.trim() || user.displayName || 'নাম প্রকাশে অনিচ্ছুক'
      });
      setOfferSuccess(true);
      await loadItems();
    } catch (err) {
      console.error('Failed to create listing:', err);
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForClaim || !user) return;

    if (!claimPhone.trim()) {
      setClaimError('অনুগ্রহ করে যোগাযোগ নম্বর প্রদান করুন');
      return;
    }

    if (claimQty > selectedItemForClaim.quantity) {
      setClaimError(`সর্বোচ্চ উপলব্ধ পরিমাণ: ${selectedItemForClaim.quantity}`);
      return;
    }

    setClaimSubmitting(true);
    setClaimError('');

    try {
      await submitItemClaim({
        itemId: selectedItemForClaim.id,
        itemTitle: selectedItemForClaim.title,
        claimantId: user.uid,
        claimantName: claimName.trim() || user.displayName || 'আবেদনকারী',
        phone: claimPhone.trim(),
        quantity: Number(claimQty) || 1
      });
      setClaimSuccess(true);
    } catch (err: any) {
      setClaimError(err.message || 'দাবি জমা দিতে ত্রুটি হয়েছে');
    } finally {
      setClaimSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.district.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCategoryIcon = (cat: ItemCategory) => {
    switch (cat) {
      case 'food': return <Apple className="w-5 h-5 text-amber-600" />;
      case 'clothes': return <Shirt className="w-5 h-5 text-indigo-600" />;
      case 'books': return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case 'medical_equipment': return <Stethoscope className="w-5 h-5 text-rose-600" />;
      default: return <Package className="w-5 h-5 text-teal-600" />;
    }
  };

  const getConditionBadge = (cond: ItemCondition) => {
    switch (cond) {
      case 'new': return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">নতুন প্যাকেটজাত</span>;
      case 'good_used': return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">ব্যবহারযোগ্য ভালো</span>;
      case 'clean': return <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">পরিষ্কার ধৌত</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs">
            <Package className="w-4 h-4 text-emerald-300" />
            খাদ্য, বস্ত্র ও প্রয়োজনীয় সামগ্রী ব্যাংক
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            অতিরিক্ত সামগ্রী পৌঁছাক অভাবী মানুষের ঘরে
          </h1>
          <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
            আপনার ভালো পোশাক, শুকনো খাবার, শিশুখাদ্য, শিক্ষাসামগ্রী বা অব্যবহৃত হুইলচেয়ার/মেডিকেল সরঞ্জাম অনুদান দিন অথবা প্রকৃত প্রয়োজনে সরাসরি সংগ্রহ আবেদন করুন।
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleOpenOffer}
              className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-teal-50 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              সামগ্রী অনুদান দিতে চাই
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="সামগ্রী বা জেলা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">সকল জেলা</option>
              {BD_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">সামগ্রী তালিকা লোড হচ্ছে...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">বর্তমানে কোনো সামগ্রী পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার কাছে যদি অব্যবহৃত কোনো পোশাক, খাদ্যসামগ্রী বা শিক্ষা উপকরণ থাকে তবে তা অনুদান দিয়ে অন্য কারো মুখে হাসি ফোটান।
          </p>
          <button
            onClick={handleOpenOffer}
            className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
          >
            প্রথম সামগ্রী অনুদান দিন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {getConditionBadge(item.condition)}
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-md">
                      মজুদ: {item.quantity} টি
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-800 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ক্যাটাগরি: {ITEM_CATEGORY_LABELS[item.category] || item.category}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {item.district} {item.upazila ? `(${item.upazila})` : ''}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    দাতার নাম: {item.donorName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenClaim(item)}
                disabled={item.quantity <= 0}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <HandHeart className="w-4 h-4" />
                সংগ্রহ বা বিতরণের জন্য দাবি জানান
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Offer Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">সামগ্রী অনুদান দিন (ফুড ও ক্লথ ব্যাংক)</h3>
              <button onClick={() => setOfferModalOpen(false)} className="text-slate-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {offerSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">সামগ্রী সফলভাবে নথিভুক্ত হয়েছে</h4>
                  <p className="text-xs text-slate-600">
                    মানবতার সেবায় এগিয়ে আসার জন্য ধন্যবাদ! নিকটস্থ ফিল্ড ভলান্টিয়ার অথবা আগ্রহী অভাবী পরিবার আপনার সাথে যোগাযোগ করতে পারবেন।
                  </p>
                  <button
                    onClick={() => setOfferModalOpen(false)}
                    className="mt-3 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
                  >
                    তালিকা দেখুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOffer} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      সামগ্রীর নাম ও সংক্ষিপ্ত পরিচয় *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: শীতের কম্বল, শিশু পুষ্টি খাদ্য বা নবম শ্রেণির বই সেট"
                      value={offerTitle}
                      onChange={(e) => setOfferTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                      <select
                        value={offerCategory}
                        onChange={(e) => setOfferCategory(e.target.value as ItemCategory)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">পরিমাণ (সংখ্যা)</label>
                      <input
                        type="number"
                        min={1}
                        value={offerQuantity}
                        onChange={(e) => setOfferQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">অবস্থা</label>
                      <select
                        value={offerCondition}
                        onChange={(e) => setOfferCondition(e.target.value as ItemCondition)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="new">নতুন প্যাকেটজাত</option>
                        <option value="good_used">ব্যবহারযোগ্য ভালো</option>
                        <option value="clean">পরিষ্কার ধৌত</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">জেলা</label>
                      <select
                        value={offerDistrict}
                        onChange={(e) => setOfferDistrict(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        {BD_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">উপজেলা / এলাকা</label>
                      <input
                        type="text"
                        placeholder="যেমন: মিরপুর / সদর"
                        value={offerUpazila}
                        onChange={(e) => setOfferUpazila(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম</label>
                      <input
                        type="text"
                        value={offerDonorName}
                        onChange={(e) => setOfferDonorName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOfferModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={offerSubmitting}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      {offerSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'তালিকায় যোগ করুন'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {claimModalOpen && selectedItemForClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-teal-100">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">সামগ্রী সংগ্রহের দাবি আবেদন</h3>
              <button onClick={() => setClaimModalOpen(false)} className="text-slate-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {claimSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">দাবি আবেদন জমা হয়েছে</h4>
                  <p className="text-xs text-slate-600">
                    আমাদের ফিল্ড কো-অর্ডিনেটর আপনার প্রদত্ত নম্বরে যোগাযোগ করে সামগ্রী হস্তান্তর সমন্বয় করবেন।
                  </p>
                  <button
                    onClick={() => setClaimModalOpen(false)}
                    className="mt-3 px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl"
                  >
                    ঠিক আছে
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitClaim} className="space-y-4">
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900">
                    <p className="font-bold">{selectedItemForClaim.title}</p>
                    <p className="text-[11px] text-teal-700">উপলব্ধ পরিমাণ: {selectedItemForClaim.quantity} টি | জেলা: {selectedItemForClaim.district}</p>
                  </div>

                  {claimError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{claimError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      গ্রহীতার নাম / আবেদনকারী *
                    </label>
                    <input
                      type="text"
                      required
                      value={claimName}
                      onChange={(e) => setClaimName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      মোবাইল নম্বর (যোগাযোগের জন্য) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      value={claimPhone}
                      onChange={(e) => setClaimPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      প্রয়োজনীয় পরিমাণ (সর্বোচ্চ {selectedItemForClaim.quantity})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedItemForClaim.quantity}
                      value={claimQty}
                      onChange={(e) => setClaimQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setClaimModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={claimSubmitting}
                      className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      {claimSubmitting ? 'জমা হচ্ছে...' : 'দাবি নিশ্চিত করুন'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
