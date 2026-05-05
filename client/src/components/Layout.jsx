import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/auth';

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: <DashboardIcon />, to: '/' },
  { label: 'Jobs',       icon: <WorkIcon />,      to: '/jobs' },
  { label: 'Companies',  icon: <BusinessIcon />,  to: '/companies' },
  { label: 'Contacts',   icon: <PeopleIcon />,    to: '/contacts' },
];

// ── Change Password Dialog ────────────────────────────────────────────────────
function ChangePasswordDialog({ open, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleClose() {
    setForm({ current: '', next: '', confirm: '' });
    setError('');
    setSuccess(false);
    onClose();
  }

  async function handleSubmit() {
    setError('');
    if (form.next !== form.confirm) { setError('New passwords do not match'); return; }
    if (form.next.length < 6) { setError('New password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await changePassword(form.current, form.next);
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Password changed successfully!</Alert>}
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          value={form.current}
          onChange={set('current')}
          disabled={success}
        />
        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={form.next}
          onChange={set('next')}
          disabled={success}
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          value={form.confirm}
          onChange={set('confirm')}
          disabled={success}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Change Password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ location, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pwOpen, setPwOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, py: 3 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 0.5 }}>
          JobTracker
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Application Manager
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ label, icon, to }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <ListItem key={to} disablePadding>
              <ListItemButton
                component={Link}
                to={to}
                onClick={onClose}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  color: active ? 'primary.main' : 'text.secondary',
                  bgcolor: active ? 'rgba(79,142,247,0.12)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(79,142,247,0.08)', color: 'text.primary' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* User info + actions */}
      <Box sx={{ px: 2, py: 2 }}>
        {/* Name + avatar row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: '0.8rem', flexShrink: 0 }}>
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name || 'Account'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons row */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Change password">
            <IconButton size="small" onClick={() => setPwOpen(true)} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <LockOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <LogoutIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <ChangePasswordDialog open={pwOpen} onClose={() => setPwOpen(false)} />
    </Box>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
              JobTracker
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          <SidebarContent location={location} onClose={() => setMobileOpen(false)} />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <SidebarContent location={location} onClose={() => {}} />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: isMobile ? 8 : 0,
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
