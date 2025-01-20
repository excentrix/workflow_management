// components/workflow/nodes/department-node/index.tsx
import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { WorkflowNode } from "@/types/workflow";
import { DeptConfigSheet } from "./sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, Workflow } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
export interface DepartmentData extends Record<string, unknown> {
  label: string;
  departmentId: string;
  task: string;
  assignee: string;
  dueDate: string;
  priority: string;
  status: string;
  comments: string;
  attachments: string;
  tags: string[];
}

// Department specific node
export interface DepartmentNode extends WorkflowNode {
  type: "department";
  data: DepartmentData;
}

// Props type for the department node component
export type DepartmentNodeProps = NodeProps<DepartmentNode>;

function DeptNode({ data, id }: DepartmentNodeProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const setNodes = useWorkflowStore((state) => state.setNodes);

  const handleUpdate = useCallback(
    (updates: Partial<DepartmentData>) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updates,
              },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "todo":
        return "bg-blue-100 text-blue-800";
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
        <Handle
          type="target"
          className="h-5 rounded bg-blue-500"
          position={Position.Left}
        />

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
                className={getPriorityColor(data.priority as string)}
              >
                {data.priority}
              </Badge>
            )}

            {data.status && (
              <Badge
                variant="default"
                className={getStatusColor(data.status as string)}
              >
                {data.status}
              </Badge>
            )}
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
                <span>
                  {new Date(data.dueDate as string).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <Handle
          type="source"
          className="h-5 rounded bg-blue-500"
          position={Position.Right}
        />
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
