import type { ReactNode } from 'react';

interface SectionPanelProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionPanel({ title, eyebrow, children }: SectionPanelProps) {
  return (
    <section className='space-y-4'>
      <div>
        {eyebrow && (
          <p className='text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase'>
            {eyebrow}
          </p>
        )}
        <h2 className='mt-1 text-lg font-semibold'>{title}</h2>
      </div>
      {children}
    </section>
  );
}
