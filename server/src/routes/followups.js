const express = require('express');
const { body } = require('express-validator');
const prisma = require('../prisma');
const { validate } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

const VALID_TYPES = ['email', 'linkedin', 'call'];

const followupValidation = [
  body('jobId').isInt({ min: 1 }).withMessage('Valid job ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').isIn(VALID_TYPES).withMessage('Type must be email, linkedin, or call'),
];

// Verify a job belongs to the current user
async function ownedJob(jobId, userId) {
  return prisma.job.findFirst({ where: { id: Number(jobId), userId } });
}

router.get('/', async (req, res, next) => {
  try {
    const { jobId } = req.query;
    // Always scope to the user's jobs
    const where = { job: { userId: req.userId } };
    if (jobId) where.jobId = Number(jobId);

    const followups = await prisma.followup.findMany({
      where,
      include: { job: { select: { id: true, roleTitle: true } } },
      orderBy: { date: 'asc' },
    });
    res.json(followups);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const followup = await prisma.followup.findFirst({
      where: { id: Number(req.params.id), job: { userId: req.userId } },
      include: { job: true },
    });
    if (!followup) return res.status(404).json({ error: 'Followup not found' });
    res.json(followup);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(followupValidation), async (req, res, next) => {
  try {
    const { jobId, date, type, notes, outcome } = req.body;
    const job = await ownedJob(jobId, req.userId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const followup = await prisma.followup.create({
      data: { jobId: Number(jobId), date: new Date(date), type, notes, outcome },
      include: { job: { select: { id: true, roleTitle: true } } },
    });
    res.status(201).json(followup);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(followupValidation), async (req, res, next) => {
  try {
    const existing = await prisma.followup.findFirst({
      where: { id: Number(req.params.id), job: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ error: 'Followup not found' });

    const { jobId, date, type, notes, outcome } = req.body;
    const followup = await prisma.followup.update({
      where: { id: Number(req.params.id) },
      data: { jobId: Number(jobId), date: new Date(date), type, notes, outcome },
      include: { job: { select: { id: true, roleTitle: true } } },
    });
    res.json(followup);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.followup.findFirst({
      where: { id: Number(req.params.id), job: { userId: req.userId } },
    });
    if (!existing) return res.status(404).json({ error: 'Followup not found' });

    await prisma.followup.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
