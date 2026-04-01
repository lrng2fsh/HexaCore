import { create } from 'zustand';
import { Workflow, AgentInfo, Message, api } from '../api/client';

interface HexacoreState {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  agents: AgentInfo[];
  selectedAgent: AgentInfo | null;
  messages: Message[];
  loading: boolean;
  error: string | null;

  submitTask: (title: string, description: string) => Promise<void>;
  loadAgents: () => Promise<void>;
  loadMessages: (task_id?: string) => Promise<void>;
  selectAgent: (agent: AgentInfo | null) => void;
  selectWorkflow: (workflow: Workflow | null) => void;
  clearError: () => void;
}

export const useStore = create<HexacoreState>((set, get) => ({
  workflows: [],
  activeWorkflow: null,
  agents: [],
  selectedAgent: null,
  messages: [],
  loading: false,
  error: null,

  submitTask: async (title, description) => {
    set({ loading: true, error: null });
    try {
      const workflow = await api.submitTask(title, description);
      set((s) => ({
        workflows: [workflow, ...s.workflows],
        activeWorkflow: workflow,
        loading: false,
      }));
      // Load messages for this workflow
      await get().loadMessages(workflow.id);
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  loadAgents: async () => {
    try {
      const agents = await api.getAgents();
      set({ agents });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  loadMessages: async (task_id) => {
    try {
      const messages = await api.getMessages(task_id);
      set({ messages });
    } catch (err) {
      set({ error: String(err) });
    }
  },

  selectAgent: (agent) => set({ selectedAgent: agent }),
  selectWorkflow: (workflow) => set({ activeWorkflow: workflow }),
  clearError: () => set({ error: null }),
}));
