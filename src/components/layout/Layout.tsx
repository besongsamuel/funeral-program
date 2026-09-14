import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { MemorialChat } from '@/components/ai/MemorialChat';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Layout() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <MemorialChat />}
    </div>
  );
}
