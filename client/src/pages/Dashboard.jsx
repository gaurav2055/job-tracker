import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { getDashboardStats } from '../api/dashboard';
import { getJobs } from '../api/jobs';
import KanbanBoard from '../components/KanbanBoard';
import JobFormModal from '../components/JobFormModal';

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
  const [search, setSearch] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await getJobs(params);
      // Exclude "To Apply" from the board
      setJobs(res.data.filter((j) => j.status !== 'To Apply'));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    getDashboardStats().then((res) => setStats(res.data));
  }, []);

  function handleJobSaved() {
    fetchJobs();
    getDashboardStats().then((res) => setStats(res.data));
  }

  // Optimistic status update — move card immediately, API call happens inside KanbanBoard
  function handleStatusChange(jobId, newStatus) {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j));
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Dashboard</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Drag cards between columns to update status
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Job
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Total" value={stats?.total} />
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

      {/* Search */}
      <Paper sx={{ p: 1.5, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search company or role…"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment>,
          }}
        />
      </Paper>

      {/* Kanban board */}
      {loading ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" width={260} height={400} sx={{ borderRadius: 2, flexShrink: 0 }} />
          ))}
        </Box>
      ) : (
        <KanbanBoard jobs={jobs} onStatusChange={handleStatusChange} />
      )}

      <JobFormModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={handleJobSaved} />
    </Box>
  );
}
