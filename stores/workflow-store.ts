import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  Node,
  NodePositionChange,
  EdgeSelectionChange,
  EdgeRemoveChange,
} from "@xyflow/react";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

interface WorkflowState {
  workflow: WorkflowNode | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  initialize: (initialWorkflow: WorkflowNode) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addWorkflowNode: (parentId: string, newNode: WorkflowNode) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      workflow: null,
      nodes: [],
      edges: [],

      initialize: (initialWorkflow) => {
        set({
          workflow: initialWorkflow,
          nodes: [initialWorkflow],
          edges: [],
        });
      },

      setNodes: (nodes) => {
        set({ nodes });
      },

      setEdges: (edges) => {
        set({ edges });
      },

      onNodesChange: (changes: NodeChange[]) => {
        const nodes = get().nodes;
        // Update nodes with position changes
        const updatedNodes = nodes.map((node) => {
          const positionChange = changes.find(
            (c): c is NodePositionChange =>
              c.type === "position" && "id" in c && c.id === node.id
          );

          if (positionChange && positionChange.position) {
            return {
              ...node,
              position: {
                x: positionChange.position.x,
                y: positionChange.position.y,
              },
            };
          }
          return node;
        });

        set({ nodes: updatedNodes });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        const edges = get().edges;
        const updatedEdges = edges.filter((edge) => {
          // Handle edge removal
          const removeChange = changes.find(
            (c): c is EdgeRemoveChange =>
              c.type === "remove" && "id" in c && c.id === edge.id
          );
          if (removeChange) return false;

          // Handle edge selection
          const selectionChange = changes.find(
            (c): c is EdgeSelectionChange =>
              c.type === "select" && "id" in c && c.id === edge.id
          );
          if (selectionChange) {
            edge.selected = selectionChange.selected;
          }

          return true;
        });

        set({ edges: updatedEdges });
      },

      addWorkflowNode: (parentId, newNode) => {
        const workflow = get().workflow;
        if (!workflow) return;

        // Ensure newNode has a valid position
        const newNodeWithPosition: WorkflowNode = {
          ...newNode,
          position: newNode.position || { x: 0, y: 0 },
        };

        // Add node to workflow
        const updatedNodes = [...get().nodes, newNodeWithPosition];
        const newEdge: WorkflowEdge = {
          id: `${parentId}-${newNode.id}`,
          source: parentId,
          target: newNode.id,
          type: "workflow",
        };
        const updatedEdges = [...get().edges, newEdge];

        set({
          nodes: updatedNodes,
          edges: updatedEdges,
        });
      },
    }),
    { name: "workflow-store" }
  )
);
