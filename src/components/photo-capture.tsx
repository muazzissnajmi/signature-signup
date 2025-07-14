
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, RefreshCw, Upload, Check } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface PhotoCaptureProps {
  onSave: (photo: string) => void;
}

export function PhotoCapture({ onSave }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video to avoid distortion
        const { videoWidth, videoHeight } = video;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        context.drawImage(video, 0, 0, videoWidth, videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: 'Please select an image file smaller than 5MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = () => {
    if (capturedImage) {
      onSave(capturedImage);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera" disabled={!hasCameraPermission}>Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="camera">
          <div className="relative w-full aspect-video bg-slate-200 rounded-md overflow-hidden mt-4">
            {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : (
                <>
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                    Enable camera permissions to use this feature. You can still upload a file.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </>
            )}
          </div>
          <div className="flex justify-center mt-4">
              {capturedImage ? (
                  <Button type="button" variant="outline" onClick={handleRetake}>
                      <RefreshCw className="mr-2" /> Retake
                  </Button>
              ) : (
                  <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
                      <Camera className="mr-2" /> Capture Photo
                  </Button>
              )}
          </div>
        </TabsContent>
        <TabsContent value="upload">
            <div className="relative w-full aspect-video bg-slate-200 rounded-md overflow-hidden mt-4 flex items-center justify-center">
              {capturedImage ? (
                  <img src={capturedImage} alt="Uploaded preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-10 h-10" />
                    <p>Click to browse or drag & drop</p>
                    <p className="text-xs">PNG, JPG, up to 5MB</p>
                </div>
              )}
               <Input 
                ref={fileInputRef}
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
               />
            </div>
             <div className="flex justify-center mt-4">
              {capturedImage && (
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2" /> Choose another file
                  </Button>
              )}
            </div>
        </TabsContent>
      </Tabs>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={() => setCapturedImage(null)}>Clear</Button>
        <Button type="button" onClick={handleSave} disabled={!capturedImage} className="bg-accent hover:bg-accent/90">
            <Check className="mr-2"/>
            Save Photo
        </Button>
      </div>
    </div>
  );
}

    