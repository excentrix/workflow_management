// components/workflow/TaskConfigSheet.tsx
import { useEffect, useState } from "react";
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
import { DepartmentData } from ".";
import TagsInput from "@/components/misc/tags-input";

interface DeptConfigSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  data: DepartmentData;
  onUpdate: (updates: DepartmentData) => void;
}

export function DeptConfigSheet({
  isOpen,
  onOpenChange,
  data,
  onUpdate,
}: DeptConfigSheetProps) {
  const [formData, setFormData] = useState<DepartmentData>({
    label: data.label || "",
    departmentId: data.departmentId || "",
    task: data.task || "",
    assignee: data.assignee || "",
    dueDate: data.dueDate || "",
    priority: data.priority || "",
    status: data.status || "",
    comments: data.comments || "",
    attachments: data.attachments || "",
    tags: data.tags || [],
  });

  // Update local state when data prop changes
  useEffect(() => {
    setFormData({
      ...data,
    });
  }, [data]);

  // Handle form submission
  const handleSubmit = () => {
    console.log(formData);
    onUpdate(formData);
    onOpenChange(false);
  };

  // Update local state and parent component
  const handleChange = (key: keyof DepartmentData, value: string) => {
    const updates = { [key]: value };
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    onUpdate({
      ...data,
      ...updates,
    });
  };

  const handleTagsChange = (newTags: string[]) => {
    const updates = { tags: newTags };
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    onUpdate({
      ...data,
      ...updates,
    });
  };

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
              value={formData.label}
              onChange={(e) => handleChange("label", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Textarea
              id="task"
              value={formData.task}
              onChange={(e) => handleChange("task", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={formData.assignee}
              onValueChange={(value) => handleChange("assignee", value)}
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
                  {formData.dueDate
                    ? format(new Date(formData.dueDate), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={
                    formData.dueDate ? new Date(formData.dueDate) : undefined
                  }
                  onSelect={(date) =>
                    handleChange("dueDate", date ? date.toISOString() : "")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
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
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
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
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagsInput
              tags={formData.tags}
              onChange={handleTagsChange}
              placeholder="Add tags..."
            />
          </div>
          <Button
            onClick={handleSubmit}
            variant="default"
            className="w-full mt-4"
          >
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
