import { getAssetUrl } from '../services/api.ts';
import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { AppItem } from '../types/index.ts';
import Download from 'lucide-react/dist/esm/icons/download.js';
import Star from 'lucide-react/dist/esm/icons/star.js';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import HardDrive from 'lucide-react/dist/esm/icons/hard-drive.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';

interface AppCardProps {
  app: AppItem;
  onSelectApp: (app: AppItem) => void;
  onQuickDownload: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onSelectApp,
  onQuickDownload,
}) => {
  const { language, t } = useLanguage();
  const latestVersion = app.versions.find((v) => v.isLatest) || app.versions[0];

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-md shadow-slate-100 dark:shadow-black/20 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 p-6">
      
      {/* Featured Badge */}
      {app.isFeatured && (
        <div className="absolute top-4 end-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>مميز</span>
        </div>
      )}

      <div>
        {/* App Header (Icon, Title, Package) */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-200/50 dark:shadow-black/30 group-hover:scale-105 transition-transform duration-300">
            <img
              src={getAssetUrl(app.iconUrl || '/logo.svg')}
              alt={app.title[language]}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="flex-1 min-w-0 pe-6">
            <h3
              onClick={() => onSelectApp(app)}
              className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate cursor-pointer"
            >
              {app.title[language]}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mb-2">
              {app.packageName}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{app.rating.toFixed(1)}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {app.totalDownloads.toLocaleString()} {t('downloads')}
              </span>
            </div>
          </div>
        </div>

        {/* Tagline / Brief Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
          {app.tagline[language]}
        </p>

        {/* Badges / Specs Pill Row */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{app.currentVersion}</span>
          </span>

          {latestVersion?.apkSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
              <HardDrive className="w-3 h-3 text-slate-400" />
              <span>{latestVersion.apkSize}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium">
            <Smartphone className="w-3 h-3 text-slate-400" />
            <span>{app.minAndroid}</span>
          </span>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onQuickDownload(app)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{t('downloadApk')}</span>
        </button>
        <button
          onClick={() => onSelectApp(app)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title={t('viewDetails')}
          aria-label={t('viewDetails')}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
