import Chip from '@mui/material/Chip';

function getFitColor(score) {
  if (score == null) return { bg: '#1F2937', color: '#9CA3AF' };
  if (score >= 70) return { bg: '#064E3B', color: '#34D399' };
  if (score >= 40) return { bg: '#78350F', color: '#FCD34D' };
  return { bg: '#450A0A', color: '#F87171' };
}

export default function FitScoreBadge({ score, size = 'small' }) {
  const { bg, color } = getFitColor(score);
  return (
    <Chip
      label={score != null ? `${score}` : '—'}
      size={size}
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.72rem' : '0.85rem',
        height: size === 'small' ? 22 : 28,
        minWidth: 36,
      }}
    />
  );
}
