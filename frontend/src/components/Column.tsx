import type { Item, ColumnKey } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  columnKey: ColumnKey;
  title: string;
  items: Item[];
  onDragStart: (e: React.DragEvent<HTMLElement>, item: Item) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, columnKey: ColumnKey) => void;
  onDelete: (itemId: number) => void;
  onEdit: (item: Item) => void;
}

export default function Column({
  columnKey,
  title,
  items,
  onDragStart,
  onDrop,
  onDelete,
  onEdit,
}: ColumnProps) {
  const allowDrop = (e: React.DragEvent<HTMLElement>) => e.preventDefault();

  return (
    <div
      data-testid={`column-${columnKey}`}
      className="rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <span className="text-xs text-slate-500">{items.length}</span>
      </div>
      <div
        className="p-3 space-y-3 min-h-40 max-h-[60vh] overflow-y-auto scrollbar-thin"
        onDragOver={allowDrop}
        onDrop={(e) => onDrop(e, columnKey)}
      >
        {items.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">
            Drag tasks here
          </div>
        ) : (
          items.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              onDelete={onDelete}
              onEdit={onEdit}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
