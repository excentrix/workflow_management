// nodes/start-node.tsx
import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNode } from "@/types/workflow";

function StartNode({ data }: NodeProps<WorkflowNode>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500">
      <div className="flex items-center">
        <div className="ml-2">
          <div className="text-sm font-bold">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(StartNode);
