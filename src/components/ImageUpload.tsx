'use client';

import React, { useState, ChangeEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { Label } from './ui/label';

interface ImageUploadProps {
  onImageUpload: (file: File | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // Always take the first file

      // Create preview image
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageDataUrl = event.target?.result as string;
          setPreviewImage(imageDataUrl);
          onImageUpload(file);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    onImageUpload(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Label className="block text-sm font-medium text-gray-700 dark:text-white">Menu Item Image</Label>
      <div className="flex flex-col space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {!previewImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed  rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors group"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <ImagePlus className="h-10 w-10 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <p className="text-sm text-gray-500 group-hover:text-indigo-600 dark:text-gray-300">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-400">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="w-full max-w-[300px] mx-auto aspect-square rounded-lg overflow-hidden ">
              <Image 
                src={previewImage} 
                alt="Preview" 
                fill
                className="object-contain group-hover:opacity-70 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white hover:bg-gray-100"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Image
                </Button>
              </div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute -top-3 -right-3 w-7 h-7 rounded-full shadow-md"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};