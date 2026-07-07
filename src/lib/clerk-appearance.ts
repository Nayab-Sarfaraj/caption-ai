// Matches the app's paper/pencil theme (white bg, near-black ink, red-pencil
// accent, monospace) instead of Clerk's default look.
export const clerkAppearance = {
  variables: {
    colorPrimary: '#c1361f',
    colorText: '#1a1917',
    colorTextSecondary: '#6b6862',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#1a1917',
    colorDanger: '#c1361f',
    fontFamily: 'var(--font-cc), ui-monospace, monospace',
    borderRadius: '2px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none border border-[#14120f1f] rounded-md',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 'border border-[#14120f1f] rounded-[2px] hover:bg-[#c1361f08]',
    socialButtonsBlockButtonText: 'text-[#1a1917] font-medium',
    dividerLine: 'bg-[#14120f1f]',
    dividerText: 'text-[#a39e96]',
    formFieldLabel: 'text-[#1a1917]',
    formFieldInput: 'border border-[#14120f1f] rounded-[2px] focus:border-[#c1361f] focus:ring-[#c1361f]',
    formButtonPrimary: 'bg-[#c1361f] hover:bg-[#a52d19] text-white rounded-[2px] text-sm normal-case',
    footerActionLink: 'text-[#c1361f] hover:text-[#a52d19]',
    identityPreviewText: 'text-[#1a1917]',
    identityPreviewEditButtonIcon: 'text-[#c1361f]',
    formResendCodeLink: 'text-[#c1361f]',
    footer: 'bg-transparent',
    footerActionText: 'text-[#6b6862]',
  },
}
