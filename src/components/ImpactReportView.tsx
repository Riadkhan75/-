import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  ShieldCheck, 
  HeartHandshake, 
  FileText, 
  Layers, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  CheckCircle2,
  Receipt,
  Building2,
  Users
} from 'lucide-react';
import { 
  getReliefDistributions, 
  getCampaigns, 
  getPublicHelpRequests,
  getPartnerOrganizations 
} from '../services/firestoreService';
import { ReliefDistribution, Campaign, HelpRequest, PartnerOrganization } from '../types';

export const ImpactReportView: React.FC = () => {
  const [reliefList, setReliefList] = useState<ReliefDistribution[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [publicRequests, setPublicRequests] = useState<HelpRequest[]>([]);
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [reliefData, campData, reqData, partData] = await Promise.all([
          getReliefDistributions(),
          getCampaigns(),
          getPublicHelpRequests(),
          getPartnerOrganizations()
        ]);
        setReliefList(reliefData);
        setCampaigns(campData);
        setPublicRequests(reqData);
        setPartners(partData);
      } catch (err) {
        console.error('Error fetching impact data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute actual numbers from live DB data (Zero fake numbers!)
  const totalCampaigns = campaigns.length;
  const totalFundsCollected = campaigns.reduce((acc, c) => acc + (Number(c.collectedAmount) || 0), 0);
  const totalDonorsCount = campaigns.reduce((acc, c) => acc + (Number(c.donorCount) || 0), 0);
  const completedHelpCount = publicRequests.filter(r => r.status === 'completed').length;
  const totalReliefItemsDistributed = reliefList.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (reliefList.length === 0) {
      alert('বর্তমানে এক্সপোর্ট করার মতো কোনো ত্রাণ বিতরণের রেকর্ড নেই।');
      return;
    }

    const headers = ['আইডি', 'সামগ্রীর নাম/খাত', 'পরিমাণ', 'জেলা', 'বিতরণ স্থান', 'দায়িত্বপ্রাপ্ত ফিল্ড অফিসার', 'তারিখ'];
    const rows = reliefList.map(r => [
      `"${r.id}"`,
      `"${r.itemType}"`,
      r.quantity,
      `"${r.district}"`,
      `"${r.location}"`,
      `"${r.handlerName}"`,
      `"${r.date}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `manobotar_sheba_relief_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            স্বচ্ছতা, জবাবদিহিতা ও প্রকাশ্য রিপোর্ট
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            বাস্তব প্রভাব ও অডিট ড্যাশবোর্ড
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            মানবতার সেবা বিশ্বাস করে প্রতিটি পয়সা ও প্রতিটি ত্রাণসামগ্রীর হিসাব জনগণের সামনে উন্মুক্ত থাকা উচিত। এখানে কোনো কৃত্রিম তথ্য নেই—সব পরিসংখ্যান সরাসরি ডেটাবেজ থেকে সংগৃহীত।
          </p>
          <div className="pt-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              ত্রাণ বিতরণ ডাটা CSV ডাউনলোড
            </button>
          </div>
        </div>
      </div>

      {/* Live Impact Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
            <Receipt className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">সংগৃহীত অনুদান (মোট)</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalFundsCollected.toLocaleString('bn-BD')} ৳
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">যাচাইকৃত ব্যাংক ও মোবাইল ব্যাংকিং</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">মোট অনুদানকারী</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalDonorsCount.toLocaleString('bn-BD')} জন
          </p>
          <p className="text-[11px] text-blue-700 font-medium">সক্রিয় মানবিক সহযাত্রী</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">বিতরণকৃত ত্রাণসামগ্রী</p>
          <p className="text-2xl font-bold text-slate-900">
            {totalReliefItemsDistributed.toLocaleString('bn-BD')} ইউনিট
          </p>
          <p className="text-[11px] text-purple-700 font-medium">খাদ্য, বস্ত্র ও ওষুধ প্যাকেট</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">সম্পন্ন সাহায্য ও চিকিৎসা</p>
          <p className="text-2xl font-bold text-slate-900">
            {completedHelpCount.toLocaleString('bn-BD')} টি
          </p>
          <p className="text-[11px] text-amber-700 font-medium">সফল পুনর্বাসন ও সেবা</p>
        </div>

      </div>

      {/* Relief Distribution Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              ত্রাণ সামগ্রী বিতরণ রেজিস্টার ও ফিল্ড লগ
            </h3>
            <p className="text-xs text-slate-500">প্রতিটি বিতরণের স্থান, দায়িত্বপ্রাপ্ত কর্মী ও তারিখ</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV এক্সপোর্ট
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">তথ্য লোড হচ্ছে...</div>
        ) : reliefList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p>বর্তমানে কোনো ফিল্ড ত্রাণ বিতরণের রেকর্ড এন্ট্রি নেই।</p>
            <p className="text-slate-400">নতুন বিতরণ সম্পন্ন হলে সুপার অ্যাডমিন প্যানেল থেকে এখানে যুক্ত করা হবে।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">সামগ্রীর বিবরণ</th>
                  <th className="py-3 px-4">পরিমাণ</th>
                  <th className="py-3 px-4">জেলা ও স্থান</th>
                  <th className="py-3 px-4">ফিল্ড কর্মকর্তা</th>
                  <th className="py-3 px-4">তারিখ</th>
                  <th className="py-3 px-4">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reliefList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.itemType}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{item.quantity} টি</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-900">{item.district}</span> ({item.location})
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.handlerName}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{item.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Partner Organizations Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">অনুমোদিত অংশীদার ও সহযোগী সংগঠনসমূহ</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          স্থানীয় পর্যায়ের নিবন্ধিত দাতব্য সংস্থা ও স্বেচ্ছাসেবী ক্লাবের সাথে যৌথভাবে সমন্বয় করে আমাদের ত্রাণ কার্যক্রম পরিচালনা করা হয়।
        </p>

        {partners.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
            বর্তমানে অনুমোদিত অংশীদার সংস্থার তালিকা হালনাগাদ করা হচ্ছে। আপনার সংগঠন অংশীদার হতে চাইলে অ্যাডমিনের সাথে যোগাযোগ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {partners.map((org) => (
              <div key={org.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-bold text-xs text-slate-900">{org.name}</h4>
                <p className="text-[11px] text-teal-800 font-medium">কার্যক্ষেত্র: {org.focusArea}</p>
                <p className="text-[11px] text-slate-500">জেলা: {org.district} | রেজি: {org.registrationNo}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Audit Policy Card */}
      <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 space-y-2">
        <h4 className="text-sm font-bold text-teal-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-700" />
          আমাদের উন্মুক্ত অডিট নীতি
        </h4>
        <p className="text-xs text-teal-800 leading-relaxed">
          প্রতি মাসের ১০ তারিখের মধ্যে পূর্ববর্তী মাসের ব্যাংক স্টেটমেন্ট, মোবাইল ব্যাংকিং হিস্ট্রি এবং ভাউচার মিলিয়ে অভ্যন্তরীণ অডিট রিপোর্ট প্রস্তুত করা হয়। কোনো নাগরিক বা অনুদানকারী চাইলে যেকোনো খরচের ভাউচার সরাসরি পর্যবেক্ষণের আবেদন করতে পারেন।
        </p>
      </div>

    </div>
  );
};
