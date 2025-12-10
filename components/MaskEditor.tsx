import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface MaskEditorProps {
  imageSrc: string;
  brushSize: number;
  brushHardness: number; // 0 to 100
  isEraser: boolean;
  showMask: boolean;
  className?: string;
  onMaskChange?: (hasMask: boolean) => void;
}

export interface MaskEditorHandle {
  getMaskImage: () => string | null;
  clearMask: () => void;
  undo: () => void;
}

export const MaskEditor = forwardRef<MaskEditorHandle, MaskEditorProps>(({
  imageSrc,
  brushSize,
  brushHardness,
  isEraser,
  showMask,
  className = '',
  onMaskChange
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Custom cursor state
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  // Initialize canvas when image loads
  const handleImageLoad = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match actual image resolution
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      saveHistory(); // Save initial blank state
    }
    setImageLoaded(true);
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getMaskImage: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    },
    clearMask: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveHistory();
        if (onMaskChange) onMaskChange(false);
      }
    },
    undo: () => {
      if (history.length <= 1 || !canvasRef.current) return;
      
      const newHistory = [...history];
      newHistory.pop(); // Remove current state
      const previousState = newHistory[newHistory.length - 1];
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && previousState) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(previousState, 0, 0);
        setHistory(newHistory);
        if (onMaskChange) onMaskChange(checkIfHasMask(previousState));
      }
    }
  }));

  const saveHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      // Limit history to 20 steps
      setHistory(prev => {
        const newHist = [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)];
        if (newHist.length > 20) return newHist.slice(newHist.length - 20);
        return newHist;
      });
    }
  };

  const checkIfHasMask = (imageData: ImageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) return true; // Alpha > 0 means something is drawn
    }
    return false;
  };

  // Coordinate mapping
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0, clientX: 0, clientY: 0 };

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      clientX,
      clientY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      draw(e);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const { clientX, clientY } = getCoordinates(e);
    
    // Update cursor position relative to viewport for the fixed overlay
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Check if mouse is inside
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
             setCursorPos({ x: clientX - rect.left, y: clientY - rect.top });
             setIsHovering(true);
        } else {
             setIsHovering(false);
        }
    }

    if (!isDrawing || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    // Brush styling
    const scaledBrushSize = brushSize * (canvasRef.current.width / 1000) * 2;
    ctx.lineWidth = scaledBrushSize;
    
    // Hardness simulation using shadowBlur
    // High hardness = 0 blur. Low hardness = high blur.
    const blurAmount = (100 - brushHardness) * (scaledBrushSize / 100);
    ctx.shadowBlur = blurAmount;
    
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.shadowColor = 'rgba(0,0,0,1)'; // Shadow for eraser needs to be opaque to cut effectively
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(239, 68, 68, 1)'; // Solid red core
      ctx.shadowColor = 'rgba(239, 68, 68, 1)'; // Red shadow for softness
      ctx.fillStyle = 'rgba(239, 68, 68, 1)';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Draw circles at start/end for smooth round caps
    ctx.beginPath();
    ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.beginPath(); // Reset path
      saveHistory();
      
      if (canvasRef.current && onMaskChange) {
         onMaskChange(true);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative select-none overflow-hidden cursor-none ${className}`} // Hide system cursor
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background Image */}
      <img 
        ref={imageRef}
        src={imageSrc} 
        alt="Edit Target" 
        className="max-w-full max-h-full object-contain pointer-events-none"
        onLoad={handleImageLoad}
      />
      
      {/* Drawing Canvas */}
      <canvas 
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full touch-none transition-opacity duration-200 ${showMask ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {/* Custom Cursor Overlay */}
      {isHovering && containerRef.current && (
        <div 
           className="pointer-events-none absolute z-50 rounded-full border border-slate-900 bg-white/20 backdrop-invert"
           style={{
             left: cursorPos.x,
             top: cursorPos.y,
             width: `${brushSize}px`, // Simple mapping, effectively pixels on screen roughly
             height: `${brushSize}px`,
             transform: 'translate(-50%, -50%)',
             boxShadow: `0 0 ${100 - brushHardness}px rgba(255,0,0,0.5)` // Visualize softness
           }}
        >
          {/* Crosshair center */}
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        </div>
      )}
    </div>
  );
});

MaskEditor.displayName = 'MaskEditor';