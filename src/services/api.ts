import {
  AppItem,
  AppVersion,
  CategoryItem,
  DeveloperProfile,
  AnalyticsData,
  RealtimeAnalyticsData,
  ContactMessage,
  AdminUser,
  SiteSettings,
  SuggestionItem,
} from '../types/index.ts';

// Configurable API base URL for FastAPI backend.
// In production or cross-origin deployment, configure VITE_API_URL (e.g. https://api.yourdomain.com).
// Development can use relative paths; production defaults to the configured FastAPI service.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://moaz-elshazly.fastapicloud.dev' : '')).replace(/\/+$/, '');

export function getAssetUrl(url?: string): string {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_BASE_URL}${url}`;
  if (url.startsWith('/')) return `${import.meta.env.BASE_URL}${url.slice(1)}`;
  return url;
}
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('moaz_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // APPS
  async getApps(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    sort?: string;
    status?: string;
  }): Promise<AppItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.featured) searchParams.append('featured', 'true');
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.status) searchParams.append('status', params.status);

    const res = await fetch(getApiUrl(`/api/apps?${searchParams.toString()}`), {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch apps');
    return res.json();
  },

  async getApp(slugOrId: string): Promise<{ app: AppItem; related: AppItem[] }> {
    const res = await fetch(getApiUrl(`/api/apps/${slugOrId}`));
    if (!res.ok) throw new Error('Failed to fetch app details');
    return res.json();
  },

  async createApp(data: Partial<AppItem> & {
    initialApkUrl?: string;
    initialVersionName?: string;
    initialVersionCode?: number;
    initialApkFileName?: string;
    initialApkSize?: string;
    initialSha256?: string;
  }): Promise<AppItem> {
    const res = await fetch(getApiUrl('/api/apps'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to create app');
    }
    return res.json();
  },

  async updateApp(id: string, data: Partial<AppItem>): Promise<AppItem> {
    const res = await fetch(getApiUrl(`/api/apps/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to update app');
    }
    return res.json();
  },

  async deleteApp(id: string): Promise<boolean> {
    const res = await fetch(getApiUrl(`/api/apps/${id}`), {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete app');
    return true;
  },

  // VERSIONS
  async addVersion(appId: string, versionData: Partial<AppVersion>): Promise<AppVersion> {
    const res = await fetch(getApiUrl(`/api/apps/${appId}/versions`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(versionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to add version');
    }
    return res.json();
  },

  async deleteVersion(appId: string, versionId: string): Promise<boolean> {
    const res = await fetch(getApiUrl(`/api/apps/${appId}/versions/${versionId}`), {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete version');
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<CategoryItem[]> {
    const res = await fetch(getApiUrl('/api/categories'));
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetch(getApiUrl('/api/categories'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to update category');
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(getApiUrl(`/api/categories/${id}`), {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  },

  // FILE UPLOADS
  async uploadApk(file: File): Promise<{
    apkUrl: string;
    apkFileName: string;
    apkSize: string;
    apkSizeBytes: number;
    sha256: string;
  }> {
    const formData = new FormData();
    formData.append('apk', file);

    const res = await fetch(getApiUrl('/api/upload/apk'), {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to upload APK file');
    }
    const result = await res.json();
    return { ...result, apkUrl: getAssetUrl(result.apkUrl) };
  },

  async uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(getApiUrl('/api/upload/image'), {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to upload image');
    }
    const result = await res.json();
    return { ...result, imageUrl: getAssetUrl(result.imageUrl) };
  },

  // DEVELOPER PROFILE
  async getDeveloper(): Promise<DeveloperProfile> {
    const res = await fetch(getApiUrl('/api/developer'));
    if (!res.ok) throw new Error('Failed to fetch developer profile');
    return res.json();
  },

  async updateDeveloper(data: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    const res = await fetch(getApiUrl('/api/developer'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update developer profile');
    const out = await res.json();
    return out.developer;
  },

  // ANALYTICS
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(getApiUrl('/api/analytics'), {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getRealtimeAnalytics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<RealtimeAnalyticsData> {
    const res = await fetch(getApiUrl(`/api/analytics/realtime?timeframe=${timeframe}`), {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch real-time analytics');
    return res.json();
  },

  // DOWNLOAD INFO TRIGGER
  async trackDownload(appId: string, versionId?: string): Promise<{
    success: boolean;
    downloadUrl: string;
    fileName: string;
    size: string;
    sha256?: string;
  }> {
    const endpoint = versionId
      ? `/api/apps/${appId}/download/${versionId}?json=true`
      : `/api/apps/${appId}/download?json=true`;

    const res = await fetch(getApiUrl(endpoint));
    if (!res.ok) throw new Error('Failed to initiate download');
    const result = await res.json();
    return { ...result, downloadUrl: getAssetUrl(result.downloadUrl) };
  },

  // AUTH
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Invalid email or password');
    }
    return res.json();
  },

  async updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; user: AdminUser }> {
    const res = await fetch(getApiUrl('/api/auth/profile'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || 'Failed to update admin profile');
    }
    return res.json();
  },

  // CONTACT
  async sendMessage(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const res = await fetch(getApiUrl('/api/contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
  },

  async getMessages(): Promise<ContactMessage[]> {
    const res = await fetch(getApiUrl('/api/contact'), {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async updateMessageStatus(id: string, status: string): Promise<void> {
    const res = await fetch(getApiUrl(`/api/contact/${id}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
  },

  async deleteMessage(id: string): Promise<void> {
    const res = await fetch(getApiUrl(`/api/contact/${id}`), {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete message');
  },

  // PUBLIC SUGGESTIONS
  async submitSuggestion(data: Record<string, string>): Promise<void> {
    const res = await fetch(getApiUrl('/api/suggestions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || 'تعذر إرسال الاقتراح');
    }
  },

  async getSuggestions(): Promise<SuggestionItem[]> {
    const res = await fetch(getApiUrl('/api/suggestions'), { headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to fetch suggestions');
    return res.json();
  },

  async updateSuggestion(id: string, status: SuggestionItem['status']): Promise<void> {
    const res = await fetch(getApiUrl(`/api/suggestions/${id}`), { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error('Failed to update suggestion');
  },

  async deleteSuggestion(id: string): Promise<void> {
    const res = await fetch(getApiUrl(`/api/suggestions/${id}`), { method: 'DELETE', headers: { ...getAuthHeader() } });
    if (!res.ok) throw new Error('Failed to delete suggestion');
  },
  // SITE SETTINGS
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(getApiUrl('/api/settings'));
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch(getApiUrl('/api/settings'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update site settings');
    const out = await res.json();
    return out.settings;
  },
};
