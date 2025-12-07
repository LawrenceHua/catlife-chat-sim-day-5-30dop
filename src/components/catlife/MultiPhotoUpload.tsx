"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, X, Check, Loader2, ArrowLeft } from "lucide-react";

export type PhotoAngle = "top" | "left" | "right" | "front";

export interface PhotoData {
  angle: PhotoAngle;
  dataUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

interface MultiPhotoUploadProps {
  onAllPhotosUploaded: (photos: Record<PhotoAngle, string>) => void;
  onBack?: () => void;
}

const PHOTO_ANGLES: { angle: PhotoAngle; label: string; icon: string }[] = [
  { angle: "top", label: "Top", icon: "🔝" },
  { angle: "left", label: "Left", icon: "⬅️" },
  { angle: "right", label: "Right", icon: "➡️" },
  { angle: "front", label: "Front", icon: "😺" },
];

// Check if file is HEIC
function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return (
    fileName.endsWith('.heic') || 
    fileName.endsWith('.heif') || 
    fileType === 'image/heic' ||
    fileType === 'image/heif'
  );
}

// Convert HEIC to JPEG blob using heic2any (dynamic import for SSR)
async function convertHeicToBlob(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.85,
  });
  return Array.isArray(result) ? result[0] : result;
}

// Convert blob to JPEG data URL using canvas
async function blobToJpegDataUrl(blob: Blob, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { URL.revokeObjectURL(blobUrl); reject(new Error('No canvas')); return; }
        
        let width = img.width, height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height / width) * maxDim); width = maxDim; }
          else { width = Math.round((width / height) * maxDim); height = maxDim; }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        URL.revokeObjectURL(blobUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (err) { URL.revokeObjectURL(blobUrl); reject(err); }
    };
    
    img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('Failed to load')); };
    img.src = blobUrl;
  });
}

// Convert any image (including HEIC) to JPEG data URL
async function convertToJpeg(file: File): Promise<string> {
  if (isHeicFile(file)) {
    console.log('[MultiPhotoUpload] Converting HEIC file...');
    const jpegBlob = await convertHeicToBlob(file);
    return blobToJpegDataUrl(jpegBlob);
  }
  return blobToJpegDataUrl(file);
}

export function MultiPhotoUpload({ onAllPhotosUploaded, onBack }: MultiPhotoUploadProps) {
  const [photos, setPhotos] = useState<Record<PhotoAngle, PhotoData>>({
    top: { angle: "top", dataUrl: null, isLoading: false, error: null },
    left: { angle: "left", dataUrl: null, isLoading: false, error: null },
    right: { angle: "right", dataUrl: null, isLoading: false, error: null },
    front: { angle: "front", dataUrl: null, isLoading: false, error: null },
  });
  const [activeAngle, setActiveAngle] = useState<PhotoAngle>("top");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadedCount = Object.values(photos).filter(p => p.dataUrl).length;
  const allUploaded = uploadedCount === 4;

  const handleFileSelect = useCallback(async (file: File, angle: PhotoAngle) => {
    const fileName = file.name.toLowerCase();
    const isImage = file.type.startsWith('image/') || 
      fileName.endsWith('.heic') || fileName.endsWith('.heif') ||
      fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
    
    if (!isImage || file.size > 20 * 1024 * 1024) {
      setPhotos(prev => ({ ...prev, [angle]: { ...prev[angle], error: isImage ? "Too large" : "Not an image" } }));
      return;
    }

    setPhotos(prev => ({ ...prev, [angle]: { ...prev[angle], isLoading: true, error: null } }));

    try {
      const jpegDataUrl = await convertToJpeg(file);
      setPhotos(prev => ({ ...prev, [angle]: { ...prev[angle], dataUrl: jpegDataUrl, isLoading: false } }));
      
      const nextEmpty = PHOTO_ANGLES.find(pa => pa.angle !== angle && !photos[pa.angle].dataUrl);
      if (nextEmpty) setActiveAngle(nextEmpty.angle);
    } catch {
      setPhotos(prev => ({ ...prev, [angle]: { ...prev[angle], isLoading: false, error: "Failed" } }));
    }
  }, [photos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file, activeAngle);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (angle: PhotoAngle) => {
    setPhotos(prev => ({ ...prev, [angle]: { ...prev[angle], dataUrl: null, error: null } }));
  };

  const handleContinue = () => {
    if (allUploaded) {
      onAllPhotosUploaded({
        top: photos.top.dataUrl!,
        left: photos.left.dataUrl!,
        right: photos.right.dataUrl!,
        front: photos.front.dataUrl!,
      });
    }
  };

  const currentAngleInfo = PHOTO_ANGLES.find(pa => pa.angle === activeAngle)!;
  const currentPhoto = photos[activeAngle];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
        <div className="w-7 flex items-center justify-center">
          {onBack && (
            <button onClick={onBack} className="p-1 text-amber-600 hover:text-amber-800 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Camera className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold text-amber-900 text-sm">Photos</span>
        </div>
        <div className="w-7 flex items-center justify-center text-xs text-amber-600 font-medium">{uploadedCount}/4</div>
      </div>

      {/* Photo Tabs */}
      <div className="flex justify-center gap-1.5 p-2 bg-white border-b border-amber-100 flex-shrink-0">
        {PHOTO_ANGLES.map((pa) => {
          const photo = photos[pa.angle];
          const isActive = activeAngle === pa.angle;
          const hasPhoto = !!photo.dataUrl;
          
          return (
            <button
              key={pa.angle}
              onClick={() => setActiveAngle(pa.angle)}
              className={`flex flex-col items-center p-1.5 rounded-lg transition-all min-w-[50px] ${
                isActive ? "bg-amber-100 border border-amber-400"
                : hasPhoto ? "bg-green-50 border border-green-300"
                : "bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="text-sm">{pa.icon}</span>
              <span className={`text-[9px] font-medium ${isActive ? "text-amber-700" : hasPhoto ? "text-green-600" : "text-gray-500"}`}>
                {pa.label}
              </span>
              {hasPhoto && <Check className="w-2.5 h-2.5 text-green-500" />}
            </button>
          );
        })}
      </div>

      {/* Upload Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="relative w-full max-w-[200px] aspect-square">
          {currentPhoto.dataUrl ? (
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-green-400 shadow-lg">
              <img src={currentPhoto.dataUrl} alt={currentAngleInfo.label} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(activeAngle)}
                className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-green-500 text-white text-[10px] font-medium rounded-full flex items-center gap-1">
                <Check className="w-2.5 h-2.5" /> Done
              </div>
            </div>
          ) : currentPhoto.isLoading ? (
            <div className="w-full h-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
              <p className="text-amber-700 font-medium text-xs">Processing...</p>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 hover:bg-amber-100 transition-all flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center mb-2">
                <Camera className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-amber-900 font-medium text-xs">Tap to upload</p>
              <p className="text-amber-600 text-[10px]">{currentAngleInfo.label} view</p>
            </button>
          )}
        </div>

        {currentPhoto.error && (
          <p className="mt-2 text-red-600 text-xs">{currentPhoto.error}</p>
        )}

        <p className="mt-3 text-[10px] text-amber-600 text-center max-w-[200px]">
          📸 Good lighting helps! Natural light works best.
        </p>
      </div>

      {/* Continue Button */}
      <div className="p-3 border-t border-amber-200 bg-white flex-shrink-0">
        <motion.button
          onClick={handleContinue}
          disabled={!allUploaded}
          whileHover={allUploaded ? { scale: 1.02 } : {}}
          whileTap={allUploaded ? { scale: 0.98 } : {}}
          className={`w-full py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm ${
            allUploaded
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allUploaded ? (
            <><Check className="w-4 h-4" /> Continue</>
          ) : (
            <><Camera className="w-4 h-4" /> Upload all 4 photos</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
