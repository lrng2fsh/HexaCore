# Hexacore — AI Engineering OS

A hive-based AI engineering operating system where specialized agents collaborate under a central Queen orchestrator.

## Quick Start

```bash
# Install all dependencies
cd hexacore
npm run install:all

# Terminal 1 — Backend (port 3001)
npm run backend

# Terminal 2 — Frontend (port 3000)
npm run frontend
```

Open http://localhost:3000

## Architecture

```
Queen Orchestrator
  ├── intakes task
  ├── builds DAG
  ├── assigns to agents
  └── produces summary

Agents (config-driven, pluggable LLMs)
  ├── AppAgent    — code analysis
  ├── DBAAgent    — schema inspection
  ├── QAAgent     — testing & validation
  └── BuildAgent  — compile, test, package

WorkflowEngine    — DAG execution
MessageBus        — structured pub/sub
ToolRegistry      — file, sql, build adapters
KnowledgeBase     — doc search (vector-ready)
```

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /task | Submit task → Queen builds + executes workflow |
| GET | /workflow/:id | Get workflow state |
| GET | /workflows | List all workflows |
| GET | /agents | List agents |
| GET | /messages | Message log |

## Extension Points

- **LLM**: Set `provider: "openai"` in agent config + `OPENAI_API_KEY` env var
- **Tools**: Implement `ToolAdapter` interface and register in `QueenOrchestrator`
- **Agents**: Add JSON config + class in `AGENT_CLASSES` map
- **Knowledge**: Replace `KnowledgeBase.search()` with real vector DB
- **Persistence**: Replace JSON files with SQLite/Postgres in `WorkflowEngine`
- **Parallelism**: `WorkflowEngine.execute()` has a marked extension point for parallel node execution
