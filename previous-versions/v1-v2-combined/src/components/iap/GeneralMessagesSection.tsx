import React, { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

interface Message {
  id: string;
  title: string;
  content: string;
}

interface GeneralMessagesSectionProps {
  isEditing: boolean;
}

export function GeneralMessagesSection({ isEditing }: GeneralMessagesSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      title: 'Welcome',
      content: `<p>Welcome to DRO 220-25. The <strong>DR 220-25 Orientation (FLOCOM)</strong> has been <a href="#" style="color: #2563eb; text-decoration: underline;">uploaded to YouTube</a>, try this link if haven't attended our Orientation in person.</p>`
    },
    {
      id: 'health-safety',
      title: 'Health & Safety',
      content: `<p>If you are experiencing any symptoms—such as cold symptoms, allergies, or any other illness—<strong>DO NOT REPORT TO WORK</strong>. Instead, please call Staff Health at 571-635-6509 and notify your supervisor.</p>`
    },
    {
      id: 'base-camp',
      title: 'Base Camp',
      content: `<p>Tampa HQ base camp is at Tampa Airport located 4232 North Westshore Blvd, Tampa, FL, 33614</p>`
    },
    {
      id: 'arc-app',
      title: 'ARC Emergency App',
      content: `<p>Download the ARC Emergency App. Make sure to check that your "Live Locations" reflects where you currently are located.</p>`
    },
    {
      id: 'signing-authority',
      title: 'Signing Authority',
      content: `<h4>SIGNING AUTHORITY for 6409s and Purchase Requests</h4>
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background: #e5e7eb;">
      <th style="border: 1px solid black; padding: 8px; text-align: left;">Command</th>
      <th style="border: 1px solid black; padding: 8px; text-align: left;">Name</th>
      <th style="border: 1px solid black; padding: 8px; text-align: left;">Authorization Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid black; padding: 8px;">DRO Director</td>
      <td style="border: 1px solid black; padding: 8px;">Virginia Mewborn</td>
      <td style="border: 1px solid black; padding: 8px;">SDP</td>
    </tr>
    <tr>
      <td style="border: 1px solid black; padding: 8px;">Deputy DRO Director</td>
      <td style="border: 1px solid black; padding: 8px;">Jennie Sahagun</td>
      <td style="border: 1px solid black; padding: 8px;">$100,000</td>
    </tr>
  </tbody>
</table>`
    },
    {
      id: 'weather',
      title: 'Weather Forecast',
      content: `<p>Check the <a href="#" style="color: #2563eb; text-decoration: underline;">Weather Prediction Center</a> for the latest forecasts and conditions affecting our operation area.</p>`
    }
  ]);

  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState<string>('');

  const handleEdit = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(messageId);
      setTempContent(message.content);
    }
  };

  const handleSave = (messageId: string) => {
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, content: tempContent } : m
    ));
    setEditingMessage(null);
    setTempContent('');
  };

  const handleCancel = () => {
    setEditingMessage(null);
    setTempContent('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">General Messages</h2>
      
      {/* Messages Menu Grid */}
      <div className="text-center bg-red-600 text-white p-4 rounded mb-6">
        <h3 className="text-xl font-bold mb-2">General Messages Menu</h3>
        <p>Click on any message title to view or edit</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {messages.map(message => (
          <button
            key={message.id}
            className="p-3 bg-yellow-200 border border-black font-bold hover:bg-yellow-300 transition-colors"
            onClick={() => isEditing && handleEdit(message.id)}
          >
            {message.title}
          </button>
        ))}
      </div>

      {/* Message Content Display/Edit */}
      {messages.map(message => (
        <div key={message.id} className="border border-gray-300 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-blue-600">{message.title}</h3>
          
          {editingMessage === message.id ? (
            <div className="space-y-4">
              <RichTextEditor
                value={tempContent}
                onChange={setTempContent}
                placeholder={`Enter content for ${message.title}...`}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleSave(message.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div 
                className="prose max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
              {isEditing && (
                <button
                  onClick={() => handleEdit(message.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit this message
                </button>
              )}
            </>
          )}
          
          <div className="text-right mt-4">
            <button className="text-red-600 font-bold hover:underline text-sm">
              Return to Main Menu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}