// lib/workflow-layout.ts
import { Position, XYPosition } from "@xyflow/react";
import { WorkflowNode, WorkflowEdge, LayoutDirection } from "@/types/workflow";

interface LayoutOptions {
  direction: LayoutDirection;
  // spacing?: {
  //   vertical: number;
  //   horizontal: number;
  // };
  // nodeWidth?: number;
  // nodeHeight?: number;
  // showGhostNodes?: boolean;
}

// export const DEFAULT_SPACING = {
//   vertical: 50,
//   horizontal: 250,
// };

// export const DEFAULT_NODE_DIMENSIONS = {
//   width: 150,
//   height: 100,
// };

export function generateWorkflowLayout(
  rootNode: WorkflowNode,
  options: LayoutOptions = {
    direction: "horizontal",
    // spacing: DEFAULT_SPACING,
    // nodeWidth: DEFAULT_NODE_DIMENSIONS.width,
    // nodeHeight: DEFAULT_NODE_DIMENSIONS.height,
  }
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } {
  // const { spacing = DEFAULT_SPACING, showGhostNodes = false } = options;

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
    // if (showGhostNodes && node.type !== "end") {
    //   const ghostId = `ghost-${node.id}`;
    //   nodes.push({
    //     id: ghostId,
    //     type: "ghost",
    //     position: {
    //       x,
    //       y,
    //     },
    //     data: { label: "+" },
    //     parentId: node.id,
    //     sourcePosition: Position.Right,
    //     targetPosition: Position.Left,
    //   });

    //   edges.push({
    //     id: `${node.id}-${ghostId}`,
    //     source: node.id,
    //     target: ghostId,
    //     type: "ghost",
    //     animated: true,
    //   });
    // }

    // Process children
    if (node.children) {
      node.children.forEach((child, index) => {
        edges.push({
          id: `${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: "workflow",
        });

        // Changed this line to maintain consistent horizontal spacing
        processNode(child, x, y);
      });
    }
  }

  // Start processing from root
  processNode(rootNode);

  return { nodes, edges };
}

const NODE_SPACING_X = 200; // Horizontal spacing between nodes
const NODE_SPACING_Y = 100; // Vertical spacing between nodes

export function addNodeToWorkflow(
  workflow: WorkflowNode,
  parentId: string,
  newNode: WorkflowNode
): WorkflowNode {
  // Helper function to calculate new node position
  const calculateNodePosition = (parentNode: WorkflowNode): XYPosition => {
    const siblingCount = parentNode.children?.length || 0;

    return {
      x: parentNode.position.x + NODE_SPACING_X,
      y: parentNode.position.y + siblingCount * NODE_SPACING_Y,
    };
  };

  // Helper function to recursively add node
  const addNode = (node: WorkflowNode): WorkflowNode => {
    if (node.id === parentId) {
      const newPosition = calculateNodePosition(node);
      const updatedChildren = [
        ...(node.children || []),
        {
          ...newNode,
          position: newPosition,
          parentId: node.id,
        },
      ];

      return {
        ...node,
        children: updatedChildren,
      };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map(addNode),
      };
    }

    return node;
  };

  return addNode(workflow);
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
