import express from 'express';
import cors from 'cors';
import { QueenOrchestrator } from './core/orchestrator/QueenOrchestrator';
import { logger } from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new QueenOrchestrator();

// ─── Routes ──────────────────────────────────────────────────────────────────

// Submit a new task → Queen builds workflow and executes
app.post('/task', async (req, res) => {
  try {
    const { title, description, context } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    const workflow = await orchestrator.submitTask({ title, description, context });
    res.json(workflow);
  } catch (err) {
    logger.error('API', 'POST /task failed', err);
    res.status(500).json({ error: String(err) });
  }
});

// Get workflow state
app.get('/workflow/:id', (req, res) => {
  const workflow = orchestrator.getWorkflow(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  res.json(workflow);
});

// List all workflows
app.get('/workflows', (_req, res) => {
  res.json(orchestrator.getAllWorkflows());
});

// List agents
app.get('/agents', (_req, res) => {
  res.json(orchestrator.getAgents());
});

// Message log
app.get('/messages', (req, res) => {
  const { task_id } = req.query;
  res.json(orchestrator.getMessages(task_id as string | undefined));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', system: 'Hexacore', version: '1.0.0' });
});

// ─── Bootstrap ───────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001;

orchestrator.initialize().then(() => {
  app.listen(PORT, () => {
    logger.info('API', `Hexacore backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  logger.error('API', 'Failed to initialize', err);
  process.exit(1);
});

export default app;
