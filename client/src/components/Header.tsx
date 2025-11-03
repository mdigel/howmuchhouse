import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import mixpanel from 'mixpanel-browser';
import { motion } from 'framer-motion'; // Added Mixpanel import

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  // Regular menu items using wouter Link
  const routerMenuItems = [
    { path: '/', label: 'Calculator' },
    { path: '/why', label: 'Why?' },
  ];

  // SSR routes that need regular anchor tags
  const ssrMenuItems = [
    { path: '/affordability-by-income-level', label: 'Affordability By Income' }
  ];

  return (
    <header className="w-full py-6 border-b border-border relative">
      <div className="container mx-auto px-4 md:px-4 lg:px-4 max-w-[1200px]">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-left space-y-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold">
                <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  How Much{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative inline-block"
                >
                  House
                  <span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {" "}Can I{" "}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="relative inline-block"
                >
                  Afford.ai
                  <span className="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
                </motion.span>
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-muted-foreground text-xs md:text-base"
            >
              An affordability calculator with an AI Assistant.
            </motion.p>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-6">
            {routerMenuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => mixpanel.track('Navigation Clicked', { item: item.label })} // Added Mixpanel tracking
              >
                {item.label}
              </Link>
            ))}
            {ssrMenuItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                onClick={() => mixpanel.track('Navigation Clicked', { item: item.label })} // Added Mixpanel tracking
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-md"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden absolute left-0 right-0 top-full bg-background border-b border-border py-4 px-4 shadow-lg z-50">
            <div className="flex flex-col space-y-4">
              {routerMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    mixpanel.track('Navigation Clicked', { item: item.label }); // Added Mixpanel tracking
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {ssrMenuItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                  onClick={() => {
                    setIsMenuOpen(false);
                    mixpanel.track('Navigation Clicked', { item: item.label }); // Added Mixpanel tracking
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}