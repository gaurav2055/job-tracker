import Chip from '@mui/material/Chip';

const STATUS_COLORS = {
  'To Apply':     { bg: '#374151', color: '#D1D5DB' },
  'Applied':      { bg: '#1E3A5F', color: '#60A5FA' },
  'Phone Screen': { bg: '#2E1065', color: '#A78BFA' },
  'Take Home':    { bg: '#431407', color: '#FB923C' },
  'Interviewing': { bg: '#78350F', color: '#FCD34D' },
  'Offer':        { bg: '#064E3B', color: '#34D399' },
  'Rejected':     { bg: '#450A0A', color: '#F87171' },
};

export default function StatusBadge({ status, size = 'small' }) {
  const style = STATUS_COLORS[status] || STATUS_COLORS['To Apply'];
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 22 : 28,
      }}
    />
  );
}
