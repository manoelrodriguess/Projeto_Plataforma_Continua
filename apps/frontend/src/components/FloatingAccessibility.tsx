import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function FloatingAccessibility() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-3 z-[60] flex items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 24, scaleX: 0.82 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            exit={{ opacity: 0, x: 24, scaleX: 0.82 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="h-12 origin-right overflow-hidden rounded-lg shadow-lg sm:h-14"
            aria-label="Acessível com VLibras"
            role="img"
          >
            <img
              src="/vlibras-popup.svg"
              alt="Acessível com VLibras"
              className="h-full w-auto object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="h-12 w-12 overflow-hidden rounded-lg shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#9bd4ff] focus:ring-offset-2 sm:h-12 sm:w-12"
        aria-label={open ? 'Ocultar Acessível com VLibras' : 'Mostrar Acessível com VLibras'}
        aria-expanded={open}
      >
        <img
          src="/vlibras-access-button.svg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </button>
    </div>
  );
}
