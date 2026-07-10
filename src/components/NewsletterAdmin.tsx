import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Send, Users, Image as ImageIcon } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: string;
}

export function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Email state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Image Upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
         // Insert image tag at the end of the content
         const imageTag = `\n<img src="${data.url}" alt="Newsletter Image" style="max-width: 100%; border-radius: 8px; margin-top: 15px;" />\n`;
         setContent(prev => prev + imageTag);
      } else {
         alert('Upload failed: ' + data.error);
      }
    } catch(err: any) {
      alert('Upload error: ' + err.message);
    }
    setIsUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/newsletter/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        setError(data.message || data.error || 'Failed to fetch subscribers');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;
    
    setSending(true);
    setSendResult(null);
    try {
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, content })
      });
      const data = await res.json();
      setSendResult({ success: data.success, message: data.message });
      if (data.success) {
        setSubject('');
        setContent('');
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message });
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Newsletter Management
        </h2>
        <button 
          onClick={fetchSubscribers} 
          className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          title="Refresh List"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscribers List */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Subscribers ({subscribers.length})
          </h3>
          
          {loading ? (
            <div className="text-neutral-500 text-sm">Loading subscribers...</div>
          ) : error ? (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-neutral-500 text-sm">No subscribers found.</div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {subscribers.map((sub, i) => (
                <div key={sub.id || i} className="bg-black border border-neutral-800 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-white text-sm font-medium">{sub.email}</div>
                    <div className="text-neutral-500 text-xs">
                      {new Date(sub.subscribedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-widest ${
                      sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {sub.status}
                    </span>
                    {sub.welcomeEmailSent === true && (
                      <span className="text-[10px] text-blue-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Email Sent
                      </span>
                    )}
                    {sub.welcomeEmailSent === false && sub.emailError && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1" title={sub.emailError}>
                        <AlertCircle className="w-3 h-3" /> Email Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Newsletter Form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-400" />
            Compose Newsletter
          </h3>
          
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Subject</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Exciting News from Tizzitech!"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">HTML Content</label>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold tracking-widest uppercase disabled:opacity-50 transition-colors"
                  >
                    <ImageIcon className="h-3 w-3" />
                    {isUploading ? 'Uploading...' : 'Insert Image'}
                  </button>
                </div>
              </div>
              <textarea 
                required
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-white font-mono text-sm h-64 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="<h1>Hello!</h1><p>Check out our latest products...</p>"
              />
              <p className="text-neutral-500 text-xs mt-1">Basic HTML template with logo is automatically wrapped around your content.</p>
            </div>
            
            <button 
              type="submit" 
              disabled={sending || subscribers.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send to All Subscribers'}
            </button>
            
            {sendResult && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${sendResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {sendResult.success ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
                <p>{sendResult.message}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
