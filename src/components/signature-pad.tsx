'use client';

import React, { useRef, useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SignaturePadProps extends ComponentPropsWithoutRef<'canvas'> {
  onSave: (signature: string) => void;
  onClear: () => void;
}

export function SignaturePad({ onSave, onClear, className, ...props }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getContext = () => canvasRef.current?.getContext('2d');

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.strokeStyle = '#000000'; // Signature color
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return null;
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const coords = getCoordinates(event.nativeEvent);
    if (coords) {
      const ctx = getContext();
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        setIsDrawing(true);
      }
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    const coords = getCoordinates(event.nativeEvent);
    if (coords) {
      const ctx = getContext();
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    const ctx = getContext();
    if (ctx) {
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onClear();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() === blank.toDataURL()) {
        return;
      }
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={cn("w-full h-64 bg-slate-100 rounded-md border-2 border-dashed touch-none cursor-crosshair", className)}
        {...props}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
        <Button type="button" onClick={handleSave} className="bg-accent hover:bg-accent/90">Save Signature</Button>
      </div>
    </div>
  );
}
