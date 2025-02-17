// pages/index.tsx
import dynamic from 'next/dynamic';
import { useState } from 'react';
import FileExplorer, { FileNode } from '../components/FileExplorer';

// Dynamically import Monaco Editor (client-side only)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function Home() {
  const [treeData, setTreeData] = useState<FileNode[]>([
    {
      id: '1',
      title: 'src',
      isExpanded: true,
      children: [
        { id: '2', title: 'index.tsx', content: '// index.tsx content', isFolder: false },
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
    if (!node.children || node.children.length === 0) {
      setSelectedFile(node);
      setCode(node.content || '');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Consolas, monospace' }}>
      {/* Sidebar: File Explorer */}
      <div
        style={{
          width: '250px',
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
          onChange={(value) => setCode(value || '')}
          options={{ automaticLayout: true }}
        />
      </div>
    </div>
  );
}
