const express = require('express');
const { body } = require('express-validator');
const prisma = require('../prisma');
const { validate } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Contact name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('linkedinUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid LinkedIn URL'),
];

router.get('/', async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      include: {
        job: { select: { id: true, roleTitle: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
      include: { job: true, company: true },
    });
    if (!contact) return res.status(404).json({ error: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(contactValidation), async (req, res, next) => {
  try {
    const { jobId, companyId, name, title, email, linkedinUrl, notes } = req.body;
    const contact = await prisma.contact.create({
      data: {
        userId: req.userId,
        jobId: jobId ? Number(jobId) : null,
        companyId: companyId ? Number(companyId) : null,
        name, title, email, linkedinUrl, notes,
      },
      include: {
        job: { select: { id: true, roleTitle: true } },
        company: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(contactValidation), async (req, res, next) => {
  try {
    const existing = await prisma.contact.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Contact not found' });

    const { jobId, companyId, name, title, email, linkedinUrl, notes } = req.body;
    const contact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: {
        jobId: jobId ? Number(jobId) : null,
        companyId: companyId ? Number(companyId) : null,
        name, title, email, linkedinUrl, notes,
      },
      include: {
        job: { select: { id: true, roleTitle: true } },
        company: { select: { id: true, name: true } },
      },
    });
    res.json(contact);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await prisma.contact.deleteMany({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (result.count === 0) return res.status(404).json({ error: 'Contact not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
