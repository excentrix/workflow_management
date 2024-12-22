// components/workflow/WorkflowToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { NodeType, WorkflowNode } from "@/types/workflow";
import { Dispatch, SetStateAction, useCallback } from "react";
import { Edge, Node, useReactFlow, ReactFlowInstance } from "@xyflow/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

interface WorkflowToolbarProps {
  setNodes: Dispatch<SetStateAction<WorkflowNode[]>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
}

const nodeConfigs: Record<NodeType, { label: string; color: string }> = {
  task: { label: "Task", color: "border-blue-500" },
  condition: { label: "Condition", color: "border-yellow-500" },
  start: { label: "Start", color: "border-green-500" },
  end: { label: "End", color: "border-red-500" },
};

export function WorkflowToolbar({ setNodes, setEdges }: WorkflowToolbarProps) {
  const reactFlowInstance = useReactFlow();

  const addNode = (type: NodeType) => {
    const viewport = reactFlowInstance.getViewport();
    const position = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    setNodes((nodes) => {
      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { label: `New ${nodeConfigs[type].label}` },
      };
      return [...nodes, newNode];
    });
  };

  const onSave = useCallback(() => {
    const flow = reactFlowInstance.toObject();
    localStorage.setItem("workflow", JSON.stringify(flow));
  }, [reactFlowInstance]);

  const onLoad = useCallback(() => {
    const flow = localStorage.getItem("workflow");
    if (flow) {
      const flowObject = JSON.parse(flow);
      setNodes(flowObject.nodes || []);
      setEdges(flowObject.edges || []);
    }
  }, [setNodes, setEdges]);

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
          {Object.entries(nodeConfigs).map(([type, config]) => (
            <DropdownMenuItem
              key={type}
              onClick={() => addNode(type as NodeType)}
              className="flex items-center gap-2"
            >
              <div className={`w-2 h-2 rounded-full bg-${config.color}`} />
              {config.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={onLoad}>
          Load
        </Button>
      </div>
    </div>
  );
}
