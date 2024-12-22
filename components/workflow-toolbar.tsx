// components/workflow/workflow-toolbar.tsx
"use client";

import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  WorkflowNode,
  WorkflowEdge,
  LayoutDirection,
  NodeType,
} from "@/types/workflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoveHorizontal, MoveVertical, Circle } from "lucide-react";
import { EdgeChange, NodeChange } from "@xyflow/react";

export interface WorkflowToolbarProps {
  layout: LayoutDirection;
  setLayout: (direction: LayoutDirection) => void;
  workflow: WorkflowNode | null;
  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  toggleGhostNodes: () => void;
  showGhostNodes: boolean;
}
const nodeConfigs: Record<NodeType, { label: string; color: string }> = {
  task: { label: "Task", color: "border-blue-500" },
  condition: { label: "Condition", color: "border-yellow-500" },
  start: { label: "Start", color: "border-green-500" },
  end: { label: "End", color: "border-red-500" },
  ghost: { label: "Ghost", color: "border-gray-300" },
};

const layoutConfigs: Record<
  LayoutDirection,
  { label: string; icon: React.ReactNode }
> = {
  horizontal: {
    label: "Horizontal",
    icon: <MoveHorizontal className="h-4 w-4" />,
  },
  vertical: {
    label: "Vertical",
    icon: <MoveVertical className="h-4 w-4" />,
  },
  radial: {
    label: "Radial",
    icon: <Circle className="h-4 w-4" />,
  },
};

export function WorkflowToolbar({
  layout,
  setLayout,
  workflow,
  setNodes,
  setEdges,
  toggleGhostNodes,
  showGhostNodes,
}: WorkflowToolbarProps) {
  return (
    <div className="flex gap-2 bg-background/60 backdrop-blur-sm p-2 rounded-md shadow-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Node
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Add Node</DropdownMenuLabel>
          {Object.entries(nodeConfigs)
            .filter(([type]) => type !== "ghost") // Exclude ghost nodes from menu
            .map(([type, config]) => (
              <DropdownMenuItem key={type} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                {config.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {layoutConfigs[layout].icon}
            Layout
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Layout Direction</DropdownMenuLabel>
          {Object.entries(layoutConfigs).map(([key, config]) => (
            <DropdownMenuItem
              key={key}
              className="flex items-center gap-2"
              onSelect={() => setLayout(key as LayoutDirection)}
            >
              {config.icon}
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const flow = {
              nodes: [],
              edges: [],
            };
            localStorage.setItem("workflow", JSON.stringify(flow));
          }}
        >
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const flow = localStorage.getItem("workflow");
            if (flow) {
              const { nodes, edges } = JSON.parse(flow);
              setNodes(nodes || []);
              setEdges(edges || []);
            }
          }}
        >
          Load
        </Button>

        <div className="workflow-controls">
          <Button
            onClick={toggleGhostNodes}
            className="toggle-ghost-nodes"
          >
            {showGhostNodes ? "Hide Ghost Nodes" : "Show Ghost Nodes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
