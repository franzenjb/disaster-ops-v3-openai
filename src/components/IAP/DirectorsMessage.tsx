'use client';

import React, { useState } from 'react';
import { SimpleRichTextEditor } from './SimpleRichTextEditor';

interface DirectorsMessageProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function DirectorsMessage({ initialContent = '', onContentChange }: DirectorsMessageProps) {
  const [content, setContent] = useState(initialContent);

  const handleChange = (value: string) => {
    setContent(value);
    if (onContentChange) {
      onContentChange(value);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Director's Message</h2>
      
      <div className="mb-4">
        <SimpleRichTextEditor
          initialContent={content}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Tips for Director's Message:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Keep the message concise and action-oriented</li>
          <li>• Highlight key priorities for the operational period</li>
          <li>• Include recognition for exceptional work when appropriate</li>
          <li>• Address any major changes or concerns</li>
          <li>• Use formatting to emphasize important points</li>
        </ul>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            const printContent = `
              <html>
                <head>
                  <title>Director's Message</title>
                  <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h2 { color: #333; }
                    ul { margin: 10px 0; }
                    li { margin: 5px 0; }
                  </style>
                </head>
                <body>
                  ${content}
                </body>
              </html>
            `;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.print();
            }
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Print Preview
        </button>
        <button
          onClick={() => {
            localStorage.setItem('directorsMessage', content);
            alert('Message saved!');
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Message
        </button>
      </div>
    </div>
  );
}