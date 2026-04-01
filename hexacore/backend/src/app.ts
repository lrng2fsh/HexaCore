import express from 'express';
import cors from 'cors';
import { QueenOrchestrator } from './core/orchestrator/QueenOrchestrator';
import { logger } from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new QueenOrchestrator();

// ─── Task ─────────────────────────────────────────────────────────────────────

app.post('/task', async (req, res) => {
  try {
    const { title, description, category, priority, context } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }
    const workflow = await orchestrator.submitTask({ title, description, category, priority, context });
    res.json(workflow);
  } catch (err) {
    logger.error('API', 'POST /task failed', err);
    res.status(500).json({ error: String(err) });
  }
});

// ─── Workflows ────────────────────────────────────────────────────────────────

app.get('/workflows', (_req, res) => {
  res.json(orchestrator.getAllWorkflows());
});

app.get('/workflow/:id', (req, res) => {
  const workflow = orchestrator.getWorkflow(req.params.id);
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  res.json(workflow);
});

app.get('/workflow/:id/artifacts', (req, res) => {
  res.json(orchestrator.getArtifacts(req.params.id));
});

app.get('/workflow/:id/audit', (req, res) => {
  res.json(orchestrator.getAuditTrail(req.params.id));
});

// ─── Agents ───────────────────────────────────────────────────────────────────

app.get('/agents', (_req, res) => {
  res.json(orchestrator.getAgents());
});

app.get('/agent/:id/activity', (req, res) => {
  const activity = orchestrator.getAgentActivity(req.params.id);
  if (!activity.agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(activity);
});

// ─── Messages ─────────────────────────────────────────────────────────────────

app.get('/messages', (req, res) => {
  const { task_id, workflowId } = req.query;
  res.json(orchestrator.getMessages({
    task_id: task_id as string | undefined,
    workflowId: workflowId as string | undefined,
  }));
});

// ─── Signals ──────────────────────────────────────────────────────────────────

app.get('/signals', (req, res) => {
  const { workflowId } = req.query;
  res.json(orchestrator.getSignals(workflowId as string | undefined));
});

// ─── Artifacts ────────────────────────────────────────────────────────────────

app.get('/artifacts', (req, res) => {
  const { workflowId } = req.query;
  res.json(orchestrator.getArtifacts(workflowId as string | undefined));
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'Hexacore',
    version: '2.0.0',
    agents: orchestrator.getAgents().length,
    signals: orchestrator.getSignals().length,
  });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001;

orchestrator.initialize().then(() => {
  app.listen(PORT, () => {
    logger.info('API', `Hexacore v2 running on http://localhost:${PORT}`);
  });
}).catch(err => {
  logger.error('API', 'Failed to initialize', err);
  process.exit(1);
});

export default app;
