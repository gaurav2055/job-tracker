const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Credentials for the seeded account ───────────────────────────────────────
const SEED_EMAIL    = process.env.SEED_EMAIL    || 'jaygauravs@gmail.com';
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'changeme123';
const SEED_NAME     = process.env.SEED_NAME     || 'Jay';

async function main() {
  console.log('Clearing existing data...');
  await prisma.followup.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.job.deleteMany();
  await prisma.userCompany.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log(`Creating user: ${SEED_EMAIL}`);
  const hashed = await bcrypt.hash(SEED_PASSWORD, 12);
  const user = await prisma.user.create({
    data: { email: SEED_EMAIL, password: hashed, name: SEED_NAME },
  });
  const uid = user.id;

  console.log('Seeding your actual applications...');

  // ── Companies (global — no userId) ───────────────────────────────────────
  const companies = await Promise.all([
    prisma.company.create({ data: { name: '8090 Solutions' } }),
    prisma.company.create({ data: { name: 'Mixpanel', industry: 'Analytics', size: 'mid' } }),
    prisma.company.create({ data: { name: 'Two Dots', industry: 'Gaming', size: 'startup' } }),
    prisma.company.create({ data: { name: 'CloudinnTech ELearning', industry: 'EdTech', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Amplify', industry: 'EdTech', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Teravision Technologies', industry: 'Software', size: 'mid' } }),
    prisma.company.create({ data: { name: 'Glimpse', industry: 'Software', size: 'startup' } }),
    prisma.company.create({ data: { name: '120Water', industry: 'Environmental Tech', size: 'startup' } }),
    prisma.company.create({ data: { name: 'OpenAI', industry: 'AI / ML', size: 'mid', location: 'San Francisco, CA' } }),
    prisma.company.create({ data: { name: 'Retell AI', industry: 'AI / ML', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Nooks', industry: 'Sales Tech', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Finpilot', industry: 'Fintech / AI', size: 'startup' } }),
    prisma.company.create({ data: { name: 'GC AI', industry: 'AI / ML', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Sift', industry: 'Fraud Prevention', size: 'mid' } }),
    prisma.company.create({ data: { name: 'Allen Control Systems', industry: 'Defense / Aerospace', size: 'mid' } }),
    prisma.company.create({ data: { name: 'Cognition', industry: 'AI / ML', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Schepmont Group', industry: 'Software', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Lila Sciences', industry: 'Biotech / AI', size: 'startup' } }),
    prisma.company.create({ data: { name: 'ZENDA, LLC', industry: 'AI / ML', size: 'startup' } }),
    prisma.company.create({ data: { name: 'BeaconFire Inc.', industry: 'Software', size: 'startup' } }),
    prisma.company.create({ data: { name: 'Elliott Davis', industry: 'Consulting', size: 'mid' } }),
  ]);

  // ── Bridge rows (user ↔ company) ──────────────────────────────────────────
  await prisma.userCompany.createMany({
    data: companies.map((c) => ({ userId: uid, companyId: c.id })),
  });

  const [
    c8090, cMixpanel, cTwoDots, cCloudinn, cAmplify,
    cTeravision, cGlimpse, c120Water, cOpenAI, cRetellAI,
    cNooks, cFinpilot, cGCAI, cSift, cAllen,
    cCognition, cSchepmont, cLila, cZenda, cBeaconFire, cElliott,
  ] = companies;

  // ── Jobs ──────────────────────────────────────────────────────────────────
  await prisma.job.createMany({
    data: [
      { userId: uid, companyId: c8090.id,       roleTitle: 'Full Stack Engineer',                  status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cMixpanel.id,   roleTitle: 'Software Engineer, Growth',            status: 'Applied', workType: 'hybrid',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cTwoDots.id,    roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cCloudinn.id,   roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cAmplify.id,    roleTitle: 'Senior Software Engineer',             status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cTeravision.id, roleTitle: 'Fullstack Developer',                  status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: cGlimpse.id,    roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-05-03'), dateApplied: new Date('2026-05-03') },
      { userId: uid, companyId: c120Water.id,   roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-24'), dateApplied: new Date('2026-04-24') },
      { userId: uid, companyId: cOpenAI.id,     roleTitle: 'Software Engineer, Full Stack',        status: 'Applied', workType: 'hybrid',  dateFound: new Date('2026-04-20'), dateApplied: new Date('2026-04-20'), location: 'San Francisco, CA' },
      { userId: uid, companyId: cRetellAI.id,   roleTitle: 'Senior Software Engineer, Full Stack', status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-20'), dateApplied: new Date('2026-04-20') },
      { userId: uid, companyId: cNooks.id,      roleTitle: 'Software Engineer, Fullstack',         status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-20'), dateApplied: new Date('2026-04-20') },
      { userId: uid, companyId: cSchepmont.id,  roleTitle: 'Full Stack Developer',                 status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-19'), dateApplied: new Date('2026-04-19') },
      { userId: uid, companyId: cLila.id,       roleTitle: 'Senior Software Engineer, Frontend',   status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-19'), dateApplied: new Date('2026-04-19') },
      { userId: uid, companyId: cZenda.id,      roleTitle: 'AI Full Stack Engineer',               status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-19'), dateApplied: new Date('2026-04-19') },
      { userId: uid, companyId: cNooks.id,      roleTitle: 'Software Engineer, Product',           status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-18'), dateApplied: new Date('2026-04-18') },
      { userId: uid, companyId: cFinpilot.id,   roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-18'), dateApplied: new Date('2026-04-18') },
      { userId: uid, companyId: cGCAI.id,       roleTitle: 'Software Engineer, Product',           status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-18'), dateApplied: new Date('2026-04-18') },
      { userId: uid, companyId: cSift.id,       roleTitle: 'Software Engineer, Full Stack',        status: 'Applied', workType: 'hybrid',  dateFound: new Date('2026-04-18'), dateApplied: new Date('2026-04-18') },
      { userId: uid, companyId: cAllen.id,      roleTitle: 'Full Stack Developer',                 status: 'Applied', workType: 'onsite',  dateFound: new Date('2026-04-18'), dateApplied: new Date('2026-04-18') },
      { userId: uid, companyId: cCognition.id,  roleTitle: 'Full-Stack Engineer',                  status: 'Applied', workType: 'onsite',  dateFound: new Date('2026-04-17'), dateApplied: new Date('2026-04-17'), location: 'San Francisco, CA' },
      { userId: uid, companyId: cBeaconFire.id, roleTitle: 'Software Engineer',                    status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-03'), dateApplied: new Date('2026-04-03') },
      { userId: uid, companyId: cBeaconFire.id, roleTitle: 'Full Stack Engineer',                  status: 'Applied', workType: 'remote',  dateFound: new Date('2026-04-03'), dateApplied: new Date('2026-04-03') },
      { userId: uid, companyId: cElliott.id,    roleTitle: 'Web Developer',                        status: 'Applied', workType: 'hybrid',  dateFound: new Date('2026-04-03'), dateApplied: new Date('2026-04-03') },
    ],
  });

  const count = await prisma.job.count();
  console.log(`Seed complete! 1 user, ${companies.length} companies, ${count} jobs.`);
  console.log(`\nLogin with:\n  Email:    ${SEED_EMAIL}\n  Password: ${SEED_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
