import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation & Brand
    brandName: 'المهندس معاذ الشاذلي',
    brandTagline: 'منصة تطبيقات أندرويد الرسمية',
    navApps: 'التطبيقات',
    navCategories: 'التصنيفات',
    navDeveloper: 'عن المهندس',
    navContact: 'تواصل / توظيف',
    navAdmin: 'لوحة التحكم',
    navSignOut: 'تسجيل خروج',
    
    // Hero Section
    heroBadge: '🤖 مهندس برمجيات أندرويد معتمد',
    heroTitlePrefix: 'تطبيقات أندرويد حديثة بمعمارية',
    heroTitleHighlight: 'عالية الأداء',
    heroSubtitle: 'استكشف وحمّل أحدث التطبيقات المطورة بلغة Kotlin وJetpack Compose مع دعم كامل للتشغيل بدون إنترنت، حماية البيانات، والتحميل المباشر لملفات APK الأصلية.',
    heroDownloadApk: 'استعراض التطبيقات',
    heroContactDev: 'طلب مشروع خاص',
    searchPlaceholder: 'ابحث عن اسم التطبيق، الميزة، أو الحزمة...',
    allCategories: 'جميع التصنيفات',
    
    // Stats
    statTotalApps: 'تطبيقات منشورة',
    statTotalDownloads: 'إجمالي التحميلات',
    statHappyUsers: 'مستخدم نشط',
    statExperience: 'سنوات خبرة برمجية',
    
    // App Card & Details
    downloadApk: 'تحميل APK',
    viewDetails: 'عرض التفاصيل',
    latestVersion: 'أحدث إصدار',
    verifiedApk: 'APK موثق وآمن',
    minAndroid: 'أدنى نظام:',
    fileSize: 'الحجم:',
    rating: 'التقييم',
    downloads: 'تحميل',
    changelog: 'ما الجديد في هذا الإصدار',
    versionHistory: 'سجل الإصدارات السابقة',
    features: 'أبرز المميزات والخصائص',
    specifications: 'المواصفات الفنية',
    packageName: 'اسم الحزمة (Package)',
    targetSdk: 'الإصدار المستهدف (Target SDK)',
    sha256Checksum: 'بصمة الأمان (SHA-256)',
    releaseDate: 'تاريخ الإصدار',
    shareApp: 'مشاركة التطبيق',
    linkCopied: 'تم نسخ الرابط!',
    githubSource: 'كود المصدر (GitHub)',
    googlePlay: 'متجر Google Play',
    relatedApps: 'تطبيقات أخرى قد تهمك',
    
    // Download Modal
    downloadingTitle: 'جاري تجهيز وتحميل ملف APK...',
    securityScanning: 'فحص الحماية وبصمة التشفير...',
    securityPassed: 'تم الفحص: ملف نظيف 100% وخالٍ من البرمجيات الضارة',
    installInstructionsTitle: 'كيفية تثبيت ملف APK على هاتفك الأندرويد؟',
    step1Title: '1. السماح بالتثبيت من مصادر غير معروفة',
    step1Desc: 'اذهب إلى الإعدادات > الحماية > التثبيت من مصادر غير معروفة واسمح لمتصفحك.',
    step2Title: '2. فتح ملف APK المحمّل',
    step2Desc: 'اضغط على إشعار اكتمال التحميل أو افتح مدير الملفات ومجلد التنزيلات (Downloads).',
    step3Title: '3. النقر على "تثبيت"',
    step3Desc: 'اتبع التعليمات على الشاشة واستمتع بالتطبيق بكامل مميزاته!',
    downloadStarted: 'بدأ التحميل بنجاح!',
    directDownloadFallback: 'إذا لم يبدأ التحميل تلقائياً، اضغط هنا للتحميل المباشر',
    close: 'إغلاق',
    
    // Developer Section
    aboutDevTitle: 'عن المهندس معاذ الشاذلي',
    aboutDevSubtitle: 'مهندس برمجيات متخصص في بناء وتطوير تطبيقات أندرويد المعقدة بأحدث المعايير الهندسية',
    techStackTitle: 'التقنيات والأدوات الهندسية',
    hireMe: 'تواصل لطلب مشروع أندرويد',
    contactDev: 'راسل المهندس معاذ',
    
    // Contact Modal
    contactTitle: 'تواصل مع المهندس معاذ الشاذلي',
    contactSubtitle: 'لديك فكرة تطبيق، استشارة برمجية، أو ترغب في العمل سوياً؟ أرسل رسالتك وسأرد عليك في أقرب وقت.',
    yourName: 'الاسم بالكامل',
    yourEmail: 'البريد الإلكتروني',
    subject: 'موضوع الرسالة',
    yourMessage: 'تفاصيل الرسالة أو فكرة المشروع...',
    sendMessage: 'إرسال الرسالة',
    messageSentSuccess: 'تم إرسال رسالتك بنجاح! شكراً لتواصلك.',
    
    // Admin Dashboard
    adminTitle: 'لوحة التحكم المركزية',
    adminSubtitle: 'إدارة التطبيقات، رفع ملفات APK، متابعة التحليلات والرسائل',
    tabOverview: 'نظرة عامة والتحليلات',
    tabApps: 'إدارة التطبيقات',
    tabNewApp: 'إضافة تطبيق جديد',
    tabNewVersion: 'رفع إصدار APK جديد',
    tabCategories: 'التصنيفات',
    tabMessages: 'رسائل الزوار',
    tabSettings: 'الإعدادات الشخصية',
    addNewApp: 'إضافة تطبيق جديد',
    uploadNewVersion: 'رفع إصدار جديد',
    editApp: 'تعديل التطبيق',
    deleteApp: 'حذف التطبيق',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    saveChanges: 'حفظ التعديلات',
    cancel: 'إلغاء',
    loginTitle: 'تسجيل الدخول للمشرف',
    loginSubtitle: 'الوصول إلى لوحة إدارة تطبيقات المهندس معاذ الشاذلي',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginButton: 'تسجيل الدخول',
    totalDownloadsOverTime: 'إحصائيات التحميلات اليومية',
    downloadsByCategory: 'توزيع التحميلات حسب التصنيف',
    topAppsByDownloads: 'أكثر التطبيقات تحميلاً',
    noAppsFound: 'لا توجد تطبيقات مطابقة لبحثك.',
    statusPublished: 'منشور',
    statusDraft: 'مسودة',
    statusArchived: 'مؤرشف',
    isFeatured: 'تطبيق مميز في الواجهة',
    uploadIcon: 'رفع أيقونة التطبيق (PNG/JPG)',
    uploadScreenshots: 'رفع لقطات الشاشة (Screenshots)',
    uploadApkFile: 'رفع ملف التطبيق (APK File)',
    versionName: 'اسم الإصدار (مثال: v2.1.0)',
    versionCode: 'كود الإصدار الرقمي (مثال: 21)',
    releaseNotesAr: 'ملاحظات الإصدار (بالعربية)',
    releaseNotesEn: 'ملاحظات الإصدار (بالإنجليزية)',
  },
  en: {
    // Navigation & Brand
    brandName: 'Eng. Moaz El Shazly',
    brandTagline: 'Official Android Apps Hub',
    navApps: 'Applications',
    navCategories: 'Categories',
    navDeveloper: 'About Developer',
    navContact: 'Contact / Hire',
    navAdmin: 'Admin Dashboard',
    navSignOut: 'Sign Out',
    
    // Hero Section
    heroBadge: '🤖 Certified Android Software Engineer',
    heroTitlePrefix: 'Modern Android Apps Engineered for',
    heroTitleHighlight: 'Peak Performance',
    heroSubtitle: 'Explore and download cutting-edge Android applications crafted with Kotlin and Jetpack Compose. Offline-first architectures, strict privacy, and direct authentic APK downloads.',
    heroDownloadApk: 'Browse Applications',
    heroContactDev: 'Request Custom App',
    searchPlaceholder: 'Search apps by name, features, or package...',
    allCategories: 'All Categories',
    
    // Stats
    statTotalApps: 'Published Apps',
    statTotalDownloads: 'Total Downloads',
    statHappyUsers: 'Active Users',
    statExperience: 'Years Experience',
    
    // App Card & Details
    downloadApk: 'Download APK',
    viewDetails: 'View Details',
    latestVersion: 'Latest Release',
    verifiedApk: 'Verified Safe APK',
    minAndroid: 'Min Android:',
    fileSize: 'Size:',
    rating: 'Rating',
    downloads: 'Downloads',
    changelog: "What's New in This Version",
    versionHistory: 'Version Release History',
    features: 'Key Features & Capabilities',
    specifications: 'Technical Specifications',
    packageName: 'Package Name',
    targetSdk: 'Target SDK',
    sha256Checksum: 'Security Hash (SHA-256)',
    releaseDate: 'Release Date',
    shareApp: 'Share App',
    linkCopied: 'Link copied to clipboard!',
    githubSource: 'Source Code (GitHub)',
    googlePlay: 'Google Play Store',
    relatedApps: 'More Apps You May Like',
    
    // Download Modal
    downloadingTitle: 'Preparing & Downloading APK...',
    securityScanning: 'Verifying signature & SHA-256 hash...',
    securityPassed: 'Security Check: 100% Clean & Malware-free',
    installInstructionsTitle: 'How to install this APK on Android?',
    step1Title: '1. Allow Unknown Source Installations',
    step1Desc: 'Open Settings > Security > Install unknown apps and toggle Allow for your browser.',
    step2Title: '2. Open Downloaded APK',
    step2Desc: 'Tap the download complete notification or navigate to your Downloads folder in Files app.',
    step3Title: '3. Tap Install',
    step3Desc: 'Follow on-screen prompts and enjoy your newly installed Android application!',
    downloadStarted: 'Download started successfully!',
    directDownloadFallback: 'If download did not start automatically, click here for direct file link',
    close: 'Close',
    
    // Developer Section
    aboutDevTitle: 'About Eng. Moaz El Shazly',
    aboutDevSubtitle: 'Senior Android Software Engineer crafting resilient, high-speed mobile solutions',
    techStackTitle: 'Technical Stack & Engineering Disciplines',
    hireMe: 'Discuss a Project',
    contactDev: 'Message Eng. Moaz',
    
    // Contact Modal
    contactTitle: 'Get in Touch with Eng. Moaz El Shazly',
    contactSubtitle: 'Have an Android app project, engineering consultation, or partnership idea? Send your inquiry directly.',
    yourName: 'Full Name',
    yourEmail: 'Email Address',
    subject: 'Subject',
    yourMessage: 'Message details or project specs...',
    sendMessage: 'Send Message',
    messageSentSuccess: 'Your message has been sent successfully! Thank you.',
    
    // Admin Dashboard
    adminTitle: 'Central Admin Dashboard',
    adminSubtitle: 'Manage apps, upload APK releases, monitor download analytics and inquiries',
    tabOverview: 'Overview & Analytics',
    tabApps: 'Manage Applications',
    tabNewApp: 'Add New App',
    tabNewVersion: 'Upload APK Version',
    tabCategories: 'Categories',
    tabMessages: 'Visitor Inquiries',
    tabSettings: 'Profile Settings',
    addNewApp: 'Add New Application',
    uploadNewVersion: 'Upload New Version',
    editApp: 'Edit Application',
    deleteApp: 'Delete Application',
    confirmDelete: 'Are you sure you want to delete this?',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    loginTitle: 'Admin Portal Login',
    loginSubtitle: 'Sign in to access management console for Eng. Moaz apps',
    email: 'Email Address',
    password: 'Password',
    loginButton: 'Sign In',
    totalDownloadsOverTime: 'Daily Download Velocity',
    downloadsByCategory: 'Downloads by Category',
    topAppsByDownloads: 'Top Performing Apps',
    noAppsFound: 'No applications found matching your query.',
    statusPublished: 'Published',
    statusDraft: 'Draft',
    statusArchived: 'Archived',
    isFeatured: 'Featured on Homepage',
    uploadIcon: 'Upload App Icon (PNG/JPG)',
    uploadScreenshots: 'Upload Screenshots',
    uploadApkFile: 'Upload APK Binary File',
    versionName: 'Version Name (e.g., v2.1.0)',
    versionCode: 'Version Code Number (e.g., 21)',
    releaseNotesAr: 'Release Notes (Arabic)',
    releaseNotesEn: 'Release Notes (English)',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('moaz_app_lang');
    return (saved === 'en' || saved === 'ar') ? saved : 'ar'; // Default Arabic as requested
  });

  const isRtl = language === 'ar';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('moaz_app_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
