import { type ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MascotAvatar } from './MascotAvatar';

const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
};

export function MascotTip({
  title,
  children,
  compact = false,
  className = '',
  mobilePopup = false,
}: {
  title: string;
  children: ReactNode;
  compact?: boolean;
  className?: string;
  mobilePopup?: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!visible) return null;

  if (mobilePopup) {
    return (
      <div className={`pointer-events-auto z-30 block sm:hidden ${className || 'relative'}`}>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#bfe3ff] bg-white shadow-md transition-transform active:scale-95"
          aria-label={mobileOpen ? 'Ocultar dica da Nina' : 'Mostrar dica da Nina'}
          aria-expanded={mobileOpen}
        >
          <MascotAvatar size="xs" />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-11 w-[min(15rem,calc(100vw-2rem))] rounded-md border border-[#bfe3ff] bg-white/95 p-2.5 pr-8 text-left shadow-lg backdrop-blur"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-1.5 top-1.5 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Fechar dica"
              >
                <X size={13} />
              </button>
              <p className="text-xs font-bold leading-tight text-gray-900">{title}</p>
              <p className="mt-0.5 text-xs leading-snug text-gray-600">{children}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const tipClassName = `pointer-events-auto relative flex items-center ${compact ? 'gap-3 rounded-lg p-3 pr-9 shadow-md' : 'gap-4 rounded-lg p-4 pr-10 shadow-xl'} border border-[#bfe3ff] bg-white/95 backdrop-blur ${className}`;

  return (
    <motion.div
      {...pageMotion}
      className={tipClassName}
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-2 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="Fechar dica"
      >
        <X size={14} />
      </button>
      <MascotAvatar size={mobilePopup ? 'xs' : compact ? 'sm' : 'md'} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </motion.div>
  );
}
