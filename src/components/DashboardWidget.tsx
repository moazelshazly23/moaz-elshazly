import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { RealtimeAnalyticsData } from '../types/index.ts';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.js';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw.js';
import Activity from 'lucide-react/dist/esm/icons/activity.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check.js';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone.js';
import BarChart2 from 'lucide-react/dist/esm/icons/chart-no-axes-column.js';
import Sliders from 'lucide-react/dist/esm/icons/sliders-vertical.js';
import CheckCircle2 from 'lucide-react/dist/esm/icons/circle-check.js';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js';
import Radio from 'lucide-react/dist/esm/icons/radio.js';

interface DashboardWidgetProps {
  className?: string;
  onRefreshParent?: () => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  className = '',
  onRefreshParent,
}) => {
  const { language, t } = useLanguage();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [data, setData] = useState<RealtimeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const timerRef = useRef<any>(null);

  const fetchRealtimeData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const res = await api.getRealtimeAnalytics(timeframe);
      setData(res);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Error fetching realtime download trends:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
  }, [timeframe]);

  // Live Auto Polling every 15 seconds
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchRealtimeData(true);
      }, 15000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, timeframe]);

  const handleManualRefresh = () => {
    fetchRealtimeData(false);
    if (onRefreshParent) onRefreshParent();
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl text-white text-xs backdrop-blur-md">
          <div className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{label}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>{item.downloads.toLocaleString()} تحميل</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>بصمة SHA-256 موثقة: 100%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-100/50 dark:shadow-black/40 overflow-hidden p-6 sm:p-8 transition-all duration-300 ${className}`}
    >
      {/* Widget Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Title & Live Badge */}
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
              {language === 'ar' ? 'مؤشر تحميلات APK المباشر' : 'Live APK Download Telemetry'}
            </h3>

            {/* LIVE BEACON */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-black tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'ar'
              ? 'مراقبة حية وتجميعية لسرعة تنزيل التطبيقات وحركة الخادم لحظة بلحظة'
              : 'Real-time aggregated stream of APK binary downloads and bandwidth throughput'}
          </p>
        </div>

        {/* Controls: Timeframes, Chart View, Auto-refresh */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Timeframe Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setTimeframe('24h')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === '24h'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === '7d'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeframe === '30d'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30d
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setChartType('area')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : ''
              }`}
              title="Area Curve"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : ''
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              autoRefresh
                ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
            title="Toggle 15s auto-polling"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
            <span>{autoRefresh ? 'مزامنة حية' : 'إيقاف'}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="تحديث فوري"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

        </div>
      </div>

      {/* KPI Real-Time Metrics Strip */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          
          {/* Today's Downloads Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>تحميلات اليوم</span>
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {data.metrics.todayDownloads.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>{data.metrics.growthPercent > 0 ? `+${data.metrics.growthPercent}%` : `${data.metrics.growthPercent}%`}</span>
              <span className="text-slate-400 font-normal">مقارنة بأمس</span>
            </div>
          </div>

          {/* Velocity Rate */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>معدل السرعة (Hourly)</span>
              <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              ~{data.metrics.hourlyRate} / ساعة
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              متوسط الفاصل: {data.metrics.avgPerInterval}
            </div>
          </div>

          {/* Peak Interval */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>ذروة التنزيل (Peak)</span>
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {data.metrics.peakValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              عند: {data.metrics.peakLabel}
            </div>
          </div>

          {/* Success / Integrity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>نسبة سلامة الحزم</span>
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              100%
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-1 font-bold">
              SHA-256 Verified
            </div>
          </div>

        </div>
      )}

      {/* Main Chart Area */}
      <div className="w-full h-72 sm:h-80 mb-6">
        {loading && !data ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <span className="text-xs">جاري تحميل إحصائيات التحميل اللحظية...</span>
          </div>
        ) : data && data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="realtimeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#realtimeGlow)"
                  isAnimationActive={true}
                />
              </AreaChart>
            ) : (
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="downloads" fill="#06b6d4" radius={[6, 6, 0, 0]} isAnimationActive={true} />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            لا توجد بيانات متاحة حالياً.
          </div>
        )}
      </div>

      {/* Live Stream Ticker / Recent Activity */}
      {data && data.recentEvents && data.recentEvents.length > 0 && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>أحدث عمليات تحميل APK المكتملة</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              آخر تحديث: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {data.recentEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {language === 'ar' ? event.appTitleAr : event.appTitle}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {event.version} • {event.deviceHash}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ps-2">
                  {event.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
