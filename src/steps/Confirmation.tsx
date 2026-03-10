import { motion, type Easing } from 'framer-motion';
import { useFormStore } from '../store/useFormStore';
import { Button } from '../components/ui/Button';

const easeOut: Easing = [0.0, 0.0, 0.2, 1.0];

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.6, ease: easeOut, delay: 0.2 },
  },
};

const circleVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export function Confirmation() {
  const { cateringType, buyoutData, togoData, reset } = useFormStore();

  const isBuyout = cateringType === 'buyout';
  const date = isBuyout ? buyoutData.eventDate : togoData.preferredPickupDate;
  const headcount = isBuyout ? buyoutData.headcount : togoData.headcount;
  const typeLabel = isBuyout ? 'Restaurant Buyout' : 'To-Go Catering';

  return (
    <div className="flex flex-col items-center px-4 py-16 text-center">
      <motion.div
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
        variants={circleVariants}
        initial="hidden"
        animate="visible"
      >
        <svg
          className="h-12 w-12 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            variants={checkVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-main">
          Thank you!
        </h1>
        <p className="font-body text-muted max-w-md">
          We've received your inquiry and will be in touch within 24 hours.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 w-full max-w-sm rounded-xl border border-border bg-surface/50 p-5"
      >
        <h3 className="font-heading text-sm font-semibold text-text-main mb-3 uppercase tracking-wide">
          Your Submission
        </h3>
        <div className="flex flex-col gap-2 font-body text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Type</span>
            <span className="text-text-main font-medium">{typeLabel}</span>
          </div>
          {date && (
            <div className="flex justify-between">
              <span className="text-muted">{isBuyout ? 'Event Date' : 'Pickup Date'}</span>
              <span className="text-text-main font-medium">{date}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">{isBuyout ? 'Guests' : 'Headcount'}</span>
            <span className="text-text-main font-medium">{headcount}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8"
      >
        <Button type="button" variant="secondary" size="lg" onClick={reset}>
          Start New Inquiry
        </Button>
      </motion.div>
    </div>
  );
}
