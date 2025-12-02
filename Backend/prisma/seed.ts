import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding ...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Organization User
  const orgEmail = 'admin@stemtrust-ng.org';
  const orgUser = await prisma.user.upsert({
    where: { email: orgEmail },
    update: {},
    create: {
      email: orgEmail,
      passwordHash,
      role: 'organization',
      organization: {
        create: {
          name: 'Nigerian Research Foundation',
          description: 'Supporting STEM research across Nigeria.',
        },
      },
    },
  });
  console.log(`Created organization user: ${orgUser.email}`);

  // 1.1 Organization Members
  const org = await prisma.organization.findUnique({ where: { userId: orgUser.id } });
  if (org) {
    await prisma.organizationMember.createMany({
      data: [
        {
          organizationId: org.id,
          email: 'admin@stemtrust-ng.org',
          name: 'Dr. Adewale',
          votingPower: 5,
          status: 'active',
          role: 'admin',
          joinedDate: new Date('2024-01-01'),
        },
        {
          organizationId: org.id,
          email: 'sarah@stemtrust-ng.org',
          name: 'Sarah Okafor',
          votingPower: 3,
          status: 'active',
          role: 'member',
          joinedDate: new Date('2024-01-15'),
        },
        {
          organizationId: org.id,
          email: 'emmanuel@stemtrust-ng.org',
          name: 'Emmanuel Nwachukwu',
          votingPower: 1,
          status: 'active',
          role: 'member',
          joinedDate: new Date('2024-02-01'),
        }
      ],
      skipDuplicates: true,
    });
    console.log('Created organization members');
  }

  // 2. Researcher User
  const resEmail = 'researcher@unilag.edu.ng'; // Using a likely email
  const resUser = await prisma.user.upsert({
    where: { email: resEmail },
    update: {},
    create: {
      email: resEmail,
      passwordHash,
      role: 'researcher',
      researcher: {
        create: {
          name: 'Dr. Chioma Okonkwo',
          institution: 'University of Lagos',
          bio: 'Senior Researcher in Agricultural Science.',
        },
      },
    },
  });
  console.log(`Created researcher user: ${resUser.email}`);

  // 3. Projects
  const researcher = await prisma.researcher.findUnique({ where: { userId: resUser.id } });
  
  if (org && researcher) {
    // Project 1: Active
    const proj1 = await prisma.project.create({
      data: {
        title: 'AI-Powered Agricultural Pest Detection',
        description: 'Using computer vision to detect pests in cassava farms.',
        category: 'Agriculture',
        organizationId: org.id,
        researcherId: researcher.id,
        totalFunding: 50000,
        fundingReleased: 15000,
        status: 'active',
        createdAt: new Date('2024-02-01'),
        milestones: {
          create: [
            {
              stageNumber: 1,
              title: 'Project Setup & Data Collection',
              description: 'Set up AI environment and collect initial dataset.',
              fundingAmount: 15000,
              fundingPercentage: 30,
              durationWeeks: 4,
              status: 'approved',
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-03-01'),
              approvedDate: new Date('2024-03-05'),
            },
            {
              stageNumber: 2,
              title: 'Model Training',
              description: 'Train the initial computer vision model.',
              fundingAmount: 15000,
              fundingPercentage: 30,
              durationWeeks: 6,
              status: 'in_progress',
              startDate: new Date('2024-03-10'),
            },
            {
              stageNumber: 3,
              title: 'Field Testing',
              description: 'Test the model in real farms.',
              fundingAmount: 20000,
              fundingPercentage: 40,
              durationWeeks: 8,
              status: 'pending',
            }
          ]
        }
      }
    });
    console.log(`Created project: ${proj1.title}`);

    // Project 2: Completed
    const proj2 = await prisma.project.create({
      data: {
        title: 'Blockchain-Based Supply Chain for Cocoa',
        description: 'Tracking cocoa beans from farm to export.',
        category: 'Technology',
        organizationId: org.id,
        researcherId: researcher.id,
        totalFunding: 75000,
        fundingReleased: 75000,
        status: 'completed',
        createdAt: new Date('2023-06-01'),
        milestones: {
          create: [
            {
              stageNumber: 1,
              title: 'System Design',
              fundingAmount: 25000,
              status: 'approved',
            },
            {
              stageNumber: 2,
              title: 'Development',
              fundingAmount: 25000,
              status: 'approved',
            },
            {
              stageNumber: 3,
              title: 'Deployment',
              fundingAmount: 25000,
              status: 'approved',
            }
          ]
        }
      }
    });
    console.log(`Created project: ${proj2.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
