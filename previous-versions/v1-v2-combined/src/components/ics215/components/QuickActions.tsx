/**
 * Quick Actions Component
 * Provides easy access to common worksheet actions
 */

import React, { useState } from 'react';
import {
  PrinterIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  onPrint?: () => void;
  onValidate?: () => void;
  onSave?: () => void;
  onExport?: (format: 'pdf' | 'excel' | 'json') => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  hasValidationErrors?: boolean;
  className?: string;
}

export function QuickActions({
  onPrint,
  onValidate,
  onSave,
  onExport,
  onDuplicate,
  onShare,
  onArchive,
  hasValidationErrors = false,
  className = ''
}: QuickActionsProps) {
  const [showMore, setShowMore] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Export format options
  const exportFormats = [
    { 
      value: 'pdf' as const, 
      label: 'PDF Document', 
      description: 'Print-ready PDF format',
      icon: '📄'
    },
    { 
      value: 'excel' as const, 
      label: 'Excel Workbook', 
      description: 'Editable spreadsheet format',
      icon: '📊'
    },
    { 
      value: 'json' as const, 
      label: 'JSON Data', 
      description: 'Raw data for integration',
      icon: '💾'
    }
  ];

  // Keyboard shortcuts reference
  const keyboardShortcuts = [
    { key: 'Ctrl+S', action: 'Save worksheet' },
    { key: 'Ctrl+P', action: 'Print worksheet' },
    { key: 'Ctrl+Shift+C', action: 'Validate worksheet' },
    { key: 'Ctrl+D', action: 'Duplicate worksheet' },
    { key: 'Alt+1-6', action: 'Switch between sections' },
    { key: 'ESC', action: 'Close dialogs' },
    { key: 'Tab', action: 'Navigate form fields' },
    { key: 'Ctrl+Z', action: 'Undo last change' }
  ];

  return (
    <div className={`relative flex items-center space-x-2 ${className}`}>
      {/* Primary Actions */}
      
      {/* Save Button */}
      {onSave && (
        <button
          onClick={onSave}
          className="flex items-center space-x-1 px-3 py-1.5 bg-red-cross-red text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
          title="Save worksheet (Ctrl+S)"
        >
          <CloudArrowDownIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </button>
      )}

      {/* Validation Button */}
      {onValidate && (
        <button
          onClick={onValidate}
          className={`flex items-center space-x-1 px-3 py-1.5 border rounded text-sm font-medium transition-colors ${
            hasValidationErrors 
              ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
              : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
          }`}
          title="Validate worksheet (Ctrl+Shift+C)"
        >
          {hasValidationErrors ? (
            <ExclamationTriangleIcon className="w-4 h-4" />
          ) : (
            <CheckCircleIcon className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {hasValidationErrors ? 'Fix Issues' : 'Validate'}
          </span>
        </button>
      )}

      {/* Print Button */}
      {onPrint && (
        <button
          onClick={onPrint}
          className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
          title="Print worksheet (Ctrl+P)"
        >
          <PrinterIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </button>
      )}

      {/* Export Button with Dropdown */}
      {onExport && (
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
            title="Export worksheet"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Export Dropdown */}
          {showExportMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1 mb-1">
                    Export Formats
                  </div>
                  {exportFormats.map(format => (
                    <button
                      key={format.value}
                      onClick={() => {
                        onExport(format.value);
                        setShowExportMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-left"
                    >
                      <span className="text-lg">{format.icon}</span>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* More Actions Button */}
      <div className="relative">
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center space-x-1 px-2 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
          title="More actions"
        >
          <EllipsisHorizontalIcon className="w-4 h-4" />
        </button>

        {/* More Actions Dropdown */}
        {showMore && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMore(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2">
                {/* Duplicate */}
                {onDuplicate && (
                  <button
                    onClick={() => {
                      onDuplicate();
                      setShowMore(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-left"
                    title="Duplicate worksheet (Ctrl+D)"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                )}

                {/* Share */}
                {onShare && (
                  <button
                    onClick={() => {
                      onShare();
                      setShowMore(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-left"
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                )}

                {/* Archive */}
                {onArchive && (
                  <button
                    onClick={() => {
                      onArchive();
                      setShowMore(false);
                    }}
                    className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-left"
                  >
                    <ArchiveBoxIcon className="w-4 h-4" />
                    <span>Archive</span>
                  </button>
                )}

                {/* Divider */}
                <div className="my-1 border-t border-gray-200" />

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => {
                    setShowKeyboardShortcuts(true);
                    setShowMore(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors text-left"
                >
                  <CommandLineIcon className="w-4 h-4" />
                  <span>Keyboard Shortcuts</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowKeyboardShortcuts(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {keyboardShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{shortcut.action}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}