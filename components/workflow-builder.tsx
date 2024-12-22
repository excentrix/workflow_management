// components/workflow/WorkflowBuilder.tsx
"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TaskNode from "@/nodes/task-node";
import StartNode from "@/nodes/start-node";
import EndNode from "@/nodes/end-node";
import { WorkflowToolbar } from "./workflow-toolbar";
import { generateWorkflowLayout } from "@/lib/workflow-layout";
import { WorkflowEdge, WorkflowNode } from "@/types/workflow";

const nodeTypes: NodeTypes = {
  task: TaskNode,
  start: StartNode,
  end: EndNode,
};

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

  useEffect(() => {
    const { nodes: layoutNodes, edges: layoutEdges } = generateWorkflowLayout() as { nodes: WorkflowNode[], edges: WorkflowEdge[] };
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <div className="h-[800px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left">
          <WorkflowToolbar setNodes={setNodes} setEdges={setEdges} />
        </Panel>
      </ReactFlow>
    </div>
  );
}
