// types/workflow.ts
import { Node, Edge } from "@xyflow/react";

export type NodeType = "task" | "condition" | "start" | "end" | "ghost";
export type LayoutDirection = "horizontal" | "vertical" | "radial";

export interface WorkflowNode extends Node {
  type: NodeType;
  id: string;
  position: { x: number; y: number };
  data: {
    label?: string;
  };
  parentId?: string;
  depth?: number;
  children?: WorkflowNode[];
}

export interface WorkflowEdge extends Edge {
  type: "workflow" | "ghost";
}
