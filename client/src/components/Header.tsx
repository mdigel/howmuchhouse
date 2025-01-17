import React from 'react';

export function Header() {
  return (
    <header className="w-full py-6 border-b border-border">
      <div className="container mx-auto px-4 md:px-4 lg:px-4 max-w-[1200px]">
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold font-noto-sans">
              How Much <span className="relative inline-block">
                Home
                <span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
              </span> Can I <span className="relative inline-block">
                Afford.ai
                <span className="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-base">Not just a simple mortgage calculator.</p>
        </div>
      </div>
    </header>
  );
}