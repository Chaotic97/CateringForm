import { motion } from 'framer-motion';
import { useFormStore } from '../store/useFormStore';
import { useSiteSettings } from '../hooks/useSiteSettings';
import type { CateringType } from '../types/form';

export function Welcome() {
  const setCateringType = useFormStore((s) => s.setCateringType);
  const { buyoutDescription, togoDescription, generalDescription } = useSiteSettings();

  const cards: {
    type: CateringType;
    icon: string;
    title: string;
    description: string;
  }[] = [
    {
      type: 'buyout',
      icon: '\u{1F3DB}\uFE0F',
      title: 'Restaurant Buyout',
      description: buyoutDescription,
    },
    {
      type: 'togo',
      icon: '\u{1F961}',
      title: 'To-Go Catering',
      description: togoDescription,
    },
  ];

  const contactCard = {
    type: 'general' as CateringType,
    icon: '\u{1F4AC}',
    title: 'Contact Our Team',
    description: generalDescription,
  };

  return (
    <div className="flex flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-text-main mb-3">
          Plan Your Event
        </h1>
        <p className="font-body text-lg text-muted max-w-lg mx-auto">
          Tell us about your occasion and we'll help bring it to life.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 w-full max-w-2xl">
        {cards.map((card, i) => (
          <motion.button
            key={card.type}
            type="button"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCateringType(card.type)}
            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface p-8 text-center transition-colors duration-150 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer"
          >
            <span className="text-5xl" role="img" aria-hidden="true">
              {card.icon}
            </span>
            <h2 className="font-heading text-xl font-semibold text-text-main">
              {card.title}
            </h2>
            <p className="font-body text-sm text-muted leading-relaxed">
              {card.description}
            </p>
          </motion.button>
        ))}
      </div>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCateringType(contactCard.type)}
        className="mt-6 flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-surface p-8 text-center transition-colors duration-150 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer w-full max-w-2xl"
      >
        <span className="text-5xl" role="img" aria-hidden="true">
          {contactCard.icon}
        </span>
        <h2 className="font-heading text-xl font-semibold text-text-main">
          {contactCard.title}
        </h2>
        <p className="font-body text-sm text-muted leading-relaxed">
          {contactCard.description}
        </p>
      </motion.button>
    </div>
  );
}
