// components/workflow/edges/workflow-edge.tsx
import { memo } from "react";
import { getSmoothStepPath, EdgeProps } from "@xyflow/react";

function WorkflowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      className="react-flow__edge-path"
      d={edgePath}
      strokeWidth={2}
      stroke="#64748b"
    />
  );
}

export default memo(WorkflowEdge);
