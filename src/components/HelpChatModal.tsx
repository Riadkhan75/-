import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { 
  getOrCreateConversation, 
  getConversationMessages, 
  sendChatMessage 
} from '../services/firestoreService';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

interface HelpChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  applicantId: string;
  applicantName: string;
  requestTitle: string;
}

export const HelpChatModal: React.FC<HelpChatModalProps> = ({
  isOpen,
  onClose,
  requestId,
  applicantId,
  applicantName,
  requestTitle
}) => {
  const { user, isAdmin } = useAuth();
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !requestId) return;

    let isMounted = true;

    async function initChat() {
      setLoading(true);
      try {
        const convId = await getOrCreateConversation(requestId, applicantId, applicantName, requestTitle);
        if (!isMounted) return;
        setConversationId(convId);
        const msgs = await getConversationMessages(convId);
        if (isMounted) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Failed to init conversation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    // Polling interval for live chat updates every 6 seconds
    const interval = setInterval(async () => {
      if (conversationId) {
        const updated = await getConversationMessages(conversationId);
        if (isMounted) setMessages(updated);
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, requestId, applicantId, applicantName, requestTitle, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRefresh = async () => {
    if (!conversationId) return;
    setLoading(true);
    const msgs = await getConversationMessages(conversationId);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId || !user) return;

    const senderRole = isAdmin ? 'admin' : 'applicant';
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      await sendChatMessage(
        conversationId,
        user.uid,
        user.displayName || (isAdmin ? 'অ্যাডমিন সাপোর্ট' : 'আবেদনকারী'),
        senderRole,
        textToSend
      );
      const updated = await getConversationMessages(conversationId);
      setMessages(updated);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-teal-100 flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold truncate max-w-[240px] sm:max-w-xs">{requestTitle}</h3>
              <p className="text-[11px] text-teal-200">
                {isAdmin ? `আবেদনকারী: ${applicantName}` : 'অ্যাডমিন ও ফিল্ড টিম সাপোর্ট চ্যাট'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              title="রিফ্রেশ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-1.5 shrink-0">
          <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>এই চ্যাটটি শুধুমাত্র সাহায্য আবেদন যাচাই ও যোগাযোগের জন্য সংরক্ষিত।</span>
        </div>

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto grow space-y-3 bg-slate-50/70">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              মেসেজ লোড হচ্ছে...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p>এখনও কোনো বার্তা আদান-প্রদান হয়নি।</p>
              <p className="text-[11px]">নিচে আপনার প্রয়োজনীয় তথ্য লিখে পাঠান।</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = user?.uid === msg.senderId;
              const isSupport = msg.senderRole === 'admin' || msg.senderRole === 'support';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5 px-1">
                    {isSupport ? (
                      <span className="flex items-center gap-0.5 font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded-md">
                        <Shield className="w-2.5 h-2.5 text-teal-700" />
                        {msg.senderName}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-700 flex items-center gap-0.5">
                        <UserIcon className="w-2.5 h-2.5 text-slate-500" />
                        {msg.senderName}
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-br-xs'
                        : isSupport
                        ? 'bg-teal-50 border border-teal-200 text-teal-950 rounded-bl-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="আপনার বার্তা বা প্রশ্ন লিখুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
