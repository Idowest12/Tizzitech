import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, CheckCircle2, User, Sparkles, RefreshCw, Save, AlertCircle, Link, FileText, RotateCcw } from 'lucide-react';

interface FounderProfileManagerProps {
  onSuccess?: (msg: string) => void;
}

const DEFAULT_FOUNDER_MESSAGE = `I started This online cause I noticed that there were many vendors who just want to sell their laptop just for the money and gain, thereby leading their customers to make wrong choices especially to novices in the computer space.

I started this cause of my Love for Tech and seeing many innocent people being scammed on daily basis.

But here I am to correct that: by Trying to help clients to make a better choice of systems based on what they intend to do, while still working within their Budget.`;

export function FounderProfileManager({ onSuccess }: FounderProfileManagerProps) {
  const [name, setName] = useState<string>('Idowu Oluwatosin A.');
  const [title, setTitle] = useState<string>('Founder & CEO • Tizzitech');
  const [quote, setQuote] = useState<string>('Tech for a Smarter Tomorrow');
  const [message, setMessage] = useState<string>(DEFAULT_FOUNDER_MESSAGE);
  const [photoUrl, setPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('tizzitech_founder_photo') || '/founder.jpg';
  });
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.founderName) setName(data.founderName);
          if (data.founderTitle) setTitle(data.founderTitle);
          if (data.founderQuote) setQuote(data.founderQuote.replace(/^"|"$/g, ''));
          if (data.founderMessage) setMessage(data.founderMessage);
          if (data.founderPhotoUrl) {
            setPhotoUrl(data.founderPhotoUrl);
            localStorage.setItem('tizzitech_founder_photo', data.founderPhotoUrl);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch settings in FounderProfileManager:', err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customPhotoUrl.trim()) {
      setPhotoPreview(customPhotoUrl.trim());
      setSelectedFile(null);
    }
  };

  const handleResetToDefaultMessage = () => {
    setMessage(DEFAULT_FOUNDER_MESSAGE);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      let finalPhotoUrl = photoUrl;

      // 1. If a file was selected, upload via the admin endpoint
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const uploadRes = await fetch('/api/admin/founder-photo', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            finalPhotoUrl = uploadData.url;
            setPhotoUrl(uploadData.url);
            localStorage.setItem('tizzitech_founder_photo', uploadData.url);
          }
        } else {
          // If server upload failed, fallback to base64 preview for client display
          if (photoPreview) {
            finalPhotoUrl = photoPreview;
            localStorage.setItem('tizzitech_founder_photo', photoPreview);
          }
        }
      } else if (customPhotoUrl.trim()) {
        finalPhotoUrl = customPhotoUrl.trim();
        setPhotoUrl(finalPhotoUrl);
        localStorage.setItem('tizzitech_founder_photo', finalPhotoUrl);
      } else if (photoPreview) {
        finalPhotoUrl = photoPreview;
        localStorage.setItem('tizzitech_founder_photo', photoPreview);
      }

      // 2. Persist founder configuration to server & Firestore
      const configRes = await fetch('/api/admin/founder-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founderName: name,
          founderTitle: title,
          founderQuote: quote,
          founderMessage: message,
          founderPhotoUrl: finalPhotoUrl || '/founder.jpg',
        }),
      });

      if (configRes.ok) {
        setSaveSuccess(true);
        localStorage.setItem('tizzitech_founder_name', name);
        
        // Dispatch instant event for AboutUs or other mounted components
        window.dispatchEvent(
          new CustomEvent('tizzitech-founder-updated', {
            detail: {
              founderName: name,
              founderTitle: title,
              founderQuote: quote,
              founderMessage: message,
              founderPhotoUrl: finalPhotoUrl,
            },
          })
        );

        if (onSuccess) onSuccess('CEO Profile and Picture updated successfully!');
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        const err = await configRes.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to save founder configuration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentDisplayPhoto = photoPreview || photoUrl;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-serif font-black text-white flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" />
            Founder & CEO Profile Management
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Centrally manage the CEO's official photo, name (Idowu Oluwatosin A.), title, motto, and message shown on the About Us page.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">CEO Profile & Picture Published Successfully!</p>
            <p className="text-xs text-emerald-400/90 mt-0.5">
              The changes have been saved to the database and are now live on the public About Us page.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-950/70 border border-red-800 rounded-xl text-red-300 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Card Preview as rendered on About Us */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Live Card Preview</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              About Us View
            </span>
          </div>

          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl group flex flex-col justify-between">
            <div className="absolute inset-0 w-full h-full">
              {currentDisplayPhoto ? (
                <img
                  src={currentDisplayPhoto}
                  alt={`${name} - Founder & CEO`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/founder.png')) {
                      target.src = '/founder.png';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                  <User className="w-16 h-16 text-blue-500 mb-2" />
                  <p className="text-neutral-400 text-xs">No picture selected</p>
                </div>
              )}
            </div>

            {/* Quick Upload Button directly in Preview */}
            <div className="relative z-20 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-blue-600 text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Choose Picture</span>
              </button>
            </div>

            {/* Bottom Card Caption */}
            <div className="relative z-20 bg-gradient-to-t from-black via-black/85 to-transparent p-6 rounded-b-3xl">
              <p className="text-white font-serif font-black text-xl tracking-tight">{name}</p>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{title}</p>
              <p className="text-neutral-400 text-[11px] italic mt-1">"{quote}"</p>
            </div>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-300">Public About Us Safe Mode:</p>
            <p>
              The public About Us page is completely clean and read-only. Only authenticated administrators can upload photos and edit text from this panel.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-bold text-white">Founder Profile Details</h2>
              <span className="text-xs text-neutral-500">Auto-synced with store</span>
            </div>

            {/* Picture Upload Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                CEO Portrait Image (Upload File)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-950/20' 
                    : 'border-neutral-700 hover:border-blue-500 bg-neutral-950/60'
                } group`}
              >
                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-white mb-1">
                  {selectedFile ? (
                    <span className="text-blue-400 font-semibold">{selectedFile.name}</span>
                  ) : (
                    'Click to select or drag & drop the CEO photo here'
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  Accepts <span className="text-blue-400 font-mono">WhatsApp Image 2026-09-14 at 8.40.47 AM.jpeg</span>, JPG, PNG, or WebP.
                </p>
              </div>

              {/* Or Direct Image URL option */}
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <Link className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="url"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-black border border-neutral-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Preview URL
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Founder & CEO Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                placeholder="Idowu Oluwatosin A."
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Updates all founder title headings and CEO signature tags.
              </p>
            </div>

            {/* Official Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Official Corporate Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                placeholder="Founder & CEO • Tizzitech"
              />
            </div>

            {/* Tagline / Motto */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Official Motto / Tagline
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-blue-500 text-sm font-medium"
                placeholder="Tech for a Smarter Tomorrow"
              />
            </div>

            {/* Founder Letter / Message */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                  A Message from the Founder (Paragraphs)
                </label>
                <button
                  type="button"
                  onClick={handleResetToDefaultMessage}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore Default Message</span>
                </button>
              </div>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl bg-black border border-neutral-800 text-white focus:outline-none focus:border-blue-500 text-xs font-mono leading-relaxed"
                placeholder="Separate paragraphs with a blank line..."
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Separate distinct paragraphs with a blank line. This will be formatted on the About Us page.
              </p>
            </div>

            {/* Save & Publish Action */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                All changes take effect immediately across web clients.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save & Publish to About Us</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
