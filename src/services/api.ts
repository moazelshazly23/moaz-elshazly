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
} from '../types/index.ts';

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

    const res = await fetch(`/api/apps?${searchParams.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch apps');
    return res.json();
  },

  async getApp(slugOrId: string): Promise<{ app: AppItem; related: AppItem[] }> {
    const res = await fetch(`/api/apps/${slugOrId}`);
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
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create app');
    }
    return res.json();
  },

  async updateApp(id: string, data: Partial<AppItem>): Promise<AppItem> {
    const res = await fetch(`/api/apps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update app');
    }
    return res.json();
  },

  async deleteApp(id: string): Promise<boolean> {
    const res = await fetch(`/api/apps/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete app');
    return true;
  },

  // VERSIONS
  async addVersion(appId: string, versionData: Partial<AppVersion>): Promise<AppVersion> {
    const res = await fetch(`/api/apps/${appId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(versionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add version');
    }
    return res.json();
  },

  async deleteVersion(appId: string, versionId: string): Promise<boolean> {
    const res = await fetch(`/api/apps/${appId}/versions/${versionId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete version');
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<CategoryItem[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const res = await fetch('/api/categories', {
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
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`/api/categories/${id}`, {
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

    const res = await fetch('/api/upload/apk', {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload APK file');
    }
    return res.json();
  },

  async uploadImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload image');
    }
    return res.json();
  },

  // DEVELOPER PROFILE
  async getDeveloper(): Promise<DeveloperProfile> {
    const res = await fetch('/api/developer');
    if (!res.ok) throw new Error('Failed to fetch developer profile');
    return res.json();
  },

  async updateDeveloper(data: Partial<DeveloperProfile>): Promise<DeveloperProfile> {
    const res = await fetch('/api/developer', {
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
    const res = await fetch('/api/analytics', {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getRealtimeAnalytics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<RealtimeAnalyticsData> {
    const res = await fetch(`/api/analytics/realtime?timeframe=${timeframe}`, {
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

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error('Failed to initiate download');
    return res.json();
  },

  // AUTH
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid email or password');
    }
    return res.json();
  },

  async updateProfile(data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; user: AdminUser }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update admin profile');
    }
    return res.json();
  },

  // CONTACT
  async sendMessage(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
  },

  async getMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/contact', {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async updateMessageStatus(id: string, status: string): Promise<void> {
    const res = await fetch(`/api/contact/${id}/status`, {
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
    const res = await fetch(`/api/contact/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete message');
  },

  // SITE SETTINGS
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch site settings');
    return res.json();
  },

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const res = await fetch('/api/settings', {
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
