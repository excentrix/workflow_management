// nodes/end-node.tsx
import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNode } from "@/types/workflow";

function EndNode({ data }: NodeProps<WorkflowNode>) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-red-500">
      <Handle
        type="target"
        className="h-5 rounded bg-red-500"
        position={Position.Left}
      />
      <div className="flex items-center">
        {/* <div className="ml-2"> */}
        <div className="text-sm font-bold">{data.label}</div>
        {/* </div> */}
      </div>
    </div>
  );
}

export default memo(EndNode);
