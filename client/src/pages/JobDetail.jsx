import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneIcon from '@mui/icons-material/Phone';

import { getJob, updateJobStatus, deleteJob } from '../api/jobs';
import { createContact, deleteContact } from '../api/contacts';
import { createFollowup, deleteFollowup } from '../api/followups';
import JobFormModal from '../components/JobFormModal';
import StatusBadge from '../components/StatusBadge';
import FitScoreBadge from '../components/FitScoreBadge';
import dayjs from 'dayjs';

const STATUSES = ['To Apply', 'Applied', 'Phone Screen', 'Take Home', 'Interviewing', 'Offer', 'Rejected'];
const FOLLOWUP_TYPES = ['email', 'linkedin', 'call'];

const FOLLOWUP_ICONS = {
  email: <EmailIcon sx={{ fontSize: 16 }} />,
  linkedin: <LinkedInIcon sx={{ fontSize: 16 }} />,
  call: <PhoneIcon sx={{ fontSize: 16 }} />,
};

// ── Contact form dialog ──────────────────────────────────────────────────────
function ContactDialog({ open, onClose, jobId, companyId, onSaved }) {
  const [form, setForm] = useState({ name: '', title: '', email: '', linkedinUrl: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm({ name: '', title: '', email: '', linkedinUrl: '', notes: '' }); setError(''); }
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const res = await createContact({ ...form, jobId, companyId });
      onSaved(res.data);
      onClose();
    } catch {
      setError('Failed to save contact');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Contact</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Name *" fullWidth value={form.name} onChange={set('name')} />
        <TextField label="Title" fullWidth value={form.title} onChange={set('title')} />
        <TextField label="Email" fullWidth value={form.email} onChange={set('email')} />
        <TextField label="LinkedIn URL" fullWidth value={form.linkedinUrl} onChange={set('linkedinUrl')} />
        <TextField label="Notes" multiline rows={2} fullWidth value={form.notes} onChange={set('notes')} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Add Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Followup form dialog ─────────────────────────────────────────────────────
function FollowupDialog({ open, onClose, jobId, onSaved }) {
  const [form, setForm] = useState({ date: dayjs().format('YYYY-MM-DD'), type: 'email', notes: '', outcome: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setForm({ date: dayjs().format('YYYY-MM-DD'), type: 'email', notes: '', outcome: '' }); setError(''); }
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.date) { setError('Date is required'); return; }
    setSaving(true);
    try {
      const res = await createFollowup({ ...form, jobId });
      onSaved(res.data);
      onClose();
    } catch {
      setError('Failed to save followup');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Followup</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Date" type="date" fullWidth
          value={form.date} onChange={set('date')}
          InputLabelProps={{ shrink: true }}
        />
        <TextField select label="Type" fullWidth value={form.type} onChange={set('type')}>
          {FOLLOWUP_TYPES.map((t) => (
            <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField label="Notes" multiline rows={3} fullWidth value={form.notes} onChange={set('notes')} />
        <TextField label="Outcome" fullWidth value={form.outcome} onChange={set('outcome')} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Log Followup'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [followupOpen, setFollowupOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  async function fetchJob() {
    try {
      const res = await getJob(id);
      setJob(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchJob(); }, [id]);

  async function handleStatusChange(e) {
    setStatusUpdating(true);
    try {
      const res = await updateJobStatus(id, e.target.value);
      setJob((j) => ({ ...j, status: res.data.status }));
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    await deleteJob(id);
    navigate('/');
  }

  async function handleDeleteContact(contactId) {
    await deleteContact(contactId);
    setJob((j) => ({ ...j, contacts: j.contacts.filter((c) => c.id !== contactId) }));
  }

  async function handleDeleteFollowup(fid) {
    await deleteFollowup(fid);
    setJob((j) => ({ ...j, followups: j.followups.filter((f) => f.id !== fid) }));
  }

  function handleContactSaved(contact) {
    setJob((j) => ({ ...j, contacts: [...(j.contacts || []), contact] }));
  }

  function handleFollowupSaved(followup) {
    setJob((j) => ({
      ...j,
      followups: [...(j.followups || []), followup].sort((a, b) => new Date(a.date) - new Date(b.date)),
    }));
  }

  if (loading) {
    return (
      <Box>
        <Skeleton width={120} height={36} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2, borderRadius: 2 }} />
      </Box>
    );
  }

  if (!job) {
    return <Typography>Job not found.</Typography>;
  }

  const salary = job.salaryMin || job.salaryMax
    ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
    : '—';

  return (
    <Box>
      {/* Back + actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <IconButton onClick={handleDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left column: main info */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Header card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {job.company?.name}
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.25, mb: 1 }}>{job.roleTitle}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  {job.location && <Chip label={job.location} size="small" variant="outlined" />}
                  {job.workType && <Chip label={job.workType} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />}
                  {(job.salaryMin || job.salaryMax) && <Chip label={salary} size="small" variant="outlined" />}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <FitScoreBadge score={job.fitScore} size="medium" />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Status:</Typography>
                  <Select
                    value={job.status}
                    onChange={handleStatusChange}
                    disabled={statusUpdating}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </Box>
                {job.jobUrl && (
                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Posting
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Job description */}
          {job.jobDescription && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Job Description</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              >
                {job.jobDescription}
              </Typography>
            </Paper>
          )}

          {/* Notes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: job.notes ? 'text.primary' : 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {job.notes || 'No notes yet.'}
            </Typography>
          </Paper>
        </Grid>

        {/* Right column: sidebar info */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Details</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Status', value: <StatusBadge status={job.status} /> },
                { label: 'Date Found', value: job.dateFound ? dayjs(job.dateFound).format('MMM D, YYYY') : '—' },
                { label: 'Date Applied', value: job.dateApplied ? dayjs(job.dateApplied).format('MMM D, YYYY') : '—' },
                { label: 'Fit Score', value: <FitScoreBadge score={job.fitScore} /> },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
                  <Typography variant="body2" component="span">{value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Contacts */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1">Contacts</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setContactOpen(true)}>
                Add
              </Button>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            {job.contacts?.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No contacts yet.</Typography>
            ) : (
              <List dense disablePadding>
                {job.contacts.map((c) => (
                  <ListItem
                    key={c.id}
                    disablePadding
                    secondaryAction={
                      <IconButton size="small" onClick={() => handleDeleteContact(c.id)} color="error">
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    }
                    sx={{ mb: 1.5 }}
                  >
                    <ListItemText
                      primary={c.name}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          {c.title && <span>{c.title}</span>}
                          {c.email && <span style={{ color: '#60A5FA' }}>{c.email}</span>}
                          {c.linkedinUrl && (
                            <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#60A5FA', fontSize: '0.75rem' }}>
                              LinkedIn
                            </a>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Full-width: Followup timeline */}
        <Grid size={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1">Followup Timeline</Typography>
              <Button size="small" startIcon={<AddIcon />} onClick={() => setFollowupOpen(true)}>
                Log Followup
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {job.followups?.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>No followups logged yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {job.followups.map((f, idx) => (
                  <Box key={f.id} sx={{ display: 'flex', gap: 2 }}>
                    {/* Timeline line */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28 }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%',
                        bgcolor: 'primary.dark',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'primary.light', flexShrink: 0,
                      }}>
                        {FOLLOWUP_ICONS[f.type]}
                      </Box>
                      {idx < job.followups.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5, minHeight: 24 }} />
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ pb: 2.5, flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {f.type}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {dayjs(f.date).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleDeleteFollowup(f.id)} color="error">
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      {f.notes && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{f.notes}</Typography>
                      )}
                      {f.outcome && (
                        <Chip
                          label={f.outcome}
                          size="small"
                          sx={{ mt: 0.75, bgcolor: 'rgba(79,142,247,0.12)', color: 'primary.light', fontSize: '0.72rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modals */}
      <JobFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => fetchJob()}
        job={job}
      />
      <ContactDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        jobId={job.id}
        companyId={job.companyId}
        onSaved={handleContactSaved}
      />
      <FollowupDialog
        open={followupOpen}
        onClose={() => setFollowupOpen(false)}
        jobId={job.id}
        onSaved={handleFollowupSaved}
      />
    </Box>
  );
}
