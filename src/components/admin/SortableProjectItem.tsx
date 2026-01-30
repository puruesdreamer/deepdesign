import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '@/lib/data';
import Image from 'next/image';
import { GripVertical, Edit, Trash2 } from 'lucide-react';

interface SortableProjectItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function SortableProjectItem({ project, onEdit, onDelete }: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded shadow-sm flex items-center justify-between touch-none">
      <div className="flex items-center gap-4 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded">
            <GripVertical className="text-gray-400" size={20} />
        </div>
        <div className="relative w-16 h-12 bg-gray-100 rounded overflow-hidden shrink-0">
          {project.images[0] && <Image src={project.images[0]} alt="" fill className="object-cover" />}
        </div>
        <div>
          <h3 className="font-bold text-lg">{project.title}</h3>
          <p className="text-sm text-gray-500">{project.category} · {project.year}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onEdit(project)} className="p-2 hover:bg-gray-100 rounded text-blue-600"><Edit size={18} /></button>
        <button onClick={() => onDelete(project)} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
