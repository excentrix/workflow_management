// lib/workflow-layout.ts
import { Position } from "@xyflow/react";
import { WorkflowNode, WorkflowEdge, LayoutDirection } from "@/types/workflow";

interface LayoutOptions {
  direction: LayoutDirection;
  spacing?: {
    vertical: number;
    horizontal: number;
  };
  nodeWidth?: number;
  nodeHeight?: number;
  showGhostNodes?: boolean;
}

export const DEFAULT_SPACING = {
  vertical: 50,
  horizontal: 200,
};

export const DEFAULT_NODE_DIMENSIONS = {
  width: 150,
  height: 100,
};

export function generateWorkflowLayout(
  rootNode: WorkflowNode,
  options: LayoutOptions = {
    direction: "horizontal",
    spacing: DEFAULT_SPACING,
    nodeWidth: DEFAULT_NODE_DIMENSIONS.width,
    nodeHeight: DEFAULT_NODE_DIMENSIONS.height,
  }
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  const { spacing = DEFAULT_SPACING, showGhostNodes = true } = options;

  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  function processNode(node: WorkflowNode, x: number = 0, y: number = 0): void {
    // Add the actual node with the given position
    nodes.push({
      ...node,
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Add ghost node if enabled
    if (showGhostNodes && node.type !== "end") {
      const ghostId = `ghost-${node.id}`;
      nodes.push({
        id: ghostId,
        type: "ghost",
        position: {
          x: x + spacing.horizontal * 0.7,
          y,
        },
        data: { label: "+" },
        parentId: node.id,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      edges.push({
        id: `${node.id}-${ghostId}`,
        source: node.id,
        target: ghostId,
        type: "ghost",
        animated: true,
      });
    }

    // Process children
    if (node.children) {
      node.children.forEach((child, index) => {
        edges.push({
          id: `${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: "workflow",
        });

        processNode(
          child,
          x + spacing.horizontal,
          y + index * spacing.vertical
        );
      });
    }
  }

  // Start processing from root
  processNode(rootNode);

  return { nodes, edges };
}

export function addNodeToWorkflow(
  workflow: WorkflowNode,
  parentId: string,
  newNode: WorkflowNode,
  position?: "before" | "after" | number
): WorkflowNode {
  if (workflow.id === parentId) {
    const children = [...(workflow.children || [])];

    if (typeof position === "number") {
      children.splice(position, 0, newNode);
    } else if (position === "before") {
      children.unshift(newNode);
    } else {
      children.push(newNode);
    }

    return {
      ...workflow,
      children,
    };
  }

  if (workflow.children) {
    return {
      ...workflow,
      children: workflow.children.map((child) =>
        addNodeToWorkflow(child, parentId, newNode, position)
      ),
    };
  }

  return workflow;
}

// Utility function to find a node in the workflow
export function findNodeInWorkflow(
  workflow: WorkflowNode,
  nodeId: string
): WorkflowNode | null {
  if (workflow.id === nodeId) {
    return workflow;
  }

  if (workflow.children) {
    for (const child of workflow.children) {
      const found = findNodeInWorkflow(child, nodeId);
      if (found) return found;
    }
  }

  return null;
}

// Utility function to remove a node from the workflow
export function removeNodeFromWorkflow(
  workflow: WorkflowNode,
  nodeId: string
): WorkflowNode {
  if (workflow.children) {
    return {
      ...workflow,
      children: workflow.children
        .filter((child) => child.id !== nodeId)
        .map((child) => removeNodeFromWorkflow(child, nodeId)),
    };
  }
  return workflow;
}
