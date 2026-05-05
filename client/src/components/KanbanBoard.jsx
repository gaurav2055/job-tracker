import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaptopIcon from '@mui/icons-material/Laptop';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import StatusBadge from './StatusBadge';
import FitScoreBadge from './FitScoreBadge';
import { updateJobStatus } from '../api/jobs';
import dayjs from 'dayjs';

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS = [
  {
    status: 'Applied',
    color: '#60A5FA',
    tooltip: 'You\'ve submitted the application and are waiting to hear back.',
  },
  {
    status: 'Phone Screen',
    color: '#A78BFA',
    tooltip: 'A short 15-30 min call with a recruiter to discuss your background and interest in the role.',
  },
  {
    status: 'Take Home',
    color: '#FB923C',
    tooltip: 'A coding assignment to complete on your own time, typically within 24-48 hours.',
  },
  {
    status: 'Interviewing',
    color: '#FCD34D',
    tooltip: 'Live technical or behavioral interview rounds with the team.',
  },
  {
    status: 'Offer',
    color: '#34D399',
    tooltip: 'You received a job offer. Congrats!',
  },
  {
    status: 'Rejected',
    color: '#F87171',
    tooltip: 'The company decided not to move forward at this stage.',
  },
];

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `$${(n / 1000).toFixed(0)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max)}`;
}

// ── Mini job card (used both in column and drag overlay) ──────────────────────
function JobMiniCard({ job, isDragging = false, dragListeners, dragRef, dragStyle }) {
  const navigate = useNavigate();
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Paper
      ref={dragRef}
      elevation={isDragging ? 8 : 0}
      onClick={() => !isDragging && navigate(`/jobs/${job.id}`)}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.95 : 1,
        transform: dragStyle,
        transition: isDragging ? undefined : 'box-shadow 0.15s',
        userSelect: 'none',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' },
        bgcolor: 'background.paper',
      }}
      {...(dragListeners || {})}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
        <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 0.4 }} noWrap>
            {job.company?.name}
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3, mt: 0.25 }}>
            {job.roleTitle}
          </Typography>
        </Box>
        <FitScoreBadge score={job.fitScore} />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {job.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <LocationOnIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{job.location}</Typography>
          </Box>
        )}
        {job.workType && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <LaptopIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', textTransform: 'capitalize' }}>{job.workType}</Typography>
          </Box>
        )}
        {salary && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <AttachMoneyIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{salary}</Typography>
          </Box>
        )}
      </Box>

      {job.dateApplied && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>
          Applied {dayjs(job.dateApplied).format('MMM D')}
        </Typography>
      )}
    </Paper>
  );
}

// ── Draggable card wrapper ────────────────────────────────────────────────────
function DraggableCard({ job }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: job.id });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{ opacity: isDragging ? 0.35 : 1, touchAction: 'none' }}
    >
      <JobMiniCard job={job} />
    </Box>
  );
}

// ── Droppable column ──────────────────────────────────────────────────────────
function KanbanColumn({ status, color, tooltip, jobs }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Box
      sx={{
        minWidth: 260,
        maxWidth: 280,
        flex: '0 0 260px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5,
        px: 1, py: 0.75,
        borderRadius: 2,
        borderLeft: `3px solid ${color}`,
        bgcolor: 'background.paper',
      }}>
        <Typography variant="body2" fontWeight={700} sx={{ flex: 1, color }}>
          {status}
        </Typography>
        <Chip
          label={jobs.length}
          size="small"
          sx={{ height: 18, fontSize: '0.7rem', bgcolor: `${color}22`, color }}
        />
        <Tooltip title={tooltip} arrow placement="top">
          <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>

      {/* Drop zone */}
      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          minHeight: 120,
          borderRadius: 2,
          p: 1,
          bgcolor: isOver ? 'rgba(79,142,247,0.06)' : 'rgba(255,255,255,0.02)',
          border: '1px dashed',
          borderColor: isOver ? 'primary.main' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        {jobs.length === 0 ? (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 3 }}>
            Drop here
          </Typography>
        ) : (
          jobs.map((job) => <DraggableCard key={job.id} job={job} />)
        )}
      </Box>
    </Box>
  );
}

// ── Main Kanban board ─────────────────────────────────────────────────────────
export default function KanbanBoard({ jobs, onStatusChange }) {
  const [activeJob, setActiveJob] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragStart(event) {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job || null);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;

    const job = jobs.find((j) => j.id === active.id);
    const newStatus = over.id; // column id = status string

    if (!job || job.status === newStatus) return;

    try {
      await updateJobStatus(job.id, newStatus);
      onStatusChange(job.id, newStatus);
    } catch {
      // silently fail — board stays in current state
    }
  }

  const jobsByStatus = (status) => jobs.filter((j) => j.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            color={col.color}
            tooltip={col.tooltip}
            jobs={jobsByStatus(col.status)}
          />
        ))}
      </Box>

      {/* Card shown while dragging */}
      <DragOverlay dropAnimation={null}>
        {activeJob ? <JobMiniCard job={activeJob} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
