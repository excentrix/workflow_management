// app/workflow/page.tsx
import WorkflowBuilder from "@/components/workflow-builder";

export default function WorkflowPage() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold m-4">Workflow Builder</h1>
      <WorkflowBuilder />
    </div>
  );
}
