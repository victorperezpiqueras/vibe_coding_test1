import type { Column as ColumnType, ColumnKey, Item } from "../types";
import Column from "./Column";

interface BoardProps {
  columns: ColumnType[];
  columnsData: Record<ColumnKey, Item[]>;
  onDragStart: (e: React.DragEvent<HTMLElement>, item: Item) => void;
  onDrop: (e: React.DragEvent<HTMLElement>, columnKey: ColumnKey) => void;
  onDelete: (itemId: number) => void;
  onEdit: (item: Item) => void;
}

export default function Board({
  columns,
  columnsData,
  onDragStart,
  onDrop,
  onDelete,
  onEdit,
}: BoardProps) {
  return (
    <main className="mx-auto max-w-7xl w-full px-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => {
          const columnKey = col.key as ColumnKey;
          return (
            <Column
              key={col.key}
              columnKey={columnKey}
              title={col.title}
              items={columnsData[columnKey]}
              onDragStart={onDragStart}
              onDrop={onDrop}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          );
        })}
      </div>
    </main>
  );
}
