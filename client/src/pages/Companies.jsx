import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';

import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import LanguageIcon from '@mui/icons-material/Language';

import { getCompanies } from '../api/companies';

const SIZE_LABELS = { startup: 'Startup', mid: 'Mid-size', large: 'Enterprise' };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Companies</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          All companies you've tracked
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : companies.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography sx={{ color: 'text.secondary' }}>No companies yet. Add your first job to get started.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {companies.map((company) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={company.id}>
              <Card
                elevation={0}
                sx={{
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
                }}
              >
                <CardActionArea onClick={() => navigate(`/companies/${company.id}`)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.dark', width: 44, height: 44 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{company.name}</Typography>
                        {company.industry && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{company.industry}</Typography>
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                      <Chip
                        icon={<WorkIcon sx={{ fontSize: '14px !important' }} />}
                        label={`${company._count?.jobs ?? 0} job${company._count?.jobs !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                      />
                      {company.size && (
                        <Chip label={SIZE_LABELS[company.size] || company.size} size="small" variant="outlined" />
                      )}
                      {company.location && (
                        <Chip label={company.location} size="small" variant="outlined" />
                      )}
                      {company.website && (
                        <Chip
                          icon={<LanguageIcon sx={{ fontSize: '14px !important' }} />}
                          label="Website"
                          size="small"
                          variant="outlined"
                          component="a"
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          clickable
                          sx={{ color: 'primary.main' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
