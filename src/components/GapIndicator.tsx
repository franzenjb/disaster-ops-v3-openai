'use client';

import React from 'react';

interface GapIndicatorProps {
  gap: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Colored circular gap indicator component
 * - Red: Negative gap (shortage/need more)
 * - Blue: Zero gap (exactly right)
 * - Green: Positive gap (surplus/have extra)
 */
export function GapIndicator({ gap, size = 'md', showLabel = true, className = '' }: GapIndicatorProps) {
  // Determine color based on gap value
  const getColorClasses = () => {
    if (gap < 0) {
      return 'bg-red-500 text-white border-red-600';
    } else if (gap === 0) {
      return 'bg-blue-500 text-white border-blue-600';
    } else {
      return 'bg-green-500 text-white border-green-600';
    }
  };

  // Determine size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'lg':
        return 'w-10 h-10 text-base';
      default: // md
        return 'w-8 h-8 text-sm';
    }
  };

  // Get semantic label
  const getLabel = () => {
    if (gap < 0) {
      return `Need ${Math.abs(gap)} more`;
    } else if (gap === 0) {
      return 'Fully staffed';
    } else {
      return `${gap} surplus`;
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (gap < 0) {
      return '⚠️'; // Warning for shortage
    } else if (gap === 0) {
      return '✓'; // Check for complete
    } else {
      return '↗'; // Arrow up for surplus
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Circular indicator */}
      <div 
        className={`
          ${getSizeClasses()} 
          ${getColorClasses()}
          rounded-full 
          border-2 
          flex 
          items-center 
          justify-center 
          font-bold 
          shadow-sm
          transition-all
          hover:scale-105
        `}
        title={showLabel ? getLabel() : `Gap: ${gap}`}
      >
        <span className="leading-none">
          {Math.abs(gap)}
        </span>
      </div>

      {/* Optional label */}
      {showLabel && (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <span>{getStatusIcon()}</span>
            <span className="text-gray-700">{getLabel()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Gap indicator for inline display (no label, smaller)
 */
export function InlineGapIndicator({ gap, className = '' }: { gap: number; className?: string }) {
  return (
    <GapIndicator 
      gap={gap} 
      size="sm" 
      showLabel={false} 
      className={className} 
    />
  );
}

/**
 * Gap summary component for displaying multiple gaps
 */
interface GapSummaryProps {
  gaps: Array<{
    label: string;
    gap: number;
    required?: number;
    have?: number;
  }>;
  title?: string;
  className?: string;
}

export function GapSummary({ gaps, title = "Gap Analysis", className = '' }: GapSummaryProps) {
  const totalGap = gaps.reduce((sum, item) => sum + item.gap, 0);
  const criticalGaps = gaps.filter(g => g.gap < 0);
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <GapIndicator gap={totalGap} size="md" showLabel={false} />
      </div>
      
      <div className="space-y-3">
        {gaps.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <GapIndicator gap={item.gap} size="sm" showLabel={false} />
              </div>
              {item.required !== undefined && item.have !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  Have {item.have} of {item.required} required
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {criticalGaps.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-red-600 font-medium">
            ⚠️ {criticalGaps.length} critical shortage{criticalGaps.length === 1 ? '' : 's'}
          </div>
        </div>
      )}
    </div>
  );
}