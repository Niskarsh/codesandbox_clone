'use client';
// components/DraggableTreeNode.tsx
import React, { FC, useRef } from 'react';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { Icon } from '@fluentui/react/lib/Icon';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import { FileNode } from './FileExplorer';

export type DropPosition = 'above' | 'below';

interface DraggableTreeNodeProps {
  node: FileNode;
  index: number;
  depth: number;
  siblings: FileNode[];
  onDrop: (dragId: string, targetId: string, position: DropPosition) => void;
  onToggle: (node: FileNode) => void;
  onSelect: (node: FileNode) => void;
}

const DraggableTreeNode: FC<DraggableTreeNodeProps> = ({
  node,
  index,
  depth,
  siblings,
  onDrop,
  onToggle,
  onSelect,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag
  const [{ isDragging }, drag] = useDrag({
    type: 'FILE_NODE',
    item: { id: node.id },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop
  const [, drop] = useDrop({
    accept: 'FILE_NODE',
    hover: (dragged: { id: string }, monitor) => {
      if (!ref.current) return;
      if (dragged.id === node.id) return; // Do nothing if hovering on itself

      const hoverRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverRect.top;
      const position: DropPosition = hoverClientY < hoverMiddleY ? 'above' : 'below';
      onDrop(dragged.id, node.id, position);
    },
  });

  drag(drop(ref));

  // Determine if node is a folder
  const isFolder = node.isFolder;

  let extension = '';
  if (!isFolder) {
    const parts = String(node.title).split('.');
    extension = parts.length > 1 ? parts[parts.length - 1] : '';
  }

  // Only call getFileTypeIconProps on the client
  const fileIconProps =
    !isFolder && typeof window !== 'undefined'
      ? getFileTypeIconProps({ extension, size: 16 })
      : {};

  return (
    <div
      ref={ref}
      style={{
        marginLeft: depth * 20,
        marginTop: '3px',
        padding: '2px',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isFolder ? (
          <span
            onClick={() => onToggle(node)}
            style={{ cursor: 'pointer', width: 20, display: 'inline-block' }}
          >
            {node.isExpanded ? '−' : '+'}
          </span>
        ) : (
          <span style={{ width: 20, display: 'inline-block' }} />
        )}
        <span
          onClick={() => onSelect(node)}
          style={{
            cursor: 'pointer',
            color: '#d4d4d4',
            fontFamily: 'Consolas, monospace',
          }}
        >
          {isFolder ? '📁' : <Icon {...fileIconProps} />} {node.title}
        </span>
      </div>
      {isFolder && node.isExpanded && node.children!.map((child, i) => (
        <DraggableTreeNode
          key={child.id}
          node={child}
          index={i}
          depth={depth + 1}
          siblings={node.children!}
          onDrop={onDrop}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default DraggableTreeNode;
