'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SimpleRichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function SimpleRichTextEditor({ initialContent = '', onChange }: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      if (onChange) {
        onChange(newContent);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-gray-200 rounded font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-gray-200 rounded italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-gray-200 rounded underline"
            title="Underline"
          >
            U
          </button>
          <button
            onClick={() => execCommand('strikeThrough')}
            className="p-2 hover:bg-gray-200 rounded line-through"
            title="Strikethrough"
          >
            S
          </button>
        </div>

        <div className="flex gap-1 border-r pr-2">
          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
        </div>

        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={() => execCommand('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Left"
          >
            ⬅
          </button>
          <button
            onClick={() => execCommand('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Center"
          >
            ⬌
          </button>
          <button
            onClick={() => execCommand('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Right"
          >
            ➡
          </button>
        </div>

        <div className="flex gap-1 border-r pr-2">
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Bullet List"
          >
            • ─
          </button>
          <button
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Numbered List"
          >
            1. ─
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={insertLink}
            className="p-2 hover:bg-gray-200 rounded text-blue-600"
            title="Insert Link"
          >
            🔗
          </button>
          <button
            onClick={insertImage}
            className="p-2 hover:bg-gray-200 rounded"
            title="Insert Image"
          >
            🖼️
          </button>
          <button
            onClick={() => execCommand('removeFormat')}
            className="p-2 hover:bg-gray-200 rounded text-red-600"
            title="Clear Formatting"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[400px] focus:outline-none"
        onInput={handleContentChange}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialContent || `
          <h2>Director's Intent</h2>
          <p>Our primary focus for this operational period is to:</p>
          <ul>
            <li>Ensure the safety and well-being of all affected residents</li>
            <li>Maintain efficient shelter operations across all sites</li>
            <li>Coordinate with local authorities for resource distribution</li>
            <li>Prepare for potential escalation of operations</li>
          </ul>
          <p><strong>Remember:</strong> We are here to serve with compassion and efficiency. Every action we take impacts those who need us most.</p>
        ` }}
      />
    </div>
  );
}