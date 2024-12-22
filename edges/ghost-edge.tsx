// components/workflow/edges/ghost-edge.tsx
import { memo } from "react";
import { getSmoothStepPath, EdgeProps } from "@xyflow/react";

function GhostEdge({
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
      stroke="#d1d5db"
      strokeDasharray="5,5"
    />
  );
}

export default memo(GhostEdge);
