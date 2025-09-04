/**
 * Photo Upload and Crop Component
 * Handles image upload with interactive cropping functionality
 */

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { PhotoIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PhotoUploadCropProps {
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  aspectRatio?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function PhotoUploadCrop({
  imageUrl,
  onImageChange,
  aspectRatio = 16/9,
  maxWidth = 1920,
  maxHeight = 1080
}: PhotoUploadCropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize crop when image loads
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };
  
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setTempImageUrl(dataUrl);
      setIsCropping(true);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  }, []);
  
  const performCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }
    
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    // Resize if needed
    if (crop.width > maxWidth || crop.height > maxHeight) {
      const scale = Math.min(maxWidth / crop.width, maxHeight / crop.height);
      const finalWidth = Math.floor(crop.width * scale);
      const finalHeight = Math.floor(crop.height * scale);
      
      const resizeCanvas = document.createElement('canvas');
      resizeCanvas.width = finalWidth;
      resizeCanvas.height = finalHeight;
      const resizeCtx = resizeCanvas.getContext('2d');
      
      if (resizeCtx) {
        resizeCtx.imageSmoothingQuality = 'high';
        resizeCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
        
        resizeCanvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                onImageChange(result);
                setIsCropping(false);
                setTempImageUrl(null);
              };
              reader.readAsDataURL(blob);
            }
          },
          'image/jpeg',
          0.9
        );
      }
    } else {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              onImageChange(result);
              setIsCropping(false);
              setTempImageUrl(null);
            };
            reader.readAsDataURL(blob);
          }
        },
        'image/jpeg',
        0.9
      );
    }
  }, [completedCrop, maxWidth, maxHeight, onImageChange]);
  
  const cancelCrop = useCallback(() => {
    setIsCropping(false);
    setTempImageUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);
  
  const handleRemoveImage = useCallback(() => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageChange]);
  
  // Cropping interface
  if (isCropping && tempImageUrl) {
    return (
      <div className="photo-upload-crop">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Crop Your Image</h3>
          <p className="text-sm text-gray-600">Drag the corners to adjust the crop area</p>
        </div>
        
        <div className="border rounded-lg overflow-hidden bg-gray-100" style={{ maxHeight: '500px' }}>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            minWidth={100}
            minHeight={100}
          >
            <img
              ref={imgRef}
              src={tempImageUrl}
              alt="Crop preview"
              style={{ maxWidth: '100%', maxHeight: '500px' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={performCrop}
            className="px-4 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            Apply Crop
          </button>
          <button
            onClick={cancelCrop}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            Cancel
          </button>
        </div>
        
        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    );
  }
  
  // Main upload/display interface
  return (
    <div className="photo-upload-crop">
      {imageUrl ? (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={imageUrl} 
              alt="Uploaded" 
              className="w-full h-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white">Processing image...</div>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Replace Photo
            </button>
            <button
              onClick={handleRemoveImage}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
            >
              <TrashIcon className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-lg border-2 border-dashed p-8
            ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}
            transition-colors duration-200
          `}
        >
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-cross-red rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Choose Photo
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              or drag and drop an image here
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
            <p className="mt-2 text-xs text-gray-500">
              You'll be able to crop the image after uploading
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}