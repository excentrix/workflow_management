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
  ConnectionState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WorkflowToolbar } from "./workflow-toolbar";
import { WorkflowNode, WorkflowEdge, NodeType } from "@/types/workflow";
import { useWorkflowStore } from "@/stores/workflow-store";
import workflowEdge from "@/edges/workflow-edge";
import ghostEdge from "@/edges/ghost-edge";
import { NodeMenu } from "./NodeTypeMenu";
import { AnimatePresence } from "framer-motion";
import { nodeTypes } from "@/nodes";

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

const initialWorkflow: WorkflowNode[] = [
  {
    id: "start-node",
    type: "start",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
    sourcePosition: Position.Right,
  },
  {
    id: "department-node",
    type: "department",
    position: { x: 300, y: 100 },
    data: {
      label: "Department",
      task: "Initial task",
      departments: [],
      assignee: "",
      dueDate: "",
      priority: "medium",
      status: "todo",
      comments: "",
      attachments: "",
      tags: [],
    },
    parentId: "start-node",
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    depth: 1,
  },
  {
    id: "end-node",
    type: "end",
    position: { x: 500, y: 100 },
    data: { label: "End" },
    parentId: "department-node",
    targetPosition: Position.Left,
    depth: 2,
  },
];

const initialEdges: WorkflowEdge[] = [
  {
    id: "start-to-department",
    source: "start-node",
    target: "department-node",
    type: "workflow",
  },
  {
    id: "department-to-end",
    source: "department-node",
    target: "end-node",
    type: "workflow",
  },
];

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
    initialize(initialWorkflow, initialEdges);
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
      setEdges((eds: WorkflowEdge[]) => {
        const newEdges = addEdge({ ...params, type: "workflow" }, eds);
        return newEdges as WorkflowEdge[];
      });
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
    (
      event: MouseEvent | TouchEvent,
      connectionState: ConnectionState
    ) => {
      if (!menuState.sourceNode) return;
      if (connectionState.isValid) return;

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

      // Ensure position values are numbers and not NaN
      const validPosition = {
        x: Number.isFinite(position.x) ? position.x : 0,
        y: Number.isFinite(position.y) ? position.y : 0,
      };

      const sourceNode = nodes.find(
        (n) => n.id === menuState.sourceNode
      ) as WorkflowNode;
      if (!sourceNode) return;

      const newNode: WorkflowNode = {
        id: crypto.randomUUID(),
        type: type as NodeType,
        position: validPosition,
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
        // colorMode="dark"
      >
        <Background gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Panel position="top-right">
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
