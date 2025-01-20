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
  OnConnectStartParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WorkflowToolbar } from "./workflow-toolbar";
import { WorkflowNode, WorkflowEdge, NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import workflowEdge from "@/edges/workflow-edge";
import ghostEdge from "@/edges/ghost-edge";
import { NodeMenu } from "./NodeTypeMenu";
import { AnimatePresence } from "framer-motion";

interface MenuState {
  show: boolean;
  position: { x: number; y: number };
  sourceNode?: string;
  sourceHandle?: string;
}

interface ExtendedNode extends Node {
  depth?: number;
}

const edgeTypes = {
  ghost: ghostEdge,
  workflow: workflowEdge,
};

const initialWorkflow: WorkflowNode = {
  id: "start",
  type: "start" as NodeType,
  position: { x: 0, y: 0 },
  data: { label: "Start" },
  children: [
    {
      id: "task-1",
      type: "task" as NodeType,
      position: { x: 0, y: 0 },
      data: { label: "Task 1" },
      parentId: "start",
      depth: 1,
    },
  ],
};

export default function WorkflowBuilder() {
  const { fitView, screenToFlowPosition } = useReactFlow();
  const {
    nodes,
    edges,
    workflow,
    onNodesChange,
    onEdgesChange,
    addWorkflowNode,
    initialize,
    setEdges,
  } = useWorkflowStore();

  const [menuState, setMenuState] = useState<MenuState>({
    show: false,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    initialize(initialWorkflow);
  }, [initialize]);

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
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      addWorkflowNode(parentId, newNode);
    },
    [nodes, addWorkflowNode]
  );

  useEffect(() => {
    window.addEventListener("addNode", handleAddNode as EventListener);
    return () =>
      window.removeEventListener("addNode", handleAddNode as EventListener);
  }, [handleAddNode]);

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds: Edge[]) => addEdge(params, eds as WorkflowEdge[]));
    },
    [setEdges]
  );

  const toolbarProps = useMemo(
    () => ({
      workflow,
      setNodes: onNodesChange,
      setEdges: onEdgesChange,
    }),
    [workflow, onNodesChange, onEdgesChange]
  );

  const onConnectStart = useCallback(
    (_: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
      const { nodeId, handleId } = params;
      setMenuState((prev) => ({
        ...prev,
        sourceNode: nodeId || undefined,
        sourceHandle: handleId || undefined,
        show: false,
      }));
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!menuState.sourceNode) return;

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
        (n) => n.id === menuState.sourceNode
      ) as WorkflowNode;
      if (!sourceNode) return;

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: type as NodeType,
        position,
        data: { label: `New ${type}` },
        parentId: menuState.sourceNode,
        depth: (sourceNode.depth || 0) + 1,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };

      addWorkflowNode(menuState.sourceNode, newNode);
      setMenuState((prev) => ({ ...prev, show: false }));
    },
    [menuState, screenToFlowPosition, nodes, addWorkflowNode]
  );

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
  }, [menuState.show]);

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
          padding: 0.1,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        defaultViewport={{
          zoom: 1.2,
          x: 50,
          y: 50,
        }}
        nodesDraggable
        nodesConnectable
        snapToGrid
        snapGrid={[10, 10]}
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
