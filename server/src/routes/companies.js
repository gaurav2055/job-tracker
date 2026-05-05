const express = require('express');
const { body } = require('express-validator');
const prisma = require('../prisma');
const { validate } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

const companyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL'),
  body('size').optional().isIn(['startup', 'mid', 'large', '']).withMessage('Invalid size'),
];

// Merge user's personal notes from the bridge into the company object
function mergeNotes(company, uid) {
  const uc = company.userCompanies?.find((r) => r.userId === uid);
  const { userCompanies: _, ...rest } = company;
  return { ...rest, notes: uc?.notes ?? null };
}

// GET /api/companies — companies this user has jobs at OR an explicit bridge row for
router.get('/', async (req, res, next) => {
  try {
    const uid = req.userId;
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { jobs: { some: { userId: uid } } },
          { userCompanies: { some: { userId: uid } } },
        ],
      },
      include: {
        userCompanies: { where: { userId: uid }, select: { userId: true, notes: true } },
        _count: { select: { jobs: { where: { userId: uid } } } },
      },
      orderBy: { name: 'asc' },
    });

    res.json(companies.map((c) => mergeNotes(c, uid)));
  } catch (err) {
    next(err);
  }
});

// GET /api/companies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const uid = req.userId;
    const company = await prisma.company.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        userCompanies: { where: { userId: uid }, select: { userId: true, notes: true } },
        jobs: { where: { userId: uid }, orderBy: { createdAt: 'desc' } },
        contacts: { where: { userId: uid } },
      },
    });

    // 404 if company doesn't exist OR this user has no relationship to it
    if (!company || (company.jobs.length === 0 && company.userCompanies.length === 0)) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(mergeNotes(company, uid));
  } catch (err) {
    next(err);
  }
});

// POST /api/companies — create (or find) global company + ensure bridge row
router.post('/', validate(companyValidation), async (req, res, next) => {
  try {
    const { name, website, industry, size, location, notes } = req.body;
    const uid = req.userId;

    let company = await prisma.company.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!company) {
      company = await prisma.company.create({ data: { name, website, industry, size, location } });
    }

    const uc = await prisma.userCompany.upsert({
      where: { userId_companyId: { userId: uid, companyId: company.id } },
      create: { userId: uid, companyId: company.id, notes },
      update: { notes },
    });

    res.status(201).json({ ...company, notes: uc.notes });
  } catch (err) {
    next(err);
  }
});

// PUT /api/companies/:id — update global fields + user's notes
router.put('/:id', validate(companyValidation), async (req, res, next) => {
  try {
    const { name, website, industry, size, location, notes } = req.body;
    const uid = req.userId;
    const cid = Number(req.params.id);

    const company = await prisma.company.update({
      where: { id: cid },
      data: { name, website, industry, size, location },
    });

    const uc = await prisma.userCompany.upsert({
      where: { userId_companyId: { userId: uid, companyId: cid } },
      create: { userId: uid, companyId: cid, notes },
      update: { notes },
    });

    res.json({ ...company, notes: uc.notes });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Company not found' });
    next(err);
  }
});

// DELETE /api/companies/:id — remove bridge row (unlinks user, leaves global company intact)
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await prisma.userCompany.deleteMany({
      where: { userId: req.userId, companyId: Number(req.params.id) },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Company not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
