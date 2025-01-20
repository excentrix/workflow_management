import { NodeTypes } from "@xyflow/react";
import taskNode from "./task-node";
import startNode from "./start-node";
import endNode from "./end-node";
import ghostNode from "./ghost-node";
import departmentNode from "./department-node";

export const nodeTypes: NodeTypes = {
  // testing
  // task: taskNode,
  start: startNode,
  end: endNode,
  ghost: ghostNode,

  // workflow
  department: departmentNode,
};
