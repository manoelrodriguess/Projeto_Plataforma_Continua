import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Download,
  Hand,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Settings,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  clampPercent,
  courseCompetencies,
  courses,
  currentUser,
  defaultDiagnostic,
  demoProgress,
  legacyStorageKeys,
  recommendedTrailLimit,
  scoreCourseRecommendation,
  storageKeys,
  type AttemptsState,
  type Course,
  type DashboardStats,
  type DiagnosticAnswers,
  type ProgressState,
} from '@/lib/learning';

type Page = 'dashboard' | 'diagnostic' | 'trail' | 'courses' | 'courseIntro' | 'lesson' | 'progress' | 'manager' | 'certificates' | 'profile' | 'settings' | 'help';

const cardSurface = 'border border-[#d5dce5] shadow-[0_8px_24px_rgba(15,23,42,0.06)]';
const interactiveCard = `${cardSurface} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]`;
const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

function LoadingDot() {
  return <span className="h-2 w-2 animate-pulse rounded-full bg-current" />;
}

function readStorage<T>(key: string, fallback: T, legacyKey?: string): T {
  try {
    const value = window.localStorage.getItem(key) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
      return;
    }

    if (line) lines.push(line);
    line = word;
  });

  if (line) lines.push(line);
  return lines;
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg', quality = 0.95) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error('Não foi possível gerar a imagem do certificado.'));
    }, type, quality);
  });
}

function createPdfFromJpeg(image: Uint8Array, width: number, height: number) {
  const encoder = new TextEncoder();
  const chunks: (string | Uint8Array)[] = [];
  const offsets: number[] = [];
  let length = 0;

  const add = (chunk: string | Uint8Array) => {
    chunks.push(chunk);
    length += typeof chunk === 'string' ? encoder.encode(chunk).length : chunk.byteLength;
  };

  const addObject = (body: string | Uint8Array, prefix: string, suffix = '\nendobj\n') => {
    offsets.push(length);
    add(prefix);
    add(body);
    add(suffix);
  };

  const pageWidth = 842;
  const pageHeight = 595;
  const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ`;

  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  addObject('<< /Type /Catalog /Pages 2 0 R >>', '1 0 obj\n');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '2 0 obj\n');
  addObject(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    '3 0 obj\n',
  );
  addObject(
    image,
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.byteLength} >>\nstream\n`,
    '\nendstream\nendobj\n',
  );
  addObject(content, `5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n`, '\nendstream\nendobj\n');

  const xrefOffset = length;
  add(`xref\n0 6\n0000000000 65535 f \n${offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\n`);
  add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks, { type: 'application/pdf' });
}

async function createCertificatePdf(course: Course, competencies: string[]) {
  const width = 1684;
  const height = 1190;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível preparar o certificado.');
  }

  const issueDate = new Date().toLocaleDateString('pt-BR');
  const certificateCode = `INN-${course.id}-100-${Date.now().toString().slice(-6)}`;
  const totalMinutes = course.modules.reduce((sum, module) => sum + module.time, 0);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#17C7B2');
  gradient.addColorStop(1, '#1464E9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 24);
  ctx.fillRect(0, height - 24, width, 24);

  ctx.strokeStyle = '#d5dce5';
  ctx.lineWidth = 4;
  ctx.strokeRect(74, 74, width - 148, height - 148);
  ctx.strokeStyle = '#1464E9';
  ctx.lineWidth = 2;
  ctx.strokeRect(104, 104, width - 208, height - 208);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#111827';
  ctx.font = '700 44px Arial';
  ctx.fillText('InnovaGov', width / 2, 178);

  ctx.fillStyle = '#1464E9';
  ctx.font = '700 72px Arial';
  ctx.fillText('CERTIFICADO', width / 2, 290);

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 30px Arial';
  ctx.fillText('Certificamos que', width / 2, 390);

  ctx.fillStyle = '#111827';
  ctx.font = '700 54px Arial';
  ctx.fillText(currentUser.name, width / 2, 475);

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 30px Arial';
  ctx.fillText('concluiu com êxito o curso', width / 2, 548);

  ctx.fillStyle = '#111827';
  ctx.font = '700 44px Arial';
  wrapCanvasText(ctx, course.title, 1160).forEach((line, index) => {
    ctx.fillText(line, width / 2, 625 + index * 52);
  });

  ctx.fillStyle = '#4b5563';
  ctx.font = '400 26px Arial';
  ctx.fillText(`Carga horária: ${totalMinutes} minutos   •   Nível: ${course.level}`, width / 2, 760);

  ctx.fillStyle = '#1464E9';
  ctx.font = '700 28px Arial';
  ctx.fillText('Competências desenvolvidas', width / 2, 835);

  ctx.fillStyle = '#374151';
  ctx.font = '400 25px Arial';
  wrapCanvasText(ctx, competencies.join(' • '), 1120).slice(0, 2).forEach((line, index) => {
    ctx.fillText(line, width / 2, 885 + index * 34);
  });

  ctx.fillStyle = '#6b7280';
  ctx.font = '400 23px Arial';
  ctx.fillText(`Data de emissão: ${issueDate}`, width / 2, 1010);
  ctx.font = '700 23px Arial';
  ctx.fillText(`Código: ${certificateCode}`, width / 2, 1050);

  const imageBlob = await canvasToBlob(canvas);
  const image = new Uint8Array(await imageBlob.arrayBuffer());
  return createPdfFromJpeg(image, width, height);
}

function readProgressStorage() {
  const savedProgress = readStorage<ProgressState>(storageKeys.progress, demoProgress, legacyStorageKeys.progress);
  const completedCount = Object.values(savedProgress).reduce((total, modules) => total + modules.length, 0);
  return completedCount > 0 ? savedProgress : demoProgress;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(courses[0].id);
  const [currentModule, setCurrentModule] = useState(0);
  const [courseIntroBackPage, setCourseIntroBackPage] = useState<Page>('courses');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [downloadingCourseId, setDownloadingCourseId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [compactMode, setCompactMode] = useState(() => readStorage<boolean>(storageKeys.theme, false, legacyStorageKeys.theme));
  const [progress, setProgress] = useState<ProgressState>(() => readProgressStorage());
  const [attempts, setAttempts] = useState<AttemptsState>(() => readStorage<AttemptsState>(storageKeys.attempts, {}, legacyStorageKeys.attempts));
  const [diagnostic, setDiagnostic] = useState<DiagnosticAnswers>(() => readStorage<DiagnosticAnswers>(storageKeys.diagnostic, defaultDiagnostic, legacyStorageKeys.diagnostic));

  useEffect(() => {
    window.localStorage.setItem(storageKeys.progress, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.attempts, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.theme, JSON.stringify(compactMode));
  }, [compactMode]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.diagnostic, JSON.stringify(diagnostic));
  }, [diagnostic]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const syncSidebar = () => {
      setIsDesktop(media.matches);
      setSidebarOpen(media.matches);
    };

    syncSidebar();
    media.addEventListener('change', syncSidebar);
    return () => media.removeEventListener('change', syncSidebar);
  }, []);

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];
  const currentLesson = selectedCourse.modules[currentModule] ?? selectedCourse.modules[0];
  const completedModules = progress[selectedCourse.id] ?? [];
  const currentAttemptKey = `${selectedCourse.id}-${currentLesson.id}`;

  const courseProgress = (course: Course) => {
    const completed = progress[course.id]?.length ?? 0;
    return clampPercent((completed / course.modules.length) * 100);
  };

  const stats = useMemo(() => {
    const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
    const completedCount = courses.reduce((total, course) => total + (progress[course.id]?.length ?? 0), 0);
    const totalMinutes = courses.reduce(
      (total, course) =>
        total + course.modules.filter((module) => progress[course.id]?.includes(module.id)).reduce((sum, module) => sum + module.time, 0),
      0,
    );
    const completedCourses = courses.filter((course) => courseProgress(course) === 100).length;
    const developedCompetencies = new Set(
      courses.flatMap((course) => (progress[course.id]?.length ? courseCompetencies[course.id] ?? [] : [])),
    ).size;

    return {
      overall: clampPercent((completedCount / totalModules) * 100),
      completedModules: completedCount,
      totalMinutes,
      studyHours: Math.max(1, Math.ceil(totalMinutes / 60)),
      activeCourses: courses.filter((course) => courseProgress(course) > 0 && courseProgress(course) < 100).length,
      completedCourses,
      developedCompetencies,
      estimatedHoursSaved: completedCount * 2 + completedCourses * 6,
    };
  }, [progress]);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setShowProfileMenu(false);
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const openCourseIntro = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCourseIntroBackPage(currentPage);
    navigate('courseIntro');
  };

  const startCourse = (courseId: number) => {
    const course = courses.find((item) => item.id === courseId) ?? courses[0];
    const completed = progress[course.id] ?? [];
    const nextIndex = Math.min(completed.length, course.modules.length - 1);
    setSelectedCourseId(course.id);
    setCurrentModule(nextIndex);
    setSelectedAnswer(null);
    setAnswered(false);
    navigate('lesson');
  };

  const resetQuizState = (moduleIndex: number) => {
    setCurrentModule(moduleIndex);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    setAttempts((current) => ({
      ...current,
      [currentAttemptKey]: (current[currentAttemptKey] ?? 0) + 1,
    }));

    if (selectedAnswer === currentLesson.correct) {
      setProgress((current) => {
        const completed = new Set(current[selectedCourse.id] ?? []);
        completed.add(currentLesson.id);
        return { ...current, [selectedCourse.id]: Array.from(completed).sort((a, b) => a - b) };
      });
    }
  };

  const retryQuestion = () => {
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const nextModule = () => {
    if (currentModule < selectedCourse.modules.length - 1) {
      resetQuizState(currentModule + 1);
      return;
    }

    setShowCompletion(true);
  };

  const resetProgress = () => {
    setProgress(demoProgress);
    setAttempts({});
    setDiagnostic(defaultDiagnostic);
    setSelectedCourseId(courses[0].id);
    resetQuizState(0);
    navigate('dashboard');
  };

  const downloadCertificate = async (course: Course) => {
    if (downloadingCourseId !== null) return;
    setDownloadingCourseId(course.id);
    const competencies = courseCompetencies[course.id] ?? [];
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      const blob = await createCertificatePdf(course, competencies);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${slugify(course.title)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingCourseId(null);
    }
  };

  const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diagnostic', label: 'Diagnóstico', icon: Check },
    { id: 'trail', label: 'Minhas Trilhas', icon: Rocket },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'progress', label: 'Progresso', icon: BarChart3 },
    { id: 'certificates', label: 'Certificados', icon: Award },
  ];

  const completedCourseList = courses.filter((course) => courseProgress(course) === 100);
  const recommendedCourses = [...courses].sort((a, b) => {
    const scoreDifference = scoreCourseRecommendation(b.id, diagnostic) - scoreCourseRecommendation(a.id, diagnostic);
    return scoreDifference || a.id - b.id;
  });
  const scoredRecommendedCourses = recommendedCourses
    .filter((course) => scoreCourseRecommendation(course.id, diagnostic) > 0)
    .slice(0, recommendedTrailLimit);
  const recommendedTrailCourses = scoredRecommendedCourses.length > 0
    ? scoredRecommendedCourses
    : recommendedCourses.slice(0, recommendedTrailLimit);
  const continueCourses = courses.filter((course) => {
    const progress = courseProgress(course);
    return progress > 0 && progress < 100;
  }).slice(0, 4);
  const primaryCourse = continueCourses[0] ?? recommendedTrailCourses[0] ?? recommendedCourses[0];
  const primaryProgress = courseProgress(primaryCourse);
  const primaryCompletedModules = progress[primaryCourse.id]?.length ?? 0;
  const primaryNextModule = primaryCourse.modules[Math.min(primaryCompletedModules, primaryCourse.modules.length - 1)];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white via-[#eef8ff] to-[#d9efff] flex flex-col ${compactMode ? 'text-sm' : ''}`}>
      <header className="bg-white border-b border-[#d9efff] shadow-sm sticky top-0 z-40">
        <div className="flex min-h-20 items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button type="button" onClick={() => navigate('dashboard')} className="truncate bg-gradient-to-r from-[#17C7B2] to-[#1464E9] bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              InnovaGov
            </button>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setShowProfileMenu((open) => !open)} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-[#008AF4] to-[#173DB7] rounded-full flex items-center justify-center text-white font-bold">{currentUser.initials}</div>
              <span className="text-gray-700 font-medium hidden sm:block">{currentUser.name}</span>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-[#d9efff] overflow-hidden z-50">
                <button type="button" onClick={() => navigate('profile')} className="w-full text-left px-4 py-3 hover:bg-[#eef8ff] flex items-center gap-2 text-gray-700 transition-colors">
                  <User size={18} /> Meu Perfil
                </button>
                <button type="button" onClick={() => navigate('settings')} className="w-full text-left px-4 py-3 hover:bg-[#eef8ff] flex items-center gap-2 text-gray-700 transition-colors">
                  <Settings size={18} /> Configurações
                </button>
                <button type="button" onClick={resetProgress} className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors">
                  <LogOut size={18} /> Restaurar demonstração
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && !isDesktop && (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-20 z-20 bg-black/30 backdrop-blur-[2px] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          />
        )}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-20 z-30 h-[calc(100vh-80px)] w-[min(18rem,86vw)] overflow-y-auto border-r border-[#d9efff] bg-white text-gray-900 shadow-lg transition-transform duration-300 lg:w-72`}>
          <div className="p-6">
            <nav className="space-y-2 mb-12">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                      currentPage === item.id ? 'bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white shadow-lg' : 'text-gray-700 hover:bg-[#eef8ff] hover:text-[#008AF4]'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="bg-gradient-to-br from-[#eef8ff] to-[#d9efff] rounded-lg p-4 mb-8 border border-[#bfe3ff]">
              <p className="text-[#008AF4] text-xs font-semibold mb-3">SEU PROGRESSO</p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">Geral</span>
                    <span className="font-bold text-[#008AF4]">{stats.overall}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all duration-300" style={{ width: `${stats.overall}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-center gap-2"><BookMarked size={16} /> {stats.completedCourses} certificados</p>
                  <p className="flex items-center gap-2"><Clock size={16} /> {stats.studyHours} horas</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#bfe3ff] pt-4">
              <button type="button" onClick={() => navigate('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#eef8ff] transition-all">
                <Settings size={18} />
                <span>Configurações</span>
              </button>
              <button type="button" onClick={() => navigate('help')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-[#eef8ff] transition-all">
                <HelpCircle size={18} />
                <span>Ajuda</span>
              </button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen && isDesktop ? 'lg:ml-72' : 'ml-0'}`}>
          {currentPage === 'dashboard' && (
            <div className="relative p-3 sm:p-5">
              <div className="relative mb-4 sm:mb-8">
                <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900 sm:mb-2 sm:gap-3 sm:text-5xl">Bem-vindo de volta! <Hand className="h-7 w-7 text-[#008AF4] sm:h-10 sm:w-10" /></h2>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-xl">Retome sua capacitação pelo ponto mais importante agora.</p>
                <div className="absolute right-0 -top-5 z-20 hidden xl:block">
                  <MascotTip title="Nina recomenda" compact className="max-w-xs">
                    O primeiro card mostra o melhor próximo passo para você não precisar procurar onde parou.
                  </MascotTip>
                </div>
              </div>

              <Card className="mb-4 overflow-hidden border border-[#d5dce5] bg-white/85 py-0 shadow-sm sm:mb-8 sm:py-6">
                <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
                  <div className="p-4 sm:p-7">
                    <div className="mb-3 grid grid-cols-[1fr_auto] items-start gap-3 sm:mb-5 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-[#008AF4] sm:text-sm">
                          {primaryProgress > 0 ? 'Continue de onde parou' : 'Próximo passo recomendado'}
                        </p>
                        <h3 className="mt-1 line-clamp-1 text-xl font-bold text-gray-900 sm:mt-2 sm:line-clamp-none sm:text-3xl">{primaryCourse.title}</h3>
                        <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-gray-600 sm:mt-2 sm:line-clamp-none sm:text-base">{primaryCourse.description}</p>
                      </div>
                      <div className="rounded-lg border border-[#bfe3ff] bg-[#f3fbff] px-3 py-2 text-left sm:px-4 sm:py-3 sm:text-right">
                        <p className="text-xs font-bold uppercase text-[#008AF4]">Progresso</p>
                        <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{primaryProgress}%</p>
                      </div>
                    </div>

                    <div className="mb-3 rounded-lg border border-[#bfe3ff] bg-[#f3fbff] p-3 sm:mb-5 sm:p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#008AF4] sm:text-sm">Próximo módulo</p>
                          <p className="mt-1 line-clamp-1 text-base font-bold text-gray-900 sm:text-lg">{primaryNextModule.title}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 sm:gap-2 sm:text-sm">
                            <Clock size={14} className="text-[#008AF4] sm:h-4 sm:w-4" />
                            {primaryNextModule.time} minutos · {primaryCourse.level}
                          </p>
                        </div>
                        <Button type="button" onClick={() => openCourseIntro(primaryCourse.id)} className="shrink-0 bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-3 text-xs text-white sm:px-4 sm:text-sm">
                          <span className="sm:hidden">{primaryProgress > 0 ? 'Continuar' : 'Começar'}</span>
                          <span className="hidden sm:inline">{primaryProgress > 0 ? 'Continuar agora' : 'Começar agora'}</span>
                          <ChevronRight size={14} className="sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 sm:h-3">
                      <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all duration-300" style={{ width: `${primaryProgress}%` }} />
                    </div>
                  </div>

                  <div className="border-t border-[#bfe3ff] bg-white p-4 sm:p-7 lg:border-l lg:border-t-0">
                    <p className="text-xs font-bold uppercase text-[#008AF4] sm:text-sm">Resumo rápido</p>
                    <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-lg border border-[#bfe3ff] bg-white sm:mt-5 sm:grid-cols-2">
                      {[
                        { label: 'Geral', value: `${stats.overall}%`, icon: BarChart3 },
                        { label: 'Horas', value: `${stats.studyHours}h`, icon: Clock },
                        { label: 'Ativos', value: String(stats.activeCourses), icon: Users },
                        { label: 'Certificados', value: String(stats.completedCourses), icon: Award },
                      ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                          <div key={stat.label} className="border-[#d9efff] p-2 [&:not(:last-child)]:border-r sm:p-4 sm:odd:border-r sm:[&:nth-child(-n+2)]:border-b sm:[&:nth-child(2n)]:border-r-0">
                            <Icon size={16} className="mb-1 text-[#008AF4] sm:mb-2 sm:h-[18px] sm:w-[18px]" />
                            <p className="text-xs font-semibold text-gray-600">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-900 sm:text-2xl">{stat.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
                <DashboardDiagnostic
                  onStart={() => navigate('diagnostic')}
                />







                <Card className={`bg-white/70 backdrop-blur-sm ${interactiveCard} p-4 md:p-6`}>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#008AF4] to-[#173DB7] rounded-lg flex items-center justify-center mb-3 md:mb-4 text-white">
                    <Rocket size={22} className="md:h-6 md:w-6" />
                  </div>
                  <p className="mb-2 text-xs font-medium text-gray-600 md:text-sm">Trilha Recomendada</p>
                  <p className="line-clamp-2 text-base font-bold leading-tight text-gray-900 md:line-clamp-1 md:text-xl">{recommendedCourses[0].title}</p>
                  <div className="mt-4 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
                    <span className="text-xs font-bold text-[#008AF4] md:text-sm">{courseProgress(recommendedCourses[0])}% concluído</span>
                    <Button type="button" onClick={() => navigate('trail')} variant="outline" className="w-full px-2 py-2 text-xs md:w-auto md:px-3 md:text-sm">
                      Ver trilhas
                    </Button>
                  </div>
                </Card>

                <Card className={`bg-white/70 backdrop-blur-sm ${interactiveCard} p-4 md:p-6`}>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#008AF4] to-[#173DB7] rounded-lg flex items-center justify-center mb-3 md:mb-4 text-white">
                    <BarChart3 size={22} className="md:h-6 md:w-6" />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-[#008AF4] mb-1">IMPACTO MENSURÁVEL</p>
                  <h3 className="mb-3 text-base font-bold leading-tight text-gray-900 md:mb-4 md:text-2xl">Resultado rápido</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{stats.estimatedHoursSaved}h</p>
                  <p className="mt-2 text-xs text-gray-600 md:text-sm">{stats.completedModules} checkpoints concluídos</p>
                  <div className="hidden">
                    <ImpactRow label="Checkpoints concluídos" value={String(stats.completedModules)} />
                    <ImpactRow label="Competências desenvolvidas" value={String(stats.developedCompetencies)} />
                    <ImpactRow label="Horas economizadas estimadas" value={`${stats.estimatedHoursSaved}h`} />
                  </div>
                </Card>
              </div>

              <div className="hidden">
                <Card className="lg:col-span-3 bg-white/75 border border-[#d5dce5] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-[#008AF4] mb-1">TRILHA RECOMENDADA</p>
                      <h3 className="text-2xl font-bold text-gray-900">Modernização Administrativa para {currentUser.name}</h3>
                      <p className="text-gray-600 mt-2">Baseada no diagnóstico: {diagnostic.pain}</p>
                    </div>
                    <Button type="button" onClick={() => navigate('trail')} variant="outline">Ver trilhas</Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {recommendedCourses.slice(0, 3).map((course, index) => (
                      <button key={course.id} type="button" onClick={() => openCourseIntro(course.id)} className="rounded-lg border border-[#bfe3ff] bg-[#f3fbff] p-4 text-left hover:border-[#008AF4] transition-colors">
                        <p className="text-xs font-bold text-[#008AF4] mb-2">Etapa {index + 1}</p>
                        <p className="font-bold text-gray-900">{course.title}</p>
                        <p className="text-sm text-gray-600 mt-2">{courseProgress(course)}% concluído</p>
                      </button>
                    ))}
                  </div>
                </Card>                
              </div>

              {continueCourses.length > 1 && (
                <CourseGrid title="Outros cursos em andamento" courses={continueCourses.slice(1)} progressFor={courseProgress} onStart={openCourseIntro} />
              )}
            </div>
          )}

          {currentPage === 'courses' && (
            <div className="p-4 sm:p-8">
              <CourseGrid title="Todos os Cursos" courses={courses} progressFor={courseProgress} onStart={openCourseIntro} largeTitle />
            </div>
          )}

          {currentPage === 'courseIntro' && (
            <CourseIntroPage
              course={selectedCourse}
              progress={courseProgress(selectedCourse)}
              completedModules={completedModules}
              competencies={courseCompetencies[selectedCourse.id] ?? []}
              onBack={() => navigate(courseIntroBackPage === 'courseIntro' || courseIntroBackPage === 'lesson' ? 'courses' : courseIntroBackPage)}
              onStart={() => startCourse(selectedCourse.id)}
            />
          )}

          {currentPage === 'diagnostic' && (
            <DiagnosticPage
              diagnostic={diagnostic}
              onChange={setDiagnostic}
              onFinish={() => navigate('trail')}
            />
          )}

          {currentPage === 'trail' && (
            <TrailPage
              diagnostic={diagnostic}
              courses={recommendedTrailCourses}
              progressFor={courseProgress}
              onStart={openCourseIntro}
              onRetake={() => navigate('diagnostic')}
            />
          )}

          {currentPage === 'lesson' && (
            <div className="relative p-5">
              <button type="button" onClick={() => navigate('courses')} className="mb-4 text-[#008AF4] hover:text-[#173DB7] font-medium flex items-center gap-2 transition-colors">
                ← Voltar aos Cursos
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <Card className="relative overflow-visible bg-white/85 backdrop-blur-sm border border-[#d5dce5] p-5 mb-5">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Módulo {currentModule + 1}: {currentLesson.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-[#bfe3ff]">
                      <span className="flex items-center gap-2"><Clock className="text-[#008AF4]" size={16} /> {currentLesson.time} minutos</span>
                      <span className="flex items-center gap-2"><BarChart3 className="text-[#1464E9]" size={16} /> Nível: {selectedCourse.level}</span>
                      <span className="flex items-center gap-2"><Check className="text-[#008AF4]" size={16} /> Com checkpoint</span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-700 leading-relaxed">
                      {currentLesson.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      <div className="grid sm:grid-cols-3 gap-2 pt-1">
                        {currentLesson.highlights.map((highlight) => (
                          <div key={highlight} className="rounded-lg border border-[#bfe3ff] bg-[#f3fbff] px-3 py-2 text-sm font-medium text-[#173DB7]">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative overflow-visible bg-gradient-to-br from-[#eef8ff] to-[#eef8ff] border-2 border-[#bfe3ff] rounded-lg p-4 mt-4">
                      <h3 className="text-base font-bold text-[#173DB7] mb-3 flex items-center gap-2">
                        <Check size={20} className="text-[#008AF4]" /> Checkpoint de Conhecimento
                      </h3>
                      <p className="font-semibold text-gray-900 mb-3">{currentLesson.question}</p>

                      <div className="space-y-2 mb-4">
                        {currentLesson.options.map((option, idx) => {
                          const isSelected = selectedAnswer === idx;
                          const isCorrect = idx === currentLesson.correct;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => !answered && setSelectedAnswer(idx)}
                              className={`w-full px-3 py-2.5 text-left rounded-lg border-2 transition-all font-medium flex items-center gap-3 ${
                                isSelected
                                  ? answered
                                    ? isCorrect
                                      ? 'border-[#008AF4] bg-[#eef8ff] text-[#173DB7]'
                                      : 'border-red-500 bg-red-50 text-red-900'
                                    : 'border-[#008AF4] bg-[#eef8ff] text-[#173DB7]'
                                  : answered && isCorrect
                                    ? 'border-[#008AF4] bg-[#eef8ff] text-[#173DB7]'
                                    : 'border-gray-300 bg-white text-gray-900 hover:border-[#173DB7] hover:bg-[#eef8ff]'
                              }`}
                              disabled={answered}
                            >
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? answered
                                    ? isCorrect
                                      ? 'border-[#008AF4] bg-[#008AF4]'
                                      : 'border-red-500 bg-red-500'
                                    : 'border-[#008AF4] bg-[#008AF4]'
                                  : answered && isCorrect
                                    ? 'border-[#008AF4] bg-[#008AF4]'
                                    : 'border-gray-400'
                              }`}>
                                {(isSelected || (answered && isCorrect)) && <Check size={16} className="text-white" />}
                              </span>
                              <span>{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div className={`p-3 rounded-lg mb-4 flex gap-3 text-sm ${
                          selectedAnswer === currentLesson.correct ? 'bg-[#eef8ff] border border-[#9bd4ff] text-[#173DB7]' : 'bg-red-100 border border-red-300 text-red-900'
                        }`}>
                          <div className="flex-shrink-0 mt-1">{selectedAnswer === currentLesson.correct ? <Check size={20} /> : <X size={20} />}</div>
                          <div>
                            <p className="font-semibold mb-1">{selectedAnswer === currentLesson.correct ? 'Correto!' : 'Ainda não. Tente novamente para liberar o próximo módulo.'}</p>
                            <p>{currentLesson.explanation}</p>
                            <p className="text-xs mt-1">Tentativas neste checkpoint: {attempts[currentAttemptKey] ?? 0}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="button" onClick={() => navigate('courses')} variant="outline" className="flex-1">Cancelar</Button>
                        {!answered && (
                          <Button type="button" onClick={submitAnswer} disabled={selectedAnswer === null} className="flex-1 bg-gradient-to-r from-[#008AF4] to-[#173DB7] hover:from-[#173DB7] hover:to-[#173DB7] text-white">
                            Verificar Resposta
                          </Button>
                        )}
                        {answered && selectedAnswer !== currentLesson.correct && (
                          <Button type="button" onClick={retryQuestion} className="flex-1 bg-gradient-to-r from-[#008AF4] to-[#173DB7] hover:from-[#173DB7] hover:to-[#173DB7] text-white">
                            Tentar Novamente
                          </Button>
                        )}
                        {answered && selectedAnswer === currentLesson.correct && (
                          <Button type="button" onClick={nextModule} className="flex-1 bg-gradient-to-r from-[#008AF4] to-[#173DB7] hover:from-[#173DB7] hover:to-[#173DB7] text-white">
                            {currentModule < selectedCourse.modules.length - 1 ? 'Próximo Módulo →' : 'Concluir Curso'}
                          </Button>
                        )}
                      </div>
                    </div>

                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="bg-white/85 backdrop-blur-sm border border-[#d5dce5] p-5 sticky top-24">
                    <MascotTip title="Dica da Nina" compact className="mb-4 max-w-none">
                      Leia os destaques e responda com calma. Se errar, eu mostro o caminho para tentar de novo.
                    </MascotTip>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><BookOpen size={22} className="text-[#008AF4]" /> Módulos</h4>
                    <div className="space-y-2">
                      {selectedCourse.modules.map((module, idx) => {
                        const isCompleted = completedModules.includes(module.id);
                        const isUnlocked = idx === 0 || completedModules.includes(selectedCourse.modules[idx - 1].id);
                        return (
                          <button
                            key={module.id}
                            type="button"
                            onClick={() => isUnlocked && resetQuizState(idx)}
                            className={`w-full text-left p-3 rounded-lg transition-all font-medium text-sm ${
                              currentModule === idx
                                ? 'bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white shadow-lg'
                                : isCompleted
                                  ? 'bg-[#eef8ff] text-[#173DB7] border border-[#9bd4ff] hover:bg-[#d9efff]'
                                  : isUnlocked
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-gray-50 text-gray-400'
                            }`}
                            disabled={!isUnlocked}
                          >
                            <span className="flex items-start gap-2">
                              <span className="mt-1">{isCompleted ? <Check size={18} /> : currentModule === idx ? <span className="inline-block w-2 h-2 bg-current rounded-full mt-1.5" /> : idx + 1}</span>
                              <span>{module.title}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'progress' && (
            <div className="p-4 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12">Seu Progresso</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 mb-8 md:mb-12">
                {[
                  { label: 'Horas Totais', value: `${stats.studyHours}h`, icon: Clock },
                  { label: 'Módulos Completos', value: String(stats.completedModules), icon: Check },
                  { label: 'Cursos Concluídos', value: String(stats.completedCourses), icon: Award },
                  { label: 'Checkpoints', value: String(stats.completedModules), icon: BookMarked },
                  { label: 'Competências', value: String(stats.developedCompetencies), icon: Sparkles },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.label} className="bg-white/70 backdrop-blur-sm border border-[#d5dce5] p-4 md:p-6">
                      <div className="flex min-h-20 flex-col items-start justify-between gap-3 md:min-h-0 md:flex-row md:items-center md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#173DB7] to-[#008AF4] rounded-lg flex items-center justify-center text-white"><Icon size={22} className="md:h-6 md:w-6" /></div>
                        <div>
                          <p className="text-gray-600 text-sm">{stat.label}</p>
                          <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-white/70 backdrop-blur-sm border border-[#d5dce5] p-4 md:p-8">
                <h3 className="mb-4 text-xl font-bold text-gray-900 md:mb-6 md:text-2xl">Detalhamento por Curso</h3>
                <div className="grid grid-cols-1 gap-3 md:block md:space-y-6">
                  {courses.map((course) => (
                    <div key={course.id} className="rounded-lg border border-[#bfe3ff] bg-white/80 p-3 md:rounded-none md:border-0 md:border-b md:bg-transparent md:p-0 md:pb-6 md:last:border-b-0">
                      <div className="mb-3 flex flex-col items-start gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
                        <h4 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900 md:line-clamp-none md:text-base">{course.title}</h4>
                        <div className="flex w-full flex-col items-start gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                          <span className="text-sm font-bold text-[#008AF4] md:text-base">{courseProgress(course)}%</span>
                          <Button type="button" variant="outline" size="sm" onClick={() => openCourseIntro(course.id)} className="w-full px-2 text-xs md:w-auto md:text-sm">
                            {courseProgress(course) === 0 ? 'Começar' : 'Continuar'}
                          </Button>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 md:h-3">
                        <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all" style={{ width: `${courseProgress(course)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {currentPage === 'certificates' && (
            <div className="p-4 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 md:mb-12">Seus Certificados</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {completedCourseList.length === 0 && (
                  <Card className="bg-white/70 border border-[#d5dce5] p-6 text-center md:p-8 sm:col-span-2 lg:col-span-3">
                    <Trophy size={56} className="text-[#1464E9] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum certificado liberado ainda</h3>
                    <p className="text-gray-600 mb-6">Conclua todos os módulos de um curso para baixar seu certificado.</p>
                    <Button type="button" onClick={() => navigate('courses')} className="bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">Ver Cursos</Button>
                  </Card>
                )}
                {completedCourseList.map((course) => (
                  <motion.div key={course.id} {...pageMotion}>
                    <Card className={`bg-white/75 backdrop-blur-sm ${interactiveCard} overflow-hidden py-0`}>
                      <CertificatePreview course={course} competencies={courseCompetencies[course.id] ?? []} />
                      <div className="p-4 text-center md:p-6">
                        <p className="mb-1 text-xs text-gray-600 md:mb-2 md:text-base">Status</p>
                        <p className="mb-3 font-bold text-gray-900 md:mb-4">Concluído</p>
                        <p className="text-xs text-gray-500 font-mono mb-3 md:mb-4">INN-{course.id}-100</p>
                        <Button type="button" onClick={() => downloadCertificate(course)} disabled={downloadingCourseId !== null} className="w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-2 text-xs text-white md:text-sm">
                          {downloadingCourseId === course.id ? (
                            <>
                              <LoadingDot /> Gerando PDF...
                            </>
                          ) : (
                            <>
                              <Download size={16} /> Baixar PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {currentPage === 'manager' && (
            <ManagerPage
              stats={stats}
              courses={courses}
              progressFor={courseProgress}
            />
          )}

          {currentPage === 'profile' && (
            <SimplePage
              title="Meu Perfil"
              icon={User}
              body={`Perfil ativo para ${currentUser.name}. Seus cursos, tentativas de quiz e certificados ficam salvos neste navegador.`}
              actionLabel="Ver progresso"
              onAction={() => navigate('progress')}
            />
          )}

          {currentPage === 'settings' && (
            <div className="p-4 sm:p-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Configurações</h2>
              <Card className="bg-white/70 border border-[#d5dce5] p-8 max-w-2xl">
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Modo compacto</h3>
                    <p className="text-gray-600">Reduz levemente a escala dos textos para telas menores.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCompactMode((value) => !value)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${compactMode ? 'bg-[#008AF4]' : 'bg-gray-300'}`}
                    aria-pressed={compactMode}
                  >
                    <span className={`block w-6 h-6 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={resetProgress}>Restaurar progresso de demonstração</Button>
              </Card>
            </div>
          )}

          {currentPage === 'help' && (
            <SimplePage
              title="Ajuda"
              icon={HelpCircle}
              body="Para avançar, leia o módulo, responda o checkpoint corretamente e use o botão de próximo módulo. Certificados aparecem automaticamente quando um curso chega a 100%."
              actionLabel="Ir para cursos"
              onAction={() => navigate('courses')}
            />
          )}
        </main>
      </div>

      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-white max-w-md w-full border border-[#d5dce5] p-8 text-center animate-in zoom-in-50 duration-300">
            <div className="mb-6 flex justify-center">
              <MascotAvatar size="lg" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Parabéns!</h3>
            <p className="text-gray-600 mb-8 text-lg">Você completou o curso {selectedCourse.title}. O certificado já está disponível.</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#eef8ff] to-[#d9efff] rounded-lg p-4">
                <p className="text-2xl font-bold text-[#008AF4]">100%</p>
                <p className="text-xs text-[#173DB7] font-medium">Progresso</p>
              </div>
              <div className="bg-gradient-to-br from-[#eef8ff] to-[#d9efff] rounded-lg p-4">
                <p className="text-2xl font-bold text-[#008AF4]">{selectedCourse.modules.length}/{selectedCourse.modules.length}</p>
                <p className="text-xs text-[#173DB7] font-medium">Módulos</p>
              </div>
              <div className="bg-gradient-to-br from-[#eef8ff] to-[#d9efff] rounded-lg p-4 flex flex-col items-center">
                <Clock size={24} className="text-[#008AF4] mb-2" />
                <p className="text-2xl font-bold text-[#008AF4]">{selectedCourse.modules.reduce((sum, module) => sum + module.time, 0)}m</p>
                <p className="text-xs text-[#173DB7] font-medium">Tempo</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="overflow-hidden rounded-lg border border-[#d5dce5]">
                <CertificatePreview course={selectedCourse} competencies={courseCompetencies[selectedCourse.id] ?? []} compact />
              </div>
              <Button type="button" onClick={() => downloadCertificate(selectedCourse)} disabled={downloadingCourseId !== null} className="w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] hover:from-[#173DB7] hover:to-[#173DB7] text-white font-bold py-3">
                {downloadingCourseId === selectedCourse.id ? (
                  <>
                    <LoadingDot /> Gerando PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Baixar PDF
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowCompletion(false); navigate('courses'); }} className="w-full">
                Voltar aos Cursos
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#d9efff] pb-3 last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-xl font-bold text-[#008AF4]">{value}</span>
    </div>
  );
}

function CertificatePreview({ course, competencies, compact = false }: { course: Course; competencies: string[]; compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#17C7B2] to-[#1464E9]" />
      <div className={`rounded-md border border-[#d5dce5] bg-gradient-to-br from-white to-[#f3fbff] ${compact ? 'p-3' : 'p-4'}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="bg-gradient-to-r from-[#17C7B2] to-[#1464E9] bg-clip-text text-sm font-bold text-transparent">InnovaGov</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Certificado</p>
          </div>
          <Award size={compact ? 22 : 28} className="text-[#1464E9]" />
        </div>
        <div className="border-y border-[#d5dce5] py-3 text-center">
          <p className="text-[10px] font-semibold uppercase text-gray-500">Concedido a</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>{currentUser.name}</p>
          <p className="mt-2 text-xs font-medium leading-snug text-gray-700">{course.title}</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {competencies.slice(0, compact ? 2 : 3).map((competency) => (
            <span key={competency} className="rounded-full bg-[#eef8ff] px-2 py-0.5 text-[10px] font-semibold text-[#173DB7]">
              {competency}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MascotAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <img
      src="/innovagov-mascot.png"
      alt=""
      aria-hidden="true"
      className={`${dimensions[size]} shrink-0 object-contain drop-shadow-md`}
    />
  );
}

function MascotTip({
  title,
  children,
  compact = false,
  className = '',
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div
      {...pageMotion}
      className={`pointer-events-auto relative flex items-center ${compact ? 'gap-3 rounded-lg p-3 pr-9 shadow-md' : 'gap-4 rounded-lg p-4 pr-10 shadow-xl'} border border-[#bfe3ff] bg-white/95 backdrop-blur ${className}`}
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Fechar dica"
      >
        <X size={14} />
      </button>
      <MascotAvatar size={compact ? 'sm' : 'md'} />
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </motion.div>
  );
}

function DashboardDiagnostic({ onStart }: { onStart: () => void }) {
  return (
    <Card className={`bg-white/70 backdrop-blur-sm ${interactiveCard} p-4 md:p-6`}>
      <div className="flex h-full flex-col justify-between gap-3 md:gap-4">
        <div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#008AF4] to-[#173DB7] rounded-lg flex items-center justify-center mb-3 md:mb-4 text-white">
            <Check size={22} className="md:h-6 md:w-6" />
          </div>
          <p className="text-xs md:text-sm font-semibold text-[#008AF4] mb-1">DIAGNÓSTICO</p>
          <h3 className="text-base md:text-xl font-bold leading-tight text-gray-900">Descubra a trilha ideal</h3>
          <p className="hidden">
            Acesse o diagnóstico inicial, responda quatro pontos sobre sua rotina e veja as trilhas recomendadas para o seu perfil.
          </p>
        </div>
        <div className="hidden">
          <div className="rounded-lg border border-[#bfe3ff] bg-[#f3fbff] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#008AF4] text-white">
                <Check size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Diagnóstico completo</p>
                <p className="text-sm text-gray-600">Base para ordenar as trilhas recomendadas.</p>
              </div>
            </div>
          </div>
          <Button type="button" onClick={onStart} className="bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">
            Fazer diagnóstico
            <ChevronRight size={16} />
          </Button>
        </div>
        <Button type="button" onClick={onStart} className="w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-2 text-xs text-white md:text-sm">
          Fazer diagnóstico
          <ChevronRight size={16} />
        </Button>
      </div>
    </Card>
  );
}

function CourseIntroPage({
  course,
  progress,
  completedModules,
  competencies,
  onBack,
  onStart,
}: {
  course: Course;
  progress: number;
  completedModules: number[];
  competencies: string[];
  onBack: () => void;
  onStart: () => void;
}) {
  const Icon = course.icon;
  const totalMinutes = course.modules.reduce((sum, module) => sum + module.time, 0);
  const nextModuleIndex = Math.min(completedModules.length, course.modules.length - 1);
  const nextModule = course.modules[nextModuleIndex];
  const completed = progress === 100;
  const learningOutcomes = Array.from(new Set(course.modules.flatMap((module) => module.highlights))).slice(0, 4);

  return (
    <div className="p-3 sm:p-5">
      <button type="button" onClick={onBack} className="mb-3 flex items-center gap-2 text-sm font-medium text-[#008AF4] transition-colors hover:text-[#173DB7]">
        ← Voltar
      </button>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
        <Card className="overflow-hidden border border-[#d5dce5] bg-white/80 py-0">
          <div className="bg-[#173DB7] p-4 text-white sm:p-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 sm:h-12 sm:w-12">
              <Icon size={26} />
            </div>
            <p className="text-xs font-semibold text-[#9bd4ff] sm:text-sm">{course.level}</p>
            <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-4xl">{course.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#d9efff] sm:text-base">{course.description}</p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-4 grid grid-cols-3 overflow-hidden rounded-lg border border-[#d5dce5] bg-white">
              <div className="border-r border-[#d5dce5] p-2.5 sm:p-3">
                <Clock size={16} className="mb-1 text-[#008AF4]" />
                <p className="text-lg font-bold text-gray-900">{totalMinutes}m</p>
                <p className="text-xs font-medium text-gray-600">Carga total</p>
              </div>
              <div className="border-r border-[#d5dce5] p-2.5 sm:p-3">
                <BookOpen size={16} className="mb-1 text-[#008AF4]" />
                <p className="text-lg font-bold text-gray-900">{course.modules.length}</p>
                <p className="text-xs font-medium text-gray-600">Módulos</p>
              </div>
              <div className="p-2.5 sm:p-3">
                <BarChart3 size={16} className="mb-1 text-[#008AF4]" />
                <p className="text-lg font-bold text-gray-900">{progress}%</p>
                <p className="text-xs font-medium text-gray-600">Progresso</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-sm font-semibold">
                <span className="text-gray-700">Andamento do curso</span>
                <span className="text-[#008AF4]">{completedModules.length}/{course.modules.length}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-[#d5dce5] bg-white/85 p-3.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold uppercase text-[#008AF4]">O que você vai aprender</p>
                <span className="hidden h-px flex-1 bg-[#d5dce5] sm:block" />
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {learningOutcomes.map((outcome) => (
                  <li key={outcome} className="flex min-h-10 items-center gap-2 rounded-lg bg-[#f3fbff] px-3 py-2 text-sm font-medium text-gray-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#17C7B2] shadow-sm">
                      <Check size={14} />
                    </span>
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">Conteúdo do curso</h3>
              <div className="space-y-2">
                {course.modules.map((module, index) => {
                  const moduleDone = completedModules.includes(module.id);
                  const isNext = !completed && index === nextModuleIndex;
                  return (
                    <div key={module.id} className={`rounded-lg border p-3 ${isNext ? 'border-[#9bd4ff] bg-[#f3fbff]' : 'border-[#d5dce5] bg-white/80'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${moduleDone ? 'bg-[#17C7B2] text-white' : isNext ? 'bg-[#008AF4] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {moduleDone ? <Check size={14} /> : index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 sm:text-base">{module.title}</p>
                            {isNext && <span className="rounded-full bg-[#eef8ff] px-2 py-0.5 text-xs font-bold text-[#008AF4]">Próximo</span>}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{module.time} minutos • {module.highlights.slice(0, 2).join(' • ')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="border border-[#d5dce5] bg-white/80 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase text-[#008AF4] sm:text-sm">{completed ? 'Curso concluído' : progress > 0 ? 'Continue por aqui' : 'Comece por aqui'}</p>
            <h3 className="mt-1.5 text-xl font-bold text-gray-900 sm:text-2xl">{completed ? 'Certificado liberado' : nextModule.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {completed
                ? 'Você concluiu todos os módulos deste curso. Pode revisar o conteúdo quando quiser.'
                : `Próximo módulo de ${nextModule.time} minutos para avançar na trilha.`}
            </p>
            <Button type="button" onClick={onStart} className="mt-4 w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">
              {completed ? 'Revisar curso' : progress > 0 ? 'Continuar curso' : 'Iniciar curso'}
              <ChevronRight size={16} />
            </Button>
          </Card>

          <Card className="border border-[#d5dce5] bg-white/80 p-4 sm:p-5">
            <h3 className="mb-3 text-lg font-bold text-gray-900">Competências</h3>
            <div className="flex flex-wrap gap-2">
              {competencies.map((competency) => (
                <span key={competency} className="rounded-full border border-[#bfe3ff] bg-[#f3fbff] px-3 py-1.5 text-sm font-semibold text-[#173DB7]">
                  {competency}
                </span>
              ))}
            </div>
          </Card>

          <MascotTip title="Dica da Nina" compact className="max-w-none">
            Veja a sequência antes de começar e retome pelo próximo módulo quando voltar.
          </MascotTip>
        </div>
      </div>
    </div>
  );
}

function DiagnosticPage({
  diagnostic,
  onChange,
  onFinish,
}: {
  diagnostic: DiagnosticAnswers;
  onChange: (answers: DiagnosticAnswers) => void;
  onFinish: () => void;
}) {
  const questions: { key: keyof DiagnosticAnswers; title: string; options: string[] }[] = [
    {
      key: 'pain',
      title: 'Qual é sua maior dificuldade hoje?',
      options: [
        'Tenho pouco tempo e preciso de aulas objetivas.',
        'Os cursos são teóricos e pouco aplicáveis.',
        'Tenho insegurança com ferramentas digitais.',
        'Tenho dificuldade para transformar dados em decisões.',
        'Quero melhorar o atendimento e a comunicação com o cidadão.',
      ],
    },
    {
      key: 'time',
      title: 'Quanto tempo você consegue estudar?',
      options: ['1 hora por semana', '2 horas por semana', '4 horas por semana'],
    },
    {
      key: 'area',
      title: 'Qual área você quer desenvolver primeiro?',
      options: ['Modernização administrativa', 'Atendimento ao cidadão', 'Transformação Digital', 'Dados e indicadores', 'Projetos e entregas públicas'],
    },
    {
      key: 'format',
      title: 'Qual formato funciona melhor para você?',
      options: ['Conteúdo curto com prática guiada', 'Trilhas com certificação', 'Material objetivo para consulta rápida'],
    },
  ];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<keyof DiagnosticAnswers>>(() => new Set());
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = diagnostic[currentQuestion.key];
  const currentQuestionAnswered = answeredQuestions.has(currentQuestion.key);
  const progress = clampPercent(((currentQuestionIndex + 1) / questions.length) * 100);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((index) => index + 1);
      return;
    }

    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="relative p-4 sm:p-8">
        <div className="mx-auto max-w-3xl">
      <Card className="bg-white/80 border border-[#d5dce5] p-5 text-center shadow-sm sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef8ff] text-[#008AF4] sm:mb-5 sm:h-16 sm:w-16">
              <Check size={28} className="sm:h-[34px] sm:w-[34px]" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#008AF4]">Diagnóstico completo</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-4xl">Sua trilha personalizada está pronta</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:mt-4 sm:text-lg">
              Organizamos os cursos de acordo com suas respostas. Agora o servidor pode seguir direto para as trilhas recomendadas.
            </p>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
              {questions.map((question) => (
                <div key={question.key} className="rounded-lg border border-[#bfe3ff] bg-[#f3fbff] p-3">
                  <p className="text-xs font-bold uppercase text-[#008AF4]">{question.title}</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{diagnostic[question.key]}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center">
              <Button type="button" onClick={() => { setCurrentQuestionIndex(0); setCompleted(false); }} variant="outline">
                Revisar respostas
              </Button>
              <Button type="button" onClick={onFinish} className="bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">
                Ir para trilhas recomendadas
                <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-4 sm:p-8">
      <div className="mb-5 sm:mb-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-4xl">Diagnóstico Inicial</h2>
        <p className="text-sm leading-relaxed text-gray-600 sm:text-lg">Responda uma pergunta por vez para gerar uma trilha personalizada para o servidor.</p>
      </div>

      <div className="mx-auto mb-5 hidden max-w-3xl xl:flex">
        <MascotTip title="Dica da Nina">
          Responda pensando na sua rotina atual. Você pode refazer o diagnóstico depois e atualizar as trilhas recomendadas.
        </MascotTip>
      </div>

      <Card className="mx-auto max-w-3xl bg-white/75 border border-[#d5dce5] p-4 sm:p-6">
        <div className="mb-5 sm:mb-6">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold sm:mb-3 sm:text-sm">
            <span className="text-[#008AF4]">Pergunta {currentQuestionIndex + 1} de {questions.length}</span>
            <span className="text-gray-500">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h3 className="mb-4 text-xl font-bold leading-tight text-gray-900 sm:mb-5 sm:text-2xl">{currentQuestion.title}</h3>
        <div className="space-y-2 sm:space-y-3">
          {currentQuestion.options.map((option) => {
            const selected = currentQuestionAnswered && selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange({ ...diagnostic, [currentQuestion.key]: option });
                  setAnsweredQuestions((current) => new Set(current).add(currentQuestion.key));
                }}
                className={`w-full rounded-lg border-2 p-3 text-left text-sm font-medium leading-snug transition-colors sm:p-4 sm:text-base ${
                  selected ? 'border-[#008AF4] bg-[#eef8ff] text-[#173DB7]' : 'border-gray-200 bg-white text-gray-700 hover:border-[#008AF4]'
                }`}
              >
                <span className="flex items-center gap-2.5 sm:gap-3">
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 sm:h-5 sm:w-5 ${selected ? 'border-[#008AF4] bg-[#008AF4]' : 'border-gray-300'}`}>
                    {selected && <Check size={14} className="text-white" />}
                  </span>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:justify-between sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentQuestionIndex((index) => Math.max(0, index - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Pergunta anterior
          </Button>
          <Button type="button" onClick={goToNextQuestion} disabled={!currentQuestionAnswered} className="bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima pergunta' : 'Finalizar diagnóstico'}
            <ChevronRight size={16} />
          </Button>
        </div>
      </Card>

      <div className="mx-auto mt-4 grid max-w-3xl grid-cols-4 gap-2 sm:mt-5">
        {questions.map((question, index) => (
          <button
            key={question.key}
            type="button"
            onClick={() => setCurrentQuestionIndex(index)}
            className={`h-2 rounded-full transition-colors ${
              index === currentQuestionIndex || answeredQuestions.has(question.key) ? 'bg-[#008AF4]' : 'bg-gray-200'
            }`}
            aria-label={`Ir para pergunta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TrailPage({
  diagnostic,
  courses,
  progressFor,
  onStart,
  onRetake,
}: {
  diagnostic: DiagnosticAnswers;
  courses: Course[];
  progressFor: (course: Course) => number;
  onStart: (courseId: number) => void;
  onRetake: () => void;
}) {
  return (
    <div className="relative p-4 sm:p-8">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Minhas Trilhas</h2>
          <p className="text-lg text-gray-600">Percurso sugerido para estudar no ritmo do servidor e aplicar no trabalho.</p>
        </div>       
      </div>


      <div className="absolute right-8 top-4 z-20 hidden max-w-md xl:flex">
        <MascotTip title="Por que essa ordem?">
          A Nina usa suas respostas do diagnóstico para priorizar os temas mais adequados ao seu perfil. Caso queira mudar a recomendação, refaça o diagnóstico!
        </MascotTip>
      </div>

      <div className="grid grid-cols-1 gap-3 md:block md:space-y-4">
        {courses.map((course, index) => {
          const Icon = course.icon;
          const progress = progressFor(course);
          return (
            <motion.div key={course.id} {...pageMotion}>
            <Card className={`bg-white/75 ${interactiveCard} p-4 md:p-6`}>
              <div className="flex h-full flex-col justify-between gap-4 md:h-auto md:flex-row md:flex-wrap md:items-center md:gap-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#008AF4] to-[#173DB7] text-white md:h-12 md:w-12">
                    <Icon size={22} className="md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#008AF4] md:text-sm">Etapa {index + 1}</p>
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight text-gray-900 md:line-clamp-none md:text-xl">{course.title}</h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-600 md:line-clamp-none md:text-base">{course.description}</p>
                  </div>
                </div>
                <div className="min-w-0 md:min-w-48">
                  <div className="mb-2 flex justify-between text-xs font-semibold md:text-sm">
                    <span>Progresso</span>
                    <span className="text-[#008AF4]">{progress}%</span>
                  </div>
                  <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200 md:mb-4">
                    <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9]" style={{ width: `${progress}%` }} />
                  </div>
                  <Button type="button" onClick={() => onStart(course.id)} className="w-full bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-2 text-xs text-white md:text-sm">
                    <span className="md:hidden">{progress > 0 ? 'Continuar' : 'Iniciar'}</span>
                    <span className="hidden md:inline">{progress > 0 ? 'Continuar etapa' : 'Iniciar etapa'}</span>
                  </Button>
                </div>
              </div>
            </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ManagerPage({
  stats,
  courses,
  progressFor,
}: {
  stats: DashboardStats;
  courses: Course[];
  progressFor: (course: Course) => number;
}) {
  const averageProgress = clampPercent(courses.reduce((sum, course) => sum + progressFor(course), 0) / courses.length);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Dashboard do Gestor</h2>
        <p className="text-lg text-gray-600">Visão institucional para acompanhar engajamento, desempenho e impacto da capacitação.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        {[
          { label: 'Servidores em capacitação', value: '128', icon: Users },
          { label: 'Progresso médio', value: `${averageProgress}%`, icon: BarChart3 },
          { label: 'Taxa de conclusão', value: `${stats.completedCourses}/${courses.length}`, icon: Award },
          { label: 'Checkpoints concluídos', value: String(stats.completedModules), icon: BookMarked },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="bg-white/75 border border-[#d5dce5] p-4 md:p-6">
              <Icon size={24} className="text-[#008AF4] mb-3 md:mb-4 md:h-7 md:w-7" />
              <p className="mb-2 text-xs text-gray-600 md:text-sm">{item.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">{item.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/75 border border-[#d5dce5] p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Cursos mais relevantes</h3>
          <div className="space-y-5">
            {courses.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>{course.title}</span>
                  <span className="text-[#008AF4]">{progressFor(course)}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9]" style={{ width: `${progressFor(course)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/75 border border-[#d5dce5] p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Competências em desenvolvimento</h3>
          <div className="flex flex-wrap gap-3">
            {Array.from(new Set(courses.flatMap((course) => courseCompetencies[course.id] ?? []))).map((competency) => (
              <span key={competency} className="rounded-full border border-[#bfe3ff] bg-[#f3fbff] px-4 py-2 text-sm font-semibold text-[#173DB7]">
                {competency}
              </span>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[#eef8ff] p-4">
              <p className="text-sm text-[#173DB7]">Impacto estimado</p>
              <p className="text-2xl font-bold text-[#008AF4]">{stats.estimatedHoursSaved}h economizadas</p>
            </div>
            <div className="rounded-lg bg-[#eef8ff] p-4">
              <p className="text-sm text-[#173DB7]">Módulos concluídos</p>
              <p className="text-2xl font-bold text-[#008AF4]">{stats.completedModules}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CourseGrid({
  title,
  courses,
  progressFor,
  onStart,
  largeTitle = false,
}: {
  title: string;
  courses: Course[];
  progressFor: (course: Course) => number;
  onStart: (courseId: number) => void;
  largeTitle?: boolean;
}) {
  return (
    <div>
      <h3 className={`${largeTitle ? 'text-3xl sm:text-4xl mb-8 md:mb-12' : 'text-2xl mb-6 md:mb-8'} font-bold text-gray-900 flex items-center gap-3`}>
        <span className="w-1 h-8 md:h-9 bg-gradient-to-b from-[#17C7B2] to-[#1464E9] rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {courses.map((course) => {
          const CourseIcon = course.icon;
          const progress = progressFor(course);
          return (
            <motion.div key={course.id} {...pageMotion}>
            <Card className={`bg-white/70 backdrop-blur-sm ${interactiveCard} overflow-hidden group py-0 md:py-6`}>
              <button type="button" onClick={() => onStart(course.id)} className="w-full text-left">
                <div className="bg-[#173DB7] p-3 text-white md:p-6">
                  <CourseIcon size={28} className="mb-2 text-white md:h-10 md:w-10" />
                  <h4 className="line-clamp-2 text-sm font-bold leading-tight md:line-clamp-none md:text-lg">{course.title}</h4>
                  <p className="text-xs text-[#9bd4ff] md:text-sm">{course.level}</p>
                </div>
                <div className="p-3 md:p-6">
                  <p className="mb-3 min-h-12 text-xs leading-relaxed text-gray-600 line-clamp-3 md:mb-4 md:line-clamp-none md:text-sm">{course.description}</p>
                  <div className="mb-3 md:mb-4">
                    <div className="flex justify-between items-center mb-1.5 md:mb-2">
                      <span className="text-xs font-medium text-gray-600">{course.modules.length} módulos</span>
                      <span className="text-xs font-bold text-[#008AF4]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#17C7B2] to-[#1464E9] transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <span className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-r from-[#008AF4] to-[#173DB7] px-2 py-2 text-xs font-medium text-white transition-all group-hover:shadow-lg md:px-4 md:text-sm">
                    {progress > 0 ? 'Continuar' : 'Começar'}
                    <ChevronRight size={14} className="ml-1.5 transition-transform group-hover:translate-x-1 md:ml-2 md:h-4 md:w-4" />
                  </span>
                </div>
              </button>
            </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function SimplePage({
  title,
  icon: Icon,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  icon: LucideIcon;
  body: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="p-4 sm:p-8">
      <Card className="bg-white/70 border border-[#d5dce5] p-8 max-w-2xl">
        <Icon size={48} className="text-[#008AF4] mb-4" />
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 text-lg mb-8">{body}</p>
        <Button type="button" onClick={onAction} className="bg-gradient-to-r from-[#008AF4] to-[#173DB7] text-white">
          {actionLabel}
        </Button>
      </Card>
    </div>
  );
}
