"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import type { PhotoAnalysis, CatProfile } from "@/types/catlife";

interface PhotoUploadProps {
  onPhotoAnalyzed: (analysis: PhotoAnalysis, imageUrl: string) => void;
  onSkip: () => void;
  catProfile: Partial<CatProfile>;
  isOpen: boolean;
}

// HEIC formats from iPhone
const HEIC_FORMATS = ['image/heic', 'image/heif'];

/**
 * Check if file is likely a HEIC/HEIF image
 */
function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  return (
    fileName.endsWith('.heic') || 
    fileName.endsWith('.heif') || 
    HEIC_FORMATS.includes(fileType) ||
    fileType === '' && fileName.match(/\.(heic|heif)$/i) !== null
  );
}

/**
 * Check if file is an image
 */
function isImageFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  // Check by MIME type
  if (fileType.startsWith('image/')) return true;
  
  // Check by extension for files without proper MIME type
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff'];
  return imageExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Convert HEIC to JPEG blob using heic2any library
 * This works on Chrome/Firefox which don't have native HEIC support
 * Uses dynamic import to avoid SSR issues
 */
async function convertHeicToBlob(file: File): Promise<Blob> {
  try {
    // Dynamic import to avoid "window is not defined" during SSR
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    // heic2any can return a single blob or array of blobs
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    console.error("[PhotoUpload] heic2any conversion failed:", error);
    throw new Error("Failed to convert HEIC image");
  }
}

/**
 * Convert image to JPEG using canvas
 * For non-HEIC images or after HEIC conversion
 */
async function blobToJpegDataUrl(blob: Blob, maxDim = 1536): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height / width) * maxDim);
            width = maxDim;
          } else {
            width = Math.round((width / height) * maxDim);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (!jpegDataUrl.startsWith('data:image/jpeg')) {
          URL.revokeObjectURL(blobUrl);
          reject(new Error('Canvas conversion did not produce JPEG'));
          return;
        }
        
        URL.revokeObjectURL(blobUrl);
        resolve(jpegDataUrl);
      } catch (err) {
        URL.revokeObjectURL(blobUrl);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Browser cannot load this image format'));
    };
    
    img.src = blobUrl;
  });
}

/**
 * Convert any image file to JPEG data URL
 * Handles HEIC files specially using heic2any
 */
async function convertToJpeg(file: File): Promise<string> {
  const isHeic = isHeicFile(file);
  
  if (isHeic) {
    console.log('[PhotoUpload] Converting HEIC file using heic2any...');
    const jpegBlob = await convertHeicToBlob(file);
    return blobToJpegDataUrl(jpegBlob);
  }
  
  // For non-HEIC files, use canvas directly
  return blobToJpegDataUrl(file);
}

export function PhotoUpload({
  onPhotoAnalyzed,
  onSkip,
  catProfile,
  isOpen,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection - ALWAYS convert to JPEG
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    const isHeic = isHeicFile(file);
    
    // Validate file type
    if (!isImageFile(file)) {
      setError("Please upload an image file (JPG, PNG, HEIC, etc.)");
      return;
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Image is too large. Please use an image under 20MB.");
      return;
    }

    setIsConverting(true);
    
    try {
      // ALWAYS convert through canvas to ensure JPEG format
      // This handles HEIC on Safari/iOS and normalizes all other formats
      const jpegDataUrl = await convertToJpeg(file);
      
      // Double-check the result is valid
      if (!jpegDataUrl || !jpegDataUrl.startsWith('data:image/jpeg')) {
        throw new Error('Conversion produced invalid output');
      }
      
      setPreview(jpegDataUrl);
      console.log('[PhotoUpload] Successfully converted image to JPEG');
    } catch (conversionError) {
      console.error("[PhotoUpload] Image conversion error:", conversionError);
      
      // Provide specific error message for HEIC
      if (isHeic) {
        setError("Your browser doesn't support HEIC photos. Please convert to JPG first, or use a different browser (Safari works best for iPhone photos).");
      } else {
        setError("Couldn't process this image. Please try a JPG or PNG photo instead.");
      }
    } finally {
      setIsConverting(false);
    }
  }, []);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Analyze the photo
  const analyzePhoto = async () => {
    if (!preview) return;

    // Double-check that preview is a valid JPEG data URL
    if (!preview.startsWith('data:image/jpeg')) {
      console.warn('[PhotoUpload] Preview is not JPEG format, may cause issues');
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/catlife/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: preview,
          catProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        const errorMsg = data.error || "Failed to analyze photo";
        const suggestion = data.suggestion || "";
        setError(suggestion ? `${errorMsg} ${suggestion}` : errorMsg);
        return;
      }

      // Check if there was an error in the response
      if (data.error) {
        setError(data.error);
        return;
      }

      onPhotoAnalyzed(data, preview);
    } catch (err) {
      console.error("Photo analysis error:", err);
      setError("Couldn't analyze the photo. You can try again or skip this step.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear the current photo
  const clearPhoto = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onSkip()}
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 md:p-6 text-white flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Camera className="w-5 h-5 md:w-6 md:h-6" />
              <div>
                <h2 className="text-lg md:text-xl font-bold">Upload a Photo</h2>
                <p className="text-amber-100 text-xs md:text-sm">
                  Let me see {catProfile.name || "your cat"} to double-check the details!
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 overflow-y-auto flex-1">
            {!preview ? (
              // Upload area
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isConverting && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 text-center transition-all ${
                  isConverting 
                    ? "border-amber-400 bg-amber-50 cursor-wait"
                    : isDragging
                    ? "border-amber-500 bg-amber-50 cursor-pointer"
                    : "border-amber-300 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleInputChange}
                  className="hidden"
                />
                {isConverting ? (
                  <>
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-amber-500 mx-auto mb-3 md:mb-4 animate-spin" />
                    <p className="text-amber-900 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Converting image...
                    </p>
                    <p className="text-amber-600 text-xs md:text-sm">
                      Processing your photo for analysis
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 md:w-12 md:h-12 text-amber-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-amber-900 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Tap to take or upload a photo
                    </p>
                    <p className="text-amber-600 text-xs md:text-sm">
                      JPG, PNG, HEIC (iPhone) supported
                    </p>
                  </>
                )}
              </div>
            ) : (
              // Preview area
              <div className="relative">
                <img
                  src={preview}
                  alt="Cat preview"
                  className="w-full h-48 md:h-64 object-cover rounded-xl md:rounded-2xl"
                />
                <button
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 p-1.5 md:p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 md:mt-4 p-2.5 md:p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700"
              >
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs md:text-sm">{error}</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-4 md:mt-6 flex gap-2 md:gap-3">
              <button
                onClick={onSkip}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-amber-700 font-medium rounded-xl hover:bg-amber-50 transition-colors text-sm md:text-base"
              >
                Skip
              </button>
              <motion.button
                onClick={analyzePhoto}
                disabled={!preview || isAnalyzing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    <span className="hidden sm:inline">Analyzing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    Analyze
                  </>
                )}
              </motion.button>
            </div>

            {/* Help text */}
            <p className="mt-3 md:mt-4 text-center text-amber-600 text-[10px] md:text-xs">
              I'll check if what you told me matches how {catProfile.name || "your cat"} looks!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

