// stores/workflow-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { WorkflowNode, WorkflowEdge, LayoutDirection } from "@/types/workflow";
import {
  generateWorkflowLayout,
  addNodeToWorkflow,
  DEFAULT_SPACING,
  DEFAULT_NODE_DIMENSIONS,
} from "@/lib/workflow-layout";

interface WorkflowState {
  workflow: WorkflowNode | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  layout: LayoutDirection;
  initialize: (initialWorkflow: WorkflowNode) => void;
  setLayout: (direction: LayoutDirection) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addWorkflowNode: (parentId: string, newNode: WorkflowNode) => void;
  updateLayout: () => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  showGhostNodes: boolean;
  toggleGhostNodes: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      workflow: null,
      nodes: [],
      edges: [],
      layout: "horizontal",
      showGhostNodes: false,

      initialize: (initialWorkflow) => {
        set({ workflow: initialWorkflow });
        const { nodes, edges } = generateWorkflowLayout(initialWorkflow, {
          direction: get().layout,
          spacing: DEFAULT_SPACING,
        });
        set({ nodes, edges });
      },

      setLayout: (direction) => {
        set({ layout: direction });
      },

      setEdges: (edges: Edge[]) => {
        set({ edges });
      },

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      addWorkflowNode: (parentId, newNode) => {
        const workflow = get().workflow;
        if (!workflow) return;

        const updatedWorkflow = addNodeToWorkflow(workflow, parentId, newNode);
        set({ workflow: updatedWorkflow });

        const { nodes, edges } = generateWorkflowLayout(updatedWorkflow, {
          direction: get().layout,
          spacing: DEFAULT_SPACING,
        });
        set({ nodes, edges });
      },

      toggleGhostNodes: () => {
        console.log("toggleGhostNodes");
        set((state) => ({ showGhostNodes: !state.showGhostNodes }));
      },

      updateLayout: () => {
        const workflow = get().workflow;
        if (!workflow) return;

        const { nodes, edges } = generateWorkflowLayout(workflow, {
          direction: get().layout,
          spacing: DEFAULT_SPACING,
          nodeWidth: DEFAULT_NODE_DIMENSIONS.width,
          nodeHeight: DEFAULT_NODE_DIMENSIONS.height,
          showGhostNodes: get().showGhostNodes,
        });

        set({ nodes, edges });
      },
    }),
    { name: "workflow-store" }
  )
);
