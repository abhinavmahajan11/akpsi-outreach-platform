'use client';

import { useEffect, useRef } from 'react';

interface DropdownItem {
  label: string;
  value?: string;
  href?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  dividerBefore?: boolean;
  onClick?: () => void;
}

interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  items: DropdownItem[];
  /** Tailwind positioning classes, e.g. "right-0 top-full mt-1" */
  position?: string;
  minWidth?: string;
}

export default function DropdownMenu({
  open,
  onClose,
  items,
  position = 'right-0 top-full mt-1',
  minWidth = 'min-w-[160px]',
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      role="menu"
      className={`absolute ${position} ${minWidth} bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50`}
    >
      {items.map((item, i) => (
        <div key={i}>
          {item.dividerBefore && (
            <div className="my-1 border-t border-slate-100" />
          )}
          {item.href ? (
            <a
              href={item.href}
              role="menuitem"
              className={`flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors ${
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={onClose}
            >
              {item.icon && (
                <span className={item.danger ? 'text-rose-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </a>
          ) : (
            <button
              role="menuitem"
              className={`w-full text-left flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium transition-colors ${
                item.danger
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
            >
              {item.icon && (
                <span className={item.danger ? 'text-rose-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
