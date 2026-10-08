

export interface AppVersion {
  id: string;
  versionName: string;
  versionCode: number;
  apkUrl: string;
  apkFileName: string;
  apkSize: string;
  apkSizeBytes: number;
  minSdk: string;
  targetSdk: string;
  sha256?: string;
  releaseNotes: {
    ar: string;
    en: string;
  };
  downloadsCount: number;
  releasedAt: string;
  isLatest: boolean;
}

export interface AppItem {
  id: string;
  slug: string;
  title: {
    ar: string;
    en: string;
  };
  tagline: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  features: {
    ar: string[];
    en: string[];
  };
  category: string;
  packageName: string;
  iconUrl: string;
  bannerUrl?: string;
  screenshots: string[];
  githubUrl?: string;
  playStoreUrl?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  rating: number;
  ratingCount: number;
  totalDownloads: number;
  currentVersion: string;
  minAndroid: string;
  versions: AppVersion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  slug: string;
  icon: string;
  description: {
    ar: string;
    en: string;
  };
  appCount?: number;
}

export interface DeveloperProfile {
  name: {
    ar: string;
    en: string;
  };
  title: {
    ar: string;
    en: string;
  };
  bio: {
    ar: string;
    en: string;
  };
  avatarUrl: string;
  email: string;
  phone: string;
  location: {
    ar: string;
    en: string;
  };
  experienceYears: number;
  skills: {
    name: string;
    level: number;
    category: 'core' | 'framework' | 'tools';
  }[];
  social: {
    github: string;
    linkedin: string;
    googlePlay: string;
    twitter: string;
    whatsapp?: string;
  };
  stats: {
    totalApps: number;
    totalDownloads: number;
    happyUsers: string;
    yearsOfExperience: number;
  };
}

export interface AnalyticsData {
  summary: {
    totalDownloads: number;
    totalApps: number;
    publishedApps: number;
    totalVersions: number;
    totalMessages: number;
    unreadMessages: number;
  };
  categoryDownloads: {
    name: string;
    nameAr: string;
    downloads: number;
  }[];
  topApps: {
    id: string;
    name: string;
    nameAr: string;
    downloads: number;
    rating: number;
    category: string;
  }[];
  dailyTrends: {
    date: string;
    downloads: number;
  }[];
}

export interface LiveDownloadEvent {
  id: string;
  appTitle: string;
  appTitleAr: string;
  version: string;
  timeAgo: string;
  timestamp: string;
  deviceHash: string;
}

export interface RealtimeAnalyticsData {
  timeframe: '24h' | '7d' | '30d';
  lastUpdated: string;
  metrics: {
    todayDownloads: number;
    yesterdayDownloads: number;
    hourlyRate: number;
    growthPercent: number;
    peakValue: number;
    peakLabel: string;
    avgPerInterval: number;
    successRate: number;
  };
  chartData: {
    timestamp: string;
    label: string;
    downloads: number;
    verifiedCount: number;
  }[];
  recentEvents: LiveDownloadEvent[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface SiteSettings {
  siteLogoUrl: string;
  siteTitleAr: string;
  siteTitleEn: string;
  taglineAr: string;
  taglineEn: string;
  directDownloadEnabled: boolean;
}


export interface SuggestionItem {
  id: string;
  type: 'edit' | 'app';
  status: 'pending' | 'approved' | 'rejected' | 'reviewed';
  name?: string;
  email?: string;
  app?: string;
  suggestion?: string;
  details?: string;
  appName?: string;
  appUrl?: string;
  category?: string;
  description?: string;
  officialWebsite?: string;
  createdAt: string;
}