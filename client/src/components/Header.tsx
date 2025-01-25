import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const menuItems = [
    { path: '/affordability-by-income-level', label: 'Income Levels' },
    { path: '/how-it-works', label: 'How It Works?' },
    { path: '/feedback', label: 'Feedback' }
  ];

  return (
    <header className="w-full py-6 border-b border-border relative">
      <div className="container mx-auto px-4 md:px-4 lg:px-4 max-w-[1200px]">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-left space-y-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold font-noto-sans">
                How Much <span className="relative inline-block">
                  House
                  <span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
                </span> Can I <span className="relative inline-block">
                  Afford.ai
                  <span className="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-base">An affordability calculator with an AI Assistant.</p>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-6">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-md"
            aria-label="Toggle menu"
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
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}