import React, { useState, useCallback, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  placeholder?: string;
  tags?: string[];
  onChange?: (tags: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export default function TagsInput({
  placeholder = "Type something and press enter...",
  tags = [],
  onChange,
  disabled = false,
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const trimmedInput = inputValue.trim();

      if ((e.key === "Enter" || e.key === ",") && trimmedInput.length > 0) {
        e.preventDefault();

        if (!tags.includes(trimmedInput)) {
          const newTags = [...tags, trimmedInput];
          onChange?.(newTags);
        }

        setInputValue("");
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        tags.length > 0
      ) {
        const newTags = tags.slice(0, -1);
        onChange?.(newTags);
      }
    },
    [inputValue, tags, onChange, disabled]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      if (disabled) return;
      const newTags = tags.filter((tag) => tag !== tagToRemove);
      onChange?.(newTags);
    },
    [tags, onChange, disabled]
  );

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border rounded-md p-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn("h-7 text-sm", !disabled && "hover:bg-secondary/80")}
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove tag</span>
            </button>
          )}
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="flex-1 !border-0 !ring-0 !ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
      />
    </div>
  );
}
