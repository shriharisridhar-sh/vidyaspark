'use strict';

/**
 * INFO PACKETS — Evidence "Superpowers" for the Manager
 *
 * These are data-backed evidence cards the manager can selectively deploy
 * during the negotiation. Each packet contains real (simulated) data that
 * helps shift the customer's mindset from price-focused to value-focused.
 *
 * Design principles:
 *   - Tier 1 packets are always available (basic evidence)
 *   - Tier 2 packets unlock after the manager demonstrates discovery
 *     (i.e., K(t) for that dimension >= 0.3)
 *   - Using the RIGHT evidence at the RIGHT time is what matters
 *   - Evidence that matches the customer's hidden top priorities has more impact
 */

const INFO_PACKETS = [
  // ── RELIABILITY ──────────────────────────────────────
  {
    id: 'rel-uptime',
    dimension: 'reliability',
    tier: 1,
    title: 'Uptime Performance Record',
    subtitle: 'Agastya vs. Industry Average',
    content: 'Agastya has delivered 99.7% operational uptime on your wells over the past 3 years, versus the Permian Basin industry average of 94.2%. That 5.5-point gap translates to approximately 20 fewer days of unplanned downtime per year across your operations.',
    icon: 'chart',
  },
  {
    id: 'rel-npt',
    dimension: 'reliability',
    tier: 2,
    title: 'NPT Incident Response Data',
    subtitle: 'Stuck Pipe Resolution Comparison',
    content: 'Over the last 24 months, Agastya resolved stuck pipe incidents on your wells in an average of 4.2 hours. The Permian Basin average is 18 hours. Baker Hughes\' published Permian record shows a 14-hour average. Your last stuck pipe incident — the one in the Delaware Basin — was resolved in 3.5 hours, saving an estimated $840,000 in NPT costs.',
    icon: 'clock',
  },

  // ── HSE ──────────────────────────────────────────────
  {
    id: 'hse-safety',
    dimension: 'hse',
    tier: 1,
    title: 'Safety Performance Record',
    subtitle: 'Zero Recordable Incidents',
    content: 'Agastya has maintained zero recordable safety incidents on your wells for 36 consecutive months. The Permian Basin average TRIR (Total Recordable Incident Rate) is 0.8 per 200,000 work hours. Baker Hughes\' published Permian TRIR is 1.4.',
    icon: 'shield',
  },
  {
    id: 'hse-regulatory',
    dimension: 'hse',
    tier: 2,
    title: 'Regulatory Risk Analysis',
    subtitle: 'Cost of HSE Incidents',
    content: 'An HSE incident in the Permian Basin results in an average of $1.2M in combined costs: downtime ($400K), regulatory fines ($300K), investigation ($200K), and remediation ($300K). In the last 5 years, operators who switched service providers experienced a 3x increase in safety incidents during the first 12 months of transition.',
    icon: 'alert',
  },

  // ── TECHNICAL ────────────────────────────────────────
  {
    id: 'tech-wells',
    dimension: 'technical',
    tier: 1,
    title: 'Complex Well Success Rate',
    subtitle: 'Deep Lateral Well Performance',
    content: 'Your deepest lateral wells (15,000ft+) have a 97% first-run success rate with Agastya crews. The industry average for comparable completions is 82%. This performance is directly tied to the crew\'s familiarity with your specific geological conditions in the Wolfcamp and Bone Spring formations.',
    icon: 'wrench',
  },
  {
    id: 'tech-knowledge',
    dimension: 'technical',
    tier: 2,
    title: 'Institutional Knowledge Assessment',
    subtitle: 'Crew Experience & Learning Curve',
    content: 'Your lead drilling engineer Mike and the Agastya crew have accumulated 1,400+ well-days together across your acreage. They know your wellbore challenges, your completion designs, and your formation quirks. Industry data shows that new service provider crews require 6-12 months and an average of 15% higher costs to reach equivalent performance levels.',
    icon: 'users',
  },

  // ── SERVICE RESPONSE ─────────────────────────────────
  {
    id: 'svc-response',
    dimension: 'service',
    tier: 1,
    title: 'Emergency Response Times',
    subtitle: 'Agastya vs. Baker Hughes (Permian)',
    content: 'Agastya\'s average emergency response time to your wells: 2.4 hours. Baker Hughes\' Permian average: 6.8 hours. This gap exists because Agastya maintains a dedicated yard and equipment staging area within 45 minutes of your major well pads, while Baker Hughes\' nearest Permian hub is 3 hours away.',
    icon: 'zap',
  },
  {
    id: 'svc-mobilization',
    dimension: 'service',
    tier: 2,
    title: 'Mobilization History',
    subtitle: '12-Month Service Record',
    content: 'In the last 12 months, Agastya mobilized crews to your wells 47 times with an average response of 2.1 hours and zero missed SLA windows. During the February cold snap, when 60% of Permian service providers couldn\'t mobilize, Agastya had crews on three of your wells within 4 hours.',
    icon: 'truck',
  },

  // ── VALUE / SWITCHING COST ───────────────────────────
  {
    id: 'val-switching',
    dimension: 'value',
    tier: 1,
    title: 'Switching Cost Analysis',
    subtitle: 'Total Cost of Provider Transition',
    content: 'Industry data from 23 Permian Basin operators who switched primary service providers shows: Year 1 costs average 15-25% HIGHER than the incumbent rate due to learning curves, equipment compatibility issues, increased NPT, and operational disruption. The 12% savings Baker Hughes is offering would likely be negative ROI in Year 1.',
    icon: 'calculator',
  },
  {
    id: 'val-total',
    dimension: 'value',
    tier: 2,
    title: 'Total Value Delivered',
    subtitle: '7-Year Partnership Impact',
    content: 'Over your 7-year partnership, Agastya has delivered an estimated $18M in value beyond base services: $8.2M in avoided NPT (reliability), $4.1M in avoided safety costs (zero incidents), $3.4M in technical optimization (well design improvements), and $2.3M in response time savings. The $4.8M annual savings from Baker Hughes\' 12% discount represents 27% of the value Agastya delivers beyond price.',
    icon: 'trending-up',
  },
];

// ── Module-aware packet loader ──
const { loadModule } = require('../modules/ModuleRegistry');

function getInfoPackets(moduleId) {
  const mod = loadModule(moduleId);
  if (mod && mod.evidencePackets && mod.evidencePackets.length > 0) {
    return mod.evidencePackets;
  }
  return INFO_PACKETS; // fallback to existing hardcoded packets
}

module.exports = { INFO_PACKETS, getInfoPackets };
