import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaptopIcon from '@mui/icons-material/Laptop';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import StatusBadge from './StatusBadge';
import FitScoreBadge from './FitScoreBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
}

function daysSinceFollowup(followups) {
  if (!followups || followups.length === 0) return null;
  return dayjs(followups[0].date).fromNow();
}

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const lastFollowup = daysSinceFollowup(job.followups);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/jobs/${job.id}`)} sx={{ height: '100%', alignItems: 'flex-start' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {job.company?.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mt: 0.25 }} noWrap>
                {job.roleTitle}
              </Typography>
            </Box>
            <FitScoreBadge score={job.fitScore} />
          </Box>

          {/* Meta row */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            {job.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <LocationOnIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{job.location}</Typography>
              </Box>
            )}
            {job.workType && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <LaptopIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>{job.workType}</Typography>
              </Box>
            )}
            {salary && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <AttachMoneyIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{salary}</Typography>
              </Box>
            )}
          </Box>

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Footer row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <StatusBadge status={job.status} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
              {job.dateApplied && (
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                  Applied {dayjs(job.dateApplied).format('MMM D')}
                </Typography>
              )}
              {lastFollowup && (
                <Tooltip title="Last followup">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                      {lastFollowup}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
