'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '../utils/store';

export function FloatingAssistant() {
  const [prompt, setPrompt] = React.useState('');
  const isPanelOpen = useAssistantStore((state) => state.isPanelOpen);
  const messages = useAssistantStore((state) => state.messages);
  const status = useAssistantStore((state) => state.status);
  const submitPrompt = useAssistantStore((state) => state.submitPrompt);
  const minimizePanel = useAssistantStore((state) => state.minimizePanel);
  const closePanel = useAssistantStore((state) => state.closePanel);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt(prompt);
    setPrompt('');
  };

  const latestAssistantMessage = messages
    .toReversed()
    .find((message) => message.role === 'assistant');

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6'>
      <div className='pointer-events-auto flex w-full max-w-3xl flex-col items-stretch gap-3'>
        <div
          className={cn(
            'origin-bottom overflow-hidden border border-border/80 bg-background/96 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-300 ease-out',
            isPanelOpen
              ? 'max-h-80 translate-y-0 opacity-100'
              : 'max-h-0 translate-y-3 border-transparent opacity-0'
          )}
        >
          <div className='flex items-center justify-between border-b border-border/70 px-4 py-3'>
            <div className='flex min-w-0 items-center gap-2'>
              <span className='flex size-7 items-center justify-center border border-primary/20 bg-primary/10 text-primary'>
                <Icons.sparkles className='size-4' />
              </span>
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium text-foreground'>Assistant</p>
                <p className='text-xs text-muted-foreground'>
                  {status === 'idle' ? 'Ready' : 'Typing and preparing actions'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7'
                onClick={minimizePanel}
                aria-label='Minimize assistant chat'
              >
                <Icons.minus className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7'
                onClick={closePanel}
                aria-label='Close assistant chat'
              >
                <Icons.close className='size-4' />
              </Button>
            </div>
          </div>

          <div className='max-h-56 space-y-3 overflow-y-auto px-4 py-4'>
            {latestAssistantMessage ? (
              <div className='border border-border/70 bg-muted/35 p-3 text-sm leading-6 text-foreground'>
                {latestAssistantMessage.content}
              </div>
            ) : (
              <div className='border border-dashed border-border/80 bg-muted/20 p-3 text-sm text-muted-foreground'>
                Ask your assistant to search, summarize, or prepare an action.
              </div>
            )}
            {status === 'responding' && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span className='flex gap-1'>
                  <span className='size-1.5 animate-pulse rounded-full bg-primary' />
                  <span className='size-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]' />
                  <span className='size-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]' />
                </span>
                Waiting for the live AI endpoint
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex min-h-14 items-center gap-2 border border-border/80 bg-background/96 px-3 py-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl'
        >
          <div className='flex size-9 shrink-0 items-center justify-center border border-primary/20 bg-primary/10 text-primary'>
            <Icons.sparkles className='size-4' />
          </div>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder='Ask your assistant'
            className='h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground'
            aria-label='Ask your assistant'
          />
          <Button
            type='submit'
            size='icon'
            className='size-10 rounded-full'
            disabled={!prompt.trim()}
            aria-label='Send assistant prompt'
          >
            <Icons.send className='size-4' />
          </Button>
        </form>
      </div>
    </div>
  );
}
