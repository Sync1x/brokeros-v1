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
      pageDescription='Priority brokerage communication without the noise.'
    >
      <div className='bg-card/80 divide-y rounded-2xl border'>
        {messages.map((message) => (
          <div key={message.subject} className='grid gap-2 p-5 md:grid-cols-[180px_1fr_100px]'>
            <p className='font-medium'>{message.from}</p>
            <p className='text-muted-foreground'>{message.subject}</p>
            <p className='text-muted-foreground text-right text-sm'>{message.time}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
