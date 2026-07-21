// Clerk appearance. We deliberately do NOT use @clerk/themes `dark` baseTheme:
// with the clerk-js v6 runtime it silently no-ops — inputs stayed white and
// labels dark while only `colorPrimary` was honored (version mismatch between
// @clerk/themes and the loaded clerk-js). So: keep the brand variables that
// DO land here, and force the dark surfaces with real CSS overriding Clerk's
// stable `.cl-*` classes in globals.css (search "Clerk dark overrides").
export const clerkAppearance = {
  variables: {
    colorPrimary: '#e0431f',
    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
    borderRadius: '10px',
  },
  elements: {
    // We render our own "Instacap" wordmark above the widget.
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    formButtonPrimary: 'normal-case',
  },
}
