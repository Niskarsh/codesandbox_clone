// components/FileExplorer.tsx
import React, { FC } from 'react';
import DraggableTreeNode, { DropPosition } from './DraggableTreeNode';

export interface FileNode {
  id: string;
  title: string;
  content?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  isFolder: boolean;
}

interface FileExplorerProps {
  treeData: FileNode[];
  setTreeData: (data: FileNode[]) => void;
  onSelect: (node: FileNode) => void;
}

const FileExplorer: FC<FileExplorerProps> = ({ treeData, setTreeData, onSelect }) => {
  // Remove node with given id from tree; returns new tree and the removed node.
  const removeNode = (nodes: FileNode[], id: string): { newNodes: FileNode[]; removed: FileNode | null } => {
    let removed: FileNode | null = null;
    const newNodes = nodes.reduce<FileNode[]>((acc, node) => {
      if (node.id === id) {
        removed = node;
        return acc;
      }
      if (node.children) {
        const result = removeNode(node.children, id);
        node.children = result.newNodes;
        if (!removed) removed = result.removed;
      }
      acc.push(node);
      return acc;
    }, []);
    return { newNodes, removed };
  };

  // Insert node relative to targetId at a given position ('above' or 'below')
  const insertNode = (
    nodes: FileNode[],
    targetId: string,
    nodeToInsert: FileNode,
    position: DropPosition
  ): FileNode[] => {
    const newNodes: FileNode[] = [];
    for (let node of nodes) {
      if (node.id === targetId) {
        if (position === 'above') {
          newNodes.push(nodeToInsert);
          newNodes.push(node);
        } else {
          newNodes.push(node);
          newNodes.push(nodeToInsert);
        }
      } else if (node.children) {
        node = { ...node, children: insertNode(node.children, targetId, nodeToInsert, position) };
        newNodes.push(node);
      } else {
        newNodes.push(node);
      }
    }
    return newNodes;
  };

  // Handler called when a draggable node is dropped
  const handleDrop = (dragId: string, targetId: string, position: DropPosition) => {
    // Remove dragged node from the tree.
    const { newNodes: treeWithoutDragged, removed } = removeNode(treeData, dragId);
    if (!removed) return;
    // Insert the dragged node relative to the target.
    const newTree = insertNode(treeWithoutDragged, targetId, removed, position);
    setTreeData(newTree);
  };

  // Toggle a node's expanded state.
  const toggleNode = (target: FileNode) => {
    const updateNodes = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.id === target.id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) };
        }
        return node;
      });
    setTreeData(updateNodes(treeData));
  };

  return (
    <div style={{ padding: '8px' }}>
      {treeData.map((node, index) => (
        <DraggableTreeNode
          key={node.id}
          node={node}
          index={index}
          depth={0}
          siblings={treeData}
          onDrop={handleDrop}
          onToggle={toggleNode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default FileExplorer;
