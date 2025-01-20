// components/workflow/WorkflowBuilder.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import { WorkflowToolbar } from "./workflow-toolbar";
import { WorkflowNode, NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import workflowEdge from "@/edges/workflow-edge";
import ghostEdge from "@/edges/ghost-edge";
import { NodeMenu } from "./NodeTypeMenu";
import { AnimatePresence } from "framer-motion";
import { nodeTypes } from "@/nodes";

interface ExtendedNode extends Node {
  depth?: number;
}

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

  const [menuState, setMenuState] = useState<{
    show: boolean;
    position: { x: number; y: number };
    sourceNode?: string;
    sourceHandle?: string;
  }>({
    show: false,
    position: { x: 0, y: 0 },
  });

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
      const parentNode = nodes.find((n: WorkflowNode) => n.id === parentId);

      if (!parentNode) return;

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: "task" as NodeType,
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

  const { screenToFlowPosition } = useReactFlow();

  const onConnectStart = useCallback(
    (event: MouseEvent | TouchEvent, { nodeId, handleId }: any) => {
      setMenuState((prev) => ({
        ...prev,
        sourceNode: nodeId,
        sourceHandle: handleId,
        show: false,
      }));
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!menuState.sourceNode) return;

      // Prevent default to stop edge creation
      event.preventDefault();

      const clientX =
        event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY =
        event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

      setMenuState((prev) => ({
        ...prev,
        show: true,
        position: {
          x: clientX,
          y: clientY,
        },
      }));
    },
    [menuState.sourceNode]
  );

  const onSelectNodeType = useCallback(
    (type: string) => {
      if (!menuState.sourceNode) return;

      const position = screenToFlowPosition({
        x: menuState.position.x,
        y: menuState.position.y,
      });

      const sourceNode = nodes.find(
        (n: WorkflowNode) => n.id === menuState.sourceNode
      );
      if (!sourceNode) return;

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: type as NodeType,
        position,
        data: { label: `New ${type}` },
        parentId: menuState.sourceNode,
        depth: (sourceNode.depth || 0) + 1,
        sourcePosition:
          layout === "horizontal" ? Position.Right : Position.Bottom,
        targetPosition: layout === "horizontal" ? Position.Left : Position.Top,
      };

      addWorkflowNode(menuState.sourceNode, newNode);
      setMenuState((prev) => ({ ...prev, show: false }));
    },
    [menuState, screenToFlowPosition, nodes, layout, addWorkflowNode]
  );
  // Add click outside handler
  const handleCloseMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuState.show) {
        setMenuState((prev) => ({ ...prev, show: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuState.show, handleCloseMenu]);

  return (
    <div className="flex h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
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
        <AnimatePresence>
          {menuState.show && (
            <NodeMenu
              position={menuState.position}
              onSelect={onSelectNodeType}
              onClose={handleCloseMenu}
            />
          )}
        </AnimatePresence>
      </ReactFlow>
    </div>
  );
}
