import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DeveloperProfile } from '../types/index.ts';
import { Logo } from './Logo.tsx';
import {
  Github,
  Linkedin,
  Play,
  Heart,
  ShieldCheck,
} from 'lucide-react';

interface FooterProps {
  developer: DeveloperProfile | null;
  onScrollToSection: (id: string) => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  customLogoUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({
  developer,
  onScrollToSection,
  onOpenContact,
  onOpenAdmin,
  customLogoUrl,
}) => {
  const { language, t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" customLogoUrl={customLogoUrl} />
              <div>
                <span className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {t('brandName')}
                </span>
                <p className="text-xs text-slate-400">
                  Senior Android Software Engineer
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              منصة رسمية متخصصة في نشر وتوزيع تطبيقات أندرويد مفتوحة المصدر وعالية الجودة والمبنية بأحدث تقنيات Jetpack Compose وKotlin Coroutines.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {developer?.social.github && (
                <a
                  href={developer.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:text-emerald-500 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {developer?.social.linkedin && (
                <a
                  href={developer.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:text-blue-500 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {developer?.social.googlePlay && (
                <a
                  href={developer.social.googlePlay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:text-emerald-500 transition-colors"
                >
                  <Play className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onScrollToSection('apps')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  {t('navApps')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('categories')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  {t('navCategories')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('developer')}
                  className="hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  {t('navDeveloper')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-emerald-500 transition-colors cursor-pointer"
                >
                  {t('navContact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              الأمان والإدارة
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>APK Signature Verified</span>
              </li>
              <li className="text-slate-400 text-xs">
                فحص مضاد للبرمجيات الخبيثة 100%
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  {t('navAdmin')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {t('brandName')} — جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-1">
            <span>تم التطوير بأحدث تقنيات أندرويد والويب الحديثة</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline mx-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};
