import React, { Suspense, useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { AppCard } from './components/AppCard.tsx';
import { DownloadModal } from './components/DownloadModal.tsx';
import { AppDetailModal } from './components/AppDetailModal.tsx';
import { DeveloperSection } from './components/DeveloperSection.tsx';
import { ContactModal } from './components/ContactModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';

import { Footer } from './components/Footer.tsx';
import { api } from './services/api.ts';
import {
  AppItem,
  AppVersion,
  CategoryItem,
  DeveloperProfile,
  SiteSettings,
} from './types/index.ts';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import Layers from 'lucide-react/dist/esm/icons/layers.js';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import Loader2 from 'lucide-react/dist/esm/icons/loader-circle.js';
import AlertCircle from 'lucide-react/dist/esm/icons/circle-alert.js';

const AdminDashboard = React.lazy(() => import('./components/AdminDashboard.tsx').then((module) => ({ default: module.AdminDashboard })));

function MainApp() {
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Data States
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'rating'>('newest');

  // Modals
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<AppItem | null>(null);
  const [selectedAppForDownload, setSelectedAppForDownload] = useState<AppItem | null>(null);
  const [selectedVersionForDownload, setSelectedVersionForDownload] = useState<AppVersion | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Initial Load
  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, catsData, devData, settsData] = await Promise.all([
        api.getApps({ sort: sortBy }),
        api.getCategories(),
        api.getDeveloper(),
        api.getSettings(),
      ]);
      setLoadError(null);
      setApps(appsData);
      setCategories(catsData);
      setDeveloper(devData);
      if (settsData) setSiteSettings(settsData);
    } catch (err) {
      console.error('Failed to load platform data:', err);
      setLoadError(err instanceof Error ? err.message : 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortBy]);

  // Handle URL deep link e.g. ?app=zad-al-muslim-quran
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appSlug = params.get('app');
    if (appSlug && apps.length > 0) {
      const match = apps.find((a) => a.slug === appSlug || a.id === appSlug);
      if (match) {
        setSelectedAppForDetail(match);
      }
    }
  }, [apps]);

  const handleOpenAdmin = () => {
    if (isAuthenticated) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickDownload = (app: AppItem, version?: AppVersion) => {
    setSelectedAppForDownload(app);
    setSelectedVersionForDownload(version || null);
  };

  // Filtered Apps
  const filteredApps = apps.filter((app) => {
    if (selectedCategory !== 'all' && app.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle =
        app.title.ar.toLowerCase().includes(q) ||
        app.title.en.toLowerCase().includes(q) ||
        app.tagline.ar.toLowerCase().includes(q) ||
        app.tagline.en.toLowerCase().includes(q) ||
        app.packageName.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle) return false;
    }
    return true;
  });

  if (loadError && !loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-slate-950 text-white p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <section className="max-w-md text-center rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">تعذر الاتصال بالخادم</h1>
          <p className="text-sm text-slate-300 mb-6">تحقق من اتصال الإنترنت ثم أعد المحاولة. لم يتم تحميل بيانات قديمة.</p>
          <button onClick={loadData} className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold">إعادة المحاولة</button>
        </section>
      </main>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Header */}
      <Header
        onOpenAdmin={handleOpenAdmin}
        onOpenContact={() => setIsContactOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onScrollToSection={scrollToSection}
        customLogoUrl={siteSettings?.siteLogoUrl}
      />

      <main className="flex-1">
        
        {/* Hero Section */}
        <Hero
          developer={developer}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          categories={categories}
          onExploreClick={() => scrollToSection('apps')}
          onRequestProjectClick={() => setIsContactOpen(true)}
        />

        {/* Categories Section */}
        <section id="categories" className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {t('navCategories')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  تصفح تطبيقات أندرويد حسب المجال والاهتمام
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <div
                onClick={() => {
                  setSelectedCategory('all');
                  scrollToSection('apps');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Layers className="w-5 h-5" />
                  <span className="text-xs font-bold opacity-80">{apps.length}</span>
                </div>
                <div className="font-extrabold text-sm sm:text-base">
                  {t('allCategories')}
                </div>
              </div>

              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    scrollToSection('apps');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs font-bold opacity-80">{cat.appCount || 0}</span>
                  </div>
                  <div className="font-extrabold text-sm sm:text-base truncate">
                    {cat.name[language]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Applications Catalog Grid */}
        <section id="apps" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Smartphone className="w-7 h-7 text-emerald-500" />
                  <span>تطبيقات أندرويد المنشورة</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  جميع التطبيقات أصلية 100%، خالية من الإعلانات المزعجة وتدعم التثبيت المباشر
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>ترتيب:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="newest">الأحدث تحديثاً</option>
                  <option value="downloads">الأكثر تحميلاً</option>
                  <option value="rating">الأعلى تقييماً</option>
                </select>
              </div>
            </div>

            {/* Apps Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
                <span className="text-sm">جاري تحميل التطبيقات...</span>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t('noAppsFound')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  جرب البحث بكلمات أخرى أو اختر تصنيفاً مختلفاً.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onSelectApp={(a) => setSelectedAppForDetail(a)}
                    onQuickDownload={(a) => handleQuickDownload(a)}
                  />
                ))}
              </div>
            )}

          </div>
        </section>

        {/* Developer Portfolio Section */}
        <DeveloperSection
          developer={developer}
          onOpenContact={() => setIsContactOpen(true)}
        />

      </main>

      {/* Footer */}
      <Footer
        developer={developer}
        onScrollToSection={scrollToSection}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        customLogoUrl={siteSettings?.siteLogoUrl}
      />

      {/* MODALS */}

      {/* APK Download Modal */}
      <DownloadModal
        app={selectedAppForDownload}
        selectedVersion={selectedVersionForDownload}
        isOpen={Boolean(selectedAppForDownload)}
        onClose={() => {
          setSelectedAppForDownload(null);
          setSelectedVersionForDownload(null);
        }}
        onDownloadCompleted={() => {
          // Increment locally or refetch
          loadData();
        }}
      />

      {/* App Details Modal */}
      <AppDetailModal
        app={selectedAppForDetail}
        isOpen={Boolean(selectedAppForDetail)}
        onClose={() => setSelectedAppForDetail(null)}
        onDownloadApk={(app, ver) => {
          setSelectedAppForDetail(null);
          handleQuickDownload(app, ver);
        }}
      />

      {/* Contact Inquiry Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Central Admin Dashboard */}
      <Suspense fallback={<div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 text-emerald-400">جاري تحميل لوحة التحكم...</div>}>
        <AdminDashboard
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          onRefreshData={loadData}
        />
      </Suspense>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
