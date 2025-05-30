import { createTheme } from '@mui/material/styles';

// Ultra-modern theme matching trystratify.com specifications
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Primary buttons & links
      light: '#a5b4fc', // Secondary accent & hover states
      dark: '#4f46e5', // Button hover & active states
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Success states
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f9fafb', // Page background
      paper: '#ffffff', // Card background
    },
    text: {
      primary: '#1f2937', // Primary text
      secondary: '#6b7280', // Secondary text
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb', // Borders & dividers
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827', // Headings
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '3.75rem', // 60px
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#111827',
    },
    h2: {
      fontSize: '3rem', // 48px  
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#111827',
    },
    h3: {
      fontSize: '2.25rem', // 36px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
      color: '#111827',
    },
    h4: {
      fontSize: '1.875rem', // 30px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#111827',
    },
    h5: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#111827',
    },
    h6: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#111827',
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#4b5563',
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#6b7280',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none' as const,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#6b7280',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#6b7280',
    },
  },
  shape: {
    borderRadius: 8, // rounded-lg
  },
  spacing: 8, // 8px base unit
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // shadow-sm
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-md
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // shadow-xl
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f9fafb',
          margin: 0,
          padding: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8, // rounded-lg
          padding: '8px 24px', // px-6 py-2
          fontSize: '0.875rem',
          lineHeight: 1.5,
          transition: 'all 150ms ease-in-out',
          '&:focus': {
            outline: '2px solid #6366f1',
            outlineOffset: '2px',
          },
        },
        contained: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            backgroundColor: '#4f46e5',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
        outlined: {
          borderColor: '#e5e7eb',
          color: '#4b5563',
          '&:hover': {
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          },
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // rounded-2xl
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
          border: 'none',
          padding: '1.5rem', // p-6
          transition: 'all 150ms ease-in-out',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16, // rounded-2xl
          backgroundColor: '#ffffff',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          color: '#1f2937',
          height: '4rem', // Fixed height
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          width: '16rem', // Fixed sidebar width
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            '& fieldset': {
              borderColor: '#e5e7eb',
            },
            '&:hover fieldset': {
              borderColor: '#d1d5db',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6366f1',
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              outline: '2px solid #6366f1',
              outlineOffset: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: '#a5b4fc',
          color: '#1f2937',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: '0.25rem',
          padding: '0.75rem 1rem',
          '&.Mui-selected': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1',
            borderLeft: '2px solid #6366f1',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: '82rem !important', // Max-width container
          paddingLeft: '2rem',
          paddingRight: '2rem',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: '4rem',
          minHeight: '4rem !important',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        },
      },
    },
  },
});

export default theme;
