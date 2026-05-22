import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create state license requirements
  const states = [
    { state: 'CA', stateName: 'California', isCompactState: false },
    { state: 'TX', stateName: 'Texas', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NY', stateName: 'New York', isCompactState: false },
    { state: 'FL', stateName: 'Florida', isCompactState: true, compactJoinedAt: new Date('2018-01-01') },
    { state: 'PA', stateName: 'Pennsylvania', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'IL', stateName: 'Illinois', isCompactState: true, compactJoinedAt: new Date('2018-01-01') },
    { state: 'OH', stateName: 'Ohio', isCompactState: true, compactJoinedAt: new Date('2019-01-01') },
    { state: 'GA', stateName: 'Georgia', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NC', stateName: 'North Carolina', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MI', stateName: 'Michigan', isCompactState: true, compactJoinedAt: new Date('2021-01-01') },
    { state: 'AZ', stateName: 'Arizona', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'WA', stateName: 'Washington', isCompactState: false },
    { state: 'CO', stateName: 'Colorado', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'TN', stateName: 'Tennessee', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MO', stateName: 'Missouri', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MD', stateName: 'Maryland', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'WI', stateName: 'Wisconsin', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MN', stateName: 'Minnesota', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'SC', stateName: 'South Carolina', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'AL', stateName: 'Alabama', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'KY', stateName: 'Kentucky', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'KS', stateName: 'Kansas', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NE', stateName: 'Nebraska', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'WY', stateName: 'Wyoming', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'SD', stateName: 'South Dakota', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'ND', stateName: 'North Dakota', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MT', stateName: 'Montana', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'ID', stateName: 'Idaho', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'UT', stateName: 'Utah', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'IA', stateName: 'Iowa', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'WV', stateName: 'West Virginia', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'ME', stateName: 'Maine', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NH', stateName: 'New Hampshire', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'DE', stateName: 'Delaware', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'VT', stateName: 'Vermont', isCompactState: false },
    { state: 'RI', stateName: 'Rhode Island', isCompactState: false },
    { state: 'CT', stateName: 'Connecticut', isCompactState: false },
    { state: 'MA', stateName: 'Massachusetts', isCompactState: false },
    { state: 'NJ', stateName: 'New Jersey', isCompactState: false },
    { state: 'IN', stateName: 'Indiana', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'MS', stateName: 'Mississippi', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'AR', stateName: 'Arkansas', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'OK', stateName: 'Oklahoma', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NM', stateName: 'New Mexico', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'LA', stateName: 'Louisiana', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'NV', stateName: 'Nevada', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'OR', stateName: 'Oregon', isCompactState: false },
    { state: 'AK', stateName: 'Alaska', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
    { state: 'HI', stateName: 'Hawaii', isCompactState: false },
    { state: 'DC', stateName: 'District of Columbia', isCompactState: false },
    { state: 'VA', stateName: 'Virginia', isCompactState: true, compactJoinedAt: new Date('2017-01-01') },
  ];

  for (const stateData of states) {
    await prisma.stateLicenseRequirement.upsert({
      where: { state: stateData.state },
      update: {},
      create: {
        ...stateData,
        physicianRequirements: {
          licenseTypes: ['MD', 'DO'],
          renewalPeriod: '2 years',
          cmeHours: 50,
          boardCertificationRequired: true
        },
        npRequirements: {
          licenseTypes: ['NP'],
          renewalPeriod: '2 years',
          collaborativeAgreement: stateData.isCompactState ? 'Not required in compact states' : 'May be required'
        },
        nursingRequirements: {
          licenseTypes: ['RN', 'LPN'],
          renewalPeriod: '2 years',
          compactEligible: stateData.isCompactState
        }
      }
    });
  }

  // Create specialty requirements
  const specialties = [
    { specialty: 'Emergency Medicine', requiredBoards: ['ABEM', 'AOBEM'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'Hospitalist', requiredBoards: ['ABIM', 'AOBIM'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Family Medicine', requiredBoards: ['ABFM', 'AOBFP'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Internal Medicine', requiredBoards: ['ABIM', 'AOBIM'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Anesthesiology', requiredBoards: ['ABA', 'AOBA'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'General Surgery', requiredBoards: ['ABS', 'AOBS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Obstetrics & Gynecology', requiredBoards: ['ABOG', 'AOBOG'], requiredCerts: ['ACLS', 'BLS', 'NRP'], compactEligible: true },
    { specialty: 'Psychiatry', requiredBoards: ['ABPN'], requiredCerts: ['BLS'], compactEligible: true },
    { specialty: 'Pediatrics', requiredBoards: ['ABP', 'AOBP'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'Cardiology', requiredBoards: ['ABIM-CV'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Critical Care', requiredBoards: ['ABIM-CCM'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Radiology', requiredBoards: ['ABR'], requiredCerts: ['BLS'], compactEligible: true },
    { specialty: 'Orthopedic Surgery', requiredBoards: ['ABOS', 'AOBOS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Neurosurgery', requiredBoards: ['ABNS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Urology', requiredBoards: ['ABU'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Gastroenterology', requiredBoards: ['ABIM-GI'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Pulmonology', requiredBoards: ['ABIM-PL'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Nephrology', requiredBoards: ['ABIM-NP'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Oncology', requiredBoards: ['ABIM-ONC'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Infectious Disease', requiredBoards: ['ABIM-ID'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Neurology', requiredBoards: ['ABPN-N'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Dermatology', requiredBoards: ['ABD'], requiredCerts: ['BLS'], compactEligible: true },
    { specialty: 'Ophthalmology', requiredBoards: ['ABO'], requiredCerts: ['BLS'], compactEligible: true },
    { specialty: 'ENT', requiredBoards: ['ABOto'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Plastic Surgery', requiredBoards: ['ABPS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Pain Management', requiredBoards: ['ABPM'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Trauma Surgery', requiredBoards: ['ABS-TS'], requiredCerts: ['ACLS', 'ATLS', 'BLS'], compactEligible: true },
    { specialty: 'Vascular Surgery', requiredBoards: ['ABS-VS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Thoracic Surgery', requiredBoards: ['ABTS'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Nurse Practitioner - Primary Care', requiredBoards: ['AANP', 'ANCC'], requiredCerts: ['BLS'], compactEligible: true },
    { specialty: 'Nurse Practitioner - Acute Care', requiredBoards: ['AACN'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Nurse Practitioner - Emergency', requiredBoards: ['ENP-C'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'Physician Assistant - Surgery', requiredBoards: ['NCCPA'], requiredCerts: ['ACLS', 'BLS'], compactEligible: true },
    { specialty: 'Physician Assistant - Emergency', requiredBoards: ['NCCPA'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'CRNA', requiredBoards: ['NBCRNA'], requiredCerts: ['ACLS', 'BLS', 'PALS'], compactEligible: true },
    { specialty: 'Radiologic Technologist', requiredBoards: ['ARRT'], requiredCerts: ['BLS'], compactEligible: false },
    { specialty: 'CT Technologist', requiredBoards: ['ARRT(CT)'], requiredCerts: ['BLS', 'IV'], compactEligible: false },
    { specialty: 'MRI Technologist', requiredBoards: ['ARRT(MR)'], requiredCerts: ['BLS', 'MRI Safety'], compactEligible: false },
    { specialty: 'Medical Technologist', requiredBoards: ['ASCP', 'AMT'], requiredCerts: [], compactEligible: false },
    { specialty: 'Registered Respiratory Therapist', requiredBoards: ['NBRC'], requiredCerts: ['ACLS', 'BLS'], compactEligible: false },
    { specialty: 'Physical Therapist', requiredBoards: ['FCCPT'], requiredCerts: [], compactEligible: false },
    { specialty: 'Occupational Therapist', requiredBoards: ['NBCOT'], requiredCerts: [], compactEligible: false },
  ];

  for (const spec of specialties) {
    await prisma.specialtyRequirement.upsert({
      where: { specialty_subSpecialty: { specialty: spec.specialty, subSpecialty: null } },
      update: {},
      create: spec
    });
  }

  // Create data retention policies
  const retentionPolicies = [
    { dataType: 'audit_log', retentionDays: 2555, archiveAfterDays: 2190, destroyAfterDays: 3650 },
    { dataType: 'message', retentionDays: 2555, archiveAfterDays: 2190, destroyAfterDays: 3650 },
    { dataType: 'credential', retentionDays: 2555, archiveAfterDays: 2190, destroyAfterDays: 3650 },
    { dataType: 'application', retentionDays: 1825, archiveAfterDays: 1460, destroyAfterDays: 2555 },
    { dataType: 'payment', retentionDays: 2555, archiveAfterDays: 2190, destroyAfterDays: 3650 },
    { dataType: 'user_profile', retentionDays: 2555, archiveAfterDays: 2190, destroyAfterDays: 3650 },
  ];

  for (const policy of retentionPolicies) {
    await prisma.dataRetentionPolicy.upsert({
      where: { dataType: policy.dataType },
      update: {},
      create: policy
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
