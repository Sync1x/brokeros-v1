import type { ReactNode } from 'react';

interface SectionPanelProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SectionPanel({ title, eyebrow, children }: SectionPanelProps) {
  return (
    <section className='flex flex-col gap-3'>
      <div>
        {eyebrow && (
          <p className='text-muted-foreground font-mono text-[0.65rem] font-medium tracking-[0.18em] uppercase'>
            {eyebrow}
          </p>
        )}
        <h2 className='mt-1 text-sm font-semibold uppercase tracking-[0.12em]'>{title}</h2>
      </div>
      {children}
    </section>
  );
}
