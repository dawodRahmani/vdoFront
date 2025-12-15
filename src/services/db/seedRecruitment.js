import {
  recruitmentDB,
  torDB,
  srfDB,
  vacancyDB,
  candidateDB,
  applicationDB,
  educationDB,
  experienceDB,
  committeeDB,
  memberDB,
  coiDB,
  longlistingDB,
  longlistingCandidateDB,
  shortlistingDB,
  shortlistingCandidateDB,
  writtenTestDB,
  writtenTestCandidateDB,
  interviewDB,
  interviewCandidateDB,
  evaluationDB,
  interviewResultDB,
  reportDB,
  offerDB,
  sanctionDB,
  backgroundCheckDB,
  contractDB,
  checklistDB,
  RECRUITMENT_STATUS,
  TOR_STATUS,
  SRF_STATUS,
  HIRING_APPROACH,
  CONTRACT_TYPE,
  EDUCATION_LEVEL,
  ANNOUNCEMENT_METHOD,
  COMMITTEE_ROLE,
  COI_DECISION,
  APPLICATION_STATUS,
  RECOMMENDATION,
} from './recruitmentService';

/**
 * Seeds a complete recruitment process with all 15 steps filled in
 * This allows you to see how the entire recruitment workflow operates
 */
export const seedCompleteRecruitment = async () => {
  console.log('🌱 Starting complete recruitment seed...');

  try {
    // ============================================
    // STEP 1: TOR Development
    // ============================================
    console.log('📝 Step 1: Creating TOR...');
    const recruitment = await recruitmentDB.create({
      positionTitle: 'Senior Program Manager',
      department: 'Programs',
      numberOfPositions: 1,
      hiringApproach: HIRING_APPROACH.OPEN_COMPETITION,
      contractType: CONTRACT_TYPE.CORE,
    });

    const tor = await torDB.create({
      recruitmentId: recruitment.id,
      positionTitle: 'Senior Program Manager',
      department: 'Programs',
      supervisor: 'Country Director',
      location: 'Kabul, Afghanistan',
      contractType: CONTRACT_TYPE.CORE,
      durationMonths: 12,
      startDate: '2025-02-01',

      // Purpose
      purposeOfPosition: 'Lead and coordinate all program activities ensuring quality implementation and compliance with donor requirements.',

      // Key Responsibilities
      keyResponsibilities: JSON.stringify([
        'Oversee implementation of all program activities',
        'Manage program budget and financial reporting',
        'Coordinate with partners and stakeholders',
        'Ensure compliance with donor regulations',
        'Supervise program staff and provide technical guidance',
      ]),

      // Qualifications
      educationRequirement: EDUCATION_LEVEL.MASTERS,
      educationField: 'International Development, Public Health, or related field',
      experienceYears: 5,
      experienceDetails: 'Minimum 5 years managing NGO programs in Afghanistan',

      // Skills
      technicalSkills: JSON.stringify([
        'Project management',
        'Budget management',
        'Report writing',
        'Donor compliance',
        'Team leadership',
      ]),
      languageRequirements: JSON.stringify([
        { language: 'English', level: 'Fluent' },
        { language: 'Dari', level: 'Fluent' },
        { language: 'Pashto', level: 'Good' },
      ]),

      // Terms
      salaryRange: '$2,500 - $3,000',
      benefits: JSON.stringify([
        'Health insurance',
        'Annual leave (30 days)',
        'Professional development opportunities',
      ]),

      status: TOR_STATUS.APPROVED,
      approvedBy: 'Country Director',
      approvedAt: new Date().toISOString(),
    });

    // ============================================
    // STEP 2: Staff Requisition Form
    // ============================================
    console.log('📋 Step 2: Creating SRF...');
    const srf = await srfDB.create({
      recruitmentId: recruitment.id,
      requestedBy: 'Program Director',
      requestDate: new Date().toISOString().split('T')[0],
      positionTitle: 'Senior Program Manager',
      department: 'Programs',
      numberOfPositions: 1,
      replacementFor: null,
      isNewPosition: true,

      // Justification
      justification: 'Expansion of program activities requires dedicated senior management to ensure quality and compliance.',

      // Budget
      budgetCode: 'PROG-2025-001',
      fundingSource: 'USAID',
      estimatedMonthlyCost: 3000,

      // HR Verification
      hrVerified: true,
      hrVerifiedBy: 'HR Manager',
      hrVerifiedAt: new Date().toISOString(),
      hrComments: 'Position approved as per organizational structure',

      // Budget Verification
      budgetVerified: true,
      budgetVerifiedBy: 'Finance Manager',
      budgetVerifiedAt: new Date().toISOString(),
      budgetComments: 'Budget available under USAID grant',

      status: SRF_STATUS.APPROVED,
      approvedBy: 'Country Director',
      approvedAt: new Date().toISOString(),
    });

    // ============================================
    // STEP 3: Requisition Review (Auto-approved)
    // ============================================
    console.log('✅ Step 3: Requisition Review completed');

    // ============================================
    // STEP 4: Vacancy Announcement
    // ============================================
    console.log('📢 Step 4: Creating Vacancy Announcement...');
    const vacancy = await vacancyDB.create({
      recruitmentId: recruitment.id,
      announcementNumber: `VDO-VAC-${recruitment.recruitmentCode}`,
      positionTitle: 'Senior Program Manager',
      numberOfPositions: 1,
      location: 'Kabul, Afghanistan',

      // Announcement Details
      announcementDate: new Date().toISOString().split('T')[0],
      closingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
      announcementMethod: ANNOUNCEMENT_METHOD.ACBAR,

      // Job Description
      overview: 'VDO Afghanistan is seeking a qualified Senior Program Manager to lead program implementation.',
      responsibilities: tor.keyResponsibilities,
      qualifications: JSON.stringify({
        education: `${tor.educationRequirement} in ${tor.educationField}`,
        experience: `${tor.experienceYears} years of relevant experience`,
        skills: JSON.parse(tor.technicalSkills),
        languages: JSON.parse(tor.languageRequirements),
      }),

      // Application Instructions
      applicationInstructions: 'Submit CV, cover letter, and three references to hr@vdo.org',
      requiredDocuments: JSON.stringify(['CV', 'Cover Letter', 'References']),

      status: 'published',
      publishedAt: new Date().toISOString(),
    });

    // ============================================
    // STEP 5: Application Receipt
    // ============================================
    console.log('👥 Step 5: Creating Candidates and Applications...');

    const candidatesData = [
      {
        fullName: 'Ahmad Khalil',
        fatherName: 'Abdul Khalil',
        gender: 'male',
        dateOfBirth: '1988-03-15',
        email: 'ahmad.khalil@example.com',
        phone: '+93 700 111 222',
        province: 'Kabul',
        education: EDUCATION_LEVEL.MASTERS,
        experienceYears: 6,
        score: 85,
      },
      {
        fullName: 'Fatima Ahmadi',
        fatherName: 'Mohammad Ahmadi',
        gender: 'female',
        dateOfBirth: '1990-07-22',
        email: 'fatima.ahmadi@example.com',
        phone: '+93 700 222 333',
        province: 'Herat',
        education: EDUCATION_LEVEL.MASTERS,
        experienceYears: 5,
        score: 82,
      },
      {
        fullName: 'Hassan Karimi',
        fatherName: 'Ali Karimi',
        gender: 'male',
        dateOfBirth: '1987-11-10',
        email: 'hassan.karimi@example.com',
        phone: '+93 700 333 444',
        province: 'Balkh',
        education: EDUCATION_LEVEL.MASTERS,
        experienceYears: 7,
        score: 88,
      },
      {
        fullName: 'Mariam Nouri',
        fatherName: 'Noor Nouri',
        gender: 'female',
        dateOfBirth: '1991-05-18',
        email: 'mariam.nouri@example.com',
        phone: '+93 700 444 555',
        province: 'Kabul',
        education: EDUCATION_LEVEL.MASTERS,
        experienceYears: 4,
        score: 75,
      },
      {
        fullName: 'Rashid Qasimi',
        fatherName: 'Qasim Qasimi',
        gender: 'male',
        dateOfBirth: '1989-09-25',
        email: 'rashid.qasimi@example.com',
        phone: '+93 700 555 666',
        province: 'Nangarhar',
        education: EDUCATION_LEVEL.BACHELORS,
        experienceYears: 3,
        score: 55,
      },
    ];

    const applications = [];
    for (const candData of candidatesData) {
      const candidate = await candidateDB.create({
        fullName: candData.fullName,
        fatherName: candData.fatherName,
        gender: candData.gender,
        dateOfBirth: candData.dateOfBirth,
        email: candData.email,
        phone: candData.phone,
        currentAddress: `${candData.province}, Afghanistan`,
        province: candData.province,
      });

      const application = await applicationDB.create({
        recruitmentId: recruitment.id,
        candidateId: candidate.id,
        status: APPLICATION_STATUS.RECEIVED,
      }, recruitment.recruitmentCode);

      // Add education
      await educationDB.create({
        candidateId: candidate.id,
        degree: candData.education,
        fieldOfStudy: 'International Development',
        institution: 'Kabul University',
        graduationYear: 2015,
      });

      // Add experience
      await experienceDB.create({
        candidateId: candidate.id,
        jobTitle: 'Program Officer',
        organization: 'International NGO',
        startDate: '2018-01-01',
        endDate: '2024-12-31',
        isCurrent: false,
        responsibilities: 'Managed program activities',
      });

      applications.push({ ...application, candidate, score: candData.score });
    }

    // ============================================
    // STEP 6: Committee Formation
    // ============================================
    console.log('👔 Step 6: Creating Recruitment Committee...');
    const committee = await committeeDB.create({
      recruitmentId: recruitment.id,
      committeeFormationDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });

    const members = [
      { name: 'HR Manager', role: COMMITTEE_ROLE.HR_REPRESENTATIVE },
      { name: 'Program Director', role: COMMITTEE_ROLE.TECHNICAL_EXPERT },
      { name: 'Finance Manager', role: COMMITTEE_ROLE.ADDITIONAL },
    ];

    for (const memberData of members) {
      const member = await memberDB.create({
        committeeId: committee.id,
        employeeName: memberData.name,
        role: memberData.role,
      });

      // COI Declaration
      await coiDB.create({
        recruitmentId: recruitment.id,
        committeeMemberId: member.id,
        hasConflict: false,
        decision: COI_DECISION.NO_CONFLICT,
        hrReviewedBy: 'HR Manager',
        hrDecision: COI_DECISION.NO_CONFLICT,
        hrReviewedAt: new Date().toISOString(),
      });
    }

    // ============================================
    // STEP 7: Longlisting
    // ============================================
    console.log('📝 Step 7: Performing Longlisting...');
    const longlisting = await longlistingDB.create({
      recruitmentId: recruitment.id,
      conductedDate: new Date().toISOString().split('T')[0],
      conductedBy: 'Recruitment Committee',
    });

    for (const app of applications) {
      const isLonglisted = app.score >= 70; // 4 out of 5 pass
      await longlistingCandidateDB.create({
        longlistingId: longlisting.id,
        candidateApplicationId: app.id,
        meetsEducation: app.score >= 70,
        meetsExperience: app.score >= 70,
        meetsLanguage: app.score >= 70,
        meetsOtherCriteria: app.score >= 70,
        isLonglisted,
      });

      if (isLonglisted) {
        await applicationDB.updateStatus(app.id, APPLICATION_STATUS.LONGLISTED);
      }
    }

    await longlistingDB.complete(longlisting.id);

    // ============================================
    // STEP 8: Shortlisting
    // ============================================
    console.log('⭐ Step 8: Performing Shortlisting...');
    const shortlisting = await shortlistingDB.create({
      recruitmentId: recruitment.id,
      conductedDate: new Date().toISOString().split('T')[0],
      conductedBy: 'Recruitment Committee',
      academicWeight: 0.20,
      experienceWeight: 0.30,
      otherWeight: 0.50,
      passingScore: 60,
    });

    const longlistedApps = applications.filter(a => a.score >= 70);
    for (const app of longlistedApps) {
      const academicScore = Math.min(app.score, 100);
      const experienceScore = Math.min(app.score - 5, 100);
      const otherScore = Math.min(app.score + 5, 100);

      await shortlistingCandidateDB.create({
        shortlistingId: shortlisting.id,
        candidateApplicationId: app.id,
        academicScore,
        experienceScore,
        otherCriteriaScore: otherScore,
      }, shortlisting);

      if ((academicScore * 0.20 + experienceScore * 0.30 + otherScore * 0.50) >= 60) {
        await applicationDB.updateStatus(app.id, APPLICATION_STATUS.SHORTLISTED);
      }
    }

    await shortlistingDB.complete(shortlisting.id);

    // ============================================
    // STEP 9: Written Test
    // ============================================
    console.log('📝 Step 9: Conducting Written Test...');
    const writtenTest = await writtenTestDB.create({
      recruitmentId: recruitment.id,
      testDate: new Date().toISOString().split('T')[0],
      testVenue: 'VDO Office',
      totalMarks: 100,
      passingMarks: 50,
    });

    const shortlistedApps = applications.filter(a => a.score >= 70);
    for (const app of shortlistedApps) {
      const testCandidate = await writtenTestCandidateDB.create({
        writtenTestId: writtenTest.id,
        candidateApplicationId: app.id,
      });

      // Mark attendance
      await writtenTestCandidateDB.recordAttendance(testCandidate.id);

      // Submit score
      const marks = Math.max(40, Math.min(app.score, 95)); // Scores between 40-95
      await writtenTestCandidateDB.submitScore(testCandidate.id, marks, writtenTest);

      if (marks >= 50) {
        await applicationDB.updateStatus(app.id, APPLICATION_STATUS.TESTED);
      }
    }

    await writtenTestDB.complete(writtenTest.id);

    // ============================================
    // STEP 10: Interview
    // ============================================
    console.log('💼 Step 10: Conducting Interviews...');
    const interview = await interviewDB.create({
      recruitmentId: recruitment.id,
      interviewDate: new Date().toISOString(),
      interviewVenue: 'VDO Conference Room',
      interviewMethod: 'in_person',
    });

    const passedTestApps = applications.filter(a => a.score >= 75); // Top 3
    for (const app of passedTestApps) {
      const intCandidate = await interviewCandidateDB.create({
        interviewId: interview.id,
        candidateApplicationId: app.id,
      });

      // Mark attendance
      await interviewCandidateDB.recordAttendance(intCandidate.id);

      // Committee members evaluate
      for (let i = 0; i < 3; i++) {
        const baseScore = Math.floor(app.score / 20); // Convert to 1-5 scale
        await evaluationDB.create({
          interviewCandidateId: intCandidate.id,
          evaluatorId: i + 1,
          technicalKnowledgeScore: Math.min(5, baseScore),
          communicationScore: Math.min(5, baseScore),
          problemSolvingScore: Math.min(5, baseScore - 1),
          experienceRelevanceScore: Math.min(5, baseScore),
          culturalFitScore: Math.min(5, baseScore),
          recommendation: app.score >= 85 ? RECOMMENDATION.STRONGLY_RECOMMEND : RECOMMENDATION.RECOMMEND,
          comments: 'Strong candidate with relevant experience',
        });
      }

      // Calculate results
      await interviewResultDB.calculateAndSave(intCandidate.id, app.score, 0.5, 0.5);

      await applicationDB.updateStatus(app.id, APPLICATION_STATUS.INTERVIEWED);
    }

    // Rank candidates
    await interviewResultDB.rankCandidates(interview.id);
    await interviewDB.complete(interview.id);

    // ============================================
    // STEP 11: Recruitment Report
    // ============================================
    console.log('📊 Step 11: Creating Recruitment Report...');
    const report = await reportDB.create({
      recruitmentId: recruitment.id,
      reportDate: new Date().toISOString().split('T')[0],
      preparedBy: 'Recruitment Committee',

      totalApplications: applications.length,
      totalLonglisted: longlistedApps.length,
      totalShortlisted: shortlistedApps.length,
      totalTested: shortlistedApps.length,
      totalInterviewed: passedTestApps.length,

      executiveSummary: `The recruitment process for Senior Program Manager position was conducted from ${vacancy.announcementDate} to ${new Date().toISOString().split('T')[0]}. We received ${applications.length} applications, longlisted ${longlistedApps.length}, shortlisted ${shortlistedApps.length}, and interviewed ${passedTestApps.length} candidates.`,

      processDescription: 'Standard recruitment process followed with TOR, SRF, public announcement, screening, written test, and interviews.',

      findingsAndAnalysis: `Top candidate: ${applications[2].candidate.fullName} with combined score of ${applications[2].score}. All candidates demonstrated strong qualifications.`,

      topThreeCandidates: JSON.stringify([
        { name: applications[2].candidate.fullName, rank: 1, score: applications[2].score },
        { name: applications[0].candidate.fullName, rank: 2, score: applications[0].score },
        { name: applications[1].candidate.fullName, rank: 3, score: applications[1].score },
      ]),

      recommendation: `We recommend hiring ${applications[2].candidate.fullName} for the Senior Program Manager position.`,

      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

    await reportDB.approve(report.id, 'Country Director');

    // ============================================
    // STEP 12: Conditional Offer
    // ============================================
    console.log('📧 Step 12: Sending Offer Letter...');
    const topCandidate = applications[2]; // Highest score
    const offer = await offerDB.create({
      recruitmentId: recruitment.id,
      candidateApplicationId: topCandidate.id,

      positionTitle: 'Senior Program Manager',
      department: 'Programs',
      location: 'Kabul',

      startDate: '2025-02-01',
      contractType: CONTRACT_TYPE.CORE,
      contractDuration: 12,

      salary: 3000,
      benefits: JSON.stringify(['Health insurance', 'Annual leave', 'Professional development']),

      conditions: JSON.stringify([
        'Satisfactory reference checks',
        'Sanction list clearance',
        'Background verification',
      ]),

      responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    await offerDB.send(offer.id);
    // Candidate accepts
    await offerDB.respond(offer.id, true);
    await applicationDB.updateStatus(topCandidate.id, APPLICATION_STATUS.OFFERED);

    // ============================================
    // STEP 13: Sanction Clearance
    // ============================================
    console.log('🔍 Step 13: Performing Sanction Clearance...');
    const sanction = await sanctionDB.create({
      recruitmentId: recruitment.id,
      candidateApplicationId: topCandidate.id,
      candidateFullName: topCandidate.candidate.fullName,
      dateOfBirth: topCandidate.candidate.dateOfBirth,
      nationality: 'Afghan',

      checkedLists: JSON.stringify([
        'UN Sanctions List',
        'OFAC SDN List',
        'EU Sanctions List',
      ]),

      checkDate: new Date().toISOString().split('T')[0],
      checkedBy: 'Compliance Officer',
    });

    await sanctionDB.verify(sanction.id, 'Compliance Officer', true);

    // ============================================
    // STEP 14: Background Checks
    // ============================================
    console.log('✅ Step 14: Conducting Background Checks...');
    const bgCheck = await backgroundCheckDB.create({
      recruitmentId: recruitment.id,
      candidateApplicationId: topCandidate.id,

      // Reference checks
      reference1Name: 'John Smith',
      reference1Organization: 'Previous Employer',
      reference1Contact: '+93 700 111 000',
      reference1Verified: true,
      reference1Feedback: 'Excellent performer',

      reference2Name: 'Sarah Johnson',
      reference2Organization: 'Academic Supervisor',
      reference2Contact: '+93 700 222 000',
      reference2Verified: true,
      reference2Feedback: 'Outstanding student',

      reference3Name: 'Ali Rezai',
      reference3Organization: 'Community Leader',
      reference3Contact: '+93 700 333 000',
      reference3Verified: true,
      reference3Feedback: 'Trusted community member',

      // Verifications
      addressVerified: true,
      addressVerificationDate: new Date().toISOString().split('T')[0],
      addressVerifiedBy: 'Field Officer',

      criminalCheckDone: true,
      criminalCheckDate: new Date().toISOString().split('T')[0],
      criminalCheckResult: 'Clear',

      guaranteeLetterReceived: true,
      guarantorName: 'Abdul Khalil',
      guarantorRelation: 'Father',
    });

    await backgroundCheckDB.complete(bgCheck.id, true);

    // ============================================
    // STEP 15: Employment Contract
    // ============================================
    console.log('📄 Step 15: Creating Employment Contract...');
    const contract = await contractDB.create({
      recruitmentId: recruitment.id,
      candidateApplicationId: topCandidate.id,

      employeeName: topCandidate.candidate.fullName,
      positionTitle: 'Senior Program Manager',
      department: 'Programs',
      location: 'Kabul',

      contractStartDate: '2025-02-01',
      contractEndDate: '2026-01-31',
      contractType: CONTRACT_TYPE.CORE,

      basicSalary: 3000,
      allowances: JSON.stringify([
        { type: 'Transportation', amount: 200 },
        { type: 'Communication', amount: 100 },
      ]),

      workingHours: '40 hours per week',
      annualLeaveDays: 30,
      sickLeaveDays: 15,

      probationPeriodMonths: 3,
      noticePeriodDays: 30,

      duties: tor.keyResponsibilities,
      termsAndConditions: JSON.stringify([
        'Subject to VDO policies and procedures',
        'Confidentiality agreement applies',
        'Code of conduct must be followed',
      ]),
    });

    // Employee signs
    await contractDB.signEmployee(contract.id);
    // Employer signs
    await contractDB.signEmployer(contract.id, 1);
    // Activate contract
    await contractDB.activate(contract.id);

    await applicationDB.updateStatus(topCandidate.id, APPLICATION_STATUS.HIRED);

    // ============================================
    // File Checklist
    // ============================================
    console.log('📁 Creating File Checklist...');
    await checklistDB.create({
      recruitmentId: recruitment.id,
      employeeId: null,

      torAttached: true,
      srfAttached: true,
      shortlistFormAttached: true,
      rcFormAttached: true,
      writtenTestPapersAttached: true,
      interviewFormsAttached: true,
      interviewResultAttached: true,
      recruitmentReportAttached: true,
      offerLetterAttached: true,
      sanctionClearanceAttached: true,
      referenceChecksAttached: true,
      guaranteeLetterAttached: true,
      addressVerificationAttached: true,
      criminalCheckAttached: true,
      contractAttached: true,
      personalInfoFormAttached: true,

      verifiedBy: 'HR Manager',
      verifiedAt: new Date().toISOString(),
    });

    // Mark recruitment as completed
    await recruitmentDB.update(recruitment.id, {
      status: RECRUITMENT_STATUS.COMPLETED,
      currentStep: 15,
    });

    console.log('✅ Complete recruitment seeded successfully!');
    console.log(`📋 Recruitment Code: ${recruitment.recruitmentCode}`);
    console.log(`👤 Hired Candidate: ${topCandidate.candidate.fullName}`);
    console.log(`📊 Total Applications: ${applications.length}`);
    console.log(`🎯 Longlisted: ${longlistedApps.length}`);
    console.log(`⭐ Shortlisted: ${shortlistedApps.length}`);
    console.log(`✍️ Tested: ${shortlistedApps.length}`);
    console.log(`💼 Interviewed: ${passedTestApps.length}`);

    return {
      recruitment,
      topCandidate: topCandidate.candidate,
      stats: {
        totalApplications: applications.length,
        longlisted: longlistedApps.length,
        shortlisted: shortlistedApps.length,
        tested: shortlistedApps.length,
        interviewed: passedTestApps.length,
      },
    };

  } catch (error) {
    console.error('❌ Error seeding recruitment:', error);
    throw error;
  }
};

// Make it globally available for easy testing
if (typeof window !== 'undefined') {
  window.seedCompleteRecruitment = seedCompleteRecruitment;
}

export default seedCompleteRecruitment;
