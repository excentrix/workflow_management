// lib/workflow-layout.ts
import * as d3 from "d3";
import { Node, Edge } from "@xyflow/react";

interface HierarchyNode {
  id: string;
  type: string;
  children?: HierarchyNode[];
}

const VERTICAL_SPACING = 100;
const HORIZONTAL_SPACING = 200;

// Sample workflow structure
const initialHierarchy: HierarchyNode = {
  id: "start",
  type: "start",
  children: [
    {
      id: "task-1",
      type: "task",
      children: [
        {
          id: "task-2",
          type: "task",
          children: [
            {
              id: "end",
              type: "end",
            },
          ],
        },
      ],
    },
  ],
};

export function generateWorkflowLayout() {
  const hierarchy = d3.hierarchy(initialHierarchy);

  // Create a tree layout
  const treeLayout = d3
    .tree<HierarchyNode>()
    .nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]);

  const tree = treeLayout(hierarchy);

  // Convert d3 hierarchy to ReactFlow nodes
  const nodes: Node[] = tree.descendants().map((d) => ({
    id: d.data.id,
    type: d.data.type,
    position: { x: d.y, y: d.x }, // Swap x/y for horizontal layout
    data: {
      label: `${d.data.type.charAt(0).toUpperCase() + d.data.type.slice(1)}`,
    },
  }));

  // Create edges between nodes
  const edges: Edge[] = tree.links().map((link) => ({
    id: `${link.source.data.id}-${link.target.data.id}`,
    source: link.source.data.id,
    target: link.target.data.id,
    type: "smoothstep",
  }));

  return { nodes, edges };
}

export function addNodeToHierarchy(
  hierarchy: HierarchyNode,
  parentId: string,
  newNode: HierarchyNode
): HierarchyNode {
  if (hierarchy.id === parentId) {
    hierarchy.children = hierarchy.children || [];
    hierarchy.children.push(newNode);
    return hierarchy;
  }

  if (hierarchy.children) {
    hierarchy.children = hierarchy.children.map((child) =>
      addNodeToHierarchy(child, parentId, newNode)
    );
  }

  return hierarchy;
}
