import React from 'react';

export function Header() {
  return (
    <header className="w-full py-6 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            How Much Home Could I Afford
          </h1>
          <p className="text-lg text-muted-foreground">
            AI for the biggest purchase of your life
          </p>
        </div>
      </div>
    </header>
  );
}
