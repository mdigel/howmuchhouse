import React from 'react';

export function Header() {
  return (
    <header className="w-full py-6">
      <div className="container mx-auto px-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">
            How Much Home Could I Afford
            <span className="bg-blue-100 px-1 rounded ml-1">
              .ai
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI for the biggest purchase of your life.
          </p>
        </div>
      </div>
    </header>
  );
}