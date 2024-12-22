// hooks/useWorkflowLayout.ts
import { useState, useCallback, useEffect } from "react";
import { useNodesState, useEdgesState } from "@xyflow/react";
import {
  generateWorkflowLayout,
  DEFAULT_SPACING,
  DEFAULT_NODE_DIMENSIONS,
  addNodeToWorkflow,
  removeNodeFromWorkflow,
} from "@/lib/workflow-layout";
import { WorkflowNode, LayoutDirection, WorkflowEdge } from "@/types/workflow";

interface UseWorkflowLayoutOptions {
  direction?: LayoutDirection;
  spacing?: typeof DEFAULT_SPACING;
  nodeDimensions?: typeof DEFAULT_NODE_DIMENSIONS;
}

export function useWorkflowLayout(
  initialWorkflow: WorkflowNode,
  options: UseWorkflowLayoutOptions = {}
) {
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  const updateLayout = useCallback(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = generateWorkflowLayout(
      workflow,
      {
        direction: options.direction || "horizontal",
        spacing: options.spacing,
        nodeWidth: options.nodeDimensions?.width,
        nodeHeight: options.nodeDimensions?.height,
      }
    );

    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [workflow, options, setNodes, setEdges]);

  const addNode = useCallback(
    (
      parentId: string,
      newNode: WorkflowNode,
      position?: "before" | "after" | number
    ) => {
      setWorkflow((current) =>
        addNodeToWorkflow(current, parentId, newNode, position)
      );
    },
    []
  );

  const removeNode = useCallback((nodeId: string) => {
    setWorkflow((current) => removeNodeFromWorkflow(current, nodeId));
  }, []);

  useEffect(() => {
    updateLayout();
  }, [workflow, updateLayout]);

  return {
    workflow,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    removeNode,
    updateLayout,
  };
}
