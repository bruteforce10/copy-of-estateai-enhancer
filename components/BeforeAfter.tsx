import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Move } from './Icons';

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
  filters?: React.CSSProperties; // CSS filters to apply to the AFTER image
  objectFit?: 'contain' | 'cover';
}

export const BeforeAfter: React.FC<BeforeAfterProps> = ({ 
  beforeImage, 
  afterImage, 
  className = '', 
  filters,
  objectFit = 'contain'
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  const handleMouseUp = () => setIsDragging(false);
  const handleTouchEnd = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  // Allow clicking anywhere on the track to jump
  const handleClick = (e: React.MouseEvent) => {
      handleMove(e.clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const fitClass = objectFit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div 
      className={`relative w-full h-full select-none overflow-hidden ${className}`} 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {/* Before Image (Background) */}
      <img 
        src={beforeImage} 
        alt="Before" 
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${fitClass}`} 
      />

      {/* After Image (Clipped) */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={afterImage} 
          alt="After" 
          className={`absolute top-0 left-0 max-w-none h-full ${fitClass}`}
          style={{ 
             width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
             ...filters 
          }} 
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-lg"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-600">
          <Move size={16} />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">After</div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">Before</div>
    </div>
  );
};