
import React, { useState, useRef } from 'react';

interface InputSectionProps {
  onProcessText: (text: string) => void;
  onProcessImage: (data: string, mimeType: string) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onProcessText, onProcessImage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{data: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    onProcessText(inputText);
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      const data = base64.split(',')[1];
      setPendingImage({ data, type: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleStartAnalysis = () => {
    if (pendingImage) {
      onProcessImage(pendingImage.data, pendingImage.type);
      setPendingImage(null);
      setPreviewImage(null);
    }
  };

  const cancelPreview = () => {
    setPreviewImage(null);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
        匯入出貨單 / 較貨單
      </h2>
      
      <div className="flex flex-col gap-4">
        {previewImage ? (
          /* Image Preview Mode */
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[4/3] flex items-center justify-center">
            <img src={previewImage} alt="Preview" className="max-h-full object-contain" />
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end p-4">
              <div className="flex gap-2 w-full">
                <button
                  onClick={cancelPreview}
                  disabled={isLoading}
                  className="flex-1 bg-white/90 backdrop-blur text-slate-700 font-bold py-3 rounded-xl active:scale-95 transition-all text-sm"
                >
                  重新選取
                </button>
                <button
                  onClick={handleStartAnalysis}
                  disabled={isLoading}
                  className="flex-[2] bg-emerald-600 text-white font-bold py-3 rounded-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : "開始 AI 辨識"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Input Mode */
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="group relative overflow-hidden bg-white hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 active:scale-[0.96]"
            >
              <div className="bg-emerald-100 p-4 rounded-full group-hover:bg-emerald-200 transition-colors">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-center">
                <span className="block text-lg font-black text-slate-700">匯入單據照片</span>
                <span className="text-xs text-slate-400 font-medium">點擊拍照或從相簿選取出貨單</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-300 font-bold tracking-widest">或分析 LINE 文字</span>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none text-slate-700 placeholder:text-slate-400 text-sm"
                placeholder="貼上 LINE 叫貨內容..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                onClick={handleTextSubmit}
                disabled={isLoading || !inputText.trim()}
                className="w-full bg-slate-800 hover:bg-black disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
              >
                {isLoading ? "處理中..." : "分析文字訊息"}
              </button>
            </div>
          </>
        )}
      </div>
      
      {!previewImage && (
        <div className="mt-4 flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-[11px] text-blue-700 leading-tight">
            <strong>拍攝建議：</strong> 將單據平放，手機垂直對準表格中心拍攝。即使是手寫的數量單位，AI 也能精確辨識。
          </p>
        </div>
      )}
    </div>
  );
};

export default InputSection;
