// components/workflow/TaskConfigSheet.tsx
import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DeptNodeData } from ".";

interface DeptConfigSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: DeptNodeData;
  onUpdate: (data: Partial<DeptNodeData>) => void;
}

export function DeptConfigSheet({
  isOpen,
  onOpenChange,
  data,
  onUpdate,
}: DeptConfigSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Task Node</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Task Name</Label>
            <Input
              id="label"
              value={data.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Textarea
              id="task"
              value={data.task}
              onChange={(e) => onUpdate({ task: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={data.assignee}
              onValueChange={(value) => onUpdate({ assignee: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
                <SelectItem value="bob">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.dueDate
                    ? format(new Date(data.dueDate), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data.dueDate ? new Date(data.dueDate) : undefined}
                  onSelect={(date) =>
                    onUpdate({ dueDate: date?.toISOString() })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={data.priority}
              onValueChange={(value) => onUpdate({ priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={data.status}
              onValueChange={(value) => onUpdate({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={data.comments}
              onChange={(e) => onUpdate({ comments: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={data.tags}
              onChange={(e) => onUpdate({ tags: e.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
