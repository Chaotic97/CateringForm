import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface StepContainerProps {
  stepKey: number;
  children: ReactNode;
}

export function StepContainer({ stepKey, children }: StepContainerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
