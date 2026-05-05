import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4F8EF7',
      light: '#82AEFB',
      dark: '#2563EB',
    },
    secondary: {
      main: '#7C3AED',
    },
    background: {
      default: '#0D1B2A',
      paper: '#132338',
    },
    divider: 'rgba(255,255,255,0.08)',
    text: {
      primary: '#F0F4FF',
      secondary: '#8FA3BF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#0B1622',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
  },
});

export default theme;
