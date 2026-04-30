import PageContainer from '@/components/layout/page-container';

const messages = [
  {
    from: 'Amelia Hart',
    subject: 'Can we see Lispenard before it goes public?',
    time: '9:20 AM'
  },
  {
    from: 'Seller Counsel',
    subject: 'Disclosure packet revision is ready',
    time: 'Yesterday'
  },
  {
    from: 'Julian Mercer',
    subject: 'Offer terms approved by attorney',
    time: 'Apr 27'
  }
];

export default function InboxPage() {
  return (
    <PageContainer
      pageTitle='Inbox'
      pageDescription='Priority communication tied to leads, listings, and active match work.'
    >
      <div className='bg-card/90 divide-y border'>
        {messages.map((message) => (
          <div key={message.subject} className='grid gap-2 p-3 md:grid-cols-[180px_1fr_100px]'>
            <p className='font-mono text-xs font-medium uppercase'>{message.from}</p>
            <p className='text-muted-foreground'>{message.subject}</p>
            <p className='text-muted-foreground text-right font-mono text-xs uppercase'>
              {message.time}
            </p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
