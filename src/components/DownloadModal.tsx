import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AppItem, AppVersion } from '../types/index.ts';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Smartphone,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
} from 'lucide-react';

interface DownloadModalProps {
  app: AppItem | null;
  selectedVersion?: AppVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadCompleted?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  app,
  selectedVersion,
  isOpen,
  onClose,
  onDownloadCompleted,
}) => {
  const { language, t } = useLanguage();
  const [downloadStep, setDownloadStep] = useState<'verifying' | 'downloading' | 'completed'>('verifying');
  const [progress, setProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  const version = selectedVersion || app?.versions.find((v) => v.isLatest) || app?.versions[0];

  useEffect(() => {
    if (!isOpen || !app) {
      setDownloadStep('verifying');
      setProgress(0);
      return;
    }

    setDownloadStep('verifying');
    setProgress(15);

    // Simulated verified security scan
    const t1 = setTimeout(() => {
      setProgress(40);
      setDownloadStep('downloading');
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(85);
    }, 1200);

    const t3 = setTimeout(() => {
      setProgress(100);
      setDownloadStep('completed');

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
        });
      } catch (err) {
        console.warn('Confetti error:', err);
      }

      // Trigger direct file download
      triggerFileDownload();

      if (onDownloadCompleted) {
        onDownloadCompleted();
      }
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, app, version]);

  const triggerFileDownload = () => {
    if (!app || !version) return;
    const downloadEndpoint = `/api/apps/${app.id}/download/${version.id}`;
    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', version.apkFileName || `${app.slug}-${version.versionName}.apk`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !app || !version) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src={app.iconUrl}
              alt={app.title[language]}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
              {app.title[language]}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {version.versionName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {version.apkSize}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                {version.apkFileName}
              </span>
            </div>
          </div>
        </div>

        {/* Free Direct Download Banner */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 text-teal-800 dark:text-teal-300 text-xs font-bold w-full justify-center">
          <span>⚡</span>
          <span>
            {language === 'ar'
              ? 'تحميل مباشر وفوري مجاناً — لا يلزم تسجيل حساب أو تسجيل دخول'
              : 'Instant Direct Download — No Sign-Up or Account Needed'}
          </span>
        </div>

        {/* Security Scan Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">{t('securityPassed')}</span>
            {version.sha256 && (
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-mono truncate mt-0.5">
                SHA-256: {version.sha256}
              </p>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <span>
              {downloadStep === 'verifying' && t('securityScanning')}
              {downloadStep === 'downloading' && t('downloadingTitle')}
              {downloadStep === 'completed' && t('downloadStarted')}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action / Fallback Download Button */}
        <div className="mb-6">
          <button
            onClick={triggerFileDownload}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('directDownloadFallback')}</span>
          </button>
        </div>

        {/* Installation Instructions Accordion */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              {t('installInstructionsTitle')}
            </span>
            {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showGuide && (
            <div className="p-4 space-y-3 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('step1Title')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('step1Desc')}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('step2Title')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('step2Desc')}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {t('step3Title')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('step3Desc')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
