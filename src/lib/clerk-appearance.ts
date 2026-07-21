// Matches the app's dark cinematic theme (near-black panels, warm ink, rust
// accent, rounded) instead of Clerk's default look. Hex values (not CSS vars)
// on `variables` so Clerk can compute its color scales.
export const clerkAppearance = {
  variables: {
    colorPrimary: '#e0431f',
    colorText: '#f7f5f0',
    colorTextSecondary: '#948d80',
    colorBackground: '#141311',
    colorInputBackground: '#1c1a17',
    colorInputText: '#f7f5f0',
    colorDanger: '#e0431f',
    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    borderRadius: '10px',
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none border border-[var(--hair)] rounded-2xl bg-[var(--panel)]',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    socialButtonsBlockButton: 'border border-[var(--hair)] rounded-lg hover:bg-[var(--brand-soft)]',
    socialButtonsBlockButtonText: 'text-[var(--ink)] font-medium',
    dividerLine: 'bg-[var(--hair)]',
    dividerText: 'text-[var(--mute)]',
    formFieldLabel: 'text-[var(--ink)]',
    formFieldInput: 'border border-[var(--hair)] rounded-lg bg-[var(--panel-2)] text-[var(--ink)] focus:border-[var(--brand)] focus:ring-[var(--brand)]',
    formButtonPrimary: 'bg-[var(--brand)] hover:brightness-110 text-white rounded-lg text-sm normal-case',
    footerActionLink: 'text-[var(--brand)] hover:brightness-110',
    identityPreviewText: 'text-[var(--ink)]',
    identityPreviewEditButtonIcon: 'text-[var(--brand)]',
    formResendCodeLink: 'text-[var(--brand)]',
    footer: 'bg-transparent',
    footerActionText: 'text-[var(--mute)]',
  },
}
