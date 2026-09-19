import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';

export const ScrollControls: React.FC = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const unsubscribeScroll = scrollY.on('change', (latest) => {
      setShowScrollTop(latest > 350);
    });

    const unsubscribeProgress = scrollYProgress.on('change', (latest) => {
      setScrollPercent(Math.round(latest * 100));
    });

    return () => {
      unsubscribeScroll();
      unsubscribeProgress();
    };
  }, [scrollY, scrollYProgress]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Circular progress math (radius = 18, circumference = 2 * pi * 18 ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <>
      {/* Top Page Scroll Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[70] h-[2.5px] bg-neutral-900/60 pointer-events-none">
        <motion.div
          style={{ scaleX }}
          className="h-full bg-gradient-to-r from-neutral-400 via-white to-neutral-200 origin-left shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        />
      </div>

      {/* Floating Back to Top Button with Circular Progress Gauge */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={scrollToTop}
              title="Back to Top"
              className="group relative w-12 h-12 rounded-full bg-[#090a0d]/90 backdrop-blur-xl border border-neutral-700/80 hover:border-white/80 shadow-2xl flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              {/* Circular SVG Gauge */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-neutral-800/80"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-white transition-all duration-150"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              {/* Center Arrow Icon with subtle hover lift */}
              <ArrowUp className="w-4 h-4 text-white relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />

              {/* Hover Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-700 text-[10px] font-mono uppercase tracking-wider text-neutral-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                Top • {scrollPercent}%
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
