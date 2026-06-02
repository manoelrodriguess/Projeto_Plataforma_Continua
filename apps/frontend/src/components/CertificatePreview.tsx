import { Award } from 'lucide-react';
import { type Course } from '@/lib/learning';
import { currentUser } from '@/lib/learning';

export function CertificatePreview({ course, competencies, compact = false }: { course: Course; competencies: string[]; compact?: boolean }) {
  return (
    <div className={`relative min-w-0 overflow-hidden bg-white ${compact ? 'p-2' : 'p-4'}`}>
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#17C7B2] to-[#1464E9]" />
      <div className={`min-w-0 rounded-md border border-[#d5dce5] bg-gradient-to-br from-white to-[#f3fbff] ${compact ? 'p-2.5 sm:p-3' : 'p-4'}`}>
        <div className={`${compact ? 'mb-2' : 'mb-3'} flex items-center justify-between gap-3`}>
          <div className="min-w-0 text-left">
            <p className="bg-gradient-to-r from-[#17C7B2] to-[#1464E9] bg-clip-text text-sm font-bold text-transparent">InnovaGov</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Certificado</p>
          </div>
          <Award size={compact ? 22 : 28} className="shrink-0 text-[#1464E9]" />
        </div>
        <div className={`${compact ? 'py-2' : 'py-3'} border-y border-[#d5dce5] text-center`}>
          <p className="text-[10px] font-semibold uppercase text-gray-500">Concedido a</p>
          <p className={`${compact ? 'text-base' : 'text-lg'} break-words font-bold text-gray-900`}>{currentUser.name}</p>
          <p className={`${compact ? 'mt-1' : 'mt-2'} break-words text-xs font-medium leading-snug text-gray-700`}>{course.title}</p>
        </div>
        <div className={`${compact ? 'mt-2' : 'mt-3'} flex flex-wrap gap-1.5`}>
          {competencies.slice(0, compact ? 2 : 3).map((competency) => (
            <span key={competency} className="max-w-full break-words rounded-full bg-[#eef8ff] px-2 py-0.5 text-[10px] font-semibold text-[#173DB7]">
              {competency}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
