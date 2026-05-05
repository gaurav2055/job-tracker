const express = require('express');
const prisma = require('../prisma');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const uid = req.userId;
    const [total, applied, interviewing, offers, avgFit] = await Promise.all([
      prisma.job.count({ where: { userId: uid } }),
      prisma.job.count({ where: { userId: uid, status: 'Applied' } }),
      prisma.job.count({ where: { userId: uid, status: 'Interviewing' } }),
      prisma.job.count({ where: { userId: uid, status: 'Offer' } }),
      prisma.job.aggregate({ where: { userId: uid }, _avg: { fitScore: true } }),
    ]);

    res.json({
      total,
      applied,
      interviewing,
      offers,
      avgFitScore: avgFit._avg.fitScore ? Math.round(avgFit._avg.fitScore) : null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
