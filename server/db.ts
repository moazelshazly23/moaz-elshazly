import fs from 'fs';
import path from 'path';

export interface AppVersion {
  id: string;
  versionName: string;      // e.g. "v3.2.0"
  versionCode: number;       // e.g. 32
  apkUrl: string;            // Download URL or local path
  apkFileName: string;       // e.g. "zad-muslim-v3.2.0.apk"
  apkSize: string;           // e.g. "28.4 MB"
  apkSizeBytes: number;      // e.g. 29779520
  minSdk: string;            // e.g. "Android 8.0 (API 26)"
  targetSdk: string;         // e.g. "Android 14 (API 34)"
  sha256?: string;           // Checksum for security
  releaseNotes: {
    ar: string;
    en: string;
  };
  downloadsCount: number;
  releasedAt: string;        // ISO date
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
    telegram?: string;
    whatsapp?: string;
  };
  stats: {
    totalApps: number;
    totalDownloads: number;
    happyUsers: string;
    yearsOfExperience: number;
  };
}

export interface DownloadLog {
  id: string;
  appId: string;
  versionId: string;
  timestamp: string;
  ipHash: string;
  userAgent?: string;
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

export interface SiteSettings {
  siteLogoUrl: string;
  siteTitleAr: string;
  siteTitleEn: string;
  taglineAr: string;
  taglineEn: string;
  directDownloadEnabled: boolean;
}

export interface DatabaseSchema {
  admin: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
  };
  developer: DeveloperProfile;
  categories: CategoryItem[];
  apps: AppItem[];
  downloads: DownloadLog[];
  messages: ContactMessage[];
  settings: SiteSettings;
}

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'backend', 'runtime_data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data and upload directories exist
export function initDataDirectories() {
  const dirs = [
    DATA_DIR,
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(process.cwd(), 'uploads', 'apk'),
    path.resolve(process.cwd(), 'uploads', 'images'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

}

// Start with an empty local store; production uses the FastAPI service.
function getInitialData(): DatabaseSchema {
  return {
    admin: { id: '', name: '', email: '', passwordHash: '' },
    developer: { name: { ar: '', en: '' }, title: { ar: '', en: '' }, bio: { ar: '', en: '' }, avatarUrl: '', email: '', phone: '', location: { ar: '', en: '' }, experienceYears: 0, skills: [], social: { github: '', linkedin: '', googlePlay: '', twitter: '' }, stats: { totalApps: 0, totalDownloads: 0, happyUsers: '0', yearsOfExperience: 0 } },
    categories: [], apps: [], downloads: [], messages: [], settings: { siteLogoUrl: '', siteTitleAr: '', siteTitleEn: '', taglineAr: '', taglineEn: '', directDownloadEnabled: true },
  };
}
// Database Read/Write Helpers with file locking
export function getDb(): DatabaseSchema {
  initDataDirectories();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    saveDb(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.settings) {
      parsed.settings = {
        siteLogoUrl: '/logo.svg',
        siteTitleAr: 'المهندس معاذ الشاذلي',
        siteTitleEn: 'Eng. Moaz El Shazly',
        taglineAr: 'المنصة الرسمية لتطبيقات أندرويد',
        taglineEn: 'Android Applications Showcase & APK Hub',
        directDownloadEnabled: true,
      };
      saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    throw new Error(`Persistent JSON database could not be read: ${String(err)}`);
  }
}

export function saveDb(data: DatabaseSchema): void {
  initDataDirectories();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}
