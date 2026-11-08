/*
 * Case 1E — Pelvic pain and vaginal bleeding in early pregnancy: "complete miscarriage" or pregnancy of unknown location?
 * Source: UFRGS/HCPA Google Forms case "Caso 1E" (R. F. Savaris), translated and adapted to US practice.
 * Version 2: stable presentation (no syncope), serial β-hCG over 48 h, ectopic pregnancy diagnosed on day 2.
 */
(function () {
  const REF = {
    acog193: 'ACOG Practice Bulletin No. 193: Tubal Ectopic Pregnancy. Obstet Gynecol. 2018;131(3):e91-e103.',
    acog200: 'ACOG Practice Bulletin No. 200: Early Pregnancy Loss. Obstet Gynecol. 2018;132(5):e197-e207.',
    esep: 'Mol F, et al. Salpingotomy versus salpingectomy in women with tubal pregnancy (ESEP): an open-label, multicentre, randomised controlled trial. Lancet. 2014;383:1483-1489.',
    rhig: 'ACOG Practice Bulletin No. 181: Prevention of Rh D Alloimmunization. Obstet Gynecol. 2017;130(2):e57-e70.',
    asa: 'American Society of Anesthesiologists. Practice Guidelines for Preoperative Fasting. Anesthesiology. 2017;126:376-393.'
  };

  // Helper: a "challenge" node (colleague/attending pushes back) + its justification node.
  function challenge(id, title, text, back, confidentPenalty, reconsiderPenalty, labels, debrief) {
    return [
      {
        id: id, phase: 'Challenge', type: 'single', title: title, prompt: text,
        choices: [
          { id: id + '_reconsider', label: labels[0], points: reconsiderPenalty, to: back, domain: 'Judgment',
            feedback: 'Reconsidering when challenged is part of safe practice. ' + debrief },
          { id: id + '_confident', label: labels[1], points: confidentPenalty, to: id + '_justify', domain: 'Judgment',
            critical: true, feedback: debrief }
        ]
      },
      {
        id: id + '_justify', phase: 'Challenge', type: 'text', title: 'Explain your answer',
        prompt: 'Write your justification. It will appear in your final report for discussion with your preceptor.',
        placeholder: 'Write your justification here',
        next: back,
        afterNote: debrief
      }
    ];
  }

  const RECONSIDER = ['I will reconsider my management', 'I am confident in my management; I will submit a written justification'];
  const RECONSIDER_DX = ['I think they are right; I want to reconsider', 'I am confident in my hypothesis. I will explain below'];

  const nodes = [
    /* =============================== DAY 0 =============================== */
    /* ---------------- HISTORY ---------------- */
    {
      id: 'history', phase: 'Day 0 · History', type: 'hub', title: 'Emergency Department — Initial encounter',
      prompt: 'What would you like to ask next?',
      choices: [
        { id: 'h_pain', label: 'How would you describe your pain?', points: 3, time: 2, domain: 'History',
          result: { title: 'Pain', text: 'The pain started 2 days ago as cramps. It got better after I passed some clots and tissue at home, but I still have mild pain on the right side.' },
          feedback: 'High yield. Improvement after passing "tissue" suggests a completed miscarriage, but persistent lateralized pain must not be dismissed.' },
        { id: 'h_bleed', label: 'Can you tell me how much you are bleeding? Is it a teacup? A tablespoon?', points: 1, time: 2, domain: 'History',
          result: { title: 'Vaginal bleeding', text: 'Two days ago it was heavy, with clots and something that looked like tissue. Now it is light: about 12 mL today.' },
          feedback: 'Useful but not diagnostic: patient-reported "tissue" is often blood clot or decidual cast, which also occurs with ectopic pregnancy.' },
        { id: 'h_ob', label: 'What is your obstetric history?', points: 3, time: 2, domain: 'History',
          result: { title: 'Obstetric history', text: "My first period was at age 13. I have been pregnant once and had a baby 4 years ago. I don't remember the date of my last menstrual period. I use condoms for contraception." },
          feedback: 'High yield. G1P1 (one live birth 4 years ago), unknown LMP: gestational age cannot be dated clinically, so β-hCG and ultrasound are required.' },
        { id: 'h_grav', label: 'How many times have you been pregnant?', points: 0, time: 2, domain: 'History',
          result: { title: 'Gravidity', text: 'I have been pregnant once. I had a baby 4 years ago.' },
          feedback: 'Redundant with the obstetric history.' },
        { id: 'h_bf', label: 'Have you ever breastfed?', points: -1, time: 2, domain: 'History',
          result: { title: 'Breastfeeding', text: 'I have never breastfed.' },
          feedback: 'Not relevant to this presentation (although lactation is a contraindication to methotrexate).' },
        { id: 'h_test', label: 'How did you find out you were pregnant?', points: 2, time: 2, domain: 'History',
          result: { title: 'Pregnancy test', text: 'I took a urine pregnancy test, and it was positive. My doctor later told me I had a miscarriage.' },
          feedback: 'Pregnancy is confirmed. Before accepting the previous diagnosis, ask yourself what it was based on.' },
        { id: 'h_us', label: 'Did your doctor do an ultrasound that showed the pregnancy inside the uterus?', points: 5, time: 2, domain: 'Bias awareness',
          result: { title: 'Prior ultrasound', text: 'No, I never had an ultrasound. He said it was a miscarriage because of the bleeding and the tissue I passed.' },
          feedback: 'Excellent question: it tests the prior diagnosis instead of accepting it (avoiding anchoring bias). Without a documented intrauterine pregnancy, "miscarriage" cannot be confirmed; this is a pregnancy of unknown location.' },
        { id: 'h_prenatal', label: 'Congratulations! I will refer you to prenatal care.', requires: ['h_test'], to: 'prenatal', time: 1, domain: 'Judgment' },
        { id: 'h_go_exam', label: '→ Proceed to the physical examination', to: 'exam', time: 0 }
      ]
    },
    ...challenge('prenatal', 'Referral to prenatal care',
      'Referring a pregnant patient to prenatal care would be appropriate if she had no pain and no vaginal bleeding. Better still: establish the location and viability of the pregnancy before referral.',
      'history', -15, -5,
      ['I think I made a mistake; I want to start over', 'I am certain she should be referred to prenatal care. I will explain below'],
      'Pain and vaginal bleeding in early pregnancy require exclusion of ectopic pregnancy before any outpatient referral (ACOG PB 193).'),

    /* ---------------- PHYSICAL EXAM ---------------- */
    {
      id: 'exam', phase: 'Day 0 · Physical exam', type: 'hub', title: 'Physical Examination',
      prompt: 'Choose what you want to examine.',
      choices: [
        { id: 'e_general', label: 'General appearance', points: 2, time: 1, domain: 'Examination',
          result: { title: 'General appearance', text: 'Good general condition; mucous membranes moist and pink.\nAppears comfortable.' },
          feedback: 'Reassuring, but a well-appearing patient can still have an ectopic pregnancy.' },
        { id: 'e_vitals', label: 'Vital signs', points: 4, time: 2, domain: 'Examination',
          result: { title: 'Vital signs', text: 'BP: 110/75 mmHg\nHR: 76 bpm\nRR: 18 breaths/min\nAxillary temperature: 36.0 °C (96.8 °F)\nPain score (NRS 0-10): 3\nSpO2: 99%' },
          feedback: 'Hemodynamically stable: outpatient evaluation with close follow-up is an option, provided a reliable plan is in place.' },
        { id: 'e_heent', label: 'Head and neck', points: 0, time: 1, domain: 'Examination',
          result: { title: 'Head and neck', text: 'Normocephalic, atraumatic.\nNeck: no masses, no lymphadenopathy, no thyromegaly; trachea midline.' },
          feedback: 'Low yield here.' },
        { id: 'e_resp', label: 'Respiratory', points: 0, time: 1, domain: 'Examination',
          result: { title: 'Respiratory', text: 'Lungs clear to auscultation bilaterally; no adventitious breath sounds.' },
          feedback: 'Normal. Low yield for this presentation.' },
        { id: 'e_cv', label: 'Cardiovascular', points: 0, time: 1, domain: 'Examination',
          result: { title: 'Cardiovascular', text: 'Regular rhythm; normal S1 and S2; grade 1/6 systolic murmur at the aortic area.' },
          feedback: 'A soft flow murmur is common in pregnancy.' },
        { id: 'e_abd', label: 'Abdomen', points: 5, time: 2, domain: 'Examination',
          result: { title: 'Abdomen', text: 'Soft, non-distended; mild tenderness in the right lower quadrant on deep palpation; no rebound tenderness.' },
          feedback: 'No peritoneal signs, but the right-sided tenderness is a clue that does not fit a simple completed miscarriage.' },
        { id: 'e_pelvic', label: 'Pelvic examination', points: 5, time: 3, domain: 'Examination',
          result: { title: 'Pelvic examination', text: 'Speculum: small amount of dark blood at the external cervical os; closed cervical os; no active bleeding; no cervical lesions; no tissue in the vagina or cervical canal.\nBimanual: no cervical motion tenderness. Anteverted uterus, not enlarged. Mild right adnexal tenderness; no palpable mass.',
            images: [{ src: 'img/speculum_exam.jpg', caption: 'Speculum examination (click to enlarge)', link: 'img/speculum_exam.jpg' }] },
          feedback: 'A closed os and a small uterus are compatible with a completed miscarriage, but also with an ectopic pregnancy. Note the right adnexal tenderness.' },
        { id: 'e_go_dx', label: '→ I already have diagnostic hypotheses', to: 'dx', time: 0 }
      ]
    },

    /* ---------------- DIAGNOSIS (DAY 0) ---------------- */
    {
      id: 'dx', phase: 'Day 0 · Diagnosis', type: 'single', title: 'Diagnostic hypothesis',
      prompt: 'What is your leading diagnostic hypothesis?',
      choices: [
        { id: 'dx_miscarriage', label: 'Complete miscarriage', points: -10, to: 'workup', domain: 'Bias awareness', group: 'dx0',
          feedback: 'Your colleague suggests confirming this hypothesis with a diagnostic workup before deciding management. Beware of anchoring: a complete miscarriage can be diagnosed only when an intrauterine pregnancy was previously documented by ultrasound or chorionic villi are confirmed; otherwise, an empty uterus after bleeding is a pregnancy of unknown location.' },
        { id: 'dx_ectopic', label: 'Ectopic pregnancy', points: 10, to: 'workup', domain: 'Diagnosis', group: 'dx0',
          feedback: 'Thinking of ectopic pregnancy is correct, and it must remain high on the list, but the diagnosis is premature: no extrauterine pregnancy has been demonstrated yet. Labeling the case as ectopic pregnancy now may lead to unnecessary treatment; the correct working diagnosis is pregnancy of unknown location.' },
        { id: 'dx_pul', label: 'Pregnancy of unknown location (PUL)', points: 15, to: 'workup', domain: 'Bias awareness', group: 'dx0', once: true,
          feedback: 'Correct. A positive pregnancy test with no intrauterine pregnancy ever documented is a pregnancy of unknown location until proven otherwise: it may be a completed miscarriage, a very early intrauterine pregnancy, or an ectopic pregnancy. The right adnexal tenderness keeps ectopic pregnancy high on the list.' },
        { id: 'dx_aub', label: 'Abnormal uterine bleeding (AUB)', to: 'dx_c_aub', domain: 'Diagnosis' }
      ]
    },
    ...challenge('dx_c_aub', 'Abnormal uterine bleeding', 'Your colleague thinks you should reconsider your hypothesis.', 'dx', -10, -5, RECONSIDER_DX,
      'AUB is not a diagnosis to consider first in a patient with a positive pregnancy test; pregnancy-related causes must be excluded.'),

    /* ---------------- WORKUP (DAY 0) ---------------- */
    {
      id: 'workup', phase: 'Day 0 · Workup', type: 'hub', title: 'Diagnostic workup',
      prompt: 'Which tests would you like to order to confirm this hypothesis?',
      choices: [
        { id: 'w_cbc', label: 'Complete blood count (CBC)', points: 3, time: 10, domain: 'Workup',
          result: { title: 'CBC (day 0)', text: 'Hemoglobin: 10.2 g/dL\nHematocrit: 30%\nWBC: 9,800/µL\nPlatelets: 245,000/µL' },
          feedback: 'Mild anemia after heavy bleeding. Baseline values are also needed if methotrexate becomes an option.' },
        { id: 'w_bmp', label: 'Basic metabolic panel (BMP)', points: -1, time: 10, domain: 'Workup',
          result: { title: 'BMP', text: 'Na: 136 mEq/L\nK: 4.0 mEq/L\nCreatinine: 0.9 mg/dL\nGlucose: 108 mg/dL\nCl: 101 mEq/L' },
          feedback: 'Unnecessary today: it does not change management. Renal function is needed only if methotrexate is considered later.' },
        { id: 'w_hcg', label: 'Quantitative serum β-hCG', points: 8, time: 10, domain: 'Workup',
          result: { title: 'Serum β-hCG (day 0)', text: 'Serum β-hCG: 650 mIU/mL' },
          feedback: 'Essential. A single value cannot locate a pregnancy: 650 mIU/mL is below the discriminatory zone (which may be as high as 3,500 mIU/mL, ACOG PB 193), so an intrauterine pregnancy may not be visible yet. The trend over 48 hours is what matters.' },
        { id: 'w_type', label: 'Blood type and Rh (type and screen)', points: 4, time: 10, domain: 'Workup',
          result: { title: 'Blood type and Rh', text: 'O, Rh positive' },
          feedback: 'Required in early pregnancy bleeding. Rh positive: Rh(D) immune globulin is not indicated.' },
        { id: 'w_fast', label: 'FAST (Focused Assessment with Sonography for Trauma)', points: -2, time: 5, domain: 'Workup',
          result: { title: 'FAST', text: 'There is no free fluid in Morison’s pouch, but there is free fluid in the cul-de-sac.',
            images: [
              { src: 'img/fast_ruq.jpg', caption: 'Right upper quadrant (hepatorenal view): no free fluid in Morison’s pouch', link: 'img/fast_ruq.jpg' },
              { src: 'img/fast_pelvic.jpg', caption: 'Pelvic view (sagittal): anechoic free fluid in the cul-de-sac', link: 'img/fast_pelvic.jpg' }
            ] },
          feedback: 'Not indicated in a hemodynamically stable patient without trauma or peritoneal signs: transvaginal ultrasound answers the clinical question. The finding (no upper abdominal fluid, small pelvic fluid) does not change management.' },
        { id: 'w_tvus', label: 'Pelvic ultrasound (transvaginal)', points: 8, time: 15, domain: 'Workup',
          result: { title: 'TVUS (day 0)', text: 'Anteverted, anteflexed uterus measuring 8.9 x 4.8 cm; homogeneous myometrium; endometrial thickness 6 mm; no intrauterine gestational sac or retained products of conception. Small amount of free fluid in the cul-de-sac. Right and left ovaries identified in normal position. Nabothian cyst present.' },
          feedback: 'Empty uterus, no adnexal mass, small amount of free fluid: by definition, a pregnancy of unknown location (PUL). It may be a completed miscarriage, a very early intrauterine pregnancy, or an ectopic pregnancy not yet visible.' },
        { id: 'w_ct', label: 'CT scan', points: -5, to: 'ct', time: 5, domain: 'Workup',
          feedback: 'Unnecessary test: CT exposes a possible pregnancy to radiation and adds nothing to TVUS and β-hCG.' },
        { id: 'w_revise_dx', label: '→ Revise my diagnostic hypothesis', requiresAny: ['dx_miscarriage', 'dx_ectopic'], hideIf: ['dx_pul'], to: 'dx', time: 0 },
        { id: 'w_go_mgmt', label: '→ Decide management', to: 'mgmt', time: 0 }
      ]
    },
    {
      id: 'ct', phase: 'Day 0 · Workup', type: 'single', title: 'CT scan',
      prompt: 'The radiologist says the patient has been placed on the waiting list; there is no estimated time for the scan.',
      choices: [
        { id: 'ct_cancel', label: 'I want to cancel this test and order another one', points: 0, to: 'workup', domain: 'Workup',
          feedback: 'Correct. CT exposes a possible pregnancy to radiation and adds nothing; transvaginal ultrasound and serial β-hCG are the tools of choice.' },
        { id: 'ct_wait', label: 'I will wait', to: 'ct_c', time: 60, domain: 'Workup' }
      ]
    },
    ...challenge('ct_c', 'CT scan: waiting', 'The radiologist asks whether you really want to do this.', 'workup', -10, -5, RECONSIDER,
      'CT is not indicated in early pregnancy bleeding. TVUS and serial β-hCG answer the clinical question.'),

    /* ---------------- MANAGEMENT (DAY 0) ---------------- */
    {
      id: 'mgmt', phase: 'Day 0 · Management', type: 'single', title: 'Management — day 0',
      prompt: 'What is your management plan today?',
      choices: [
        { id: 'm0_hcg48', label: 'Return in 48 hours, or earlier if she gets worse', points: 15, to: 'day2', time: 2880, domain: 'Bias awareness', once: true,
          feedback: 'Correct. A stable patient with a pregnancy of unknown location is managed with serial β-hCG every 48 hours and clear return precautions until the pregnancy is located or β-hCG becomes undetectable (ACOG PB 193).' },
        { id: 'm0_home', label: 'Discharge home: complete miscarriage, no follow-up needed', to: 'm0_c_home', domain: 'Management' },
        { id: 'm0_mtx', label: 'Methotrexate today', to: 'm0_c_mtx', domain: 'Management' },
        { id: 'm0_surg', label: 'Diagnostic laparoscopy today', to: 'm0_c_surg', domain: 'Management' }
      ]
    },
    ...challenge('m0_c_home', 'Discharge without follow-up', 'The attending physician thinks you should reconsider your management: no intrauterine pregnancy was ever documented.', 'mgmt', -20, -10, RECONSIDER,
      'Critical error. Labeling a pregnancy of unknown location as a "complete miscarriage" without follow-up is a classic cause of missed ectopic pregnancy.'),
    ...challenge('m0_c_mtx', 'Methotrexate today', 'The attending physician thinks you should reconsider your management: the location of the pregnancy is unknown.', 'mgmt', -10, -5, RECONSIDER,
      'A single β-hCG value is insufficient. Methotrexate without a definitive diagnosis may harm a desired early intrauterine pregnancy and exposes the patient to unnecessary treatment.'),
    ...challenge('m0_c_surg', 'Diagnostic laparoscopy today', 'The attending physician thinks you should reconsider your management: the patient is stable and no adnexal mass is seen.', 'mgmt', -10, -5, RECONSIDER,
      'Surgery in a stable patient with a pregnancy of unknown location and no adnexal mass is overtreatment; serial β-hCG is the appropriate next step.'),

    /* =============================== DAY 2 =============================== */
    {
      id: 'day2', phase: 'Day 2 · Return visit', type: 'hub', title: 'Return visit — 48 hours later',
      prompt: 'The patient returns 48 hours later, as instructed. She still has mild right lower quadrant pain and light spotting. Vital signs are stable. Abdomen: soft, mild right lower quadrant tenderness, no rebound tenderness.\n\nWhat would you like to order?',
      choices: [
        { id: 'd2_hcg', label: 'Repeat quantitative serum β-hCG', points: 8, time: 10, domain: 'Day 2 workup',
          result: { title: 'Serum β-hCG (day 2)', text: 'Serum β-hCG: 640 mIU/mL (day 0: 650 mIU/mL; -1.5% in 48 hours: plateau)' },
          feedback: 'Abnormal trend: a plateau. A viable intrauterine pregnancy would rise (a conservative minimum is 35% in 48 hours), and a completed miscarriage would show a substantial fall over 48 hours. A plateaued β-hCG indicates an abnormal pregnancy, and ectopic pregnancy must be actively excluded (ACOG PB 193).' },
        { id: 'd2_tvus', label: 'Repeat transvaginal ultrasound', points: 8, time: 15, domain: 'Day 2 workup',
          result: { title: 'TVUS (day 2)', text: 'Uterus without intrauterine gestational sac. Free fluid in the cul-de-sac. A 1.5 cm mass in the right adnexa.' },
          feedback: 'Diagnostic: an extrauterine adnexal mass with an empty uterus and a plateaued β-hCG confirms an ectopic pregnancy.' },
        { id: 'd2_cbc', label: 'Repeat CBC', points: 2, time: 10, domain: 'Day 2 workup',
          result: { title: 'CBC (day 2)', text: 'Hemoglobin: 10.4 g/dL\nHematocrit: 31%\nWBC: 8,900/µL\nPlatelets: 252,000/µL' },
          feedback: 'Stable hemoglobin: no evidence of ongoing bleeding. Normal counts are required before methotrexate.' },
        { id: 'd2_lft', label: 'Liver function tests (AST, ALT) and creatinine', points: 3, time: 10, domain: 'Day 2 workup',
          result: { title: 'LFTs and creatinine (day 2)', text: 'AST: 18 U/L\nALT: 15 U/L\nCreatinine: 0.8 mg/dL' },
          feedback: 'Required baseline before methotrexate (hepatic and renal function).' },
        { id: 'd2_go_dx', label: '→ I have my diagnosis', to: 'dx2', time: 0 }
      ]
    },
    {
      id: 'dx2', phase: 'Day 2 · Diagnosis', type: 'single', title: 'Diagnosis — day 2',
      prompt: 'What is your diagnosis now?',
      choices: [
        { id: 'dx2_ectopic', label: 'Right tubal ectopic pregnancy', points: 15, to: 'mgmt2', domain: 'Diagnosis', once: true,
          feedback: 'Correct. Plateaued β-hCG, empty uterus and a right adnexal mass.' },
        { id: 'dx2_misc', label: 'Complete miscarriage', to: 'dx2_c_misc', domain: 'Diagnosis' },
        { id: 'dx2_iup', label: 'Early viable intrauterine pregnancy', to: 'dx2_c_iup', domain: 'Diagnosis' }
      ]
    },
    ...challenge('dx2_c_misc', 'Complete miscarriage?', 'Your colleague points out that β-hCG has not fallen more than 50% and there is an adnexal mass.', 'dx2', -15, -5, RECONSIDER_DX,
      'Critical error. After a completed miscarriage β-hCG falls substantially within 48 hours; a plateaued β-hCG with an adnexal mass is an ectopic pregnancy until proven otherwise.'),
    ...challenge('dx2_c_iup', 'Early intrauterine pregnancy?', 'Your colleague points out that the uterus is empty and the β-hCG has not risen.', 'dx2', -10, -5, RECONSIDER_DX,
      'A viable intrauterine pregnancy would show a rising β-hCG; here it has plateaued, and an adnexal mass is present.'),

    /* ---------------- MANAGEMENT (DAY 2) ---------------- */
    {
      id: 'mgmt2', phase: 'Day 2 · Management', type: 'single', title: 'Management — day 2',
      prompt: 'Hemodynamically stable patient; β-hCG 640 mIU/mL (plateau); 1.5 cm right adnexal mass; small amount of free fluid; normal CBC, liver and renal function; not breastfeeding. What is your management?',
      choices: [
        { id: 'm2_mtx', label: 'Single-dose methotrexate', points: 5, to: 'mtx_patient', domain: 'Management', once: true,
          feedback: 'Clinically she meets the criteria for methotrexate: hemodynamically stable, no signs of rupture, low β-hCG (< 5,000 mIU/mL) and a small mass. But one criterion has not been checked yet: can she comply with follow-up?' },
        { id: 'm2_lap', label: 'Laparoscopy', points: 15, to: 'preop', domain: 'Management', once: true,
          feedback: 'Appropriate. Methotrexate would also be an option for a stable patient, but it requires reliable follow-up with serial β-hCG; surgery is definitive in a single intervention.' },
        { id: 'm2_expect', label: 'Expectant management', to: 'm2_c_expect', domain: 'Management' },
        { id: 'm2_home', label: 'Discharge home without follow-up', to: 'm2_c_home', domain: 'Management' }
      ]
    },
    ...challenge('m2_c_expect', 'Expectant management', 'The attending physician thinks you should reconsider your management: β-hCG is not declining.', 'mgmt2', -10, -5, RECONSIDER,
      'Expectant management is reserved for asymptomatic patients with low and declining β-hCG; here β-hCG has plateaued and there is a visible mass.'),
    ...challenge('m2_c_home', 'Discharge without follow-up', 'The attending physician thinks you should reconsider your management.', 'mgmt2', -20, -10, RECONSIDER,
      'Critical error. An untreated ectopic pregnancy can rupture.'),

    /* ---------------- METHOTREXATE: ADHERENCE TWIST ---------------- */
    {
      id: 'mtx_patient', phase: 'Day 2 · Management', type: 'single', countInMax: false, title: 'Counseling for methotrexate',
      prompt: 'While you explain the treatment and the need for β-hCG on days 4 and 7 and then weekly, the patient says:\n\n"Doctor, I live too far from here. It was already a problem to return today."',
      choices: [
        { id: 'mp_surgery', label: 'Then methotrexate is not a safe option for her; I will offer laparoscopy', points: 10, to: 'preop', domain: 'Management', once: true,
          feedback: 'Correct. Inability or unwillingness to comply with post-treatment monitoring is a contraindication to methotrexate (ACOG PB 193). Treatment failure or tubal rupture can occur during follow-up, far from the hospital.' },
        { id: 'mp_mtx', label: 'Proceed with methotrexate anyway; she will find a way to come back', to: 'mtx_c', domain: 'Management' }
      ]
    },
    {
      id: 'mtx_c', phase: 'Challenge', type: 'single', title: 'Methotrexate despite limited access',
      prompt: 'The attending physician thinks you should reconsider your management: the patient has told you she cannot return reliably.',
      choices: [
        { id: 'mtx_c_reconsider', label: 'I will reconsider my management', points: -5, to: 'mtx_patient', domain: 'Judgment',
          feedback: 'Reconsidering when challenged is part of safe practice. Reliable follow-up is a prerequisite for methotrexate.' },
        { id: 'mtx_c_confident', label: 'I am confident in my management; I will submit a written justification', points: -15, to: 'mtx_c_justify', domain: 'Judgment', critical: true,
          feedback: 'Critical error. Inability to comply with monitoring is a contraindication to methotrexate; a ruptured ectopic pregnancy far from the hospital can be fatal.' }
      ]
    },
    {
      id: 'mtx_c_justify', phase: 'Challenge', type: 'text', title: 'Explain your answer',
      prompt: 'Write your justification. It will appear in your final report for discussion with your preceptor.',
      placeholder: 'Write your justification here',
      afterNote: 'Inability to comply with monitoring is a contraindication to methotrexate (ACOG PB 193).',
      next: 'mtx'
    },

    /* ---------------- METHOTREXATE BRANCH ---------------- */
    {
      id: 'mtx', phase: 'Day 2 · Methotrexate', type: 'multi', countInMax: false, title: 'Methotrexate protocol and counseling',
      prompt: 'Select all orders and counseling items you want to include.',
      groups: [
        { name: 'Treatment', options: [
          { id: 'x_dose', label: 'Methotrexate 50 mg/m² IM, single dose', points: 3, feedback: 'Correct single-dose protocol (ACOG PB 193).' },
          { id: 'x_folic', label: 'Folic acid 5 mg PO daily during treatment', points: -3, feedback: 'Incorrect: folic acid antagonizes methotrexate and should be avoided.' } ] },
        { name: 'Follow-up', options: [
          { id: 'x_d47', label: 'β-hCG on days 4 and 7; second dose if the decline between days 4 and 7 is < 15%', points: 3, feedback: 'Correct monitoring of the single-dose protocol.' },
          { id: 'x_weekly', label: 'Weekly β-hCG until undetectable', points: 2, feedback: 'Correct.' },
          { id: 'x_nofu', label: 'No further β-hCG needed after the injection', points: -5, feedback: 'Incorrect: treatment failure and tubal rupture can occur after methotrexate.' } ] },
        { name: 'Counseling', options: [
          { id: 'x_avoid', label: 'Avoid folate-containing supplements, NSAIDs, alcohol, sun exposure, and sexual intercourse or vigorous exercise until resolution', points: 2, feedback: 'Correct.' },
          { id: 'x_precaution', label: 'Return immediately for severe pain, heavy bleeding, dizziness or syncope (possible rupture)', points: 2, feedback: 'Correct: rupture can occur even with a falling β-hCG.' },
          { id: 'x_pain', label: 'Explain that transient pelvic pain is common 2 to 3 days after the injection', points: 1, feedback: 'Correct: "separation pain" is common but must be distinguished from rupture.' } ] }
      ],
      domain: 'Methotrexate',
      next: 'note',
      teaching: 'Rh(D) immune globulin is indicated after ectopic pregnancy only in Rh-negative patients; this patient is Rh positive.'
    },

    /* ---------------- SURGICAL BRANCH ---------------- */
    {
      id: 'preop', phase: 'Day 2 · Preoperative orders', type: 'multi', title: 'Prepare for surgery',
      prompt: "Write the patient's preoperative orders. Select all orders you want to place.",
      groups: [
        { name: 'Preoperative preparation', options: [
          { id: 'p_iv', label: 'Two large-bore IV lines (16-18 gauge)', points: 2, feedback: 'Correct: standard preparation for surgery for ectopic pregnancy.' },
          { id: 'p_xmatch', label: 'Type and crossmatch (2 units of packed red blood cells)', points: 2, feedback: 'Correct: blood should be available in case of intraoperative hemorrhage.' },
          { id: 'p_consent', label: 'Obtain informed consent (including possible salpingectomy and laparotomy)', points: 2, feedback: 'Correct: discuss salpingectomy versus salpingostomy, conversion to laparotomy, and transfusion.' } ] },
        { name: 'Diet', options: [
          { id: 'p_diet', label: 'Regular diet', points: -4, feedback: 'Incorrect: the patient is going to the OR; aspiration risk (ASA fasting guidelines).' },
          { id: 'p_npo', label: 'NPO', points: 3, feedback: 'Correct.' } ] },
        { name: 'Nursing care', options: [
          { id: 'p_vitals', label: 'Vital signs monitoring', points: 2, feedback: 'Correct.' },
          { id: 'p_weight', label: 'Daily weight', points: 0, feedback: 'Not relevant before surgery.' } ] },
        { name: 'IV fluids', options: [
          { id: 'p_d5w', label: 'D5W 500 mL IV continuous at 90 mL/h', points: 0, feedback: 'Not an appropriate maintenance fluid while NPO before surgery: dextrose solutions become hypotonic after glucose metabolism.' },
          { id: 'p_ns', label: '0.9% NaCl 500 mL IV continuous at 90 mL/h', points: 2, feedback: 'Appropriate: isotonic crystalloid.' } ] },
        { name: 'PRN', options: [
          { id: 'p_ibu', label: 'Ibuprofen 600 mg PO q6h PRN pain ≥4/10', points: -2, feedback: 'Incorrect: oral route while NPO.' },
          { id: 'p_apap', label: 'Acetaminophen 1 g IV q6h PRN pain ≥4/10', points: 2, feedback: 'Appropriate.' },
          { id: 'p_meto', label: 'Metoclopramide 10 mg IV q6h PRN nausea or vomiting', points: 1, feedback: 'Appropriate.' } ] }
      ],
      domain: 'Orders',
      next: 'approach',
      teaching: 'IV access, blood availability and consent must be secured before transfer to the OR.'
    },
    {
      id: 'approach', phase: 'Day 2 · Surgery', type: 'single', title: 'Surgery',
      prompt: 'Which surgical approach?',
      choices: [
        { id: 'a_lap', label: 'Laparoscopy', points: 8, to: 'postop_lap', domain: 'Surgery', once: true,
          feedback: 'Preferred in hemodynamically stable patients (ACOG PB 193). With a normal contralateral tube, salpingectomy is preferred over salpingostomy (ESEP trial).' },
        { id: 'a_open', label: 'Laparotomy via Pfannenstiel incision', points: 2, to: 'postop_open', domain: 'Surgery', once: true,
          feedback: 'Not justified in a stable patient with a small, unruptured ectopic pregnancy; laparoscopy is preferred.' }
      ]
    },
    {
      id: 'postop_lap', phase: 'Day 2 · Postoperative care', type: 'multi', title: 'Laparoscopy — postoperative care',
      links: [{ label: '▶ Watch the procedure: laparoscopy (video)', url: 'https://www.youtube.com/watch?v=8CCcjX1WVY0' }],
      prompt: 'Which postoperative measures are indicated? (Select all that apply)',
      groups: [{ name: 'Postoperative orders', options: [
        { id: 'po_dc', label: 'Discharge within 24 hours if in good general condition', points: 2, feedback: 'Appropriate after laparoscopy.' },
        { id: 'po_bleed', label: 'Explain that she may have increased vaginal bleeding within 3 to 4 days', points: 2, feedback: 'Appropriate counseling (withdrawal bleeding).' },
        { id: 'po_analg', label: 'Prescribe oral analgesics', points: 2, feedback: 'Appropriate.' },
        { id: 'po_rhig', label: 'Rh(D) immune globulin (RhIG)', points: -5, feedback: 'The nurse asks whether you really want to do this: the patient is O, Rh positive. RhIG is indicated only for Rh-negative patients.' },
        { id: 'po_sti', label: 'Order serologic testing for sexually transmitted infections (VDRL, HIV, hepatitis B, hepatitis C) and histopathology; arrange suture removal and review results at the outpatient follow-up visit', points: 2, feedback: 'Appropriate. Histopathology confirms trophoblastic tissue in the tube.' }
      ] }],
      domain: 'Postoperative',
      next: 'note',
      teaching: 'If salpingostomy is performed instead of salpingectomy, serial β-hCG until undetectable is required (persistent trophoblast).'
    },
    {
      id: 'postop_open', phase: 'Day 2 · Postoperative care', type: 'multi', countInMax: false, title: 'Laparotomy — postoperative care',
      links: [{ label: '▶ Watch the procedure: open surgery (video)', url: 'https://youtu.be/0vWmS1VQ5N8' }],
      prompt: 'Which postoperative measures are indicated? (Select all that apply)',
      groups: [{ name: 'Postoperative orders', options: [
        { id: 'po_dc', label: 'Discharge within 24 hours if in good general condition', points: 2, feedback: 'Acceptable if recovery is uncomplicated; hospital stay after laparotomy is usually longer.' },
        { id: 'po_bleed', label: 'Explain that she may have increased vaginal bleeding within 3 to 4 days', points: 2, feedback: 'Appropriate counseling (withdrawal bleeding).' },
        { id: 'po_analg', label: 'Prescribe oral analgesics', points: 2, feedback: 'Appropriate.' },
        { id: 'po_rhig', label: 'Rh(D) immune globulin (RhIG)', points: -5, feedback: 'The nurse asks whether you really want to do this: the patient is O, Rh positive. RhIG is indicated only for Rh-negative patients.' },
        { id: 'po_sti', label: 'Order serologic testing for sexually transmitted infections (VDRL, HIV, hepatitis B, hepatitis C) and review results at the outpatient follow-up visit', points: 2, feedback: 'Appropriate.' }
      ] }],
      domain: 'Postoperative',
      next: 'note',
      teaching: 'Histopathology of the specimen should also be requested to confirm the diagnosis.'
    },

    /* ---------------- NOTE + END ---------------- */
    {
      id: 'note', phase: 'Documentation', type: 'text', title: 'Clinical note',
      prompt: 'Write a brief note for this case (HPI, pertinent findings, β-hCG trend and imaging, assessment and plan).',
      placeholder: 'HPI:\nPertinent exam:\nStudies (β-hCG day 0 and day 2, TVUS):\nAssessment:\nPlan:',
      next: 'end'
    },
    { id: 'end', phase: 'Debrief', type: 'debrief', title: 'Case debrief' }
  ];

  window.CASES = window.CASES || {};
  window.CASES.case1e = {
    id: 'case1e',
    title: 'Case 1E — Pelvic pain and vaginal bleeding in early pregnancy',
    subtitle: 'Emergency gynecology simulation for OB/GYN residents',
    author: 'Ricardo F. Savaris, MD, PhD — UFRGS / HCPA',
    patient: {
      name: 'Sue Smith', age: 24,
      summary: 'A 24-year-old White woman presents to the emergency department with pelvic pain and vaginal bleeding. She has no risk factors for tubal disease. She states that her physician told her she had a miscarriage. She reports that she is pregnant.'
    },
    introImage: {
      src: 'img/qr_ectopic_calculator.png',
      alt: 'QR code linking to the Ectopic Pregnancy Calculator',
      caption: 'Ectopic Pregnancy Calculator',
      link: 'https://ricardosavaris.github.io/ectopic-pregnancy-calculator/'
    },
    start: 'history',
    nodes: nodes,
    keyPoints: [
      'Anchoring bias: always ask what a previous diagnosis was based on. "Your doctor said it was a miscarriage" is not a documented intrauterine pregnancy.',
      '"Complete miscarriage" requires a previously documented intrauterine pregnancy or confirmed chorionic villi; otherwise an empty uterus after bleeding is a pregnancy of unknown location (PUL).',
      'Patient-reported passage of "tissue" may be clot or decidual cast and does not exclude ectopic pregnancy.',
      'A single β-hCG cannot locate a pregnancy; in a stable patient, repeat β-hCG in 48 hours with clear return precautions.',
      'A plateaued β-hCG over 48 hours (neither the expected rise of a viable intrauterine pregnancy nor the fall of a completed miscarriage) indicates an abnormal pregnancy; exclude ectopic pregnancy.',
      'Failure to see an adnexal mass on the first ultrasound does not exclude ectopic pregnancy; repeat imaging with the β-hCG trend.',
      'Single-dose methotrexate (50 mg/m² IM) is an option for stable patients with low β-hCG and a small mass, but only with reliable follow-up; inability to return for monitoring is a contraindication, and surgery is then preferred.',
      'Avoid folic acid, NSAIDs and alcohol during methotrexate treatment; counsel on symptoms of rupture.',
      'Order only tests that change management: in a stable patient without trauma, FAST, CT and a metabolic panel do not.',
      'RhIG only for Rh-negative patients.'
    ],
    references: [REF.acog193, REF.acog200, REF.esep, REF.rhig, REF.asa]
  };
})();
