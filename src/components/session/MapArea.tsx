"use client";

import { useEffect, useRef, useState } from "react";

type MapAreaProps = {
  mapUrl?: string;
};

export default function MapArea({ mapUrl }: MapAreaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [start, setStart] = useState({ x: 0, y: 0 });

  // 🔥 Ajustar automaticamente ao carregar imagem
  useEffect(() => {
    if (!mapUrl) return;

    const img = imageRef.current;
    const container = containerRef.current;

    if (!img || !container) return;

    function fitImage() {
      if (!container || !img) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const imageWidth = img.naturalWidth;
      const imageHeight = img.naturalHeight;

      const scaleX = containerWidth / imageWidth;
      const scaleY = containerHeight / imageHeight;

      const newScale = Math.min(scaleX, scaleY);

      const newX = (containerWidth - imageWidth * newScale) / 2;
      const newY = (containerHeight - imageHeight * newScale) / 2;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }

    if (img.complete) {
      fitImage();
    } else {
      img.onload = fitImage;
    }
  }, [mapUrl]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomIntensity = 0.0015;
    const newScale = scale - e.deltaY * zoomIntensity;
    const clampedScale = Math.min(Math.max(newScale, 0.2), 4);

    const scaleFactor = clampedScale / scale;

    const newX = mouseX - (mouseX - position.x) * scaleFactor;
    const newY = mouseY - (mouseY - position.y) * scaleFactor;

    setScale(clampedScale);
    setPosition({ x: newX, y: newY });
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex-1 overflow-hidden bg-[var(--bg-primary)] cursor-grab active:cursor-grabbing"
    >
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          transition: isDragging ? "none" : "transform 0.05s linear",
        }}
      >
        {mapUrl ? (
          <img
            ref={imageRef}
            src={mapUrl}
            alt="Mapa da sessão"
            draggable={false}
            className="select-none pointer-events-none max-w-none"
          />
        ) : (
          <div className="w-[1600px] h-[1000px] flex items-center justify-center text-[var(--text-muted)]">
            Nenhum mapa carregado
          </div>
        )}
      </div>
    </div>
  );
}
