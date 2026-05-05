import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';

import { getCompany } from '../api/companies';
import JobCard from '../components/JobCard';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompany(id)
      .then((res) => setCompany(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton width={120} height={36} />
        <Skeleton variant="rectangular" height={120} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    );
  }

  if (!company) return <Typography>Company not found.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit" sx={{ mb: 3 }}>
        Back
      </Button>

      {/* Company header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar sx={{ bgcolor: 'primary.dark', width: 56, height: 56 }}>
            <BusinessIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>{company.name}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {company.industry && <Chip label={company.industry} size="small" variant="outlined" />}
              {company.size && <Chip label={company.size} size="small" variant="outlined" />}
              {company.location && <Chip label={company.location} size="small" variant="outlined" />}
              {company.website && (
                <Chip
                  icon={<LanguageIcon sx={{ fontSize: '14px !important' }} />}
                  label={company.website}
                  size="small"
                  variant="outlined"
                  component="a"
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  sx={{ color: 'primary.main' }}
                />
              )}
            </Box>
          </Box>
        </Box>
        {company.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{company.notes}</Typography>
          </>
        )}
      </Paper>

      {/* Jobs at this company */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Jobs at {company.name} ({company.jobs?.length ?? 0})
      </Typography>
      {company.jobs?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary' }}>No jobs tracked at this company yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {company.jobs.map((job) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={job.id}>
              <JobCard job={{ ...job, company }} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
