// types/workflow.ts
import { Node, Edge, NodeProps } from "@xyflow/react";

export type NodeType =
  | "task"
  | "condition"
  | "start"
  | "end"
  | "ghost"
  | "department";
export type LayoutDirection = "horizontal" | "vertical" | "radial";

// Base workflow node type
export interface WorkflowNode extends Node {
  type: NodeType;
  id: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  parentId?: string;
  depth?: number;
  children?: WorkflowNode[];
}


export interface WorkflowEdge extends Edge {
  type: "workflow" | "ghost";
}
