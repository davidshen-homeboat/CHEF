
import React, { useState, useRef, useEffect } from 'react';

interface ProcessingItem {
  id: string;
  name: string;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
}

interface InputSectionProps {
  onProcessText: (text: string, date: string) => void;
  onProcessImage: (data: string, mimeType: string, date: string) => Promise<void>;
  isLoading: boolean;
}

type InputMode = 'file' | 'url' | 'text';

const InputSection: React.FC<InputSectionProps> = ({ onProcessText, onProcessImage, isLoading }) => {
  const [mode, setMode] = useState<InputMode>('file');
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<ProcessingItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 處理 Ctrl+V 貼上圖片
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
      if (imageItems.length === 0) return;

      setMode('file');
      
      const newItems: ProcessingItem[] = [];
      const files: File[] = [];

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          const preview = URL.createObjectURL(file);
          const id = `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          newItems.push({ id, name: `貼上的圖片`, preview, status: 'pending' });
          files.push(file);
        }
      }

      setQueue(prev => [...prev, ...newItems]);
      
      for (let i = 0; i < files.length; i++) {
        await handleSingleFileProcess(newItems[i], files[i]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedDate]); // 當日期改變時重新綁定

  const handleSingleFileProcess = async (queueItem: ProcessingItem, file: File) => {
    setQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'processing' } : q));
    try {
      const reader = new FileReader();
      const dataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const base64Data = await dataPromise;
      await onProcessImage(base64Data, file.type || 'image/jpeg', selectedDate);
      setQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'done' } : q));
    } catch (err) {
      setQueue(prev => prev.map(q => q.id === queueItem.id ? { ...q, status: 'error' } : q));
    }
  };

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    onProcessText(inputText, selectedDate);
    setInputText('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (files: File[]) => {
    const newItems: ProcessingItem[] = files.map((file, i) => ({
      id: `q-${Date.now()}-${i}`,
      name: file.name,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setQueue(prev => [...prev, ...newItems]);
    for (let i = 0; i < files.length; i++) {
      await handleSingleFileProcess(newItems[i], files[i]);
    }
    setTimeout(() => {
      setQueue(prev => prev.filter(q => q.status !== 'done'));
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      setMode('file');
      await processFiles(files);
    }
  };

  const handleUrlSubmit = async () => {
    if (!inputUrl.trim()) return;
    setIsFetchingUrl(true);
    try {
      const response = await fetch(inputUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        await onProcessImage(base64, blob.type || 'image/jpeg', selectedDate);
        setIsFetchingUrl(false);
        setInputUrl('');
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      alert('無法讀取圖片連結');
      setIsFetchingUrl(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date Selection Bar */}
      <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-between text-white">
        <div className="flex items-center gap-3 ml-2">
          <svg className="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-bold">叫貨日期設定</span>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-emerald-700 text-white text-sm font-bold px-3 py-1.5 rounded-xl border border-emerald-500 outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white p-5 md:p-6 rounded-3xl border-2 transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-2xl' : 'border-slate-200 shadow-sm'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-6 rounded-full ${isDragging ? 'bg-blue-500 animate-bounce' : 'bg-emerald-500'}`}></div>
            {isDragging ? '放開以匯入' : '匯入來源'}
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['file', 'text'].map((m) => (
              <button 
                key={m}
                onClick={() => setMode(m as InputMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
              >
                {m === 'file' ? '照片' : '文字'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="min-h-[140px] flex flex-col">
            {mode === 'file' && (
              <div className="animate-in fade-in duration-300">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="group relative overflow-hidden bg-white hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 active:scale-[0.96] w-full"
                >
                  <div className="bg-emerald-100 p-3 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="block text-base font-black text-slate-700">拖曳照片至此 或 點擊上傳</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      或直接 Ctrl + V 貼上 LINE 截圖
                    </span>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                </button>
              </div>
            )}

            {mode === 'text' && (
              <div className="animate-in fade-in duration-300 space-y-3">
                <textarea
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-400 outline-none resize-none text-slate-700 text-sm"
                  placeholder="可貼上 LINE 對話紀錄..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={isLoading || !inputText.trim()}
                  className="w-full bg-slate-800 hover:bg-black disabled:bg-slate-200 text-white font-bold py-3.5 rounded-2xl transition-all text-sm"
                >
                  匯入為 {selectedDate} 叫貨單
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700 animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-white text-[10px] font-bold uppercase tracking-wider mb-2">批次處理 ({queue.filter(q => q.status === 'done').length}/{queue.length})</h3>
          <div className="grid grid-cols-5 gap-2">
            {queue.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-900 group">
                <img src={item.preview} className={`w-full h-full object-cover ${item.status === 'processing' ? 'opacity-40' : 'opacity-80'}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.status === 'processing' && <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>}
                  {item.status === 'done' && <div className="bg-emerald-500 p-0.5 rounded-full"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputSection;
