import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './interactive-grid';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

const brokerOSClerkAppearance = {
  variables: {
    colorPrimary: '#c76b2c',
    colorPrimaryForeground: '#070707',
    colorBackground: '#0d0d0c',
    colorForeground: '#e7e4dd',
    colorMuted: '#141413',
    colorMutedForeground: '#a9a49b',
    colorInput: '#11110f',
    colorInputForeground: '#e7e4dd',
    colorBorder: '#2b2b28',
    colorDanger: '#d14f45',
    colorRing: '#c76b2c',
    borderRadius: '0px',
    fontFamily: 'var(--font-sans)'
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: [
      'w-full rounded-none border border-[#2b2b28] bg-[#0d0d0c]',
      'px-5 py-6 shadow-[0_0_0_1px_rgba(231,228,221,0.03),0_24px_80px_rgba(0,0,0,0.34)]',
      'sm:px-7 sm:py-7'
    ].join(' '),
    header: 'mb-6 text-left',
    headerTitle: 'text-[1.15rem] font-semibold leading-6 tracking-normal text-[#e7e4dd]',
    headerSubtitle: 'mt-1.5 text-sm leading-5 text-[#a9a49b]',
    socialButtonsBlockButton:
      'h-10 rounded-none border border-[#2b2b28] bg-[#11110f] text-[#e7e4dd] shadow-none transition-colors hover:border-[#c76b2c]/60 hover:bg-[#161614] focus-visible:ring-2 focus-visible:ring-[#c76b2c]/45',
    socialButtonsBlockButtonText: 'text-sm font-medium text-[#e7e4dd]',
    socialButtonsProviderIcon: 'opacity-80',
    dividerRow: 'my-5',
    dividerLine: 'bg-[#2b2b28]',
    dividerText: 'px-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#80807f]',
    formField: 'space-y-1.5',
    formFieldLabel: 'text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[#a9a49b]',
    formFieldInput:
      'h-10 rounded-none border border-[#2b2b28] bg-[#11110f] text-[#e7e4dd] shadow-none caret-[#c76b2c] placeholder:text-[#80807f] focus:border-[#c76b2c] focus:ring-2 focus:ring-[#c76b2c]/25',
    formFieldInputShowPasswordButton:
      'text-[#a9a49b] hover:text-[#e7e4dd] focus-visible:ring-[#c76b2c]/45',
    formFieldErrorText: 'text-xs font-medium text-[#ff8a7a]',
    formFieldSuccessText: 'text-xs font-medium text-[#9aa889]',
    formButtonPrimary:
      'h-10 rounded-none border border-[#d9823a] bg-[#c76b2c] text-sm font-semibold text-[#070707] shadow-none transition-colors hover:bg-[#e08a45] focus-visible:ring-2 focus-visible:ring-[#c76b2c]/45 active:bg-[#b85f24]',
    footer: 'mt-6 rounded-none border-t border-[#242421] pt-5',
    footerAction: 'text-[#a9a49b]',
    footerActionText: 'text-sm text-[#a9a49b]',
    footerActionLink: 'text-sm font-semibold text-[#e08a45] hover:text-[#f0a566]',
    alert: 'rounded-none border border-[#5b2721] bg-[#271210] text-[#ffd6cf]',
    alertText: 'text-sm text-[#ffd6cf]',
    alertIcon: 'text-[#ff8a7a]',
    formResendCodeLink: 'font-semibold text-[#e08a45] hover:text-[#f0a566]',
    otpCodeFieldInput:
      'rounded-none border-[#2b2b28] bg-[#11110f] text-[#e7e4dd] focus:border-[#c76b2c] focus:ring-[#c76b2c]/25',
    identityPreview: 'rounded-none border border-[#2b2b28] bg-[#11110f]',
    identityPreviewText: 'text-[#e7e4dd]',
    formFieldHintText: 'text-xs text-[#80807f]'
  }
};

export default function SignUpViewPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070707] text-[#e7e4dd] md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/auth/sign-in'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 z-30 hidden rounded-none border border-[#2b2b28] bg-[#0d0d0c]/80 text-[#e7e4dd] hover:bg-[#141413] hover:text-[#e7e4dd] md:top-8 md:right-8'
        )}
      >
        Login
      </Link>
      <div className='relative hidden h-full flex-col border-r border-[#242421] bg-[#090908] p-10 lg:flex'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,#0d0d0c_0%,#070707_100%)]' />
        <div className='relative z-20 flex items-center text-lg font-medium text-[#e7e4dd]'>
          <Icons.logo className='mr-2 h-6 w-6 text-[#c76b2c]' />
          BrokerOS
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12 opacity-35'
          )}
        />
        <div className='relative z-20 mt-auto text-[#e7e4dd]'>
          <blockquote className='space-y-2'>
            <p className='max-w-md text-lg leading-7 text-[#e7e4dd]'>
              &ldquo;Run the client work, listing work, and match work from one quiet operating
              system.&rdquo;
            </p>
            <footer className='text-sm text-[#a9a49b]'>BrokerOS</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full w-full items-center justify-center border-[#242421] p-4 sm:p-6 lg:p-8'>
        <div className='flex w-full max-w-[27rem] flex-col items-center justify-center space-y-5'>
          <div className='flex items-center gap-2 self-start lg:hidden'>
            <Icons.logo className='h-5 w-5 text-[#c76b2c]' />
            <span className='text-sm font-semibold text-[#e7e4dd]'>BrokerOS</span>
          </div>
          <ClerkSignUpForm
            appearance={brokerOSClerkAppearance}
            initialValues={{
              emailAddress: 'your_mail+clerk_test@example.com'
            }}
          />
          <p className='px-4 text-center text-xs leading-5 text-[#80807f]'>
            Authentication is handled securely by Clerk.
          </p>
        </div>
      </div>
    </div>
  );
}
