import { Router, Request, Response } from 'express';
import Alert from '../models/Alert';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// GET /api/alerts/:projectId — Get all alerts for a project (with filters)
// ───────────────────────────────────────────────────────────────────────────
router.get('/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { type, severity, resolved } = req.query;

    const filter: any = { projectId };
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/alerts/stats/:projectId — Get alert statistics
// ───────────────────────────────────────────────────────────────────────────
router.get('/stats/:projectId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const [byType, bySeverity, byResolved] = await Promise.all([
      Alert.aggregate([
        { $match: { projectId: projectId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Alert.aggregate([
        { $match: { projectId: projectId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Alert.aggregate([
        { $match: { projectId: projectId } },
        { $group: { _id: '$resolved', count: { $sum: 1 } } },
      ]),
    ]);

    const stats = {
      byType: byType.reduce((acc: any, cur: any) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      bySeverity: bySeverity.reduce((acc: any, cur: any) => {
        acc[cur._id] = cur.count;
        return acc;
      }, {}),
      resolved: byResolved.find((r: any) => r._id === true)?.count || 0,
      unresolved: byResolved.find((r: any) => r._id === false)?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Alert stats error:', error);
    res.status(500).json({ message: 'Server error fetching alert stats' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/alerts/ — Create a new alert
// ───────────────────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, type, severity, title, message, deviceId, metadata } = req.body;

    if (!projectId || !type || !title || !message) {
      res.status(400).json({ message: 'projectId, type, title, and message are required' });
      return;
    }

    const alert = await Alert.create({
      projectId,
      type,
      severity,
      title,
      message,
      deviceId,
      metadata,
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ message: 'Server error creating alert' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/alerts/simulate — Simulate a random IoT alert for demo
// ───────────────────────────────────────────────────────────────────────────
router.post('/simulate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      res.status(400).json({ message: 'projectId is required' });
      return;
    }

    const templates = [
      {
        type: 'packet_loss' as const,
        severity: 'HIGH' as const,
        title: 'High Packet Loss Detected',
        message: 'Packet loss rate has exceeded acceptable threshold at 23%. Immediate investigation recommended.',
        deviceId: 'ESP32-NODE-01',
        metadata: { packet_loss_percent: 23, threshold: 5 },
      },
      {
        type: 'high_latency' as const,
        severity: 'MEDIUM' as const,
        title: 'Elevated Network Latency',
        message: 'Average latency has risen to 450ms, which may affect real-time data reporting.',
        deviceId: 'ESP32-NODE-02',
        metadata: { latency_ms: 450, normal_latency_ms: 50 },
      },
      {
        type: 'battery_drain' as const,
        severity: 'HIGH' as const,
        title: 'Critical Battery Level',
        message: 'Battery level has dropped to 12%. Device may shut down soon if not recharged.',
        deviceId: 'ESP32-NODE-03',
        metadata: { battery_percent: 12, estimated_hours_remaining: 2 },
      },
      {
        type: 'sensor_failure' as const,
        severity: 'HIGH' as const,
        title: 'Sensor Failure — DHT22',
        message: 'DHT22 temperature/humidity sensor is returning invalid readings. Check wiring and connections.',
        deviceId: 'ESP32-NODE-01',
        metadata: { sensor: 'DHT22', last_valid_reading: '24.5°C / 60%' },
      },
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];

    const alert = await Alert.create({
      projectId,
      ...template,
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Simulate alert error:', error);
    res.status(500).json({ message: 'Server error simulating alert' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// PUT /api/alerts/:id/resolve — Mark an alert as resolved
// ───────────────────────────────────────────────────────────────────────────
router.put('/:id/resolve', async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }

    res.json(alert);
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ message: 'Server error resolving alert' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// DELETE /api/alerts/:id — Delete an alert
// ───────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error deleting alert' });
  }
});

export default router;
