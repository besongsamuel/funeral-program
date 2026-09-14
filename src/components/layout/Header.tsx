import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Bird } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemorial } from '@/hooks/useMemorial';
import { getFirstName } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/legacy', label: 'Legacy' },
  { to: '/funeral', label: 'Funeral' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/memories', label: 'Memories' },
  { to: '/tributes', label: 'Tributes' },
  { to: '/family', label: 'Family' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { data } = useMemorial();
  const firstName = data ? getFirstName(data.memorial.fullName) : '';

  return (
    <header className="sticky top-0 z-40 border-b-2 border-gold-400 bg-white/90 backdrop-blur-md">
      <div className="container-memorial flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-memorial-800">
          <Bird className="h-6 w-6" />
          <span className="font-serif text-lg font-semibold">
            Remembering {firstName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-100 text-memorial-900'
                    : 'text-gray-600 hover:bg-gold-50 hover:text-memorial-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="rounded-lg p-2 text-memorial-700 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-gold-200 bg-white lg:hidden"
          >
            <div className="flex flex-col p-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-gold-100 text-memorial-900' : 'text-gray-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
