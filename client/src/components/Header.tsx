import React from 'react';

export function Header() {
  return (
    <header className="w-full py-6">
      <div className="container mx-auto px-4">
        <div className="text-left space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-[2rem] leading-tight md:leading-8 tracking-tight font-bold font-noto-sans">
              How Much <span className="relative">
                Home
                <span className="absolute inset-0 bg-[#006AFF]/20 -rotate-1"></span>
              </span> Could I <span className="relative">
                Afford.ai
                <span className="absolute inset-0 bg-[#006AFF]/20 rotate-1"></span>
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-base">AI for the biggest purchase of your life.</p>
        </div>
      </div>
    </header>
  );
}