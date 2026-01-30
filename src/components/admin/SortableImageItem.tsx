import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { X } from 'lucide-react';

interface SortableImageItemProps {
  url: string;
  onRemove: (url: string) => void;
}

export function SortableImageItem({ url, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative aspect-video group bg-gray-100 rounded overflow-hidden cursor-move touch-none">
      <Image src={url} alt="" fill className="object-cover pointer-events-none" />
      <button 
        type="button" 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(url);
        }} 
        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 z-10"
      >
        <X size={12} />
      </button>
    </div>
  );
}
