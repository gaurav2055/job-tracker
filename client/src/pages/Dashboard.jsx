import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { getDashboardStats } from '../api/dashboard';
import { getJobs } from '../api/jobs';
import JobCard from '../components/JobCard';
import JobFormModal from '../components/JobFormModal';

const STATUSES = ['', 'To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
const WORK_TYPES = ['', 'remote', 'hybrid', 'onsite'];
const SORT_OPTIONS = [
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'fitScore', label: 'Fit Score' },
  { value: 'dateApplied', label: 'Date Applied' },
];

function StatCard({ label, value, color }) {
  return (
    <Paper sx={{ p: 2.5, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 800, color: color || 'primary.main', lineHeight: 1 }}>
        {value ?? <Skeleton width={48} sx={{ mx: 'auto' }} />}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const [filters, setFilters] = useState({ status: '', workType: '', search: '', sortBy: 'dateAdded' });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.workType) params.workType = filters.workType;
      if (filters.search) params.search = filters.search;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      const res = await getJobs(params);
      setJobs(res.data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    getDashboardStats().then((res) => setStats(res.data));
  }, []);

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  function handleJobSaved() {
    fetchJobs();
    getDashboardStats().then((res) => setStats(res.data));
  }

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Dashboard</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Track your job applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
        >
          Add Job
        </Button>
      </Box>

      {/* Stats banner */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total Jobs" value={stats?.total} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Applied" value={stats?.applied} color="#60A5FA" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Interviewing" value={stats?.interviewing} color="#FCD34D" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Avg Fit Score" value={stats?.avgFitScore != null ? `${stats.avgFitScore}` : '—'} color="#34D399" />
        </Grid>
      </Grid>

      {/* Filters row */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search company or role…"
          value={filters.search}
          onChange={setFilter('search')}
          sx={{ flex: '1 1 200px', minWidth: 180 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment>,
          }}
        />
        <TextField
          select size="small" label="Status"
          value={filters.status} onChange={setFilter('status')}
          sx={{ minWidth: 140 }}
        >
          {STATUSES.map((s) => <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>)}
        </TextField>
        <TextField
          select size="small" label="Work Type"
          value={filters.workType} onChange={setFilter('workType')}
          sx={{ minWidth: 130 }}
        >
          {WORK_TYPES.map((w) => (
            <MenuItem key={w} value={w} sx={{ textTransform: 'capitalize' }}>
              {w || 'All Types'}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select size="small" label="Sort By"
          value={filters.sortBy} onChange={setFilter('sortBy')}
          sx={{ minWidth: 140 }}
        >
          {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      </Paper>

      {/* Jobs grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>No jobs found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Add your first job or adjust your filters
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setAddOpen(true)}>
            Add Job
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {jobs.map((job) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={job.id}>
              <JobCard job={job} />
            </Grid>
          ))}
        </Grid>
      )}

      <JobFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={handleJobSaved} />
    </Box>
  );
}
