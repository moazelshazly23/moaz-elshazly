import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DeveloperProfile } from '../types/index.ts';
import {
  Search,
  Download,
  Code2,
  Users,
  Award,
  Sparkles,
  Layers,
  ArrowDownCircle,
} from 'lucide-react';

interface HeroProps {
  developer: DeveloperProfile | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  categories: { slug: string; name: { ar: string; en: string }; appCount?: number }[];
  onExploreClick: () => void;
  onRequestProjectClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  developer,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  onExploreClick,
  onRequestProjectClick,
}) => {
  const { language, t } = useLanguage();

  const totalDownloads = developer?.stats.totalDownloads || 124850;
  const totalApps = developer?.stats.totalApps || 5;
  const experienceYears = developer?.experienceYears || 6;
  const happyUsers = developer?.stats.happyUsers || '50K+';

  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-24 right-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badge & Verified Engineer */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm shadow-emerald-500/10">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{t('heroBadge')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">
              {developer?.name[language] || t('brandName')}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.2] sm:leading-[1.15] mb-6">
            <span>{t('heroTitlePrefix')} </span>
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mb-10 leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={onExploreClick}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{t('heroDownloadApk')}</span>
            </button>
            <button
              onClick={onRequestProjectClick}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-semibold text-sm sm:text-base hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Code2 className="w-5 h-5 text-emerald-500" />
              <span>{t('heroContactDev')}</span>
            </button>
          </div>

          {/* Direct Download No-Account Reassurance Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold mb-8 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              {language === 'ar'
                ? '⚡ تحميل مباشر مجاني وسريع لجميع التطبيقات بصيغة APK — بدون الحاجة لإنشاء حساب إطلاقاً!'
                : '⚡ 100% Free & Direct APK Downloads for All Apps — No Registration or Account Needed!'}
            </span>
          </div>

          {/* Search Box */}
          <div className="w-full max-w-2xl relative mb-8">
            <div className="relative flex items-center">
              <Search className="absolute start-4 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full ps-12 pe-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base shadow-lg shadow-slate-200/50 dark:shadow-black/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute end-4 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl">
            <button
              onClick={() => onCategorySelect('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('allCategories')}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onCategorySelect(cat.slug)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <span>{cat.name[language]}</span>
                {typeof cat.appCount === 'number' && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {cat.appCount}
                  </span>
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Engineering Metrics & Stats Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalDownloads.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('statTotalDownloads')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {totalApps}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('statTotalApps')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {happyUsers}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('statHappyUsers')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                +{experienceYears}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('statExperience')}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
