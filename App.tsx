
import React, { useState } from 'react';
import { ThumbnailNiche, ThumbnailState, ThumbnailAssets } from './types';
import { geminiService } from './services/geminiService';
import Header from './components/Header';
import ThumbnailPreview from './components/ThumbnailPreview';

const App: React.FC = () => {
  const [state, setState] = useState<ThumbnailState>({
    title: '',
    niche: ThumbnailNiche.MYSTERY,
    assets: {},
    isGenerating: false,
  });

  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAssetUpload = (type: keyof ThumbnailAssets, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setState(prev => ({
          ...prev,
          assets: { ...prev.assets, [type]: base64 }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAsset = (type: keyof ThumbnailAssets) => {
    setState(prev => ({
      ...prev,
      assets: { ...prev.assets, [type]: undefined }
    }));
  };

  const handleGenerate = async () => {
    if (!state.title.trim()) {
      setState(prev => ({ ...prev, error: "Please enter a video title first." }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: undefined, generatedImage: undefined }));

    try {
      const { imageUrl, hook, fontFamily } = await geminiService.generateThumbnailData(
        state.title,
        state.niche,
        state.assets
      );
      setState(prev => ({
        ...prev,
        generatedImage: imageUrl,
        shortHook: hook,
        fontFamily: fontFamily,
        isGenerating: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Failed to generate thumbnail."
      }));
    }
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim() || !state.generatedImage) return;

    setIsEditing(true);
    setState(prev => ({ ...prev, error: undefined }));

    try {
      const updatedImageUrl = await geminiService.editThumbnail(
        state.generatedImage,
        editPrompt
      );
      setState(prev => ({
        ...prev,
        generatedImage: updatedImageUrl
      }));
      setEditPrompt('');
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || "Failed to apply visual edits."
      }));
    } finally {
      setIsEditing(false);
    }
  };

  const AssetCard = ({ type, label }: { type: keyof ThumbnailAssets; label: string }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">{label}</label>
      <div className="relative h-24 border border-white/5 rounded-xl overflow-hidden bg-black/40 group hover:border-red-600/30 transition-all flex items-center justify-center">
        {state.assets[type] ? (
          <div className="relative w-full h-full">
            <img src={state.assets[type]} className="w-full h-full object-cover opacity-60" alt={label} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-black/40">
              <span className="text-[9px] text-white font-black uppercase mb-1">ASSET LOADED</span>
              <button 
                onClick={() => clearAsset(type)}
                className="text-[8px] text-red-500 font-bold uppercase hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer">
            <svg className="w-5 h-5 text-zinc-700 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[9px] text-zinc-600 font-bold uppercase">Upload</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleAssetUpload(type, e)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6 bg-zinc-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
            
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Video Topic / Content Goal</label>
              <textarea 
                value={state.title}
                onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What is your video about? (e.g. The Secret History of AI...)"
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all resize-none h-24 text-sm"
              />
            </div>

            {/* Niche Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Video Category</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ThumbnailNiche).map((niche) => (
                  <button
                    key={niche}
                    onClick={() => setState(prev => ({ ...prev, niche }))}
                    className={`text-[9px] font-bold py-3 px-2 rounded-xl border transition-all text-center leading-tight uppercase ${
                      state.niche === niche 
                        ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' 
                        : 'bg-black/40 text-zinc-500 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            {/* Triple Asset Uploads */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reference Visuals</label>
                 <span className="text-[8px] text-zinc-600 font-bold uppercase italic">Strictly Preserved</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <AssetCard type="background" label="Background" />
                <AssetCard type="object" label="Main Object" />
                <AssetCard type="icon" label="Icon/Badge" />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={state.isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all transform active:scale-[0.98] ${
                state.isGenerating 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:scale-[1.02] shadow-xl shadow-red-900/30'
              }`}
            >
              {state.isGenerating ? 'ANALYZING CTR ENGINE...' : state.generatedImage ? 'REGENERATE NEW BASE' : 'GENERATE THUMBNAIL'}
            </button>

            {state.error && <p className="text-xs text-red-500 font-bold text-center bg-red-500/10 p-2 rounded-lg">{state.error}</p>}
          </div>

          {/* Edit Section (Appears after Generation) */}
          {state.generatedImage && (
            <div className="space-y-6 bg-zinc-900/60 p-6 rounded-3xl border border-red-500/20 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Refinement Engine</h3>
              </div>

              {/* Hook Text Override */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Adjust Hook Text (1-4 words)</label>
                <input 
                  type="text"
                  value={state.shortHook}
                  onChange={(e) => setState(prev => ({ ...prev, shortHook: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Font Override */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Change Font Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {['bebas', 'anton', 'cinzel', 'space-mono'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setState(prev => ({ ...prev, fontFamily: f }))}
                      className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${state.fontFamily === f ? 'bg-white text-black' : 'bg-black/40 text-zinc-500 border border-white/10'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Edit Prompt */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Visual Refinement (e.g. "Add purple mist", "More glow")</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe specific visual changes..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    onClick={handleApplyEdit}
                    disabled={isEditing || !editPrompt.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                  >
                    {isEditing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Live Rendering Preview</h3>
               <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">1280x720 • NO FACE</span>
               </div>
            </div>

            {state.generatedImage ? (
              <ThumbnailPreview 
                imageUrl={state.generatedImage} 
                hookText={state.shortHook || ''} 
                niche={state.niche}
                fontFamily={state.fontFamily || 'bebas'}
              />
            ) : (
              <div className="aspect-video w-full rounded-3xl border-2 border-dashed border-white/5 bg-zinc-900/10 flex flex-col items-center justify-center space-y-4 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                   <svg className="w-8 h-8 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-700 uppercase">Awaiting Topic Input</p>
                  <p className="text-[10px] text-zinc-800 max-w-xs mx-auto">Upload assets to guide the engine.</p>
                </div>
              </div>
            )}
            
            <div className="mt-8 bg-zinc-900/20 p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">PRO TIP</p>
                   <p className="text-xs text-zinc-400">Add an <b>Icon</b> for authority and an <b>Object</b> for visual storytelling.</p>
                </div>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border border-black bg-zinc-800" />)}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
