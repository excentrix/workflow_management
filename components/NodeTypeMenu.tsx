// components/workflow/NodeMenu.tsx
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NodeMenuItem {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const nodeItems: NodeMenuItem[] = [
  {
    id: "task",
    label: "Task",
    icon: "📋",
    description: "A basic task node",
  },
  {
    id: "condition",
    label: "Condition",
    icon: "⚡",
    description: "A conditional branch",
  },
  {
    id: "loop",
    label: "Loop",
    icon: "🔄",
    description: "A loop operation",
  },
  {
    id: "api",
    label: "API Call",
    icon: "🌐",
    description: "External API request",
  },
  {
    id: "transform",
    label: "Transform",
    icon: "🔄",
    description: "Data transformation",
  },
  {
    id: "end",
    label: "End",
    icon: "🏁",
    description: "Workflow endpoint",
  },
];

interface NodeMenuProps {
  position: { x: number; y: number };
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function NodeMenu({ position, onSelect, onClose }: NodeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust position to keep menu in viewport
  const adjustedPosition = useMenuPosition(position, menuRef);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use setTimeout to avoid immediate trigger on menu open
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[1000] bg-white rounded-lg shadow-xl border border-gray-200 w-[240px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2 space-y-1">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-500">
          Add Node
        </div>
        {nodeItems.map((item) => (
          <motion.button
            key={item.id}
            className="w-full flex items-start space-x-2 px-2 py-2 text-left hover:bg-gray-50 rounded-md transition-colors group"
            onClick={() => onSelect(item.id)}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.1 }}
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-50 group-hover:bg-white">
              {item.icon}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {item.label}
              </div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function useMenuPosition(
  position: { x: number; y: number },
  ref: React.RefObject<HTMLDivElement | null>
) {
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const updatePosition = () => {
      if (!ref.current) return;

      const menuRect = ref.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // Adjust horizontal position
      if (x + menuRect.width > viewportWidth) {
        x = viewportWidth - menuRect.width - 10; // 10px padding from edge
      }
      if (x < 0) {
        x = 10; // 10px padding from edge
      }

      // Adjust vertical position
      if (y + menuRect.height > viewportHeight) {
        y = viewportHeight - menuRect.height - 10; // 10px padding from edge
      }
      if (y < 0) {
        y = 10; // 10px padding from edge
      }

      setAdjustedPosition({ x, y });
    };

    updatePosition();

    // Update position on window resize
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [position, ref]);

  return adjustedPosition;
}
