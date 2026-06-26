import { Router, Request, Response } from 'express';
import IoTLibraryItem from '../models/IoTLibraryItem';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library — Get the full IoT solution library from DB
// ───────────────────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await IoTLibraryItem.find();
    
    // Group them into the structure expected by the frontend
    const result: Record<string, any[]> = {
      hardware: [],
      protocols: [],
      cloud: [],
      software: [],
      sensors: [] // Added for backward compatibility if needed
    };
    
    for (const item of items) {
      // Reconstruct the flat object
      const flatObj = {
        name: item.name,
        icon: item.icon,
        description: item.description,
        difficulty: item.difficulty,
        ...item.data
      };
      
      if (result[item.category]) {
        result[item.category].push(flatObj);
      } else {
        result[item.category] = [flatObj];
      }
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching library:', err);
    res.status(500).json({ message: 'Server error fetching library' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// POST /api/library/seed — Temporary endpoint to seed DB from request body
// ───────────────────────────────────────────────────────────────────────────
router.post('/seed', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    if (!data) {
      res.status(400).json({ message: 'No data provided' });
      return;
    }

    await IoTLibraryItem.deleteMany({}); // Clear existing

    const toInsert = [];

    // Categories in the new JSON are 'hardware', 'protocols', 'cloud', 'software'
    const categories = ['hardware', 'protocols', 'cloud', 'software', 'cloudPlatforms', 'sensors'];

    for (const category of categories) {
      if (data[category] && Array.isArray(data[category])) {
        // Map cloudPlatforms to cloud if necessary
        const targetCategory = category === 'cloudPlatforms' ? 'cloud' : category;

        for (const item of data[category]) {
          const { name, icon, description, difficulty, ...rest } = item;
          toInsert.push({
            category: targetCategory,
            name: name || 'Unknown',
            icon: icon || '',
            description: description || '',
            difficulty: difficulty || '',
            data: rest
          });
        }
      }
    }

    await IoTLibraryItem.insertMany(toInsert);
    res.json({ message: 'Successfully seeded library items', count: toInsert.length });
  } catch (err) {
    console.error('Error seeding library:', err);
    res.status(500).json({ message: 'Server error seeding library' });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/search?q=...
// ───────────────────────────────────────────────────────────────────────────
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.q as string) || '').toLowerCase();

    if (!query) {
      res.json([]);
      return;
    }

    const items = await IoTLibraryItem.find();
    const results: Array<Record<string, unknown>> = [];

    for (const item of items) {
      const flatObj = {
        name: item.name,
        icon: item.icon,
        description: item.description,
        difficulty: item.difficulty,
        ...item.data
      };
      
      const text = JSON.stringify(flatObj).toLowerCase();
      if (text.includes(query)) {
        results.push({ ...flatObj, _category: item.category });
      }
    }

    res.json(results);
  } catch (err) {
    console.error('Error searching library:', err);
    res.status(500).json({ message: 'Server error searching library' });
  }
});

// Provide backward-compatible routes if needed
router.get('/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryMap: any = {
      protocols: 'protocols',
      hardware: 'hardware',
      cloud: 'cloud',
      sensors: 'sensors'
    };
    
    const categoryKey = Array.isArray(req.params.category) ? req.params.category[0] : req.params.category;
    const cat = categoryMap[categoryKey as string];
    if (!cat) {
      // Fallback to next middleware or 404
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const items = await IoTLibraryItem.find({ category: cat });
    const results = items.map(item => ({
      name: item.name,
      icon: item.icon,
      description: item.description,
      difficulty: item.difficulty,
      ...item.data
    }));

    res.json(results);
  } catch (err) {
    console.error(`Error fetching library category ${req.params.category}:`, err);
    res.status(500).json({ message: `Server error fetching ${req.params.category}` });
  }
});

export default router;
