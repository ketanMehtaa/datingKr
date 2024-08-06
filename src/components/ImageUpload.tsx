'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from './ui/button';
import { Area, Point } from 'react-easy-crop';
import { useToast } from './ui/use-toast';

interface ImageUploadProps {
  handleImageChange:any;
  handleImageRemove:any;
  id:number;
}

export default function ImageUpload({ handleImageChange,handleImageRemove ,id}: ImageUploadProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast()


  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleLocalImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSave = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    try {
      if (selectedImage && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);
        const file = await blobToFile(croppedImage, 'cropped_image.jpg');
        console.log('Cropped image file:', file);
        handleImageChange(file);
        toast({
            title: "Image Added",
            description: "",
          })
  
      }
    } catch (e) {
      console.error('Error saving image:', e);
    }
  }, [selectedImage, croppedAreaPixels, handleImageChange]);

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setSelectedImage(null);
    handleImageRemove(id);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast({
        title: "Image Removed",
        description: "",
      })
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedImage ? (
        <div 
          style={{ 
            width: '300px', 
            height: '300px', 
            border: '2px dashed #ccc', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            fontSize: '48px',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          +
        </div>
      ) : (
        <div style={{ width: '100%', height: '500px', position: 'relative' }}>
          <Cropper
            image={selectedImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            cropSize={{ width: 365, height: 360 }}
            showGrid={false}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLocalImageChange}
        style={{ display: 'none' }}
      />
      {selectedImage && (
        <div style={{ marginTop: '20px', width: '400px' }}>
          <div style={{ display: 'flex', justifyContent:'center', gap:'10px', marginTop: '20px' }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to create a cropped image
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to create canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image as HTMLImageElement,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas to Blob conversion failed'));
      }
    }, 'image/jpeg');
  });
}

// Helper function to create an image
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

// Helper function to convert Blob to File
function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}