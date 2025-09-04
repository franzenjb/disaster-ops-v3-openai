/**
 * Rich Text Editor Component
 * Provides formatted text editing capabilities with toolbar
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  LinkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListBulletIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '200px'
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);
  
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      addToHistory(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };
  
  const addToHistory = (newContent: string) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newContent];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
        onChange(history[newIndex]);
      }
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
        onChange(history[newIndex]);
      }
    }
  };
  
  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      
      // Debounce history updates
      clearTimeout((window as any).historyTimeout);
      (window as any).historyTimeout = setTimeout(() => {
        addToHistory(newContent);
      }, 500);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
    
    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      execCommand('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };
  
  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setIsLinkDialogOpen(false);
      setLinkUrl('');
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  };
  
  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
          title="Bold (Cmd+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 italic"
          title="Italic (Cmd+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 underline"
          title="Underline (Cmd+U)"
        >
          U
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Numbered List"
        >
          <Bars3Icon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={() => setIsLinkDialogOpen(true)}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Cmd+Z)"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Cmd+Shift+Z)"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="p-4 focus:outline-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96">
            <h3 className="text-lg font-semibold mb-2">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink();
                }
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkUrl('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        
        .rich-text-editor [contenteditable]:focus {
          outline: none;
        }
        
        .rich-text-editor [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .rich-text-editor [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .rich-text-editor [contenteditable] h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        
        .rich-text-editor [contenteditable] h4 {
          font-size: 1em;
          font-weight: bold;
          margin: 1.33em 0;
        }
        
        .rich-text-editor [contenteditable] ul,
        .rich-text-editor [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .rich-text-editor [contenteditable] a {
          color: #dc2626;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}