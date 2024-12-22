// types/workflow.ts
import { Node, Edge } from "@xyflow/react";

export type NodeType = "task" | "condition" | "start" | "end";

export interface WorkflowNode extends Node {
  type: NodeType;
  data: {
    label: string;
  };
}

export interface WorkflowEdge extends Edge {}
