// components/workflow/nodes/department-node/index.tsx
import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNode } from "@/types/workflow";
import { DeptConfigSheet } from "./sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, Workflow } from "lucide-react";

export type DeptNodeData = WorkflowNode & {
  label: string;
  departmentId: string;
  task: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  comments: string;
  attachments: string;
  tags: string;
};

// Extend NodeProps with our custom data type
type DeptNodeProps = NodeProps<DeptNodeData>;

function DeptNode({ data, id }: DeptNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleUpdate = useCallback(
    (updates: Partial<DeptNodeData>) => {
      console.log("Update node:", id, updates);
    },
    [id]
  );

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div
        className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[200px]"
        onDoubleClick={() => setIsConfigOpen(true)}
      >
        <Handle type="target" position={Position.Left} />

        <div className="space-y-2">
          <div className="font-bold text-sm">{data.label}</div>

          {data.task && (
            <div className="text-xs text-gray-500 line-clamp-2">
              {data.task}
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {data.priority && (
              <Badge
                variant="secondary"
                className={getPriorityColor(data.priority)}
              >
                {data.priority}
              </Badge>
            )}

            {data.status && <Badge variant="outline">{data.status}</Badge>}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            {data.assignee && (
              <div className="flex items-center gap-1">
                <span>👤</span>
                <span>{data.assignee}</span>
              </div>
            )}

            {data.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(data.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <Handle type="source" position={Position.Right} />
      </div>

      <DeptConfigSheet
        isOpen={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        data={data}
        onUpdate={handleUpdate}
      />
    </>
  );
}

export default memo(DeptNode);
