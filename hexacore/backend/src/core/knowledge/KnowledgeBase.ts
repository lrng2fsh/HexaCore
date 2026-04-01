import fs from 'fs';
import path from 'path';
import { logger } from '../../utils/logger';

interface KnowledgeDoc {
  id: string;
  source: string;
  content: string;
  tags: string[];
}

export class KnowledgeBase {
  private docs: KnowledgeDoc[] = [];

  loadFromDirectory(dir: string): void {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.txt'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      this.docs.push({
        id: file,
        source: path.join(dir, file),
        content,
        tags: file.replace(/\.[^.]+$/, '').split('-'),
      });
    }
    logger.info('KnowledgeBase', `Loaded ${files.length} documents from ${dir}`);
  }

  addDocument(id: string, content: string, tags: string[] = []): void {
    this.docs.push({ id, source: 'inline', content, tags });
  }

  // Placeholder vector-like search — string match, replaceable with real embeddings
  search(query: string, topK = 3): KnowledgeDoc[] {
    const terms = query.toLowerCase().split(/\s+/);
    const scored = this.docs.map((doc) => {
      const text = (doc.content + ' ' + doc.tags.join(' ')).toLowerCase();
      const score = terms.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
      return { doc, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => s.doc);
  }

  // Graph placeholder — object map for entity relationships
  private graph: Map<string, string[]> = new Map();

  addRelation(from: string, to: string): void {
    const existing = this.graph.get(from) ?? [];
    this.graph.set(from, [...existing, to]);
  }

  getRelated(entity: string): string[] {
    return this.graph.get(entity) ?? [];
  }
}
