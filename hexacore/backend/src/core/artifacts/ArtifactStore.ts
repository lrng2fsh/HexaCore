import fs from 'fs';
import path from 'path';
import { Artifact, ArtifactType } from '../../types';
import { generateId } from '../../utils/id';
import { logger } from '../../utils/logger';

const ARTIFACT_DIR = path.resolve(__dirname, '../../../../runtime/artifacts');

export class ArtifactStore {
  private static instance: ArtifactStore;
  private artifacts: Map<string, Artifact> = new Map();

  static getInstance(): ArtifactStore {
    if (!ArtifactStore.instance) ArtifactStore.instance = new ArtifactStore();
    return ArtifactStore.instance;
  }

  create(params: {
    type: ArtifactType;
    name: string;
    content: string;
    createdBy: string;
    workflowId: string;
    nodeId: string;
    metadata?: Record<string, unknown>;
  }): Artifact {
    const artifact: Artifact = {
      id: generateId('art'),
      ...params,
      createdAt: new Date().toISOString(),
    };

    this.artifacts.set(artifact.id, artifact);
    this.persist(artifact);
    logger.info('ArtifactStore', `Artifact created: ${artifact.name}`, { id: artifact.id, type: artifact.type });
    return artifact;
  }

  get(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  getByWorkflow(workflowId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.workflowId === workflowId);
  }

  getByNode(nodeId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.nodeId === nodeId);
  }

  getAll(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  private persist(artifact: Artifact): void {
    try {
      const dir = path.join(ARTIFACT_DIR, artifact.workflowId);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Write content file
      const ext = this.extensionFor(artifact.type);
      fs.writeFileSync(path.join(dir, `${artifact.id}${ext}`), artifact.content, 'utf-8');

      // Write metadata sidecar
      fs.writeFileSync(
        path.join(dir, `${artifact.id}.meta.json`),
        JSON.stringify({ ...artifact, content: undefined }, null, 2)
      );
    } catch {
      // non-fatal
    }
  }

  private extensionFor(type: ArtifactType): string {
    const map: Record<ArtifactType, string> = {
      log: '.log', report: '.md', diff: '.diff', sql: '.sql',
      test_result: '.json', build_output: '.txt', config_snapshot: '.json', decision_note: '.md',
    };
    return map[type] ?? '.txt';
  }
}
