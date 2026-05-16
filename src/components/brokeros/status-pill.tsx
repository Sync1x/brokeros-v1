import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export type StatusPillVariant =
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'success'
  | 'hot'
  | 'active'
  | 'warm'
  | 'cold';

export type StatusPillAppearance = 'soft' | 'outline' | 'score';

export interface StatusPillProps extends React.ComponentPropsWithoutRef<'span'> {
  appearance?: StatusPillAppearance;
  asChild?: boolean;
  dot?: boolean;
  icon?: LucideIcon;
  variant?: StatusPillVariant;
}

function softVariantClasses(variant: StatusPillVariant) {
  switch (variant) {
    case 'danger':
    case 'hot':
      return 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-300';
    case 'warning':
    case 'warm':
      return 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-300';
    case 'info':
    case 'cold':
      return 'border-sky-500/35 bg-sky-500/10 text-sky-700 dark:border-sky-400/35 dark:bg-sky-500/15 dark:text-sky-300';
    case 'success':
    case 'active':
      return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-300';
    case 'neutral':
    default:
      return 'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:border-slate-400/25 dark:bg-slate-500/15 dark:text-slate-200';
  }
}

function dotClasses(variant: StatusPillVariant) {
  switch (variant) {
    case 'danger':
    case 'hot':
      return 'bg-rose-500';
    case 'warning':
    case 'warm':
      return 'bg-amber-500';
    case 'info':
    case 'cold':
      return 'bg-sky-500';
    case 'success':
    case 'active':
      return 'bg-emerald-500';
    case 'neutral':
    default:
      return 'bg-slate-500';
  }
}

function appearanceClasses(appearance: StatusPillAppearance) {
  switch (appearance) {
    case 'outline':
      return 'rounded-full border border-foreground/80 bg-background/90 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-foreground';
    case 'score':
      return 'rounded-full border border-foreground/80 bg-background/95 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground';
    case 'soft':
    default:
      return 'rounded-full border px-2.5 py-1 text-[0.65rem] font-medium leading-none';
  }
}

export function StatusPill({
  appearance = 'soft',
  asChild = false,
  className,
  children,
  dot = false,
  icon: Icon,
  variant = 'neutral',
  ...props
}: StatusPillProps) {
  const Comp = asChild ? Slot : 'span';
  const isSoft = appearance === 'soft';

  if (asChild) {
    return (
      <Comp
        data-slot='status-pill'
        className={cn(
          'inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
          appearanceClasses(appearance),
          isSoft ? softVariantClasses(variant) : null,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot='status-pill'
      className={cn(
        'inline-flex w-fit shrink-0 items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3',
        isSoft ? 'gap-1.5' : 'gap-1',
        appearanceClasses(appearance),
        isSoft ? softVariantClasses(variant) : null,
        className
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden='true' className='shrink-0' /> : null}
      {!Icon && dot ? <span aria-hidden='true' className={cn('size-1.5 rounded-full', dotClasses(variant))} /> : null}
      {children}
    </Comp>
  );
}
