const express = require('express');
const { body } = require('express-validator');
const prisma = require('../prisma');
const { validate } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

const VALID_STATUSES = ['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
const VALID_WORK_TYPES = ['remote', 'hybrid', 'onsite'];

const jobValidation = [
  body('roleTitle').trim().notEmpty().withMessage('Role title is required'),
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('workType').optional({ checkFalsy: true }).isIn([...VALID_WORK_TYPES, '']).withMessage('Invalid work type'),
  body('fitScore').optional({ nullable: true }).isInt({ min: 0, max: 100 }).withMessage('Fit score must be 0-100'),
  body('salaryMin').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Invalid salary min'),
  body('salaryMax').optional({ nullable: true }).isInt({ min: 0 }).withMessage('Invalid salary max'),
];

// Find or create a global company, then ensure the user has a bridge row
async function resolveCompany(companyName, userId) {
  let company = await prisma.company.findFirst({
    where: { name: { equals: companyName, mode: 'insensitive' } },
  });
  if (!company) {
    company = await prisma.company.create({ data: { name: companyName } });
  }
  // Ensure bridge row exists (upsert is safe to call even if it already exists)
  await prisma.userCompany.upsert({
    where: { userId_companyId: { userId, companyId: company.id } },
    create: { userId, companyId: company.id },
    update: {},
  });
  return company;
}

router.get('/', async (req, res, next) => {
  try {
    const { status, workType, search, sortBy } = req.query;
    const where = { userId: req.userId };
    if (status) where.status = status;
    if (workType) where.workType = workType;
    if (search) {
      where.OR = [
        { roleTitle: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderByMap = {
      fitScore: { fitScore: 'desc' },
      dateAdded: { createdAt: 'desc' },
      dateApplied: { dateApplied: 'desc' },
    };

    const jobs = await prisma.job.findMany({
      where,
      orderBy: orderByMap[sortBy] || { createdAt: 'desc' },
      include: {
        company: true,
        followups: { orderBy: { date: 'desc' }, take: 1 },
        _count: { select: { contacts: true, followups: true } },
      },
    });
    res.json(jobs);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
      include: {
        company: true,
        contacts: true,
        followups: { orderBy: { date: 'asc' } },
      },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(jobValidation), async (req, res, next) => {
  try {
    const {
      companyName, roleTitle, jobDescription, jobUrl,
      salaryMin, salaryMax, location, workType, status,
      fitScore, dateFound, dateApplied, notes,
    } = req.body;

    const company = await resolveCompany(companyName, req.userId);

    const job = await prisma.job.create({
      data: {
        userId: req.userId,
        companyId: company.id,
        roleTitle,
        jobDescription,
        jobUrl,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        location,
        workType,
        status: status || 'To Apply',
        fitScore: fitScore != null ? Number(fitScore) : null,
        dateFound: dateFound ? new Date(dateFound) : null,
        dateApplied: dateApplied ? new Date(dateApplied) : null,
        notes,
      },
      include: { company: true },
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(jobValidation), async (req, res, next) => {
  try {
    const {
      companyName, roleTitle, jobDescription, jobUrl,
      salaryMin, salaryMax, location, workType, status,
      fitScore, dateFound, dateApplied, notes,
    } = req.body;

    const existing = await prisma.job.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Job not found' });

    const company = await resolveCompany(companyName, req.userId);

    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: {
        companyId: company.id,
        roleTitle,
        jobDescription,
        jobUrl,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        salaryMax: salaryMax ? Number(salaryMax) : null,
        location,
        workType,
        status,
        fitScore: fitScore != null ? Number(fitScore) : null,
        dateFound: dateFound ? new Date(dateFound) : null,
        dateApplied: dateApplied ? new Date(dateApplied) : null,
        notes,
      },
      include: { company: true },
    });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(422).json({ error: 'Invalid status' });
    }
    const existing = await prisma.job.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Job not found' });

    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { company: true },
    });
    res.json(job);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await prisma.job.deleteMany({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Job not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
