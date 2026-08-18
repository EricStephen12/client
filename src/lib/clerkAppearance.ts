/**
 * Clerk v7+ dark appearance for Eixora.
 * Important: colorText / colorInputBackground are deprecated and ignored —
 * use colorForeground / colorInput or Clerk stays on the light (dark-on-black) theme.
 */
export const clerkAppearance = {
    variables: {
        colorBackground: '#0a0a0a',
        colorForeground: '#fafaf9',
        colorMuted: '#171717',
        colorMutedForeground: '#a8a29e',
        colorPrimary: '#a3e635',
        colorPrimaryForeground: '#0a0a0a',
        colorInput: '#141414',
        colorInputForeground: '#fafaf9',
        colorBorder: 'rgba(255,255,255,0.16)',
        colorRing: '#a3e635',
        colorNeutral: '#fafaf9',
        colorDanger: '#f87171',
        colorShadow: 'transparent',
        borderRadius: '0.85rem',
    },
    elements: {
        rootBox: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
        },
        cardBox: {
            width: '100%',
            maxWidth: '440px',
            boxShadow: 'none',
            background: 'transparent',
            margin: '0 auto',
        },
        card: {
            width: '100%',
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            padding: '0',
            margin: '0 auto',
        },
        header: {
            textAlign: 'center' as const,
        },
        headerTitle: {
            color: '#fafaf9',
            fontSize: '1.25rem',
            fontWeight: '600',
            textAlign: 'center' as const,
        },
        headerSubtitle: {
            color: '#a8a29e',
            fontSize: '0.875rem',
            fontWeight: '400',
            textAlign: 'center' as const,
        },
        socialButtonsBlockButton: {
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '9999px',
            color: '#fafaf9',
            boxShadow: 'none',
        },
        socialButtonsBlockButtonText: {
            color: '#fafaf9',
            fontWeight: '500',
        },
        dividerLine: {
            backgroundColor: 'rgba(255,255,255,0.12)',
        },
        dividerText: {
            color: '#78716c',
        },
        formFieldLabel: {
            color: '#a8a29e',
            fontSize: '0.6875rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase' as const,
            fontWeight: '500',
        },
        formFieldInput: {
            backgroundColor: '#141414',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '9999px',
            color: '#fafaf9',
            boxShadow: 'none',
        },
        formButtonPrimary: {
            backgroundColor: '#a3e635',
            color: '#0a0a0a',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '0.875rem',
            boxShadow: 'none',
        },
        footerActionText: {
            color: '#78716c',
        },
        footerActionLink: {
            color: '#a3e635',
            fontWeight: '500',
        },
        footer: {
            background: 'transparent',
            justifyContent: 'center',
            textAlign: 'center' as const,
        },
        identityPreviewText: {
            color: '#e7e5e4',
        },
        identityPreviewEditButton: {
            color: '#a3e635',
        },
        formFieldInputShowPasswordButton: {
            color: '#a8a29e',
        },
        otpCodeFieldInput: {
            backgroundColor: '#141414',
            borderColor: 'rgba(255,255,255,0.16)',
            color: '#fafaf9',
        },
        alternativeMethodsBlockButton: {
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#fafaf9',
        },
    },
};
