import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { DeveloperProfile } from '../types/index.ts';
import {
  UserCheck,
  Code,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  Play,
  Send,
  CheckCircle,
  Briefcase,
  Terminal,
} from 'lucide-react';

interface DeveloperSectionProps {
  developer: DeveloperProfile | null;
  onOpenContact: () => void;
}

export const DeveloperSection: React.FC<DeveloperSectionProps> = ({
  developer,
  onOpenContact,
}) => {
  const { language, t } = useLanguage();

  if (!developer) return null;

  return (
    <section id="developer" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
            <UserCheck className="w-4 h-4" />
            <span>{t('aboutDevTitle')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            {developer.name[language]}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            {developer.title[language]}
          </p>
        </div>

        {/* Developer Card & Skills Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Card & Bio */}
          <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500/30 shadow-lg shrink-0">
                <img
                  src={developer.avatarUrl}
                  alt={developer.name[language]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 end-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>

              <div className="text-center sm:text-start">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {developer.name[language]}
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-3">
                  +{developer.experienceYears} سنوات خبرة في هندسة تطبيقات Android
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{developer.location[language]}</span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">{developer.email}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
              {developer.bio[language]}
            </p>

            {/* Social & Contact Links */}
            <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800/80 mb-6">
              {developer.social.github && (
                <a
                  href={developer.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {developer.social.linkedin && (
                <a
                  href={developer.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {developer.social.googlePlay && (
                <a
                  href={developer.social.googlePlay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 transition-colors"
                  title="Google Play Developer Console"
                >
                  <Play className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Hire Me CTA Button */}
            <button
              onClick={onOpenContact}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('hireMe')}</span>
            </button>
          </div>

          {/* Right Column: Engineering Disciplines & Skill Progress */}
          <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/40">
            <div className="flex items-center gap-2.5 mb-6">
              <Terminal className="w-5 h-5 text-emerald-500" />
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white">
                {t('techStackTitle')}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              تطوير تطبيقات أندرويد أصلية (Native) وفق أفضل ممارسات Google الهندسية، مع معمارية Clean Architecture، وأنماط MVI/MVVM لضمان صيانة برمجية طويلة الأمد واختبارات آلية موثوقة.
            </p>

            {/* Skills List with Progress */}
            <div className="space-y-5">
              {developer.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-1.5">
                    <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-500" />
                      {skill.name}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Engineering Highlights Badges */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 text-center">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Offline-First
                </span>
                <span className="text-[10px] text-slate-400">Room & Local Cache</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 text-center">
                <CheckCircle className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Jetpack Compose
                </span>
                <span className="text-[10px] text-slate-400">Declarative UI</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 text-center">
                <CheckCircle className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  CI/CD Pipelines
                </span>
                <span className="text-[10px] text-slate-400">Automated Testing</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
