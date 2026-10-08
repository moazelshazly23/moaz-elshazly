import { getAssetUrl } from '../services/api.ts';
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AppItem, AppVersion } from '../types/index.ts';
import X from 'lucide-react/dist/esm/icons/x.js';
import Download from 'lucide-react/dist/esm/icons/download.js';
import Star from 'lucide-react/dist/esm/icons/star.js';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import HardDrive from 'lucide-react/dist/esm/icons/hard-drive.js';
import Calendar from 'lucide-react/dist/esm/icons/calendar.js';
import Share2 from 'lucide-react/dist/esm/icons/share-2.js';
import Check from 'lucide-react/dist/esm/icons/check.js';
import Github from 'lucide-react/dist/esm/icons/github.js';
import Play from 'lucide-react/dist/esm/icons/play.js';
import Layers from 'lucide-react/dist/esm/icons/layers.js';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import History from 'lucide-react/dist/esm/icons/history.js';
import FileCode2 from 'lucide-react/dist/esm/icons/file-code-2.js';

interface AppDetailModalProps {
  app: AppItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadApk: (app: AppItem, version?: AppVersion) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  isOpen,
  onClose,
  onDownloadApk,
}) => {
  const { language, t } = useLanguage();
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'specs'>('overview');

  if (!isOpen || !app) return null;

  const latestVersion = app.versions.find((v) => v.isLatest) || app.versions[0];

  const handleShare = () => {
    const url = window.location.origin + `?app=${app.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Lightbox for screenshots */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={getAssetUrl(selectedScreenshot)}
            alt="Screenshot preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {app.title[language]}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {app.currentVersion}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title={t('shareApp')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? t('linkCopied') : t('shareApp')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-8 flex-1">
          
          {/* App Hero Summary */}
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xl shrink-0">
              <img
                src={getAssetUrl(app.iconUrl || '/logo.svg')}
                alt={app.title[language]}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
                {app.title[language]}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 mb-3">
                {app.packageName}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {app.tagline[language]}
              </p>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/40">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{app.rating.toFixed(1)} / 5.0</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{app.totalDownloads.toLocaleString()} {t('downloads')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{app.minAndroid}</span>
                </span>
              </div>
            </div>

            {/* Prominent Download Button */}
            <div className="w-full sm:w-auto shrink-0 flex flex-col gap-1.5">
              <button
                onClick={() => onDownloadApk(app, latestVersion)}
                className="w-full sm:w-48 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>{t('downloadApk')}</span>
              </button>
              <div className="text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                ⚡ {language === 'ar' ? 'تحميل مباشر فوري (بدون حساب)' : 'Instant direct download (no account)'}
              </div>
              {latestVersion?.apkSize && (
                <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {latestVersion.apkSize} • {latestVersion.versionName}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('features')}
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'versions'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('versionHistory')} ({app.versions.length})
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('specifications')}
            </button>
          </div>

          {/* TAB 1: OVERVIEW & SCREENSHOTS & FEATURES */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Screenshots Gallery */}
              {app.screenshots.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    لقطات من التطبيق (Screenshots)
                  </h4>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                    {app.screenshots.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedScreenshot(img)}
                        className="relative shrink-0 w-44 sm:w-52 h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      >
                        <img
                          src={getAssetUrl(img)}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Changelog Card */}
              {latestVersion?.releaseNotes && (
                <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t('changelog')} ({latestVersion.versionName})</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {latestVersion.releaseNotes[language]}
                  </p>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  عن التطبيق
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                  {app.description[language]}
                </p>
              </div>

              {/* Features List */}
              {app.features[language]?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                    {t('features')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {app.features[language].map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                {app.githubUrl && (
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>{t('githubSource')}</span>
                  </a>
                )}
                {app.playStoreUrl && (
                  <a
                    href={app.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Play className="w-4 h-4 text-emerald-500" />
                    <span>{t('googlePlay')}</span>
                  </a>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ALL VERSIONS HISTORY */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                يمكنك تحميل أي إصدار من الإصدارات السابقة للتطبيق في حال رغبت في الرجوع لنسخة معينة:
              </p>

              {app.versions.map((ver) => (
                <div
                  key={ver.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {ver.versionName}
                      </span>
                      {ver.isLatest && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {t('latestVersion')}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 font-mono">
                        (Build {ver.versionCode})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {ver.releaseNotes[language]}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span>{ver.apkSize}</span>
                      <span>•</span>
                      <span>{new Date(ver.releasedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{ver.downloadsCount.toLocaleString()} {t('downloads')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDownloadApk(app, ver)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل {ver.versionName}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              <div className="flex justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-slate-500 dark:text-slate-400">{t('packageName')}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{app.packageName}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-slate-500 dark:text-slate-400">{t('latestVersion')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{app.currentVersion}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-slate-500 dark:text-slate-400">{t('minAndroid')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{app.minAndroid}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-slate-500 dark:text-slate-400">{t('targetSdk')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{latestVersion?.targetSdk || 'Android 14 (API 34)'}</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-slate-500 dark:text-slate-400">{t('fileSize')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{latestVersion?.apkSize}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-slate-500 dark:text-slate-400">{t('releaseDate')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{new Date(app.updatedAt).toLocaleDateString()}</span>
              </div>
              {latestVersion?.sha256 && (
                <div className="flex flex-col p-4 bg-slate-50/50 dark:bg-slate-800/30 gap-1">
                  <span className="text-slate-500 dark:text-slate-400">{t('sha256Checksum')}</span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 break-all">
                    {latestVersion.sha256}
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
