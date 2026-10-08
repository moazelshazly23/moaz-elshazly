import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api, getAssetUrl } from '../services/api.ts';
import {
  AppItem,
  AppVersion,
  CategoryItem,
  AnalyticsData,
  ContactMessage,
  DeveloperProfile,
  SuggestionItem,
} from '../types/index.ts';
import { DashboardWidget } from './DashboardWidget.tsx';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import X from 'lucide-react/dist/esm/icons/x.js';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.js';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import Upload from 'lucide-react/dist/esm/icons/upload.js';
import Plus from 'lucide-react/dist/esm/icons/plus.js';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.js';
import Edit from 'lucide-react/dist/esm/icons/square-pen.js';
import Layers from 'lucide-react/dist/esm/icons/layers.js';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square.js';
import Settings from 'lucide-react/dist/esm/icons/settings.js';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.js';
import Download from 'lucide-react/dist/esm/icons/download.js';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js';
import Star from 'lucide-react/dist/esm/icons/star.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import CheckCircle2 from 'lucide-react/dist/esm/icons/circle-check.js';
import FileCode from 'lucide-react/dist/esm/icons/file-code.js';
import ImageIcon from 'lucide-react/dist/esm/icons/image.js';
import Loader2 from 'lucide-react/dist/esm/icons/loader-circle.js';
import Check from 'lucide-react/dist/esm/icons/check.js';
import User from 'lucide-react/dist/esm/icons/user.js';
import FolderPlus from 'lucide-react/dist/esm/icons/folder-plus.js';
import Globe from 'lucide-react/dist/esm/icons/globe.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import PlusCircle from 'lucide-react/dist/esm/icons/circle-plus.js';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase.js';
import Sliders from 'lucide-react/dist/esm/icons/sliders-vertical.js';
import UserCheck from 'lucide-react/dist/esm/icons/user-check.js';
import Code from 'lucide-react/dist/esm/icons/code.js';
import Share2 from 'lucide-react/dist/esm/icons/share-2.js';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const { language, t } = useLanguage();
  const { admin, updateAdminUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'new-app' | 'new-version' | 'categories' | 'developer' | 'messages' | 'suggestions' | 'settings'>('overview');
  
  // Data States
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Forms State
  const [selectedAppForEdit, setSelectedAppForEdit] = useState<AppItem | null>(null);
  const [selectedAppForNewVersion, setSelectedAppForNewVersion] = useState<string>('');

  // Toast Notification State (replaces window.alert)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Confirmation Modal State (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // Site Settings & Logo State
  const [siteLogoUrl, setSiteLogoUrl] = useState('/logo.svg');
  const [siteTitleAr, setSiteTitleAr] = useState('المهندس معاذ الشاذلي');
  const [siteTitleEn, setSiteTitleEn] = useState('Eng. Moaz El Shazly');
  const [siteTaglineAr, setSiteTaglineAr] = useState('المنصة الرسمية لتطبيقات أندرويد');
  const [siteTaglineEn, setSiteTaglineEn] = useState('Android Applications Showcase & APK Hub');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // New Version Form State
  const [newVersionName, setNewVersionName] = useState('v1.0.1');
  const [newVersionCode, setNewVersionCode] = useState('2');
  const [newVersionApkUrl, setNewVersionApkUrl] = useState('');
  const [newVersionApkFileName, setNewVersionApkFileName] = useState('');
  const [newVersionApkSize, setNewVersionApkSize] = useState('');
  const [newVersionSha256, setNewVersionSha256] = useState('');
  const [newVersionNotesAr, setNewVersionNotesAr] = useState('');
  const [newVersionNotesEn, setNewVersionNotesEn] = useState('');
  const [isUploadingApk, setIsUploadingApk] = useState(false);

  // New App Form State
  const [appFormTitleAr, setAppFormTitleAr] = useState('');
  const [appFormTitleEn, setAppFormTitleEn] = useState('');
  const [appFormTaglineAr, setAppFormTaglineAr] = useState('');
  const [appFormTaglineEn, setAppFormTaglineEn] = useState('');
  const [appFormDescAr, setAppFormDescAr] = useState('');
  const [appFormDescEn, setAppFormDescEn] = useState('');
  const [appFormCategory, setAppFormCategory] = useState('utilities');
  const [appFormPackage, setAppFormPackage] = useState('com.moaz.myapp');
  const [appFormIconUrl, setAppFormIconUrl] = useState('');
  const [appFormScreenshots, setAppFormScreenshots] = useState<string[]>([]);
  const [appFormMinAndroid, setAppFormMinAndroid] = useState('Android 8.0 (API 26)');
  const [appFormIsFeatured, setAppFormIsFeatured] = useState(false);
  const [appFormStatus, setAppFormStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [appFormFeaturesAr, setAppFormFeaturesAr] = useState('');
  const [appFormFeaturesEn, setAppFormFeaturesEn] = useState('');
  // Direct APK upload during new app creation:
  const [appFormApkUrl, setAppFormApkUrl] = useState('');
  const [appFormApkFileName, setAppFormApkFileName] = useState('');
  const [appFormApkSize, setAppFormApkSize] = useState('');
  const [appFormApkSha256, setAppFormApkSha256] = useState('');
  const [appFormVersionName, setAppFormVersionName] = useState('v1.0.0');
  const [appFormVersionCode, setAppFormVersionCode] = useState('1');
  const [isUploadingAppApk, setIsUploadingAppApk] = useState(false);

  // Categories Manager State
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('Folder');
  const [catDescAr, setCatDescAr] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<CategoryItem | null>(null);

  // Developer Profile Manager State
  const [devNameAr, setDevNameAr] = useState('');
  const [devNameEn, setDevNameEn] = useState('');
  const [devTitleAr, setDevTitleAr] = useState('');
  const [devTitleEn, setDevTitleEn] = useState('');
  const [devBioAr, setDevBioAr] = useState('');
  const [devBioEn, setDevBioEn] = useState('');
  const [devLocationAr, setDevLocationAr] = useState('');
  const [devLocationEn, setDevLocationEn] = useState('');
  const [devEmail, setDevEmail] = useState('');
  const [devPhone, setDevPhone] = useState('');
  const [devWhatsapp, setDevWhatsapp] = useState('');
  const [devAvatarUrl, setDevAvatarUrl] = useState('');
  const [devExpYears, setDevExpYears] = useState(6);
  const [devGithub, setDevGithub] = useState('');
  const [devLinkedin, setDevLinkedin] = useState('');
  const [devGooglePlay, setDevGooglePlay] = useState('');
  const [devTwitter, setDevTwitter] = useState('');
  const [devSkills, setDevSkills] = useState<{ name: string; level: number; category: 'core' | 'framework' | 'tools' }[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(90);

  // Admin Account & Password State
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [adminEmail, setAdminEmail] = useState(admin?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, appsData, catsData, msgsData, devData, settsData, suggestionsData] = await Promise.all([
        api.getAnalytics(),
        api.getApps({ sort: 'downloads' }),
        api.getCategories(),
        api.getMessages(),
        api.getDeveloper(),
        api.getSettings().catch(() => null),
        api.getSuggestions(),
      ]);
      setAnalytics(analyticsData);
      setApps(appsData);
      setCategories(catsData);
      setMessages(msgsData);
      setSuggestions(suggestionsData);
      setDeveloper(devData);

      if (settsData) {
        setSiteLogoUrl(settsData.siteLogoUrl || '/logo.svg');
        setSiteTitleAr(settsData.siteTitleAr || '');
        setSiteTitleEn(settsData.siteTitleEn || '');
        setSiteTaglineAr(settsData.taglineAr || '');
        setSiteTaglineEn(settsData.taglineEn || '');
      }

      if (devData) {
        setDevNameAr(devData.name.ar);
        setDevNameEn(devData.name.en);
        setDevTitleAr(devData.title.ar);
        setDevTitleEn(devData.title.en);
        setDevBioAr(devData.bio.ar);
        setDevBioEn(devData.bio.en);
        setDevLocationAr(devData.location.ar);
        setDevLocationEn(devData.location.en);
        setDevEmail(devData.email);
        setDevPhone(devData.phone);
        setDevWhatsapp(devData.social.whatsapp || '');
        setDevAvatarUrl(devData.avatarUrl);
        setDevExpYears(devData.experienceYears);
        setDevGithub(devData.social.github);
        setDevLinkedin(devData.social.linkedin);
        setDevGooglePlay(devData.social.googlePlay);
        setDevTwitter(devData.social.twitter);
        setDevSkills(devData.skills || []);
      }

      if (admin) {
        setAdminName(admin.name);
        setAdminEmail(admin.email);
      }

      if (appsData.length > 0 && !selectedAppForNewVersion) {
        setSelectedAppForNewVersion(appsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('فشل تحميل بعض بيانات لوحة التحكم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers for File Uploads
  const handleApkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingApk(true);
      const uploaded = await api.uploadApk(file);
      setNewVersionApkUrl(uploaded.apkUrl);
      setNewVersionApkFileName(uploaded.apkFileName);
      setNewVersionApkSize(uploaded.apkSize);
      setNewVersionSha256(uploaded.sha256);
      showToast(`تم رفع ملف APK بنجاح: ${uploaded.apkFileName} (${uploaded.apkSize})`);
    } catch (err: any) {
      showToast(err.message || 'فشل رفع ملف APK', 'error');
    } finally {
      setIsUploadingApk(false);
    }
  };

  const handleAppApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAppApk(true);
      const uploaded = await api.uploadApk(file);
      setAppFormApkUrl(uploaded.apkUrl);
      setAppFormApkFileName(uploaded.apkFileName);
      setAppFormApkSize(uploaded.apkSize);
      setAppFormApkSha256(uploaded.sha256);
      showToast(`تم رفع ملف APK للتطبيق: ${uploaded.apkFileName} (${uploaded.apkSize})`);
    } catch (err: any) {
      showToast(err.message || 'فشل رفع ملف APK', 'error');
    } finally {
      setIsUploadingAppApk(false);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadImage(file);
      setAppFormIconUrl(res.imageUrl);
      showToast('تم رفع أيقونة التطبيق بنجاح!');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الأيقونة', 'error');
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const res = await api.uploadImage(files[i]);
        setAppFormScreenshots((prev) => [...prev, res.imageUrl]);
      }
      showToast(`تم رفع ${files.length} صورة بنجاح!`);
    } catch (err: any) {
      showToast(err.message || 'فشل رفع لقطة الشاشة', 'error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const res = await api.uploadImage(file);
      setSiteLogoUrl(res.imageUrl);
      showToast('تم رفع شعار الموقع بنجاح!');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الشعار', 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSettingsError('');
      setSettingsSuccess('');
      await api.updateSettings({
        siteLogoUrl,
        siteTitleAr,
        siteTitleEn,
        taglineAr: siteTaglineAr,
        taglineEn: siteTaglineEn,
      });
      setSettingsSuccess('تم حفظ إعدادات وشعار الموقع بنجاح!');
      showToast('تم حفظ إعدادات وشعار الموقع بنجاح!');
      onRefreshData();
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err: any) {
      setSettingsError(err.message || 'فشل حفظ إعدادات الموقع');
      showToast(err.message || 'فشل حفظ إعدادات الموقع', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit New Version
  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForNewVersion || !newVersionName || !newVersionApkUrl) {
      showToast('يرجى تحديد التطبيق وإدخال اسم الإصدار ورفع ملف APK', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.addVersion(selectedAppForNewVersion, {
        versionName: newVersionName,
        versionCode: Number(newVersionCode) || 1,
        apkUrl: newVersionApkUrl,
        apkFileName: newVersionApkFileName,
        apkSize: newVersionApkSize || '15 MB',
        sha256: newVersionSha256,
        releaseNotes: {
          ar: newVersionNotesAr || 'تحديث دوري وإصلاحات عامة',
          en: newVersionNotesEn || 'Regular update & stability fixes',
        },
      });

      showToast('تم رفع ونشر الإصدار الجديد بنجاح!');
      setNewVersionApkUrl('');
      setNewVersionNotesAr('');
      setNewVersionNotesEn('');
      await fetchDashboardData();
      onRefreshData();
      setActiveTab('apps');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الإصدار', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit New App or Update App
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFormTitleAr || !appFormTitleEn) {
      showToast('يرجى إدخال عنوان التطبيق بالعربية والإنجليزية', 'error');
      return;
    }

    const featuresArList = appFormFeaturesAr.split('\n').filter((f) => f.trim().length > 0);
    const featuresEnList = appFormFeaturesEn.split('\n').filter((f) => f.trim().length > 0);

    try {
      setLoading(true);
      if (selectedAppForEdit) {
        // Update App
        await api.updateApp(selectedAppForEdit.id, {
          title: { ar: appFormTitleAr, en: appFormTitleEn },
          tagline: { ar: appFormTaglineAr, en: appFormTaglineEn },
          description: { ar: appFormDescAr, en: appFormDescEn },
          category: appFormCategory,
          packageName: appFormPackage,
          iconUrl: appFormIconUrl,
          screenshots: appFormScreenshots,
          minAndroid: appFormMinAndroid,
          isFeatured: appFormIsFeatured,
          status: appFormStatus,
          features: { ar: featuresArList, en: featuresEnList },
        });
        showToast('تم تعديل التطبيق بنجاح');
      } else {
        // Create App
        await api.createApp({
          title: { ar: appFormTitleAr, en: appFormTitleEn },
          tagline: { ar: appFormTaglineAr, en: appFormTaglineEn },
          description: { ar: appFormDescAr, en: appFormDescEn },
          category: appFormCategory,
          packageName: appFormPackage,
          iconUrl: appFormIconUrl,
          screenshots: appFormScreenshots,
          minAndroid: appFormMinAndroid,
          isFeatured: appFormIsFeatured,
          status: appFormStatus,
          features: { ar: featuresArList, en: featuresEnList },
          initialVersionName: appFormVersionName || 'v1.0.0',
          initialVersionCode: Number(appFormVersionCode) || 1,
          initialApkUrl: appFormApkUrl || newVersionApkUrl || '/uploads/apk/zad-muslim-v3.2.0.apk',
          initialApkFileName: appFormApkFileName || '',
          initialApkSize: appFormApkSize || '15 MB',
          initialSha256: appFormApkSha256 || '',
        });
        showToast('تم إنشاء التطبيق ورفع الإصدار بنجاح!');
      }

      resetAppForm();
      await fetchDashboardData();
      onRefreshData();
      setActiveTab('apps');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ التطبيق', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAppForm = () => {
    setSelectedAppForEdit(null);
    setAppFormTitleAr('');
    setAppFormTitleEn('');
    setAppFormTaglineAr('');
    setAppFormTaglineEn('');
    setAppFormDescAr('');
    setAppFormDescEn('');
    setAppFormScreenshots([]);
    setAppFormFeaturesAr('');
    setAppFormFeaturesEn('');
    setAppFormApkUrl('');
    setAppFormApkFileName('');
    setAppFormApkSize('');
    setAppFormApkSha256('');
    setAppFormVersionName('v1.0.0');
    setAppFormVersionCode('1');
  };

  const startEditApp = (app: AppItem) => {
    setSelectedAppForEdit(app);
    setAppFormTitleAr(app.title.ar);
    setAppFormTitleEn(app.title.en);
    setAppFormTaglineAr(app.tagline.ar);
    setAppFormTaglineEn(app.tagline.en);
    setAppFormDescAr(app.description.ar);
    setAppFormDescEn(app.description.en);
    setAppFormCategory(app.category);
    setAppFormPackage(app.packageName);
    setAppFormIconUrl(app.iconUrl);
    setAppFormScreenshots(app.screenshots || []);
    setAppFormMinAndroid(app.minAndroid);
    setAppFormIsFeatured(app.isFeatured);
    setAppFormStatus(app.status);
    setAppFormFeaturesAr(app.features.ar.join('\n'));
    setAppFormFeaturesEn(app.features.en.join('\n'));
    setActiveTab('new-app');
  };

  const handleDeleteApp = (id: string) => {
    const target = apps.find((a) => a.id === id);
    const title = target?.title[language] || 'هذا التطبيق';
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف التطبيق',
      description: `هل أنت متأكد من رغبتك في حذف تطبيق "${title}"؟ سيتم حذف جميع ملفات الـ APK والإصدارات والبيانات نهائياً.`,
      confirmText: 'نعم، احذف التطبيق نهائياً',
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.deleteApp(id);
          setConfirmModal(null);
          showToast('تم حذف التطبيق بنجاح');
          await fetchDashboardData();
          onRefreshData();
        } catch (err: any) {
          showToast(err.message || 'فشل حذف التطبيق', 'error');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Categories Handlers
  const handleResetCategoryForm = () => {
    setSelectedCatForEdit(null);
    setCatNameAr('');
    setCatNameEn('');
    setCatSlug('');
    setCatIcon('Folder');
    setCatDescAr('');
    setCatDescEn('');
  };

  const handleStartEditCategory = (cat: CategoryItem) => {
    setSelectedCatForEdit(cat);
    setCatNameAr(cat.name.ar);
    setCatNameEn(cat.name.en);
    setCatSlug(cat.slug);
    setCatIcon(cat.icon);
    setCatDescAr(cat.description.ar);
    setCatDescEn(cat.description.en);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameAr || !catNameEn || !catSlug) {
      showToast('يرجى كتابة اسم التصنيف بالعربية والإنجليزية والمعرف (Slug)', 'error');
      return;
    }
    try {
      setLoading(true);
      if (selectedCatForEdit) {
        await api.updateCategory(selectedCatForEdit.id, {
          name: { ar: catNameAr, en: catNameEn },
          slug: catSlug.toLowerCase().trim().replace(/\s+/g, '-'),
          icon: catIcon || 'Folder',
          description: { ar: catDescAr, en: catDescEn },
        });
        showToast('تم تعديل التصنيف بنجاح');
      } else {
        await api.createCategory({
          name: { ar: catNameAr, en: catNameEn },
          slug: catSlug.toLowerCase().trim().replace(/\s+/g, '-'),
          icon: catIcon || 'Folder',
          description: { ar: catDescAr, en: catDescEn },
        });
        showToast('تم إنشاء التصنيف الجديد بنجاح');
      }
      handleResetCategoryForm();
      await fetchDashboardData();
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ التصنيف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const catName = target?.name[language] || 'هذا التصنيف';
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف التصنيف',
      description: `هل أنت متأكد من حذف تصنيف "${catName}"؟ لن يتم حذف التطبيقات التابعة له تلقائياً.`,
      confirmText: 'نعم، احذف التصنيف',
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.deleteCategory(id);
          setConfirmModal(null);
          showToast('تم حذف التصنيف بنجاح');
          await fetchDashboardData();
          onRefreshData();
        } catch (err: any) {
          showToast(err.message || 'فشل حذف التصنيف', 'error');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Developer Profile Handlers
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadImage(file);
      setDevAvatarUrl(res.imageUrl);
      showToast('تم رفع الصورة الشخصية بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setDevSkills((prev) => [
      ...prev,
      { name: newSkillName.trim(), level: Number(newSkillLevel) || 90, category: 'framework' },
    ]);
    setNewSkillName('');
    setNewSkillLevel(90);
    showToast(`تمت إضافة مهارة "${newSkillName.trim()}"`);
  };

  const handleRemoveSkill = (index: number) => {
    setDevSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillLevelChange = (index: number, level: number) => {
    setDevSkills((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], level };
      return copy;
    });
  };

  const handleSaveDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateDeveloper({
        name: { ar: devNameAr, en: devNameEn },
        title: { ar: devTitleAr, en: devTitleEn },
        bio: { ar: devBioAr, en: devBioEn },
        location: { ar: devLocationAr, en: devLocationEn },
        avatarUrl: devAvatarUrl,
        email: devEmail,
        phone: devPhone,
        experienceYears: Number(devExpYears) || 6,
        skills: devSkills,
        social: {
          github: devGithub,
          linkedin: devLinkedin,
          googlePlay: devGooglePlay,
          twitter: devTwitter,
          whatsapp: devWhatsapp,
        },
      });
      showToast('تم حفظ وتحديث بيانات عن المهندس معاذ الشاذلي بنجاح!');
      await fetchDashboardData();
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث بيانات المهندس', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Account Settings Handler (Username, Email & Password)
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    try {
      setLoading(true);
      const res = await api.updateProfile({
        name: adminName,
        email: adminEmail,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (res.user) {
        updateAdminUser(res.user);
      }
      setAccountSuccess('تم تحديث بيانات الحساب وكلمة المرور بنجاح!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setAccountSuccess(''), 4000);
    } catch (err: any) {
      setAccountError(err.message || 'فشل تحديث بيانات الحساب');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899'];

  const filteredApps = apps.filter((a) =>
    a.title.ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Dashboard Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white">
                {t('adminTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                مرحباً {admin?.name || 'المهندس معاذ الشاذلي'} ({admin?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('tabOverview')}</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'apps'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{t('tabApps')} ({apps.length})</span>
          </button>
          <button
            onClick={() => {
              resetAppForm();
              setActiveTab('new-app');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'new-app'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{selectedAppForEdit ? t('editApp') : t('tabNewApp')}</span>
          </button>
          <button
            onClick={() => setActiveTab('new-version')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'new-version'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{t('tabNewVersion')}</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>التصنيفات ({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'developer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>عن المهندس</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('tabMessages')} ({messages.filter(m => m.status === 'unread').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === 'suggestions' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>الاقتراحات ({suggestions.filter(item => item.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t('tabSettings')}</span>
          </button>
        </div>

        {/* Dashboard Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-8">
              
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    إجمالي التحميلات
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {analytics.summary.totalDownloads.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    ↑ متزايد لحظياً
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    التطبيقات المنشورة
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {analytics.summary.publishedApps} / {analytics.summary.totalApps}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    جاهزة للتحميل الفوري
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    إجمالي إصدارات APK
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {analytics.summary.totalVersions}
                  </div>
                  <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
                    بصمات SHA256 موثقة
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    استفسارات الزوار
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {analytics.summary.totalMessages}
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
                    {analytics.summary.unreadMessages} رسالة جديدة غير مقروءة
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Download Trends Widget */}
              <DashboardWidget onRefreshParent={fetchDashboardData} />

              {/* Chart: Daily Downloads Area */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span>{t('totalDownloadsOverTime')} (آخر 14 يوماً)</span>
                </h3>
                <div className="h-64 sm:h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyTrends}>
                      <defs>
                        <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="downloads"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#downloadGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row: Category Pie & Top Apps Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Apps Bar */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    {t('topAppsByDownloads')}
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topApps} layout="vertical">
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                        <YAxis dataKey="nameAr" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="downloads" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Pie */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                    {t('downloadsByCategory')}
                  </h3>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryDownloads}
                          dataKey="downloads"
                          nameKey="nameAr"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(((percent ?? 0) * 100)).toFixed(0)}%)`}
                        >
                          {analytics.categoryDownloads.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: APPS MANAGER TABLE */}
          {activeTab === 'apps' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute start-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في التطبيقات..."
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={() => {
                    resetAppForm();
                    setActiveTab('new-app');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addNewApp')}</span>
                </button>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-start">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                      <tr>
                        <th className="p-4 text-start">التطبيق</th>
                        <th className="p-4 text-start">الإصدار الحالي</th>
                        <th className="p-4 text-start">التصنيف</th>
                        <th className="p-4 text-start">التحميلات</th>
                        <th className="p-4 text-start">الحالة</th>
                        <th className="p-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {filteredApps.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={getAssetUrl(a.iconUrl)}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {a.title[language]}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {a.packageName}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {a.currentVersion} ({a.versions.length} نسخ)
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            {a.category}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            {a.totalDownloads.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                a.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAppForNewVersion(a.id);
                                  setActiveTab('new-version');
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="رفع إصدار جديد"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditApp(a)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                title={t('editApp')}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteApp(a.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title={t('deleteApp')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ADD / EDIT APP FORM */}
          {activeTab === 'new-app' && (
            <form onSubmit={handleSaveApp} className="max-w-3xl mx-auto space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedAppForEdit ? t('editApp') : t('addNewApp')}
                </h3>
                {selectedAppForEdit && (
                  <button
                    type="button"
                    onClick={resetAppForm}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    إلغاء التعديل وإنشاء جديد
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">اسم التطبيق (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={appFormTitleAr}
                    onChange={(e) => setAppFormTitleAr(e.target.value)}
                    placeholder="مثال: زاد المسلم — القرآن الكريم"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">App Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={appFormTitleEn}
                    onChange={(e) => setAppFormTitleEn(e.target.value)}
                    placeholder="e.g. Zad Al-Muslim — Holy Quran"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">شعار / نبذة مختصرة (بالعربية)</label>
                  <input
                    type="text"
                    value={appFormTaglineAr}
                    onChange={(e) => setAppFormTaglineAr(e.target.value)}
                    placeholder="تطبيق شامل بدون إنترنت..."
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Tagline (English)</label>
                  <input
                    type="text"
                    value={appFormTaglineEn}
                    onChange={(e) => setAppFormTaglineEn(e.target.value)}
                    placeholder="Offline-first all-in-one companion..."
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">اسم الحزمة (Package Name)</label>
                  <input
                    type="text"
                    value={appFormPackage}
                    onChange={(e) => setAppFormPackage(e.target.value)}
                    placeholder="com.moaz.app"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">التصنيف (Category)</label>
                  <select
                    value={appFormCategory}
                    onChange={(e) => setAppFormCategory(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name[language]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon Uploader & Preview */}
              <div>
                <label className="block text-xs font-bold mb-2">{t('uploadIcon')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border shrink-0">
                    <img src={getAssetUrl(appFormIconUrl)} alt="Icon preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="text-xs text-slate-500 file:me-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500 file:text-white file:font-bold hover:file:bg-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Screenshots Uploader */}
              <div>
                <label className="block text-xs font-bold mb-2">{t('uploadScreenshots')}</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="text-xs text-slate-500 file:me-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-700 file:text-white file:font-bold hover:file:bg-slate-600 cursor-pointer mb-3"
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {appFormScreenshots.map((url, i) => (
                    <div key={i} className="relative w-20 h-32 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                      <img src={getAssetUrl(url)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAppFormScreenshots(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 end-1 p-1 rounded-full bg-red-600 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct APK Upload during App Creation */}
              {!selectedAppForEdit && (
                <div className="p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      رفع ملف APK الأولي للتطبيق (اختياري عند الإنشاء)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">رقم الإصدار (Version Name)</label>
                      <input
                        type="text"
                        value={appFormVersionName}
                        onChange={(e) => setAppFormVersionName(e.target.value)}
                        placeholder="v1.0.0"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">كود الإصدار (Version Code)</label>
                      <input
                        type="number"
                        value={appFormVersionCode}
                        onChange={(e) => setAppFormVersionCode(e.target.value)}
                        placeholder="1"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      accept=".apk,application/vnd.android.package-archive"
                      onChange={handleAppApkUpload}
                      className="text-xs text-slate-500 file:me-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold hover:file:bg-emerald-500 cursor-pointer"
                    />
                    {isUploadingAppApk && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري رفع وتوليد بصمة SHA-256 لملف APK...</span>
                      </div>
                    )}
                    {appFormApkUrl && (
                      <div className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>تم تجهيز الملف: {appFormApkFileName} ({appFormApkSize})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-bold mb-1">الوصف التفصيلي (بالعربية)</label>
                <textarea
                  rows={4}
                  value={appFormDescAr}
                  onChange={(e) => setAppFormDescAr(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Full Description (English)</label>
                <textarea
                  rows={4}
                  value={appFormDescEn}
                  onChange={(e) => setAppFormDescEn(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                />
              </div>

              {/* Features list (one per line) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">المميزات (سطر لكل ميزة - بالعربية)</label>
                  <textarea
                    rows={4}
                    value={appFormFeaturesAr}
                    onChange={(e) => setAppFormFeaturesAr(e.target.value)}
                    placeholder="مواقيت الصلاة الدقيقة&#10;المصحف كاملاً بدون إنترنت"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Features (One per line - English)</label>
                  <textarea
                    rows={4}
                    value={appFormFeaturesEn}
                    onChange={(e) => setAppFormFeaturesEn(e.target.value)}
                    placeholder="Accurate prayer times&#10;100% Offline Holy Quran"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Status & Featured */}
              <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={appFormIsFeatured}
                    onChange={(e) => setAppFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{t('isFeatured')}</span>
                </label>

                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="font-bold">الحالة:</span>
                  <select
                    value={appFormStatus}
                    onChange={(e: any) => setAppFormStatus(e.target.value)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs"
                  >
                    <option value="published">منشور (Published)</option>
                    <option value="draft">مسودة (Draft)</option>
                    <option value="archived">مؤرشف (Archived)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>{selectedAppForEdit ? t('saveChanges') : t('addNewApp')}</span>
              </button>

            </form>
          )}

          {/* TAB 4: ADD NEW VERSION (APK UPLOAD) */}
          {activeTab === 'new-version' && (
            <form onSubmit={handleCreateVersion} className="max-w-2xl mx-auto space-y-6">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {t('uploadNewVersion')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  قم برفع ملف APK الثنائي الجديد وتحديد رقم الإصدار وملاحظات التحديث.
                </p>
              </div>

              {/* App selector */}
              <div>
                <label className="block text-xs font-bold mb-1.5">اختر التطبيق المستهدف *</label>
                <select
                  required
                  value={selectedAppForNewVersion}
                  onChange={(e) => setSelectedAppForNewVersion(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title[language]} ({a.currentVersion})
                    </option>
                  ))}
                </select>
              </div>

              {/* Version Name and Code */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5">{t('versionName')} *</label>
                  <input
                    type="text"
                    required
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="v3.3.0"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5">{t('versionCode')} *</label>
                  <input
                    type="number"
                    required
                    value={newVersionCode}
                    onChange={(e) => setNewVersionCode(e.target.value)}
                    placeholder="33"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              {/* APK File Upload Area */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
                <Upload className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('uploadApkFile')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  اختر ملف .apk من جهازك (يدعم حتى 200 ميجابايت)
                </p>

                <input
                  type="file"
                  accept=".apk,application/vnd.android.package-archive"
                  onChange={handleApkFileUpload}
                  className="text-xs text-slate-500 file:me-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold hover:file:bg-emerald-500 cursor-pointer"
                />

                {isUploadingApk && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-emerald-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري رفع وتوليد بصمة SHA-256 للملف...</span>
                  </div>
                )}

                {newVersionApkUrl && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-start text-emerald-900 dark:text-emerald-200">
                    <div className="font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>تم رفع الملف: {newVersionApkFileName} ({newVersionApkSize})</span>
                    </div>
                    {newVersionSha256 && (
                      <div className="text-[10px] font-mono break-all mt-1 opacity-80">
                        SHA256: {newVersionSha256}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Release Notes */}
              <div>
                <label className="block text-xs font-bold mb-1.5">{t('releaseNotesAr')}</label>
                <textarea
                  rows={3}
                  value={newVersionNotesAr}
                  onChange={(e) => setNewVersionNotesAr(e.target.value)}
                  placeholder="مثال: تحسين استهلاك البطارية ودعم ويدجت جديد..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">{t('releaseNotesEn')}</label>
                <textarea
                  rows={3}
                  value={newVersionNotesEn}
                  onChange={(e) => setNewVersionNotesEn(e.target.value)}
                  placeholder="e.g. Battery optimizations and new glance widgets..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading || isUploadingApk}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                <span>نشر الإصدار الجديد فوراً</span>
              </button>

            </form>
          )}

          {/* TAB: CATEGORIES MANAGER */}
          {activeTab === 'categories' && (
            <div className="max-w-4xl mx-auto space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    إدارة وتعديل تصنيفات التطبيقات
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يمكنك إضافة تصنيفات جديدة، تعديل أسمائها بالعربية والإنجليزية، أو حذف أي تصنيف.
                  </p>
                </div>
                {selectedCatForEdit && (
                  <button
                    type="button"
                    onClick={handleResetCategoryForm}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    إلغاء التعديل والعودة لإضافة جديد
                  </button>
                )}
              </div>

              {/* Add / Edit Category Form */}
              <form onSubmit={handleSaveCategory} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-emerald-500" />
                  <span>{selectedCatForEdit ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">اسم التصنيف (بالعربية) *</label>
                    <input
                      type="text"
                      required
                      value={catNameAr}
                      onChange={(e) => setCatNameAr(e.target.value)}
                      placeholder="مثال: تعليم ولغات"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Category Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={catNameEn}
                      onChange={(e) => setCatNameEn(e.target.value)}
                      placeholder="e.g. Education & Languages"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">المعرف البرمجي (Slug) *</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="e.g. education-languages"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">رمز الأيقونة (Icon)</label>
                    <select
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    >
                      <option value="Folder">Folder (مجلد)</option>
                      <option value="Moon">Moon (إسلاميات / ليلي)</option>
                      <option value="CheckSquare">CheckSquare (مهام / إنتاجية)</option>
                      <option value="Mic">Mic (صوتيات / تسجيل)</option>
                      <option value="TrendingUp">TrendingUp (مالية / استثمار)</option>
                      <option value="Wrench">Wrench (أدوات ونظام)</option>
                      <option value="Smartphone">Smartphone (هواتف / اتصالات)</option>
                      <option value="Sparkles">Sparkles (تطبيقات ذكية)</option>
                      <option value="Code">Code (برمجة وتطوير)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">الوصف المختصر (بالعربية)</label>
                    <input
                      type="text"
                      value={catDescAr}
                      onChange={(e) => setCatDescAr(e.target.value)}
                      placeholder="تطبيقات تعليمية وتدريبية..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Description (English)</label>
                    <input
                      type="text"
                      value={catDescEn}
                      onChange={(e) => setCatDescEn(e.target.value)}
                      placeholder="Educational and learning apps..."
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{selectedCatForEdit ? 'حفظ تعديل التصنيف' : 'إضافة التصنيف'}</span>
                  </button>
                </div>
              </form>

              {/* Categories List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  التصنيفات الحالية ({categories.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {cat.name.ar} / {cat.name.en}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                            {cat.slug} • ({cat.appCount || 0} تطبيقات)
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {cat.description.ar}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(cat)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: DEVELOPER PROFILE (عن المهندس معاذ الشاذلي) */}
          {activeTab === 'developer' && (
            <form onSubmit={handleSaveDeveloper} className="max-w-4xl mx-auto space-y-8">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  تعديل قسم عن المهندس معاذ الشاذلي
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يمكنك تعديل أي معلومة تظهر في قسم السيرة الذاتية والمهارات الهندسية وروابط التواصل الاجتماعي.
                </p>
              </div>

              {/* Avatar Photo Section */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <label className="block text-xs font-bold mb-3">الصورة الشخصية للمهندس (Avatar)</label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/40 shadow-lg shrink-0">
                    <img src={getAssetUrl(devAvatarUrl)} alt="Developer Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 text-center sm:text-start flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="text-xs text-slate-500 file:me-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold hover:file:bg-emerald-500 cursor-pointer"
                    />
                    <div className="text-[11px] text-slate-400">
                      يمكنك أيضاً وضع رابط مباشر للصورة إذا رغبت:
                    </div>
                    <input
                      type="text"
                      value={devAvatarUrl}
                      onChange={(e) => setDevAvatarUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Details: Name, Title, Experience */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">البيانات الأساسية</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">الاسم (بالعربية) *</label>
                    <input
                      type="text"
                      required
                      value={devNameAr}
                      onChange={(e) => setDevNameAr(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={devNameEn}
                      onChange={(e) => setDevNameEn(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">المسمى الوظيفي (بالعربية)</label>
                    <input
                      type="text"
                      value={devTitleAr}
                      onChange={(e) => setDevTitleAr(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Professional Title (English)</label>
                    <input
                      type="text"
                      value={devTitleEn}
                      onChange={(e) => setDevTitleEn(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">سنوات الخبرة</label>
                    <input
                      type="number"
                      value={devExpYears}
                      onChange={(e) => setDevExpYears(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">الموقع (بالعربية)</label>
                    <input
                      type="text"
                      value={devLocationAr}
                      onChange={(e) => setDevLocationAr(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Location (English)</label>
                    <input
                      type="text"
                      value={devLocationEn}
                      onChange={(e) => setDevLocationEn(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">النبذة الشخصية (بالعربية)</label>
                  <textarea
                    rows={4}
                    value={devBioAr}
                    onChange={(e) => setDevBioAr(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Biography (English)</label>
                  <textarea
                    rows={4}
                    value={devBioEn}
                    onChange={(e) => setDevBioEn(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Contact & Social Links */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">التواصل والشبكات الاجتماعية</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">البريد الإلكتروني العام</label>
                    <input
                      type="email"
                      value={devEmail}
                      onChange={(e) => setDevEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={devPhone}
                      onChange={(e) => setDevPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={devWhatsapp}
                      onChange={(e) => setDevWhatsapp(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">رابط GitHub</label>
                    <input
                      type="url"
                      value={devGithub}
                      onChange={(e) => setDevGithub(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">رابط LinkedIn</label>
                    <input
                      type="url"
                      value={devLinkedin}
                      onChange={(e) => setDevLinkedin(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Google Play Developer Console</label>
                    <input
                      type="url"
                      value={devGooglePlay}
                      onChange={(e) => setDevGooglePlay(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Twitter / X</label>
                    <input
                      type="url"
                      value={devTwitter}
                      onChange={(e) => setDevTwitter(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Manager */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    المهارات والتقنيات الهندسية ({devSkills.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {devSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50"
                    >
                      <div className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex-1">
                        {skill.name}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-64">
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={skill.level}
                          onChange={(e) => handleSkillLevelChange(index, Number(e.target.value))}
                          className="flex-1 accent-emerald-500 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 w-10 text-end">
                          {skill.level}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="حذف المهارة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new skill inline */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="اسم المهارة الجديدة (مثال: Kotlin Multiplatform Mobile)"
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={newSkillLevel}
                      onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                      className="w-20 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      إضافة مهارة
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>حفظ وتحديث ملف المهندس معاذ الشاذلي</span>
              </button>

            </form>
          )}

          {/* TAB 5: INCOMING MESSAGES INBOX */}
          {activeTab === 'messages' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                رسائل واستفسارات الزوار
              </h3>

              {messages.length === 0 ? (
                <div className="p-8 text-center text-slate-400">لا توجد رسائل حالياً.</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-base text-slate-900 dark:text-white">
                        {m.name} ({m.email})
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      الموضوع: {m.subject}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                      {m.message}
                    </p>
                    <div className="flex justify-end gap-2 pt-2">
                      <a
                        href={`mailto:${m.email}?subject=رد على: ${encodeURIComponent(m.subject)}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                      >
                        الرد عبر البريد
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="max-w-5xl mx-auto space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">اقتراحات الزوار</h3>
              {suggestions.length === 0 ? <p className="rounded-2xl bg-white dark:bg-slate-900 p-6 text-slate-500">لا توجد اقتراحات حتى الآن.</p> : suggestions.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3"><strong>{item.type === 'edit' ? `اقتراح تعديل: ${item.app || ''}` : `اقتراح تطبيق: ${item.appName || ''}`}</strong><span className="text-xs text-slate-500">{item.status} · {new Date(item.createdAt).toLocaleString()}</span></div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{item.suggestion || item.description || item.appUrl}</p>
                  {item.details && <p className="text-sm text-slate-500">{item.details}</p>}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={async () => { try { await api.updateSuggestion(item.id, 'approved'); await fetchDashboardData(); showToast('تم اعتماد الاقتراح'); } catch (error: any) { showToast(error.message, 'error'); } }} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">اعتماد</button>
                    <button onClick={async () => { try { await api.updateSuggestion(item.id, 'rejected'); await fetchDashboardData(); showToast('تم رفض الاقتراح'); } catch (error: any) { showToast(error.message, 'error'); } }} className="px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold">رفض</button>
                    <button onClick={async () => { try { await api.deleteSuggestion(item.id); await fetchDashboardData(); showToast('تم حذف الاقتراح'); } catch (error: any) { showToast(error.message, 'error'); } }} className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold">حذف</button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {/* TAB 6: SETTINGS (SITE BRANDING & ADMIN ACCOUNT) */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8">
              
              {/* SECTION 1: SITE BRANDING & LOGO */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-500" />
                    <span>شعار الموقع وهوية المنصة (Site Branding & Logo)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يمكنك تغيير لوجو الموقع الرسمي، عنوان المنصة بالعربية والإنجليزية، والنبذة التعريفية.
                  </p>
                </div>

                {settingsSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{settingsSuccess}</span>
                  </div>
                )}

                {settingsError && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {settingsError}
                  </div>
                )}

                <form onSubmit={handleSaveSiteSettings} className="space-y-5">
                  {/* Logo Preview & Upload */}
                  <div>
                    <label className="block text-xs font-bold mb-2">شعار الموقع (Logo)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/40 p-1 flex items-center justify-center shrink-0 shadow-md">
                        <img
                          src={getAssetUrl(siteLogoUrl || '/logo.svg')}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2 flex-1 w-full">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          رفع ملف صورة كشعار جديد (PNG / SVG / WEBP / JPG):
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-xs text-slate-500 file:me-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-600 file:text-white file:font-bold hover:file:bg-emerald-500 cursor-pointer"
                        />
                        {isUploadingLogo && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري رفع الشعار...</span>
                          </div>
                        )}
                        <div className="pt-1">
                          <label className="block text-[11px] text-slate-400 mb-1">أو رابط مباشر للشعار (Logo URL):</label>
                          <input
                            type="text"
                            value={siteLogoUrl}
                            onChange={(e) => setSiteLogoUrl(e.target.value)}
                            placeholder="/logo.svg"
                            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Site Titles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">اسم الموقع (بالعربية) *</label>
                      <input
                        type="text"
                        required
                        value={siteTitleAr}
                        onChange={(e) => setSiteTitleAr(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Site Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={siteTitleEn}
                        onChange={(e) => setSiteTitleEn(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Taglines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">الشعار اللفظي (بالعربية)</label>
                      <input
                        type="text"
                        value={siteTaglineAr}
                        onChange={(e) => setSiteTaglineAr(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Tagline (English)</label>
                      <input
                        type="text"
                        value={siteTaglineEn}
                        onChange={(e) => setSiteTaglineEn(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>حفظ وتطبيق شعار وهوية الموقع</span>
                  </button>
                </form>
              </div>

              {/* SECTION 2: ADMIN ACCOUNT & SECURITY */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-500" />
                    <span>إعدادات حساب وبيانات الدخول للمشرف</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يمكنك تغيير اسم المستخدم، البريد الإلكتروني، وكلمة المرور الخاصة بلوحة التحكم.
                  </p>
                </div>

                {accountSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{accountSuccess}</span>
                  </div>
                )}

                {accountError && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {accountError}
                  </div>
                )}

                <form onSubmit={handleUpdateAccount} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">اسم المشرف / اسم المستخدم (Username)</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Eng. Moaz El Shazly"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">البريد الإلكتروني لتسجيل الدخول</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      تغيير كلمة المرور (اختياري - اتركه فارغاً إذا كنت لا ترغب في تغييرها)
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">كلمة المرور الحالية</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية لتأكيد التغيير"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة"
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    <span>حفظ بيانات الحساب وكلمة المرور</span>
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* IN-APP TOAST BANNER */}
        {toast && (
          <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
            <div
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border backdrop-blur-md ${
                toast.type === 'error'
                  ? 'bg-red-900/90 text-white border-red-700 shadow-red-950/50'
                  : 'bg-emerald-900/90 text-white border-emerald-600 shadow-emerald-950/50'
              }`}
            >
              {toast.type === 'error' ? (
                <X className="w-4 h-4 text-red-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              )}
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* CUSTOM CONFIRMATION MODAL (No window.confirm) */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-start">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {confirmModal.description}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 cursor-pointer"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
