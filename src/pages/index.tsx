// pages/index.tsx
import dynamic from 'next/dynamic';
import { useState } from 'react';
import FileExplorer, { FileNode } from '../components/FileExplorer';

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// Helper function to update a file's content recursively in a tree
const updateFileContent = (
  nodes: FileNode[],
  fileId: string,
  newContent: string
): FileNode[] => {
  return nodes.map((node) => {
    if (node.id === fileId && (!node.children || node.children.length === 0)) {
      return { ...node, content: newContent };
    } else if (node.children) {
      return { ...node, children: updateFileContent(node.children, fileId, newContent) };
    }
    return node;
  });
};

export default function Home() {
  const [treeData, setTreeData] = useState<FileNode[]>([
    {
      id: '1',
      title: 'src',
      isExpanded: true,
      children: [
        { id: '2', title: 'index.mjs', content: '// index.tsx content', isFolder: false },
        { id: '3', title: 'App.tsx', content: '// App.tsx content', isFolder: false },
      ],
      isFolder: true,
    },
    {
      id: '4',
      title: 'package.json',
      content: '{ "name": "my-app", "version": "1.0.0" }',
      isFolder: false,
    },
  ]);
  const [code, setCode] = useState<string>('// Start typing your code...');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);

  const handleFileSelect = (node: FileNode) => {
    // Only select file nodes (nodes without children)
    if (!node.children || node.children.length === 0) {
      setSelectedFile(node);
      setCode(node.content || '');
    }
  };

  // When code changes, update both the code state and the file content in treeData.
  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    if (selectedFile) {
      const updatedTree = updateFileContent(treeData, selectedFile.id, newCode);
      setTreeData(updatedTree);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Consolas, monospace', margin: '0px' }}>
      {/* Sidebar: File Explorer */}
      <div
        style={{
          minWidth: '250px',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          borderRight: '1px solid #333',
          overflowY: 'auto',
        }}
      >
        <FileExplorer treeData={treeData} setTreeData={setTreeData} onSelect={handleFileSelect} />
      </div>

      {/* Main Area: Monaco Editor */}
      <div style={{ flexGrow: 1 }}>
        <MonacoEditor
          height="100%"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{ automaticLayout: true }}
        />
      </div>
    </div>
  );
}
