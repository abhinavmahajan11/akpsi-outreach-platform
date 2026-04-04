'use client';

import { useState } from 'react';

interface OrgLogoProps {
  name: string;
  logoInitials: string;
  logoColor: string;
  website?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
};

function buildSources(domain: string): string[] {
  return [
    // Google's favicon CDN — very reliable, returns high-quality icons
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    // DuckDuckGo's favicon CDN — second reliable source
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  ];
}

export default function OrgLogo({
  name,
  logoInitials,
  logoColor,
  website,
  size = 'md',
}: OrgLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);

  const sizeClass = sizeClasses[size];

  const domain = website
    ? website.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    : null;

  const sources = domain ? buildSources(domain) : [];
  const currentSrc = sources[sourceIndex] ?? null;
  const allFailed = !currentSrc;

  function handleError() {
    setSourceIndex((i) => i + 1);
  }

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden flex-shrink-0 ${
        !allFailed
          ? 'bg-white border border-slate-100 shadow-sm'
          : `${logoColor} shadow-sm`
      }`}
    >
      {!allFailed ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${name} logo`}
          className="w-full h-full object-contain p-1.5"
          onError={handleError}
        />
      ) : (
        <span className="text-white font-bold">{logoInitials}</span>
      )}
    </div>
  );
}
