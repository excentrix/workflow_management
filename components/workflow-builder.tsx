// components/workflow/WorkflowBuilder.tsx
"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Connection,
  Edge,
  NodeTypes,
  addEdge,
  Position,
  useReactFlow,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TaskNode from "@/nodes/task-node";
import StartNode from "@/nodes/start-node";
import EndNode from "@/nodes/end-node";
import { WorkflowToolbar } from "./workflow-toolbar";
import { WorkflowNode, WorkflowEdge, LayoutDirection } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import workflowEdge from "@/edges/workflow-edge";
import ghostEdge from "@/edges/ghost-edge";
import ghostNode from "@/nodes/ghost-node";

interface ExtendedNode extends Node {
  depth?: number;
}

const nodeTypes: NodeTypes = {
  task: TaskNode,
  start: StartNode,
  end: EndNode,
  ghost: ghostNode,
};

const edgeTypes = {
  ghost: ghostEdge,
  workflow: workflowEdge,
};

const initialWorkflow: WorkflowNode = {
  id: "start",
  type: "start",
  position: { x: 0, y: 0 },
  data: { label: "Start" },
  children: [
    {
      id: "task-1",
      type: "task",
      position: { x: 0, y: 0 },
      data: { label: "Task 1" },
      parentId: "start",
      depth: 1,
    },
  ],
};

export default function WorkflowBuilder() {
  const { fitView } = useReactFlow();
  const {
    nodes,
    edges,
    layout,
    workflow,
    setLayout,
    onNodesChange,
    onEdgesChange,
    addWorkflowNode,
    updateLayout,
    initialize,
    setEdges,
    showGhostNodes,
    toggleGhostNodes,
  } = useWorkflowStore();

  // Initialize workflow on mount
  useEffect(() => {
    initialize(initialWorkflow);
  }, [initialize]);

  // Update layout when direction changes
  useEffect(() => {
    updateLayout();
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [layout, updateLayout, fitView, showGhostNodes]);

  const handleAddNode = useCallback(
    (event: CustomEvent<{ parentId: string; ghostId: string }>) => {
      const { parentId } = event.detail;
      const parentNode = nodes.find((n) => n.id === parentId) as ExtendedNode;

      if (!parentNode) return;

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: "task",
        position: { x: 0, y: 0 },
        data: { label: "New Task" },
        parentId: parentId,
        depth: (parentNode.depth || 0) + 1,
        sourcePosition:
          layout === "horizontal" ? Position.Right : Position.Bottom,
        targetPosition: layout === "horizontal" ? Position.Left : Position.Top,
      };

      addWorkflowNode(parentId, newNode);
    },
    [nodes, layout, addWorkflowNode]
  );

  useEffect(() => {
    window.addEventListener("addNode", handleAddNode as EventListener);
    return () =>
      window.removeEventListener("addNode", handleAddNode as EventListener);
  }, [handleAddNode]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds: Edge[]) => addEdge(params, eds));
    },
    [setEdges]
  );

  const toolbarProps = useMemo(
    () => ({
      layout,
      setLayout,
      workflow,
      setNodes: onNodesChange,
      setEdges: onEdgesChange,
      showGhostNodes,
      toggleGhostNodes,
    }),
    [layout, setLayout, workflow, onNodesChange, onEdgesChange]
  );

  return (
    <div className="flex h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode={["Control", "Meta"]}
        selectionOnDrag
        selectNodesOnDrag={false}
        elevateNodesOnSelect
        fitViewOptions={{
          padding: 0.1, // Reduced padding
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        defaultViewport={{
          zoom: 1.2, // Adjust initial zoom
          x: 50, // Adjust initial position
          y: 50,
        }}
        // Add minimum node distance
        nodesDraggable={true}
        snapToGrid={true}
        snapGrid={[10, 10]}
        // Add node spacing constraint
        nodeExtent={[
          [-2000, -2000],
          [2000, 2000],
        ]}
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Panel position="top-left">
          <WorkflowToolbar {...toolbarProps} />
        </Panel>
      </ReactFlow>
    </div>
  );
}
