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
import {
  analyzeInterdisciplinaryIssues,
  getIssuesSummary,
  ArchitectureInput,
} from '../services/interdisciplinaryAnalyzer';
import { DEMO_PROJECTS, getDemoProject } from '../dto/demoProjects';

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
    const project = getDemoProject(req.params.id);

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

    // Run interdisciplinary analysis
    const issues = analyzeInterdisciplinaryIssues(architecture);
    const summary = getIssuesSummary(issues);

    // Calculate a simple health score based on issues found
    const highPenalty = summary.bySeverity.HIGH * 15;
    const mediumPenalty = summary.bySeverity.MEDIUM * 8;
    const lowPenalty = summary.bySeverity.LOW * 3;
    const healthScore = Math.max(0, 100 - highPenalty - mediumPenalty - lowPenalty);

    // Build data flow based on input
    const dataFlow = [];
    if (sensors && sensors.length > 0) dataFlow.push(sensors.join(' + '));
    if (device) dataFlow.push(`${device} (MCU/Processing)`);
    if (protocol) dataFlow.push(`${protocol} (Communication)`);
    if (cloudPlatform) dataFlow.push(`${cloudPlatform} (Cloud)`);
    if (database) dataFlow.push(`${database} (Storage)`);
    if (dataFlow.length === 0) dataFlow.push('No components defined');

    // Generate simple layer analysis
    const layers = [
      {
        name: 'Sensor Layer',
        status: (sensors.length > 4 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
        score: Math.max(50, 95 - sensors.length * 5),
        details: `${sensors.length} sensor(s) configured: ${sensors.join(', ') || 'none'}`,
      },
      {
        name: 'Firmware Layer',
        status: (summary.byCategory['memory'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
        score: summary.byCategory['memory'] ? 55 : 85,
        details: `Running on ${device}. ${summary.byCategory['memory'] ? 'Memory constraints detected.' : 'No memory issues detected.'}`,
      },
      {
        name: 'Communication Layer',
        status: (summary.byCategory['protocol'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
        score: summary.byCategory['protocol'] ? 50 : 80,
        details: `Using ${protocol || 'unknown protocol'}. ${summary.byCategory['protocol'] ? 'Protocol issues detected.' : 'Protocol looks compatible.'}`,
      },
      {
        name: 'Power Layer',
        status: (summary.byCategory['power'] ? 'critical' : 'healthy') as 'healthy' | 'warning' | 'critical',
        score: summary.byCategory['power'] ? 35 : 90,
        details: `Power source: ${powerSource || 'unknown'}. ${summary.byCategory['power'] ? 'Power management issues detected.' : 'Power setup looks adequate.'}`,
      },
      {
        name: 'Cloud/Database Layer',
        status: (summary.byCategory['architecture'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
        score: summary.byCategory['architecture'] ? 60 : 85,
        details: `${cloudPlatform || 'No cloud'} + ${database || 'No DB'}`,
      },
    ];

    res.json({
      architecture,
      healthScore,
      dataFlow,
      layers,
      issues,
      summary,
    });
  } catch (error) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({ message: 'Server error in architecture analysis' });
  }
});

export default router;
