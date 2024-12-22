"use client";

import TaskNode from "@/nodes/task-node";
import {
  ReactFlow,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
} from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";

const initialNodes = [
  {
    id: "1", // required
    position: { x: 100, y: 100 }, // required
    data: { label: "Hello" }, // required
    type: "task",
  },
  {
    id: "2",
    position: { x: 200, y: 400 },
    data: { label: "World" },
  },
];

const initialEdges = [
  { id: "1-2", source: "1", target: "2", animated: true, type: "smoothstep" },
];

export default function Home() {
  const nodeTypes = useMemo(() => ({ task: TaskNode }), []);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className="flex h-screen w-full" style={{ height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
