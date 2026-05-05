import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import { createJob, updateJob } from '../api/jobs';
import dayjs from 'dayjs';

const STATUSES = ['Applied', 'Phone Screen', 'Take Home', 'Interviewing', 'Offer', 'Rejected'];
const WORK_TYPES = ['remote', 'hybrid', 'onsite'];

const EMPTY = {
  companyName: '',
  roleTitle: '',
  jobUrl: '',
  jobDescription: '',
  location: '',
  workType: '',
  salaryMin: '',
  salaryMax: '',
  fitScore: '',
  status: 'Applied',
  dateFound: dayjs().format('YYYY-MM-DD'),
  dateApplied: '',
  notes: '',
};

function toFormValues(job) {
  if (!job) return EMPTY;
  return {
    companyName: job.company?.name || '',
    roleTitle: job.roleTitle || '',
    jobUrl: job.jobUrl || '',
    jobDescription: job.jobDescription || '',
    location: job.location || '',
    workType: job.workType || '',
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    fitScore: job.fitScore ?? '',
    status: job.status || 'To Apply',
    dateFound: job.dateFound ? dayjs(job.dateFound).format('YYYY-MM-DD') : '',
    dateApplied: job.dateApplied ? dayjs(job.dateApplied).format('YYYY-MM-DD') : '',
    notes: job.notes || '',
  };
}

export default function JobFormModal({ open, onClose, onSaved, job }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormValues(job));
      setErrors({});
    }
  }, [open, job]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = 'Required';
    if (!form.roleTitle.trim()) errs.roleTitle = 'Required';
    if (form.fitScore !== '' && (Number(form.fitScore) < 0 || Number(form.fitScore) > 100)) {
      errs.fitScore = '0-100';
    }
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin !== '' ? Number(form.salaryMin) : null,
        salaryMax: form.salaryMax !== '' ? Number(form.salaryMax) : null,
        fitScore: form.fitScore !== '' ? Number(form.fitScore) : null,
        dateFound: form.dateFound || null,
        dateApplied: form.dateApplied || null,
      };
      const res = job ? await updateJob(job.id, payload) : await createJob(payload);
      onSaved(res.data);
      onClose();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const map = {};
        apiErrors.forEach((e) => { map[e.path] = e.msg; });
        setErrors(map);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {job ? 'Edit Job' : 'Add New Job'}
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Company + Role */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Company Name *"
              fullWidth
              value={form.companyName}
              onChange={set('companyName')}
              error={!!errors.companyName}
              helperText={errors.companyName}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Role Title *"
              fullWidth
              value={form.roleTitle}
              onChange={set('roleTitle')}
              error={!!errors.roleTitle}
              helperText={errors.roleTitle}
            />
          </Grid>

          {/* Job URL */}
          <Grid size={12}>
            <TextField label="Job URL" fullWidth value={form.jobUrl} onChange={set('jobUrl')} />
          </Grid>

          {/* Location + Work Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Location" fullWidth value={form.location} onChange={set('location')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select label="Work Type" fullWidth
              value={form.workType} onChange={set('workType')}
            >
              <MenuItem value="">— Select —</MenuItem>
              {WORK_TYPES.map((w) => (
                <MenuItem key={w} value={w} sx={{ textTransform: 'capitalize' }}>{w}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Salary */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Salary Min"
              type="number"
              fullWidth
              value={form.salaryMin}
              onChange={set('salaryMin')}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Salary Max"
              type="number"
              fullWidth
              value={form.salaryMax}
              onChange={set('salaryMax')}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </Grid>

          {/* Status + Fit Score */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Status" fullWidth value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fit Score (0-100)"
              type="number"
              fullWidth
              value={form.fitScore}
              onChange={set('fitScore')}
              error={!!errors.fitScore}
              helperText={errors.fitScore}
            />
          </Grid>

          {/* Dates */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Date Found"
              type="date"
              fullWidth
              value={form.dateFound}
              onChange={set('dateFound')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Date Applied"
              type="date"
              fullWidth
              value={form.dateApplied}
              onChange={set('dateApplied')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Job Description */}
          <Grid size={12}>
            <TextField
              label="Job Description"
              multiline
              rows={4}
              fullWidth
              value={form.jobDescription}
              onChange={set('jobDescription')}
            />
          </Grid>

          {/* Notes */}
          <Grid size={12}>
            <TextField
              label="Notes"
              multiline
              rows={2}
              fullWidth
              value={form.notes}
              onChange={set('notes')}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : job ? 'Save Changes' : 'Add Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
