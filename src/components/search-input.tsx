'use client';
import { useKBar } from 'kbar';
import { Icons } from '@/components/icons';
import { Button } from './ui/button';

export default function SearchInput() {
  const { query } = useKBar();
  return (
    <div className='w-full'>
      <Button
        variant='outline'
        className='bg-background text-muted-foreground relative h-9 w-full justify-start font-mono text-xs font-normal shadow-none sm:pr-12 md:w-72 lg:w-96'
        onClick={query.toggle}
      >
        <Icons.search className='mr-2 h-4 w-4' />
        Search leads, listings, or press ⌘K
        <kbd className='bg-muted pointer-events-none absolute top-[0.2rem] right-[0.2rem] hidden h-6 items-center gap-1 border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </Button>
    </div>
  );
}
