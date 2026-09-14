import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionHeading({ title, subtitle, centered = true }: SectionHeadingProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={centered ? 'mb-12 text-center' : 'mb-12'}
    >
      <h2 className="font-serif text-3xl font-semibold text-memorial-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-gray-600">{subtitle}</p>}
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gold-400" />
    </motion.div>
  );
}
