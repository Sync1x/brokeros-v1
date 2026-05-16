import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';

export default function Header() {
  return (
    <header className='bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center border-b md:h-12'>
      <div className='z-10 flex items-center gap-2 px-3'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>

      <div className='pointer-events-none absolute left-1/2 hidden w-full max-w-[620px] -translate-x-1/2 px-3 md:block'>
        <SearchInput />
      </div>

      <div className='ml-auto flex items-center px-3' />
    </header>
  );
}
