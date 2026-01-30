import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Edit, Trash2, GripVertical } from 'lucide-react';

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

interface SortableTeamItemProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function SortableTeamItem({ member, onEdit, onDelete }: SortableTeamItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white p-4 rounded shadow-sm flex items-center gap-4 touch-none h-full">
       <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:bg-gray-100 p-1 rounded self-center">
          <GripVertical size={20} />
       </div>
      <div className="relative w-16 h-16 bg-gray-100 rounded-full overflow-hidden shrink-0">
        {member.image && <Image src={member.image} alt="" fill className="object-cover" />}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{member.name}</h3>
        <p className="text-sm text-gray-500">{member.role}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(member)} className="p-2 hover:bg-gray-100 rounded text-blue-600"><Edit size={18} /></button>
        <button onClick={() => onDelete(member)} className="p-2 hover:bg-gray-100 rounded text-red-600"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}
