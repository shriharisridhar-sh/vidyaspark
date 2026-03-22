# VidyaSpark — AI-Powered Ignator Training & Education Platform

## What This Project Is

VidyaSpark is an AI-powered "Intellectual Forest" — an ecosystem where Agastya International Foundation's Ignators (science educators) practice teaching interactive science experiments to AI students on a visual canvas, receive feedback from human or AI mentors, and repeat until mastery. Once proven, the same platform delivers those interactive experiments to real students in government school classrooms.

This is a white-label fork of the CoEqual AI simulation engine, reimagined for India's experiential education context.

## Key Stakeholders

- **Professor Shrihari Sridhar** — CRO of Agastya, Professor at Texas A&M Mays Business School. Building this for research (AI training effectiveness) and commercialization (state-level education platform).
- **Ramji** — CEO of Agastya International Foundation. Presenting VidyaSpark to the Chief Minister of Andhra Pradesh for potential state-wide deployment.
- **Agastya International Foundation** — Indian non-profit delivering hands-on STEAM education to underserved children. ~1,000 Ignators. Goal: 100M children, 1M teachers by 2032.

## The Three-Phase Vision

**Phase 1 — The Simulator:** Ignators practice teaching ABL modules to 5 AI students on an interactive experiment canvas. They receive mentor feedback (human or AI). They practice unlimited times until mastery. This is the research phase.

**Phase 2 — The Classroom:** The same interactive canvas becomes the teaching tool for real students. VidyaSpark-trained Ignators use the canvas to teach live classes. Every government school with a screen becomes a science lab.

**Phase 3 — The Platform:** VidyaSpark scales across Andhra Pradesh and beyond. The full library of 100+ interactive modules, deployed to thousands of schools through trained Ignators. A technology company that changes education delivery in India.

## Core Concepts

### The Interactive Experiment Canvas
Each ABL (Activity-Based Learning) module from Agastya's handbooks is turned into an interactive visual experience. The canvas shows the experiment step by step — illustrated storyboard frames for MVP, animated SVG for later upgrades. When the Ignator narrates an action, the canvas advances to show the result.

### The 5 AI Students
- **Priya** (13, Curious): Asks genuine "why" questions
- **Ravi** (14, Skeptic): Demands proof, challenges claims
- **Lakshmi** (12, Shy): Knows answers but won't speak unless invited
- **Arjun** (14, Disengaged): Bored, makes jokes, can be won back
- **Meena** (13, Rote Learner): Repeats without understanding

### The Mentor Pause
After ~5 minutes, the session pauses. The Ignator chooses:
- **Human Mentor:** A real Catalyzer reviews the transcript and gives feedback
- **AI Mentor:** AI reviews against the ABL handbook, Super Class checklist, and student engagement patterns

### Memory Wipe & Repeat
After each session, AI students' memory resets. The Ignator can practice the same module unlimited times. Available 24/7 from anywhere.

## What's in This Folder

- `CLAUDE.md` — This file
- `PLAN.md` — Detailed implementation plan (phases, architecture, sprints)
- `BRAINSTORM - VidyaSpark Reimagined.md` — Initial brainstorming document
- `VidyaSpark-Vision-Pitch.html` — Pitch document for Ramji / CM Naidu
- `experiment-canvas-mockup.html` — Interactive prototype of the experiment canvas
- `ignator-docs/` — Agastya training documents (Navoday, Arohan, Srujan, etc.)
- `ABL HANDBOOKS/` — Full ABL handbooks (Physics, Chemistry, Biology, Maths)
- `coequal-reference/` — Key files from CoEqual AI for reference

## Source Platform (CoEqual AI)

Fork from: `C:\Users\shriharisridhar\OneDrive - Texas A&M University\ClaudeCodeProjects\Voice Agent Halliburton`

Key patterns to reuse:
- `app/server/modules/ModuleRegistry.js` — Module auto-discovery
- `app/server/scenarios/{module-id}/` — Module package structure
- `app/server/agents/` — Student agent, coach agent, skill judge, report agent
- `app/server/utils/pdfReport.js` — PDF generation with pdfkit
- `app/client/src/flows/ManagerFlow.jsx` — Session flow architecture

## ABL Module Library

Start with P7.1 (Force and Pressure — Brick on Rubber Sheet). Architecture supports any ABL:

- **Physics:** 11 handbooks, ~50 ABLs (Measurements, Magnetism, Sound, Light, Refraction, Heat, Pressure & Density, Forces & Motion, Electricity, Astronomy, Electromagnetism)
- **Chemistry:** 7 handbooks, ~30 ABLs (States of Matter, Separation, Acids/Bases, Chemical Reactions, Atomic Structure, Periodic Table, Metals)
- **Biology:** 8 handbooks, ~25 ABLs (Cells, Photosynthesis, Digestion, Respiration, Transport in Plants, Circulatory, Nervous System, Skeletal)
- **Maths:** 1 handbook, ~5 ABLs

## Branding

- **Colors:** Orange (#E65100) primary, Green (#059669) accent
- **Tagline:** "Practice the Classroom Before the Classroom"
- **Metaphor:** "The Intellectual Forest" — a rich ecosystem where Ignators grow

## Getting Started

When ready to build: "Read PLAN.md and CLAUDE.md, fork the CoEqual AI engine, and build the VidyaSpark platform starting with the P7.1 module."
