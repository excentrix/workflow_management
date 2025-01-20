import { useState, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
  NodePositionChange,
} from "@xyflow/react";
import {
  addNodeToWorkflow,
  removeNodeFromWorkflow,
} from "@/lib/workflow-layout";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export function useWorkflowLayout(initialWorkflow: WorkflowNode) {
  const [workflow, setWorkflow] = useState<WorkflowNode>(initialWorkflow);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  // Add node
  const addNode = useCallback(
    (
      parentId: string,
      newNode: WorkflowNode,
      position?: "before" | "after" | number
    ) => {
      setWorkflow((current) => {
        const updatedWorkflow = addNodeToWorkflow(current, parentId, newNode);
        return updatedWorkflow;
      });
    },
    []
  );

  // Remove node with cleanup
  const removeNode = useCallback(
    (nodeId: string) => {
      setWorkflow((current) => {
        const updatedWorkflow = removeNodeFromWorkflow(current, nodeId);
        return updatedWorkflow;
      });

      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setEdges]
  );

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Type assertion for onNodesChange
      onNodesChange(changes as NodeChange<WorkflowNode>[]);

      // Update workflow with new positions
      const positionChanges = changes.filter(
        (change): change is NodePositionChange => change.type === "position"
      );

      if (positionChanges.length > 0) {
        setWorkflow((current) => {
          const updatePositions = (node: WorkflowNode): WorkflowNode => {
            const change = positionChanges.find((c) => c.id === node.id);
            return {
              ...node,
              // Ensure position is always defined
              position: change?.position ?? node.position ?? { x: 0, y: 0 },
              children: node.children
                ? node.children.map(updatePositions)
                : undefined,
            };
          };
          return updatePositions(current);
        });
      }
    },
    [onNodesChange]
  );

  return {
    workflow,
    nodes,
    edges,
    onNodesChange: handleNodesChange,
    onEdgesChange,
    addNode,
    removeNode,
    setNodes,
    setEdges,
  };
}
