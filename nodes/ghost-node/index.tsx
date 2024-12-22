// nodes/ghost-node.tsx
import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowNode } from "@/types/workflow";

export interface GhostNodeData extends WorkflowNode {
  parentId?: string;
  depth: number;
}

function GhostNode({ id, parentId }: NodeProps<GhostNodeData>) {
  return (
    <div className="flex items-center justify-center w-20 h-10 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full h-full rounded-xl hover:bg-gray-100"
        onClick={() => {
          const event = new CustomEvent("addNode", {
            detail: { parentId: parentId, ghostId: id },
          });
          window.dispatchEvent(event);
        }}
      >
        <Plus className="w-4 h-4 text-gray-500" />
      </Button>
    </div>
  );
}

export default memo(GhostNode);
