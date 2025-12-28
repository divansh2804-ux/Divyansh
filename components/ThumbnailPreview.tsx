
import React, { useRef, useState } from 'react';

interface Props {
  imageUrl: string;
  hookText: string;
  niche: string;
  fontFamily: string;
}

const ThumbnailPreview: React.FC<Props> = ({ imageUrl, hookText, fontFamily }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const fontMap: Record<string, { className: string; canvasFont: string; spacing: number }> = {
    'cinzel': { className: 'cinzel', canvasFont: 'Cinzel', spacing: 25 },
    'space-mono': { className: 'space-mono', canvasFont: 'Space Mono', spacing: 20 },
    'anton': { className: 'anton', canvasFont: 'Anton', spacing: 35 },
    'bebas': { className: 'bebas', canvasFont: 'Bebas Neue', spacing: 30 },
    'inter-bold': { className: 'font-black tracking-tighter', canvasFont: 'Inter', spacing: 20 }
  };

  const selectedFont = fontMap[fontFamily] || fontMap['bebas'];

  const downloadFullThumbnail = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1280;
      canvas.height = 720;

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // 1. Draw Background
      ctx.drawImage(img, 0, 0, 1280, 720);

      // 2. Add Depth Gradient
      const gradient = ctx.createLinearGradient(0, 450, 0, 720);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.75)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      // 3. High-Impact Typography with Manual Spacing Control
      const words = hookText.toUpperCase().split(/\s+/).filter(w => w.length > 0);
      const fontSize = hookText.length > 15 ? 100 : 135;
      ctx.font = `900 ${fontSize}px ${selectedFont.canvasFont}`;
      ctx.fillStyle = 'white';
      ctx.textBaseline = 'bottom';

      // Shadow for extreme contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;

      // Calculate total width to center the group of words
      const wordGaps = selectedFont.spacing;
      let totalWidth = 0;
      const wordMetrics = words.map(word => {
        const width = ctx.measureText(word).width;
        totalWidth += width;
        return width;
      });
      totalWidth += (words.length - 1) * wordGaps;

      // Draw each word with precise spacing
      let currentX = (1280 - totalWidth) / 2;
      const yPos = 690;

      words.forEach((word, index) => {
        ctx.fillText(word, currentX, yPos);
        currentX += wordMetrics[index] + wordGaps;
      });

      // 4. Export
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 1.0);
      link.download = `yt-thumbnail-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5 group bg-zinc-900"
      >
        <img 
          src={imageUrl} 
          alt="Generated Cinematic Visual" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent pointer-events-none opacity-90" />
        
        <div className="absolute bottom-6 left-0 right-0 flex justify-center px-10 pointer-events-none">
           <h2 
            className={`${selectedFont.className} text-5xl md:text-7xl lg:text-8xl leading-none text-white drop-shadow-[0_20px_20px_rgba(0,0,0,1)] uppercase text-center w-full break-words font-black flex justify-center flex-wrap gap-x-6`}
            style={{ wordSpacing: `${selectedFont.spacing / 5}px` }}
           >
              {hookText.split(/\s+/).map((word, i) => (
                <span key={i} className="inline-block">{word}</span>
              ))}
           </h2>
        </div>
      </div>

      <div className="flex items-center justify-between bg-zinc-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex flex-col">
            <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.2em] mb-1">Ultra-Readable Spacing</span>
            <span className="text-sm font-bold text-zinc-300 tracking-tight italic">"{hookText}"</span>
        </div>
        <button 
          onClick={downloadFullThumbnail}
          disabled={isExporting}
          className={`px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all transform active:scale-95 shadow-lg ${
            isExporting ? 'bg-zinc-800 text-zinc-500 cursor-wait' : 'bg-white text-black hover:bg-red-600 hover:text-white'
          }`}
        >
          {isExporting ? (
             <>
               <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               POLISHING...
             </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              DOWNLOAD 16:9
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
