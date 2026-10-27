import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  X, 
  User, 
  Calendar, 
  BookHeart,
  AlertCircle
} from 'lucide-react';
import { getPublishedStories, submitPublishedStory } from '../services/firestoreService';
import { PublishedStory } from '../types';
import { useAuth } from '../context/AuthContext';

interface StoriesViewProps {
  onRequireAuth: () => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({ onRequireAuth }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<PublishedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Story Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PublishedStory['category']>('general');
  const [location, setLocation] = useState('ঢাকা');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await getPublishedStories();
      setStories(data);
    } catch (err) {
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleOpenSubmit = () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setSuccess(false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      await submitPublishedStory({
        title: title.trim(),
        category,
        location: location.trim(),
        authorName: authorName.trim() || user.displayName || 'মানবতার বন্ধু',
        excerpt: excerpt.trim() || content.trim().slice(0, 100) + '...',
        content: content.trim()
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'গল্প জমা দেওয়ার সময় ত্রুটি ঘটেছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            ভালো কাজের গল্প ও মানবিক অনুপ্রেরণা
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            মানুষের পাশে মানুষের দাঁড়ানোর সত্য গল্প
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            আপনার বা আপনার চারপাশের কোনো ইতিবাচক উদ্যোগ, রক্তদানের অভিজ্ঞতা বা কাউকে সহযোগিতার গল্প শেয়ার করে অন্যদেরও অনুপ্রাণিত করুন।
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenSubmit}
              className="px-5 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              আপনার গল্প শেয়ার করুন
            </button>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">গল্পসমূহ লোড হচ্ছে...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <BookHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">বর্তমানে কোনো প্রকাশিত গল্প নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            আপনার পরিচিত কোনো মহৎ উদ্যোগের ঘটনা লিখে পাঠিয়ে প্রথম গল্পটি যুক্ত করুন।
          </p>
          <button
            onClick={handleOpenSubmit}
            className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
          >
            প্রথম গল্প লিখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">
                    {story.category === 'medical' ? 'চিকিৎসা সহায়তা' :
                     story.category === 'flood' ? 'ত্রাণ ও উদ্ধার' :
                     story.category === 'blood' ? 'জরুরি রক্তদান' :
                     story.category === 'education' ? 'শিক্ষা সহায়তা' : 'সাধারণ মানবিকতা'}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(story.publishedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {story.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {story.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  {story.authorName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {story.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Story Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">ভালো কাজের মানবিক গল্প শেয়ার করুন</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">গল্প সফলভাবে জমা হয়েছে</h4>
                  <p className="text-xs text-slate-600">
                    ব্যক্তিগত গোপনীয়তা ও সত্যতা নিশ্চিতকরণের পর আমাদের অ্যাডমিন প্যানেল থেকে গল্পটি সরাসরি প্রকাশ করা হবে।
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="mt-3 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      গল্পের শিরোনাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: এক ব্যাগ রক্তের খোঁজে মধ্যরাতের অভিযান..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটাগরি</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="general">সাধারণ মানবিকতা</option>
                        <option value="medical">চিকিৎসা সহায়তা</option>
                        <option value="blood">জরুরি রক্তদান</option>
                        <option value="flood">ত্রাণ ও দুর্যোগ</option>
                        <option value="education">শিক্ষা সহায়তা</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">ঘটনাস্থল / জেলা</label>
                      <input
                        type="text"
                        placeholder="যেমন: নোয়াখালী সদর"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">আপনার নাম / লেখক</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      সম্পূর্ণ গল্প লিখুন *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="ঘটনার ইতিবাচক দিক, কীভাবে সমাধান হলো ও মানুষের আন্তরিকতা সম্পর্কে লিখুন..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-50"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      {submitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
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
