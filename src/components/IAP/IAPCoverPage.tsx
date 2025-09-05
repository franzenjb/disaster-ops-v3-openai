'use client';

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface IAPCoverPageProps {
  drNumber?: string;
  operationName?: string;
  operationalPeriod?: {
    number: number;
    start: string;
    end: string;
  };
  preparedBy?: {
    name: string;
    title: string;
  };
  approvedBy?: {
    name: string;
    title: string;
  };
  onPhotoUpdate?: (photo: string, caption: string) => void;
}

export function IAPCoverPage({ 
  drNumber = "220-25",
  operationName = "FLOCOM", 
  operationalPeriod = {
    number: 27,
    start: "20/10/2024 18:00",
    end: "21/10/2024 17:59"
  },
  preparedBy = {
    name: "Gary Pelletier",
    title: "Information & Planning"
  },
  approvedBy = {
    name: "Virginia Mewborn", 
    title: "DRO Director"
  },
  onPhotoUpdate
}: IAPCoverPageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checklist] = useState({
    directorsIntent: true,
    incidentPriorities: true,
    statusOfPrevious: true,
    contactRoster: true,
    incidentOpenAction: true,
    incidentOrgChart: true,
    workAssignment: true,
    workSites: true,
    dailySchedule: true,
    generalMessage: true
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop]);

  const handleCropComplete = async () => {
    const croppedUrl = await getCroppedImg();
    if (croppedUrl) {
      setCroppedImageUrl(croppedUrl);
      setShowCropper(false);
      if (onPhotoUpdate) {
        onPhotoUpdate(croppedUrl, caption);
      }
    }
  };

  const handleRemoveImage = () => {
    setCroppedImageUrl(null);
    setSelectedImage(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-8" style={{ minHeight: '11in' }}>
      {/* Header Table */}
      <table className="w-full border-2 border-black mb-4">
        <tbody>
          <tr>
          <td className="border-2 border-black p-2">
            <div className="text-sm">Incident Name:</div>
            <div className="font-bold">{operationName}</div>
          </td>
          <td className="border-2 border-black p-2">
            <div className="text-sm">DR Number</div>
            <div className="font-bold">{drNumber}</div>
          </td>
          <td className="border-2 border-black p-2">
            <div className="text-sm">Operational Period</div>
            <div className="font-bold">{operationalPeriod.start} to {operationalPeriod.end}</div>
          </td>
          </tr>
        </tbody>
      </table>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Incident Action Plan [#{operationalPeriod.number}]</h1>
      </div>

      {/* Photo Upload Section */}
      <div className="border-2 border-gray-300 mb-6 bg-gray-50" style={{ minHeight: '300px' }}>
        {!croppedImageUrl && !showCropper && (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="text-gray-500 mb-4">Operation Photo</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer inline-block"
              >
                Upload Photo
              </label>
            </div>
          </div>
        )}

        {/* Image Cropper */}
        {showCropper && selectedImage && (
          <div className="p-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9}
            >
              <img
                ref={imgRef}
                src={selectedImage}
                alt="Upload"
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </ReactCrop>
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={handleCropComplete}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Apply Crop
              </button>
              <button
                onClick={() => {
                  setShowCropper(false);
                  setSelectedImage(null);
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Display Cropped Image with Caption */}
        {croppedImageUrl && (
          <div>
            <img
              src={croppedImageUrl}
              alt="Operation"
              className="w-full object-cover"
              style={{ maxHeight: '350px' }}
            />
            <div className="p-2 bg-white border-t">
              <input
                type="text"
                placeholder="Add caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onBlur={() => {
                  if (onPhotoUpdate) {
                    onPhotoUpdate(croppedImageUrl, caption);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onPhotoUpdate) {
                    onPhotoUpdate(croppedImageUrl, caption);
                  }
                }}
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={handleRemoveImage}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <div className="mb-6">
        <table className="w-full">
          <tbody>
            <tr>
            <td className="w-1/2 pr-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <td className="p-2 font-bold" colSpan={2}>Documents Included:</td>
                    <td className="p-2 font-bold text-center">Y/N</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Director's Intent/Message</td>
                    <td className="p-1 text-center">{checklist.directorsIntent ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Priorities and Objectives</td>
                    <td className="p-1 text-center">{checklist.incidentPriorities ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Status of Previous Operating Period's Objectives</td>
                    <td className="p-1 text-center">{checklist.statusOfPrevious ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Contact Roster DRO HQ</td>
                    <td className="p-1 text-center">{checklist.contactRoster ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Open Action Tracker</td>
                    <td className="p-1 text-center">{checklist.incidentOpenAction ? 'Y' : 'N'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td className="w-1/2 pl-4">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <td className="p-2 font-bold" colSpan={2}>Documents Included:</td>
                    <td className="p-2 font-bold text-center">Y/N</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Incident Organization Chart</td>
                    <td className="p-1 text-center">{checklist.incidentOrgChart ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Work Assignment</td>
                    <td className="p-1 text-center">{checklist.workAssignment ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Work Sites</td>
                    <td className="p-1 text-center">{checklist.workSites ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">Daily Schedule</td>
                    <td className="p-1 text-center">{checklist.dailySchedule ? 'Y' : 'N'}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="p-1 underline text-blue-600">General Message</td>
                    <td className="p-1 text-center">{checklist.generalMessage ? 'Y' : 'N'}</td>
                  </tr>
                </tbody>
              </table>
            </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Prepared/Approved By */}
      <table className="w-full border-2 border-black">
        <tbody>
          <tr className="bg-gray-200">
          <td className="border-r-2 border-black p-2 w-1/2">
            <div className="font-bold">Prepared By:</div>
            <div>{preparedBy.name}</div>
            <div className="text-sm">{preparedBy.title}</div>
          </td>
          <td className="p-2 w-1/2">
            <div className="font-bold">Approved By:</div>
            <div>{approvedBy.name}</div>
            <div className="text-sm">{approvedBy.title}</div>
          </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}