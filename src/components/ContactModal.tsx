import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import X from 'lucide-react/dist/esm/icons/x.js';
import Send from 'lucide-react/dist/esm/icons/send.js';
import CheckCircle2 from 'lucide-react/dist/esm/icons/circle-check.js';
import Mail from 'lucide-react/dist/esm/icons/mail.js';
import User from 'lucide-react/dist/esm/icons/user.js';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square.js';
import HelpCircle from 'lucide-react/dist/esm/icons/circle-question-mark.js';
import Loader2 from 'lucide-react/dist/esm/icons/loader-circle.js';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [kind, setKind] = useState<'contact' | 'edit' | 'app'>('contact');
  const [suggestedApp, setSuggestedApp] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kind === 'contact' && (!name || !email || !message)) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      if (kind === 'contact') {
        await api.sendMessage({ name, email, subject, message });
      } else if (kind === 'edit') {
        await api.submitSuggestion({ type: 'edit', name, email, app: suggestedApp, suggestion, details: message, honeypot: '' });
      } else {
        await api.submitSuggestion({ type: 'app', name, email, appName: subject, appUrl, category, description: message, officialWebsite, honeypot: '' });
      }
      setIsSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>{kind === 'contact' ? 'طلب استشارة أو مشروع' : kind === 'edit' ? 'اقتراح تعديل' : 'اقتراح تطبيق'}</span>
          </div>
          <div className="flex gap-2 mb-4 pe-8">
            <button type="button" onClick={() => setKind('contact')} className={`px-3 py-2 rounded-lg text-xs font-bold ${kind === 'contact' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>تواصل</button>
            <button type="button" onClick={() => setKind('edit')} className={`px-3 py-2 rounded-lg text-xs font-bold ${kind === 'edit' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>اقتراح تعديل</button>
            <button type="button" onClick={() => setKind('app')} className={`px-3 py-2 rounded-lg text-xs font-bold ${kind === 'app' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>اقتراح تطبيق</button>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {kind === 'contact' ? t('contactTitle') : kind === 'edit' ? 'اقتراح تعديل تطبيق' : 'اقتراح تطبيق جديد'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {kind === 'contact' ? t('contactSubtitle') : 'شاركنا اقتراحك، وسيراجعه فريق الإدارة.'}
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('messageSentSuccess')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سيقوم المهندس معاذ بمراجعة استفسارك والتواصل معك عبر البريد الإلكتروني.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('yourName')} {kind === 'contact' && '*'}
              </label>
              <div className="relative">
                <User className="absolute start-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required={kind === 'contact'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: م. كريم أحمد"
                  className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('yourEmail')} {kind === 'contact' && '*'}
              </label>
              <div className="relative">
                <Mail className="absolute start-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required={kind === 'contact'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {kind !== 'edit' && <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {kind === 'app' ? 'اسم التطبيق *' : t('subject')}
              </label>
              <div className="relative">
                <HelpCircle className="absolute start-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input type="text" required={kind === 'app'} maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="مثال: تطبيق لإدارة المهام" className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>}
            {kind === 'edit' && <div className="space-y-3"><input required maxLength={160} value={suggestedApp} onChange={(e) => setSuggestedApp(e.target.value)} placeholder="اسم التطبيق المقصود *" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" /><textarea required maxLength={2000} rows={2} value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="اقتراح التعديل *" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" /></div>}
            {kind === 'app' && <div className="grid sm:grid-cols-2 gap-3"><input type="url" maxLength={2048} value={appUrl} onChange={(e) => setAppUrl(e.target.value)} placeholder="رابط التطبيق أو صفحة المعلومات" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" /><input type="url" maxLength={2048} value={officialWebsite} onChange={(e) => setOfficialWebsite(e.target.value)} placeholder="الموقع الرسمي (اختياري)" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" /><input maxLength={100} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="التصنيف" className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800" /></div>}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {kind === 'contact' ? t('yourMessage') : kind === 'edit' ? 'تفاصيل إضافية' : 'وصف التطبيق'} {kind === 'contact' && '*'}
              </label>
              <div className="relative">
                <MessageSquare className="absolute start-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <textarea
                  required={kind === 'contact' || kind === 'app'}
                  maxLength={kind === 'app' ? 3000 : 5000}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اشرح فكرة التطبيق، المتطلبات الرئيسية، أو استفسارك..."
                  className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t('sendMessage')}</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
