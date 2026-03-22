'use strict';

/**
 * pdfReport.js — 5-page individualized coaching PDF for each VidyaSpark session.
 *
 * Page 1: YOUR PERFORMANCE (Mirror)
 * Page 2: YOUR COACHING DEBRIEF (Diagnose)
 * Page 3: THE HIDDEN TRUTH (Reveal)
 * Page 4: THE BIGGER LESSON (Teach)
 * Page 5: YOUR ACTION FRAMEWORK (Equip)
 *
 * Design rules:
 *   - No em dashes. Periods, commas, colons only.
 *   - Helvetica throughout (Regular, Bold, Oblique).
 *   - Colored boxes for emphasis. Warm Socratic coaching voice.
 *   - Clean whitespace, printable on letter paper.
 */

const PDFDocument = require('pdfkit');
const { loadModule } = require('../modules/ModuleRegistry');

// ── Color palette ──
const COLORS = {
  primary:     '#0a0a0a',
  secondary:   '#71717a',
  accent:      '#E65100',
  accentLight: '#FFF3E0',
  warmGray:    '#f4f4f5',
  green:       '#059669',
  amber:       '#f59e0b',
  red:         '#ef4444',
  white:       '#ffffff',
};

// ── Dimension labels ──
const DIM_NAMES = {
  reliability: 'Reliability and Uptime',
  hse:         'HSE / Safety Compliance',
  technical:   'Technical Support Quality',
  service:     'Service Response Time',
  price:       'Pricing',
};

// ── Static performance grades ──
const PERF_GRADES = {
  agastya: { reliability: 91, hse: 88, technical: 85, service: 79, price: 58 },
  baker:   { reliability: 74, hse: 79, technical: 71, service: 68, price: 82 },
};

const DIM_ORDER = ['reliability', 'hse', 'technical', 'service', 'price'];

// ── Module-aware report data loader ──

function getReportData(moduleId) {
  const mod = loadModule(moduleId || 'abl-p7-force-pressure');
  if (!mod) return { dimNames: DIM_NAMES, perfGrades: PERF_GRADES, dimOrder: DIM_ORDER };

  const dimNames = {};
  const dimOrder = [];
  mod.dimensions.forEach(d => {
    dimNames[d.shortName] = d.name;
    dimOrder.push(d.shortName);
  });

  return {
    dimNames,
    perfGrades: mod.performanceGrades || PERF_GRADES,
    dimOrder,
    frameworkConcepts: mod.frameworkConcepts || null,
    beforeAfterPhrases: mod.beforeAfterPhrases || null,
    furtherReading: mod.furtherReading || null,
    archetypes: mod.archetypes || null,
    scoreBands: mod.scoreBands || null,
    skills: mod.skills || null,
    isCompetitive: mod.isCompetitive,
  };
}

// ── Utility functions ──

function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\u2014/g, '. ')
    .replace(/\u2013/g, ', ')
    .replace(/\u2012/g, ', ')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreInfo(score) {
  if (score >= 70) return { label: 'Strong',     color: COLORS.green, benchmark: 'Top 20% of participants' };
  if (score >= 50) return { label: 'Developing',  color: COLORS.accent, benchmark: 'Middle of the pack' };
  if (score >= 30) return { label: 'Emerging',    color: COLORS.amber, benchmark: 'Room to grow' };
  return               { label: 'Novice',      color: COLORS.red,   benchmark: 'Most people start here' };
}

function roundedRect(doc, x, y, w, h, r) {
  doc.moveTo(x + r, y)
     .lineTo(x + w - r, y)
     .quadraticCurveTo(x + w, y, x + w, y + r)
     .lineTo(x + w, y + h - r)
     .quadraticCurveTo(x + w, y + h, x + w - r, y + h)
     .lineTo(x + r, y + h)
     .quadraticCurveTo(x, y + h, x, y + h - r)
     .lineTo(x, y + r)
     .quadraticCurveTo(x, y, x + r, y);
}

function drawBox(doc, x, y, w, bgColor, title, body, opts = {}) {
  const padding = 14;
  const titleSize = opts.titleSize || 11;
  const bodySize = opts.bodySize || 10;
  const titleColor = opts.titleColor || COLORS.primary;

  const bodyText = cleanText(body);
  const bodyHeight = doc.fontSize(bodySize).font('Helvetica')
    .heightOfString(bodyText, { width: w - padding * 2, lineGap: 3 });
  const totalHeight = (title ? titleSize + 8 : 0) + bodyHeight + padding * 2;

  doc.save();
  roundedRect(doc, x, y, w, totalHeight, 6);
  doc.fillColor(bgColor).fill();
  doc.restore();

  let curY = y + padding;
  if (title) {
    doc.font('Helvetica-Bold').fontSize(titleSize).fillColor(titleColor);
    doc.text(title, x + padding, curY, { width: w - padding * 2 });
    curY += titleSize + 6;
  }

  doc.font('Helvetica').fontSize(bodySize).fillColor(COLORS.primary);
  doc.text(bodyText, x + padding, curY, { width: w - padding * 2, lineGap: 3 });

  return totalHeight;
}

function drawSkillBar(doc, x, y, width, label, score, weight, color) {
  const barHeight = 10;
  const barWidth = width * 0.55;
  const labelWidth = width * 0.30;

  doc.font('Helvetica').fontSize(9).fillColor(COLORS.primary);
  doc.text(label + ' (' + Math.round(weight * 100) + '%)', x, y + 1, { width: labelWidth });

  const barX = x + labelWidth;
  doc.save();
  roundedRect(doc, barX, y, barWidth, barHeight, 3);
  doc.fillColor(COLORS.warmGray).fill();
  doc.restore();

  const fillWidth = Math.max(4, (score / 100) * barWidth);
  doc.save();
  roundedRect(doc, barX, y, fillWidth, barHeight, 3);
  doc.fillColor(color).fill();
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(9).fillColor(color);
  doc.text(String(Math.round(score)), barX + barWidth + 8, y + 1, { width: 40 });

  return barHeight + 8;
}

// ── Page helpers ──

function drawPageHeader(doc, pageWidth, rightLabel) {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.accent);
  doc.text('VidyaSpark', 55, 45);
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
  doc.text(rightLabel, 55, 50, { width: pageWidth, align: 'right' });
  doc.moveTo(55, 72).lineTo(55 + pageWidth, 72).strokeColor(COLORS.accent).lineWidth(1.5).stroke();
}

function drawPageFooter(doc, pageWidth, sessionId) {
  doc.font('Helvetica').fontSize(7).fillColor(COLORS.secondary);
  doc.text('VidyaSpark. Practice the Classroom Before the Classroom.', 55, 730, { width: pageWidth, align: 'center' });
  if (sessionId) {
    doc.fontSize(6);
    doc.text('Session: ' + String(sessionId).substring(0, 12), 55, 742, { width: pageWidth, align: 'center' });
  }
}

function drawBulletList(doc, x, y, width, items, bulletColor) {
  let curY = y;
  for (let i = 0; i < Math.min(items.length, 3); i++) {
    const text = cleanText(items[i]);
    if (!text) continue;
    doc.save();
    doc.circle(x + 5, curY + 5, 3).fillColor(bulletColor).fill();
    doc.restore();
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.primary);
    const h = doc.heightOfString(text, { width: width - 18, lineGap: 3 });
    doc.text(text, x + 15, curY, { width: width - 18, lineGap: 3 });
    curY += h + 8;
  }
  return curY - y;
}

function drawConceptBar(doc, x, y, width, concept, score, feedback) {
  const maxScore = 10;
  const barWidth = width * 0.35;
  const labelWidth = width * 0.38;
  const barHeight = 10;
  const barX = x + labelWidth;
  const pct = Math.min(score / maxScore, 1);
  const barColor = score >= 7 ? COLORS.green : score >= 4 ? COLORS.amber : COLORS.red;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLORS.primary);
  doc.text(concept, x, y + 1, { width: labelWidth });

  doc.save();
  roundedRect(doc, barX, y, barWidth, barHeight, 3);
  doc.fillColor(COLORS.warmGray).fill();
  doc.restore();

  const fillW = Math.max(4, pct * barWidth);
  doc.save();
  roundedRect(doc, barX, y, fillW, barHeight, 3);
  doc.fillColor(barColor).fill();
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(9).fillColor(barColor);
  doc.text(Math.round(score) + '/10', barX + barWidth + 8, y + 1, { width: 40 });

  let curY = y + barHeight + 4;

  if (feedback) {
    doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
    const h = doc.heightOfString(cleanText(feedback), { width: width, lineGap: 2 });
    doc.text(cleanText(feedback), x, curY, { width: width, lineGap: 2 });
    curY += h + 4;
  }

  return curY - y + 6;
}

function drawDualBarChart(doc, x, y, width, predicted, actual, topDim, dynamicDimOrder, dynamicDimNames) {
  const useDimOrder = dynamicDimOrder || DIM_ORDER;
  const useDimNames = dynamicDimNames || DIM_NAMES;
  const barHeight = 14;
  const rowSpacing = 6;
  const labelWidth = width * 0.30;
  const chartWidth = width * 0.55;
  const barX = x + labelWidth;
  let curY = y;

  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.secondary);
  doc.text('Your Prediction', barX, curY, { width: chartWidth / 2 });
  doc.text('Actual', barX + chartWidth / 2 + 10, curY, { width: chartWidth / 2 });
  curY += 14;

  for (const dim of useDimOrder) {
    const predVal = (predicted && predicted[dim]) || 0;
    const actVal = (actual && actual[dim]) || 0;
    const halfBar = (chartWidth - 10) / 2;
    const isTop = dim === topDim;
    const isPrice = dim === 'price';

    doc.font('Helvetica').fontSize(8).fillColor(COLORS.primary);
    doc.text(useDimNames[dim] || dim, x, curY + 2, { width: labelWidth - 5 });

    // Predicted bar
    const predW = Math.max(2, (predVal / 60) * halfBar);
    doc.save();
    roundedRect(doc, barX, curY, halfBar, barHeight, 3);
    doc.fillColor(COLORS.warmGray).fill();
    doc.restore();
    doc.save();
    roundedRect(doc, barX, curY, predW, barHeight, 3);
    doc.fillColor(COLORS.secondary).fill();
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.secondary);
    doc.text(predVal + '%', barX + predW + 3, curY + 3, { width: 30 });

    // Actual bar
    const actBarX = barX + halfBar + 10;
    const actW = Math.max(2, (actVal / 60) * halfBar);
    const actColor = isTop ? COLORS.accent : isPrice ? COLORS.red : COLORS.secondary;
    doc.save();
    roundedRect(doc, actBarX, curY, halfBar, barHeight, 3);
    doc.fillColor(COLORS.warmGray).fill();
    doc.restore();
    doc.save();
    roundedRect(doc, actBarX, curY, actW, barHeight, 3);
    doc.fillColor(actColor).fill();
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(7).fillColor(actColor);
    doc.text(actVal + '%', actBarX + actW + 3, curY + 3, { width: 30 });

    curY += barHeight + rowSpacing;
  }

  return curY - y;
}

function drawThermometer(doc, x, y, width, startVal, endVal, opts = {}) {
  const barHeight = 14;
  const barY = y + 14;
  const leftLabel = opts.leftLabel || 'Price-Focused';
  const rightLabel = opts.rightLabel || 'Value-Balanced';

  doc.font('Helvetica').fontSize(7).fillColor(COLORS.secondary);
  doc.text(leftLabel, x, y, { width: width / 2 });
  doc.text(rightLabel, x + width / 2, y, { width: width / 2, align: 'right' });

  doc.save();
  roundedRect(doc, x, barY, width, barHeight, 5);
  doc.fillColor(COLORS.warmGray).fill();
  doc.restore();

  const fillPct = Math.min(1, Math.max(0, (endVal - 0.15) / 0.85));
  const fillW = Math.max(4, fillPct * width);
  const fillColor = fillPct >= 0.6 ? COLORS.green : fillPct >= 0.3 ? COLORS.amber : COLORS.red;
  doc.save();
  roundedRect(doc, x, barY, fillW, barHeight, 5);
  doc.fillColor(fillColor).fill();
  doc.restore();

  doc.save();
  doc.circle(x + fillW, barY + barHeight / 2, 5).fillColor(COLORS.white).fill();
  doc.circle(x + fillW, barY + barHeight / 2, 4).fillColor(fillColor).fill();
  doc.restore();

  doc.font('Helvetica-Bold').fontSize(8).fillColor(fillColor);
  doc.text(Math.round(fillPct * 100) + '% shifted', x, barY + barHeight + 4, { width: width, align: 'center' });

  return barHeight + 32;
}

function drawTrajectoryChart(doc, x, y, width, height, knowledgeHistory) {
  const chartX = x + 30;
  const chartW = width - 40;
  const chartY = y;
  const chartH = height;

  doc.save();
  doc.moveTo(chartX, chartY).lineTo(chartX, chartY + chartH).strokeColor(COLORS.secondary).lineWidth(0.5).stroke();
  doc.moveTo(chartX, chartY + chartH).lineTo(chartX + chartW, chartY + chartH).stroke();
  doc.restore();

  doc.font('Helvetica').fontSize(6).fillColor(COLORS.secondary);
  doc.text('1.0', x, chartY - 3, { width: 25, align: 'right' });
  doc.text('0.5', x, chartY + chartH / 2 - 3, { width: 25, align: 'right' });
  doc.text('0', x, chartY + chartH - 3, { width: 25, align: 'right' });
  doc.text('Exchange', chartX + chartW / 2 - 20, chartY + chartH + 4, { width: 50 });

  if (knowledgeHistory && knowledgeHistory.length > 1) {
    const points = knowledgeHistory.map((snap, i) => {
      const K = snap.K || snap.scores || {};
      const dims = Object.values(K);
      const avg = dims.length > 0 ? dims.reduce((s, v) => s + v, 0) / dims.length : 0;
      const px = chartX + (i / (knowledgeHistory.length - 1)) * chartW;
      const py = chartY + chartH - (avg * chartH);
      return { x: px, y: py };
    });

    doc.save();
    doc.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      doc.lineTo(points[i].x, points[i].y);
    }
    doc.strokeColor(COLORS.accent).lineWidth(2).stroke();
    doc.restore();

    for (const p of points) {
      doc.save();
      doc.circle(p.x, p.y, 3).fillColor(COLORS.accent).fill();
      doc.restore();
    }
  } else {
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLORS.secondary);
    doc.text('Trajectory data not available for this session.', chartX + 10, chartY + chartH / 2);
  }

  return chartH + 20;
}

function drawSatisfactionChain(doc, x, y, width) {
  const labels = ['Operational\nInitiatives', 'Strategic Area\nPerformance', 'Customer\nSatisfaction', 'Behaviors\n(repurchase)', 'Financial\nOutcomes'];
  const boxW = width / 7;
  const boxH = 28;
  const gap = (width - boxW * 5) / 4;

  for (let i = 0; i < labels.length; i++) {
    const bx = x + i * (boxW + gap);
    doc.save();
    roundedRect(doc, bx, y, boxW, boxH, 4);
    doc.fillColor(COLORS.accentLight).fill();
    doc.restore();

    const lines = labels[i].split('\n');
    doc.font('Helvetica').fontSize(6).fillColor(COLORS.primary);
    for (let l = 0; l < lines.length; l++) {
      doc.text(lines[l], bx + 2, y + 4 + l * 9, { width: boxW - 4, align: 'center' });
    }

    if (i < labels.length - 1) {
      const arrowX = bx + boxW + 2;
      const arrowY2 = y + boxH / 2;
      doc.save();
      doc.moveTo(arrowX, arrowY2).lineTo(arrowX + gap - 4, arrowY2)
        .strokeColor(COLORS.accent).lineWidth(1).stroke();
      doc.moveTo(arrowX + gap - 4, arrowY2)
        .lineTo(arrowX + gap - 8, arrowY2 - 3)
        .lineTo(arrowX + gap - 8, arrowY2 + 3)
        .fillColor(COLORS.accent).fill();
      doc.restore();
    }
  }

  return boxH + 8;
}

function drawDecisionExplanationPath(doc, x, y, width) {
  const labels = ['The\nDecision', 'The\nExplanation', 'The Path\nForward'];
  const subtext = ['What happened', 'Why it happened', 'What comes next'];
  const boxW = width / 5;
  const boxH = 34;
  const gap = (width - boxW * 3) / 2;

  for (let i = 0; i < labels.length; i++) {
    const bx = x + i * (boxW + gap);
    doc.save();
    roundedRect(doc, bx, y, boxW, boxH, 4);
    doc.fillColor(COLORS.accentLight).fill();
    doc.restore();

    const lines = labels[i].split('\n');
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.primary);
    for (let l = 0; l < lines.length; l++) {
      doc.text(lines[l], bx + 2, y + 4 + l * 10, { width: boxW - 4, align: 'center' });
    }

    doc.font('Helvetica').fontSize(6).fillColor(COLORS.secondary);
    doc.text(subtext[i], bx + 2, y + boxH - 10, { width: boxW - 4, align: 'center' });

    if (i < labels.length - 1) {
      const arrowX = bx + boxW + 2;
      const arrowY2 = y + boxH / 2;
      doc.save();
      doc.moveTo(arrowX, arrowY2).lineTo(arrowX + gap - 4, arrowY2)
        .strokeColor(COLORS.accent).lineWidth(1).stroke();
      doc.moveTo(arrowX + gap - 4, arrowY2)
        .lineTo(arrowX + gap - 8, arrowY2 - 3)
        .lineTo(arrowX + gap - 8, arrowY2 + 3)
        .fillColor(COLORS.accent).fill();
      doc.restore();
    }
  }

  return boxH + 8;
}

function drawBeforeAfter(doc, x, y, width, before, after) {
  const halfW = (width - 10) / 2;
  const padding = 8;

  // Measure heights
  doc.font('Helvetica-Oblique').fontSize(8);
  const beforeH = doc.heightOfString(before, { width: halfW - padding * 2, lineGap: 2 });
  doc.font('Helvetica-Bold').fontSize(8);
  const afterH = doc.heightOfString(after, { width: halfW - padding * 2, lineGap: 2 });
  const rowH = Math.max(beforeH, afterH) + padding * 2 + 12;

  // Before box (gray)
  doc.save();
  roundedRect(doc, x, y, halfW, rowH, 4);
  doc.fillColor(COLORS.warmGray).fill();
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.red);
  doc.text('BEFORE', x + padding, y + padding, { width: halfW - padding * 2 });
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLORS.secondary);
  doc.text(before, x + padding, y + padding + 12, { width: halfW - padding * 2, lineGap: 2 });

  // After box (light blue)
  doc.save();
  roundedRect(doc, x + halfW + 10, y, halfW, rowH, 4);
  doc.fillColor(COLORS.accentLight).fill();
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.green);
  doc.text('AFTER', x + halfW + 10 + padding, y + padding, { width: halfW - padding * 2 });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.primary);
  doc.text(after, x + halfW + 10 + padding, y + padding + 12, { width: halfW - padding * 2, lineGap: 2 });

  return rowH;
}


// ══════════════════════════════════════════════════════
// MAIN: Generate 5-page PDF
// ══════════════════════════════════════════════════════

function generateSessionPDF(sessionData, reportData, moduleId) {
  return new Promise((resolve, reject) => {
    try {
      const modData = getReportData(moduleId || sessionData?.coachModelMetrics?.scenarioId || 'abl-p7-force-pressure');
      const dimNames = modData.dimNames;
      const perfGrades = modData.perfGrades;
      const dimOrder = modData.dimOrder;
      const moduleFrameworkConcepts = modData.frameworkConcepts || [];
      const moduleBeforeAfter = modData.beforeAfterPhrases || [];
      const moduleFurtherReading = modData.furtherReading || [];
      const moduleArchetypes = modData.archetypes || [];
      const moduleScoreBands = modData.scoreBands || [];
      const moduleSkills = modData.skills || [];

      // Determine if this is a competitive module (explicit flag or fallback to 2+ companies in perfGrades)
      const perfCompanies = perfGrades ? Object.keys(perfGrades) : [];
      const isCompetitive = modData.isCompetitive !== undefined ? modData.isCompetitive : perfCompanies.length >= 2;
      const company1Key = perfCompanies[0] || 'agastya';
      const company2Key = perfCompanies[1] || 'baker';
      const company1Grades = perfGrades[company1Key] || {};
      const company2Grades = perfGrades[company2Key] || {};
      const company1Name = company1Key.charAt(0).toUpperCase() + company1Key.slice(1).replace(/([A-Z])/g, ' $1').trim();
      const company2Name = company2Key.charAt(0).toUpperCase() + company2Key.slice(1).replace(/([A-Z])/g, ' $1').trim();

      const doc = new PDFDocument({
        size: 'letter',
        margins: { top: 50, bottom: 50, left: 55, right: 55 },
        info: {
          Title: 'VidyaSpark Performance Report',
          Author: 'VidyaSpark',
          Subject: 'Individualized Coaching Report',
        },
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = 612 - 55 - 55;
      const report = reportData || {};
      const session = sessionData || {};

      // ── Extract all data ──
      const userName = session.userName || 'Participant';
      const sessionDate = session.createdAt
        ? new Date(session.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const sessionId = session.id || '';

      const compositeScore = report.compositeScore || report.overallScore || 0;
      const info = scoreInfo(compositeScore);
      const archetype = report.archetype || { name: 'Explorer', description: 'You started finding signals but could go deeper.' };
      const keyInsight = report.keyInsight || '';
      const gammaSkills = report.gammaSkills || [];
      const skillScores = report.skillScores || {};
      const strengths = (report.strengthsAndGrowth && report.strengthsAndGrowth.strengths) || [];
      const growth = (report.strengthsAndGrowth && report.strengthsAndGrowth.areasForGrowth) || [];
      const conceptScores = report.conceptScores || [];
      const negotiationEff = report.negotiationEffectiveness || {};
      const expertiseProfile = report.expertiseProfile || {};
      const learningTrajectory = report.learningTrajectory || {};

      const scenarioWeights = session.scenarioWeights || {};
      const weights = scenarioWeights.weights || {};
      const topDim = scenarioWeights.topDimension || 'reliability';
      const topWeight = weights[topDim] || 35;
      const weightPrediction = (session.postSurvey && session.postSurvey.weightPrediction) || session.weightPrediction || null;
      const priorityPrediction = session.priorityPrediction || {};
      const knowledgeState = session.knowledgeState || {};
      const knowledgeHistory = session.knowledgeHistory || [];
      const mindsetState = session.mindsetState || 0.15;
      const dimensionEngagement = session.dimensionEngagement || {};
      const perceivedScore = session.perceivedScore;

      const priceWeight = weights.price || 7;
      const relWeight = weights.reliability || 35;
      const hseWeight = weights.hse || 28;
      const dimsProbed = Object.keys(dimensionEngagement).filter(d => dimensionEngagement[d] > 0).length;
      const discoveredReliability = (knowledgeState.reliability || 0) > 0.3;
      const relGap = isCompetitive ? (company1Grades.reliability || 0) - (company2Grades.reliability || 0) : 0;
      const priceGap = isCompetitive ? (company2Grades.price || 0) - (company1Grades.price || 0) : 0;
      const actualName = dimNames[topDim] || topDim;


      // ═══════════════════════════════════════════════
      // PAGE 1: YOUR PERFORMANCE
      // ═══════════════════════════════════════════════

      doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.accent);
      doc.text('VidyaSpark', 55, 45);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
      doc.text(userName, 55, 45, { width: pageWidth, align: 'right' });
      doc.text(sessionDate, 55, 57, { width: pageWidth, align: 'right' });
      doc.moveTo(55, 75).lineTo(55 + pageWidth, 75).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

      let y = 90;

      // Score
      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
      doc.text('Your Score', 55, y);
      y += 20;

      doc.font('Helvetica-Bold').fontSize(52).fillColor(info.color);
      doc.text(String(Math.round(compositeScore)), 55, y);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(info.color);
      doc.text(info.label, 160, y + 10);
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
      doc.text(info.benchmark, 160, y + 28);
      y += 70;

      // Skill bars
      if (gammaSkills.length > 0) {
        for (const skill of gammaSkills) {
          const sc = skillScores[skill.id] || 0;
          const barColor = sc >= 60 ? COLORS.green : sc >= 40 ? COLORS.amber : COLORS.red;
          y += drawSkillBar(doc, 55, y, pageWidth, skill.name || skill.id, sc, skill.weight || 0.5, barColor);
        }
      } else {
        const dScore = report.discoveryScore || 0;
        const pScore = report.persuasionScore || 0;
        y += drawSkillBar(doc, 55, y, pageWidth, 'Discovery', dScore, 0.6, dScore >= 60 ? COLORS.green : dScore >= 40 ? COLORS.amber : COLORS.red);
        y += drawSkillBar(doc, 55, y, pageWidth, 'Persuasion', pScore, 0.4, pScore >= 60 ? COLORS.green : pScore >= 40 ? COLORS.amber : COLORS.red);
      }
      y += 12;

      // Archetype
      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
      doc.text('Your Archetype', 55, y);
      y += 18;
      const archetypeText = (archetype.name || 'Explorer') + '. ' + cleanText(archetype.description || '');
      y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, null, archetypeText, { bodySize: 11 });
      y += 14;

      // Negotiation Effectiveness (2x2 grid)
      if (negotiationEff.customerEngagement || negotiationEff.valueArticulation) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
        doc.text('How You Negotiated', 55, y);
        y += 18;

        const halfW = (pageWidth - 10) / 2;
        const effItems = [
          { title: 'Customer Engagement', body: negotiationEff.customerEngagement },
          { title: 'Value Articulation', body: negotiationEff.valueArticulation },
          { title: 'Price Handling', body: negotiationEff.priceHandling },
          { title: 'Strategic Thinking', body: negotiationEff.strategicThinking },
        ].filter(item => item.body);

        for (let i = 0; i < effItems.length; i += 2) {
          const leftH = effItems[i] ? drawBox(doc, 55, y, halfW, COLORS.warmGray, effItems[i].title, effItems[i].body, { titleSize: 9, bodySize: 8 }) : 0;
          const rightH = effItems[i + 1] ? drawBox(doc, 55 + halfW + 10, y, halfW, COLORS.warmGray, effItems[i + 1].title, effItems[i + 1].body, { titleSize: 9, bodySize: 8 }) : 0;
          y += Math.max(leftH, rightH) + 8;
        }
        y += 4;
      }

      // Key Insight
      if (keyInsight) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
        doc.text('The Key Insight', 55, y);
        y += 18;
        drawBox(doc, 55, y, pageWidth, COLORS.warmGray, null, keyInsight, { bodySize: 10 });
      }

      drawPageFooter(doc, pageWidth, sessionId);


      // ═══════════════════════════════════════════════
      // PAGE 2: YOUR COACHING DEBRIEF
      // ═══════════════════════════════════════════════
      doc.addPage();
      drawPageHeader(doc, pageWidth, 'Your Coaching Debrief');

      y = 85;

      if (strengths.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.green);
        doc.text('What You Did Well', 55, y);
        y += 20;
        y += drawBulletList(doc, 55, y, pageWidth, strengths, COLORS.green);
        y += 8;
      }

      if (growth.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.amber);
        doc.text('Where to Focus Next', 55, y);
        y += 20;
        y += drawBulletList(doc, 55, y, pageWidth, growth, COLORS.amber);
        y += 8;
      }

      // Concept mastery
      if (conceptScores.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
        doc.text('Three Concepts That Matter', 55, y);
        y += 20;

        for (const cs of conceptScores.slice(0, 3)) {
          y += drawConceptBar(doc, 55, y, pageWidth, cs.concept || '', cs.score || 0, cs.feedback || '');
        }
        y += 4;
      }

      // Expertise profile
      if (expertiseProfile.overallLevel || expertiseProfile.developmentPriority) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.secondary);
        doc.text('Your Expertise Level', 55, y);
        y += 16;

        const levelLabel = (expertiseProfile.overallLevel || 'developing').toUpperCase();
        const devPriority = cleanText(expertiseProfile.developmentPriority || '');
        const expText = levelLabel + '. ' + devPriority;
        y += drawBox(doc, 55, y, pageWidth, COLORS.warmGray, null, expText, { bodySize: 10 });
      }

      drawPageFooter(doc, pageWidth, sessionId);


      // ═══════════════════════════════════════════════
      // PAGE 3: THE HIDDEN TRUTH
      // ═══════════════════════════════════════════════
      doc.addPage();
      drawPageHeader(doc, pageWidth, 'The Hidden Truth');

      y = 85;

      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
      doc.text('What You Thought vs. What Was Real', 55, y);
      y += 18;

      // Dynamic intro
      const predictedFirst = (priorityPrediction && priorityPrediction.first) || (isCompetitive ? 'price' : dimOrder[0]);
      const predictedName = dimNames[predictedFirst] || predictedFirst;

      let introText;
      if (isCompetitive) {
        if (predictedFirst === topDim) {
          introText = 'You correctly identified ' + actualName + ' as the customer\'s top priority. That is rare, and it means your discovery instincts are strong. Here is how the full picture looked.';
        } else {
          introText = 'You predicted ' + predictedName + ' was the customer\'s top priority. Most people do. But ' + actualName + ' drove ' + topWeight + '% of this customer\'s decisions. Here is the full picture.';
        }
      } else {
        introText = 'Most people assume they know what matters most in this conversation. The hidden priority weights below reveal what actually drove your score. ' + actualName + ' carried ' + topWeight + '% of the weight.';
      }
      doc.font('Helvetica').fontSize(10).fillColor(COLORS.primary);
      const introH = doc.heightOfString(introText, { width: pageWidth, lineGap: 3 });
      doc.text(introText, 55, y, { width: pageWidth, lineGap: 3 });
      y += introH + 12;

      // Dual bar chart
      y += drawDualBarChart(doc, 55, y, pageWidth, weightPrediction, weights, topDim, dimOrder, dimNames);
      y += 8;

      // Module-aware "trap" insight section
      if (isCompetitive) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.red);
        doc.text('The Price Trap', 55, y);
        y += 16;

        let priceTrapText = 'In B2B energy services, pricing drives less than 10% of customer satisfaction. Reliability and HSE drive over 60%. But pricing is what customers complain about most loudly. This gap between what is salient and what is important is where careers are made or broken.';
        priceTrapText += ' In your session, the customer led with Baker Hughes being 12% cheaper. But price was worth only ' + priceWeight + '% of their decision. Reliability alone was worth ' + relWeight + '%.';
        if (discoveredReliability) {
          priceTrapText += ' You found your way to reliability. That is the right instinct.';
        } else {
          priceTrapText += ' Discovering this hidden priority is the first step to reframing the conversation.';
        }
        y += drawBox(doc, 55, y, pageWidth, COLORS.warmGray, null, priceTrapText, { bodySize: 9 });
        y += 14;
      } else {
        // Non-competitive modules: show the core insight trap
        const mod = loadModule(moduleId || sessionData?.coachModelMetrics?.scenarioId || 'hard-call');
        const trapConcept = (mod && mod.frameworkConcepts && mod.frameworkConcepts.length > 0) ? mod.frameworkConcepts[0] : null;
        const trapTitle = trapConcept ? trapConcept.name : 'The Hidden Pattern';
        const trapBody = trapConcept ? trapConcept.whyItMatters : 'Just as the loudest signal is rarely the most important in negotiations, the most obvious approach in difficult conversations is rarely the most effective.';

        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.red);
        doc.text(trapTitle, 55, y);
        y += 16;

        y += drawBox(doc, 55, y, pageWidth, COLORS.warmGray, null, trapBody, { bodySize: 9 });
        y += 14;
      }

      // Importance vs Performance table (competitive) or Priority Weights (non-competitive)
      doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.primary);
      doc.text(isCompetitive ? 'Importance vs. Performance' : 'Priority Weights Revealed', 55, y);
      y += 16;

      if (isCompetitive) {
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
        doc.text('How ' + company1Name + ' and ' + company2Name + ' compare on the dimensions that matter.', 55, y, { width: pageWidth });
        y += 14;

        const col1 = 55;
        const col2 = 55 + pageWidth * 0.32;
        const col3 = 55 + pageWidth * 0.50;
        const col4 = 55 + pageWidth * 0.68;
        const col5 = 55 + pageWidth * 0.86;

        doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.secondary);
        doc.text('Dimension', col1, y, { width: 80 });
        doc.text('Weight', col2, y, { width: 50 });
        doc.text(company1Name, col3, y, { width: 55 });
        doc.text(company2Name, col4, y, { width: 60 });
        doc.text('Gap', col5, y, { width: 40 });
        y += 12;

        doc.moveTo(55, y).lineTo(55 + pageWidth, y).strokeColor(COLORS.warmGray).lineWidth(0.5).stroke();
        y += 4;

        for (const dim of dimOrder) {
          const w = weights[dim] || 0;
          const hPerf = company1Grades[dim] || 0;
          const bPerf = company2Grades[dim] || 0;
          const gap = hPerf - bPerf;
          const isTop = dim === topDim;
          const isPrice = dim === 'price';
          const rowColor = isTop ? COLORS.accent : isPrice ? COLORS.red : COLORS.primary;

          doc.font(isTop ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor(rowColor);
          doc.text(dimNames[dim] || dim, col1, y, { width: 80 });
          doc.text(w + '%', col2, y, { width: 50 });
          doc.text(String(hPerf), col3, y, { width: 55 });
          doc.text(String(bPerf), col4, y, { width: 60 });
          doc.font('Helvetica-Bold').fillColor(gap > 0 ? COLORS.green : COLORS.red);
          doc.text((gap > 0 ? '+' : '') + gap, col5, y, { width: 40 });
          y += 14;
        }
        y += 8;

        // Callout
        const callout = company1Name + ' leads by ' + relGap + ' points on Reliability, the dimension worth ' + relWeight + '% of satisfaction. ' + company2Name + ' leads by ' + priceGap + ' points on Pricing, worth only ' + priceWeight + '%.';
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.primary);
        const callH = doc.heightOfString(callout, { width: pageWidth, lineGap: 3 });
        doc.text(callout, 55, y, { width: pageWidth, lineGap: 3 });
        y += callH + 14;
      } else {
        // Non-competitive module: show dimension importance weights only
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
        doc.text('How the hidden priority weights break down for this scenario.', 55, y, { width: pageWidth });
        y += 14;

        const col1 = 55;
        const col2 = 55 + pageWidth * 0.50;

        doc.font('Helvetica-Bold').fontSize(7).fillColor(COLORS.secondary);
        doc.text('Dimension', col1, y, { width: 200 });
        doc.text('Importance Weight', col2, y, { width: 100 });
        y += 12;

        doc.moveTo(55, y).lineTo(55 + pageWidth, y).strokeColor(COLORS.warmGray).lineWidth(0.5).stroke();
        y += 4;

        for (const dim of dimOrder) {
          const w = weights[dim] || 0;
          const isTop = dim === topDim;
          const rowColor = isTop ? COLORS.accent : COLORS.primary;

          doc.font(isTop ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor(rowColor);
          doc.text(dimNames[dim] || dim, col1, y, { width: 200 });
          doc.text(w + '%', col2, y, { width: 100 });
          y += 14;
        }
        y += 8;

        const topDimName = dimNames[topDim] || topDim;
        const lowestDim = dimOrder[dimOrder.length - 1];
        const lowestDimName = dimNames[lowestDim] || lowestDim;
        const lowestWeight = weights[lowestDim] || 0;
        const callout = topDimName + ' is the most important dimension at ' + topWeight + '%. ' + lowestDimName + ' is worth only ' + lowestWeight + '%. The gap between what feels urgent and what actually matters is where most people get stuck.';
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(COLORS.primary);
        const callH = doc.heightOfString(callout, { width: pageWidth, lineGap: 3 });
        doc.text(callout, 55, y, { width: pageWidth, lineGap: 3 });
        y += callH + 14;
      }

      // Mindset shift
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
      if (isCompetitive) {
        doc.text('Did You Move the Customer?', 55, y);
      } else {
        doc.text('Your Communication Shift', 55, y);
      }
      y += 16;
      const thermoOpts = isCompetitive
        ? {}
        : { leftLabel: 'Avoidance', rightLabel: 'Clarity' };
      y += drawThermometer(doc, 55, y, pageWidth, 0.15, mindsetState, thermoOpts);

      drawPageFooter(doc, pageWidth, sessionId);


      // ═══════════════════════════════════════════════
      // PAGE 4: THE BIGGER LESSON
      // ═══════════════════════════════════════════════
      doc.addPage();
      drawPageHeader(doc, pageWidth, 'The Bigger Lesson');

      y = 85;

      if (moduleFrameworkConcepts && moduleFrameworkConcepts.length > 0) {
        // Module-specific framework concepts
        doc.font('Helvetica-Oblique').fontSize(10).fillColor(COLORS.secondary);
        const openingText = 'This simulation is designed to surface patterns that appear across many professional contexts. Here are the key concepts embedded in what you just experienced.';
        const openH = doc.heightOfString(openingText, { width: pageWidth, lineGap: 3 });
        doc.text(openingText, 55, y, { width: pageWidth, lineGap: 3 });
        y += openH + 16;

        for (let ci = 0; ci < Math.min(moduleFrameworkConcepts.length, 3); ci++) {
          const concept = moduleFrameworkConcepts[ci];
          doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.accent);
          doc.text((ci + 1) + '. ' + (concept.name || ''), 55, y);
          y += 18;

          if (concept.definition) {
            doc.font('Helvetica').fontSize(9).fillColor(COLORS.primary);
            const defH = doc.heightOfString(cleanText(concept.definition), { width: pageWidth, lineGap: 3 });
            doc.text(cleanText(concept.definition), 55, y, { width: pageWidth, lineGap: 3 });
            y += defH + 8;
          }

          if (concept.whyItMatters) {
            y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, 'Why it matters', cleanText(concept.whyItMatters), { bodySize: 9, titleSize: 9, titleColor: COLORS.accent });
            y += 10;
          } else if (concept.applicationToSim) {
            y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, null, concept.applicationToSim, { bodySize: 9 });
            y += 14;
          }

          if (y > 640) break;
        }
      } else {
        // Default legacy framework concepts
        doc.font('Helvetica-Oblique').fontSize(10).fillColor(COLORS.secondary);
        const openingText = 'This simulation is built on research from the Customer Value Framework. The patterns you experienced are not unique to this scenario. They appear in every B2B relationship. Here are three concepts that will change how you negotiate.';
        const openH = doc.heightOfString(openingText, { width: pageWidth, lineGap: 3 });
        doc.text(openingText, 55, y, { width: pageWidth, lineGap: 3 });
        y += openH + 16;

        // Concept 1
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.accent);
        doc.text('1. The Salience-Importance Gap', 55, y);
        y += 18;

        doc.font('Helvetica').fontSize(9).fillColor(COLORS.primary);
        const c1Static = 'Salience is what customers mention most. Importance is what drives their satisfaction. These are not the same. In a fast food study, owners recalled "high quality food" 98% of the time but "short wait" only 5%, yet wait time was the stronger satisfaction driver. In furniture retail, pricing was mentioned constantly but had zero statistical importance weight (p = 0.51). The pattern is universal: what is loudest is rarely what matters most.';
        const c1H = doc.heightOfString(c1Static, { width: pageWidth, lineGap: 3 });
        doc.text(c1Static, 55, y, { width: pageWidth, lineGap: 3 });
        y += c1H + 8;

        let c1Dynamic = 'In your simulation, the customer kept raising Baker Hughes\' lower price. Price was the most salient issue. But it drove only ' + priceWeight + '% of their satisfaction.';
        if (discoveredReliability) {
          c1Dynamic += ' You saw through the noise and probed reliability, which was worth ' + relWeight + '%. That is exactly the move this framework teaches.';
        } else {
          c1Dynamic += ' The real driver, ' + actualName + ', was worth ' + topWeight + '%. Recognizing this gap is the first and most important skill in value-based selling.';
        }
        y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, null, c1Dynamic, { bodySize: 9 });
        y += 14;

        // Concept 2
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.accent);
        doc.text('2. The Customer Value Equation', 55, y);
        y += 18;

        doc.font('Helvetica').fontSize(9).fillColor(COLORS.primary);
        const c2Static = 'Customer satisfaction is a weighted equation. Collect ratings on each strategic area, run a regression, and convert the coefficients to importance weights that sum to 100%. Non-significant coefficients receive zero weight. This is how you discover what actually drives value, not what people say drives it.';
        const c2H = doc.heightOfString(c2Static, { width: pageWidth, lineGap: 3 });
        doc.text(c2Static, 55, y, { width: pageWidth, lineGap: 3 });
        y += c2H + 8;

        const dpScore = conceptScores.length > 1 ? conceptScores[1].score : 0;
        let c2Dynamic = 'For this customer, the equation was: Satisfaction = 0.' + relWeight + ' x Reliability + 0.' + hseWeight + ' x HSE + 0.' + (weights.technical || 18) + ' x Technical + 0.' + (weights.service || 12) + ' x Service + 0.0' + priceWeight + ' x Price. You explored ' + dimsProbed + ' of 5 dimensions during the conversation.';
        if (dpScore) {
          c2Dynamic += ' Your Dimension Prioritization score was ' + Math.round(dpScore) + '/10.';
        }
        y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, null, c2Dynamic, { bodySize: 9 });
        y += 14;

        // Concept 3
        doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.accent);
        doc.text('3. The Importance-Performance Matrix', 55, y);
        y += 18;

        doc.font('Helvetica').fontSize(9).fillColor(COLORS.primary);
        const c3Static = 'Plot importance weights on the Y-axis and performance grades on the X-axis for each competitor. High importance, high performance is your strength to maintain. High importance, low performance is your vulnerability. This matrix reveals where competitive advantage actually lives.';
        const c3H = doc.heightOfString(c3Static, { width: pageWidth, lineGap: 3 });
        doc.text(c3Static, 55, y, { width: pageWidth, lineGap: 3 });
        y += c3H + 8;

        const cmScore = conceptScores.length > 2 ? conceptScores[2].score : 0;
        const combinedTopWeight = relWeight + hseWeight;
        let c3Dynamic = 'The learner sits in the "Maintain Strength" quadrant on Reliability and HSE, the two dimensions worth ' + combinedTopWeight + '% combined. The competitor only leads on Pricing, worth ' + priceWeight + '%.';
        if (cmScore >= 7) {
          c3Dynamic += ' Your Competitive Mapping score of ' + Math.round(cmScore) + '/10 suggests you grasped this instinctively.';
        } else if (cmScore > 0 && cmScore < 4) {
          c3Dynamic += ' Your Competitive Mapping score of ' + Math.round(cmScore) + '/10 suggests this is the biggest opportunity for growth. Next time, ask: where does each competitor sit on the dimensions that matter most?';
        } else if (cmScore > 0) {
          c3Dynamic += ' Your Competitive Mapping score was ' + Math.round(cmScore) + '/10.';
        }
        y += drawBox(doc, 55, y, pageWidth, COLORS.accentLight, null, c3Dynamic, { bodySize: 9 });
        y += 16;
      }

      // Flow diagram (module-aware)
      if (y < 640) {
        if (isCompetitive) {
          doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
          doc.text('The Satisfaction-Profit Chain', 55, y);
          y += 14;
          y += drawSatisfactionChain(doc, 55, y, pageWidth);
          y += 4;
          doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
          doc.text('Managing satisfaction is managing financial performance. The research shows satisfaction drives repurchase and recommendation, which drive revenue.', 55, y, { width: pageWidth, lineGap: 2 });
        } else {
          doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
          doc.text('The Decision-Explanation-Path Framework', 55, y);
          y += 14;
          y += drawDecisionExplanationPath(doc, 55, y, pageWidth);
          y += 4;
          doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
          doc.text('Every difficult conversation needs all three elements in order. Skipping or reordering them creates confusion and erodes trust.', 55, y, { width: pageWidth, lineGap: 2 });
        }
      }

      drawPageFooter(doc, pageWidth, sessionId);


      // ═══════════════════════════════════════════════
      // PAGE 5: YOUR ACTION FRAMEWORK
      // ═══════════════════════════════════════════════
      doc.addPage();
      drawPageHeader(doc, pageWidth, 'Your Action Framework');

      y = 85;

      doc.font('Helvetica-Bold').fontSize(13).fillColor(COLORS.accent);
      doc.text('Five Things You Say at Work. Now Say Them Differently.', 55, y);
      y += 20;

      doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
      doc.text('The simulation gave you a new lens. Here is how it changes the conversations you already have.', 55, y, { width: pageWidth, lineGap: 3 });
      y += 20;

      // Before/After pairs (module-aware)
      if (moduleBeforeAfter && moduleBeforeAfter.length > 0) {
        for (let bai = 0; bai < Math.min(moduleBeforeAfter.length, 5); bai++) {
          const pair = moduleBeforeAfter[bai];
          y += drawBeforeAfter(doc, 55, y, pageWidth, pair.before || '', pair.after || '');
          y += 6;
        }
      } else {
        // Default legacy before/after pairs
        y += drawBeforeAfter(doc, 55, y, pageWidth,
          '"We can match their price."',
          '"Before we talk numbers, help me understand what is driving this decision. What would make you confident in switching?"'
        );
        y += 6;

        y += drawBeforeAfter(doc, 55, y, pageWidth,
          '"Our product is better across the board."',
          '"On the two dimensions you told me matter most, here is exactly where we lead and by how much."'
        );
        y += 6;

        y += drawBeforeAfter(doc, 55, y, pageWidth,
          '"The customer says price is the issue."',
          '"Price is what they mentioned. But when I dug deeper, uptime and safety were the real concerns."'
        );
        y += 6;

        y += drawBeforeAfter(doc, 55, y, pageWidth,
          '"We need to cut our price to win this."',
          '"We need to quantify our advantage on the dimensions that drive their satisfaction, then present that data."'
        );
        y += 6;

        y += drawBeforeAfter(doc, 55, y, pageWidth,
          '"I know what the customer wants."',
          '"I know what the customer says. Let me test whether that is what actually drives their decision."'
        );
      }
      y += 12;

      // Learning trajectory
      if (knowledgeHistory.length > 1 && y < 520) {
        doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.primary);
        doc.text('Your Learning Arc', 55, y);
        y += 14;
        y += drawTrajectoryChart(doc, 55, y, pageWidth, 70, knowledgeHistory);

        if (learningTrajectory.startingPoint || learningTrajectory.endingPoint) {
          doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
          const trajText = cleanText((learningTrajectory.startingPoint || '') + ' ' + (learningTrajectory.endingPoint || ''));
          if (trajText) {
            const trajH = doc.heightOfString(trajText, { width: pageWidth, lineGap: 2 });
            doc.text(trajText, 55, y, { width: pageWidth, lineGap: 2 });
            y += trajH + 8;
          }
        }
      }

      // Calibration check (conditional)
      if (perceivedScore != null && compositeScore && y < 600) {
        doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
        doc.text('How Well Do You Know Yourself?', 55, y);
        y += 16;

        const halfW = (pageWidth - 20) / 2;
        doc.save();
        roundedRect(doc, 55, y, halfW, 36, 6);
        doc.fillColor(COLORS.warmGray).fill();
        doc.restore();
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.secondary);
        doc.text('You Said', 55 + 10, y + 4, { width: halfW - 20 });
        doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.secondary);
        doc.text(String(Math.round(perceivedScore)), 55 + 10, y + 14, { width: halfW - 20 });

        doc.save();
        roundedRect(doc, 55 + halfW + 20, y, halfW, 36, 6);
        doc.fillColor(COLORS.accentLight).fill();
        doc.restore();
        doc.font('Helvetica').fontSize(8).fillColor(COLORS.accent);
        doc.text('Data Shows', 55 + halfW + 30, y + 4, { width: halfW - 20 });
        doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.accent);
        doc.text(String(Math.round(compositeScore)), 55 + halfW + 30, y + 14, { width: halfW - 20 });
        y += 44;
      }

      // Further Reading (module-aware)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
      const readingY = Math.max(y + 8, 620);
      doc.text('Further Reading', 55, readingY);

      doc.font('Helvetica').fontSize(7).fillColor(COLORS.secondary);
      const defaultReadings = [
        'Anderson, J.C. & Narus, J.A. (1998). Business Marketing: Understand What Customers Value. Harvard Business Review.',
        'Nagle, T.T. & Muller, G. (2017). The Strategy and Tactics of Pricing: A Guide to Growing More Profitably. Routledge.',
        'Ulaga, W. & Eggert, A. (2006). Value-Based Differentiation in Business Relationships. Journal of Marketing, 70(1).',
        'Hinterhuber, A. (2008). Customer Value-Based Pricing Strategies. Journal of Revenue and Pricing Management, 7(1).',
        'Rackham, N. (1988). SPIN Selling. McGraw-Hill.',
      ];
      const readings = (moduleFurtherReading && moduleFurtherReading.length > 0)
        ? moduleFurtherReading
        : defaultReadings;
      let rY = readingY + 14;
      for (const ref of readings) {
        let refText;
        if (typeof ref === 'object' && ref.author) {
          refText = ref.author + ' (' + ref.year + '). ' + ref.title + '. ' + ref.journal + '.';
        } else {
          refText = String(ref);
        }
        doc.text(cleanText(refText), 55, rY, { width: pageWidth, lineGap: 1 });
        rY += 10;
      }

      // Closing (module-aware)
      const closingY = rY + 8;
      doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
      const closingLine = isCompetitive
        ? 'The gap between what customers say and what they value is where the best B2B professionals operate.'
        : 'The gap between what feels kind and what is actually helpful is where the best communicators operate.';
      doc.text(closingLine, 55, closingY, { width: pageWidth, align: 'center' });

      drawPageFooter(doc, pageWidth, sessionId);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateSessionPDF, getReportData };
