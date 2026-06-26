// ═══════════════════════════════════════════════════════════════════════════
// Analysis Routes — Interdisciplinary Issues + Architecture Analysis Demo
// ═══════════════════════════════════════════════════════════════════════════
// Provides two main features:
// 1. POST /api/analysis/interdisciplinary — Analyze architecture for cross-discipline issues
// 2. GET  /api/analysis/demo-projects     — List demo projects for architecture analysis
// 3. GET  /api/analysis/demo-projects/:id — Get full analysis for a specific demo project
// 4. POST /api/analysis/architecture      — Analyze a custom architecture (with fake results)
// ═══════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express';
import { DEMO_PROJECTS, getDemoProject } from '../dto/demoProjects';
import { analyzeInterdisciplinaryIssues, getIssuesSummary, ArchitectureInput, analyzeArchitecture } from '../services/analyze';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// POST /api/analysis/interdisciplinary
// Receives architecture details and returns interdisciplinary issues.
// ───────────────────────────────────────────────────────────────────────────
router.post('/interdisciplinary', (req: Request, res: Response): void => {
  try {
    const { device, protocol, database, powerSource, sensors, cloudPlatform } = req.body;

    // Validate: at least device is required
    if (!device) {
      res.status(400).json({ message: 'Device field is required' });
      return;
    }

    const architecture: ArchitectureInput = {
      device: device || '',
      protocol: protocol || '',
      database: database || '',
      powerSource: powerSource || '',
      sensors: sensors || [],
      cloudPlatform: cloudPlatform || '',
    };

    // Run the rule-based analysis
    const issues = analyzeInterdisciplinaryIssues(architecture);
    const summary = getIssuesSummary(issues);

    res.json({
      architecture,
      issues,
      summary,
    });
  } catch (error) {
    console.error('Interdisciplinary analysis error:', error);
    res.status(500).json({ message: 'Server error in interdisciplinary analysis' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/analysis/demo-projects
// Returns a list of demo projects (summary only, no full analysis).
// ───────────────────────────────────────────────────────────────────────────
router.get('/demo-projects', (_req: Request, res: Response): void => {
  try {
    // Return only summary info (not the full analysis)
    const summaries = DEMO_PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      device: p.device,
      protocol: p.protocol,
      database: p.database,
      powerSource: p.powerSource,
      sensors: p.sensors,
      cloudPlatform: p.cloudPlatform,
      healthScore: p.healthScore,
    }));

    res.json(summaries);
  } catch (error) {
    console.error('Demo projects list error:', error);
    res.status(500).json({ message: 'Server error fetching demo projects' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/analysis/demo-projects/:id
// Returns the full analysis for a specific demo project.
// ───────────────────────────────────────────────────────────────────────────
router.get('/demo-projects/:id', (req: Request, res: Response): void => {
  try {
    const project = getDemoProject(req.params.id as string);

    if (!project) {
      res.status(404).json({ message: 'Demo project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Demo project detail error:', error);
    res.status(500).json({ message: 'Server error fetching demo project' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/analysis/architecture
// Analyzes a custom architecture (combines interdisciplinary + basic scores).
// This is a demo endpoint — generates analysis from rules, not real AI.
// ───────────────────────────────────────────────────────────────────────────
router.post('/architecture', (req: Request, res: Response): void => {
  try {
    const { device, protocol, database, powerSource, sensors, cloudPlatform } = req.body;

    if (!device) {
      res.status(400).json({ message: 'Device field is required' });
      return;
    }

    const architecture: ArchitectureInput = {
      device: device || '',
      protocol: protocol || '',
      database: database || '',
      powerSource: powerSource || '',
      sensors: sensors || [],
      cloudPlatform: cloudPlatform || '',
    };

    const result = analyzeArchitecture(architecture);
    res.json(result);
  } catch (error) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({ message: 'Server error in architecture analysis' });
  }
});

export default router;
