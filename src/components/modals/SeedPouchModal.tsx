import React, { useState, useRef } from 'react';
import { SubjectId, Lesson } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { uploadMaterials } from '../../services/api';
import { PetalFlowerMark } from '../brand/PetalLogo';
import { Flower2, Sparkles, X, AlertCircle, Check, FileText } from 'lucide-react';

interface SeedPouchModalProps {
  subjectId: SubjectId;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (lessons: Lesson[]) => void;
}

interface UploadQueueItem {
  id: string;
  name: string;
  size: string;
  status: 'queued' | 'extracting' | 'grounding' | 'ready' | 'error';
  statusText: string;
}

export const SeedPouchModal: React.FC<SeedPouchModalProps> = ({
  subjectId,
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const subject = SUBJECTS[subjectId];

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setErrorMessage(null);
    setIsProcessing(true);

    const initialQueue: UploadQueueItem[] = fileArray.map((f, i) => ({
      id: `queue-${i}-${Date.now()}`,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      status: 'extracting',
      statusText: 'Extracting slide content...',
    }));
    setUploadQueue(initialQueue);

    try {
      // Step 1: Extracting
      await new Promise((r) => setTimeout(r, 400));
      setUploadQueue((q) =>
        q.map((item) => ({
          ...item,
          status: 'grounding',
          statusText: 'Grounding 3-tab study pages...',
        }))
      );

      // Step 2: Upload and process
      const createdLessons = await uploadMaterials(fileArray, subjectId);

      // Step 3: Complete
      setUploadQueue((q) =>
        q.map((item) => ({
          ...item,
          status: 'ready',
          statusText: 'Ready in Garden!',
        }))
      );

      await new Promise((r) => setTimeout(r, 600));
      setIsProcessing(false);
      onUploadComplete(createdLessons);
      onClose();
    } catch (err: any) {
      console.error('Seed planting error', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Could not plant seed. Please check your document.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3566]/35 backdrop-blur-md animate-fadeIn">
      {/* Seed Pouch Shape Container */}
      <div className="w-full max-w-lg rounded-organic-lg bg-[#FFF5E4] border-2 border-[#855627] shadow-[0_24px_55px_rgba(74,53,102,0.25)] p-7 relative overflow-hidden">
        {/* Decorative Top Pouch Ties */}
        <div className="absolute top-0 inset-x-0 h-4 bg-[#DFC29D] border-b border-[#855627] flex items-center justify-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#855627]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#855627]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#855627]" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#EAD7BA] hover:bg-[#DFC29D] text-[#855627] flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pt-2 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <PetalFlowerMark size={32} animate />
            <span className="text-[14px] font-display font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-[#E7DCFF] text-[#4A3566] border border-[#B196F5] inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF5FA2]" />
              Plant Seeds (Multi-Upload)
            </span>
          </div>
          <h3 className="text-3xl font-brand font-bold text-[#4B2A7B]">
            {subject.title}
          </h3>
          <p className="text-[17px] text-[#6C538C] font-body mt-1 leading-[1.6]">
            Drop one or several lecture decks. Each will bloom into its own permanent 3-tab Material page (Learn, Quiz, Visual).
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-[#FFD6E0] border border-[#F2A8BC] text-[#855627] text-[15px] font-body flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isProcessing ? (
          /* Multi-File Upload Queue Progress */
          <div className="py-6 px-4 rounded-organic-md bg-[#FFFDF9] border-2 border-[#E8D4B0] space-y-4">
            <div className="flex items-center justify-center gap-3 text-[#4B2A7B] font-brand font-bold text-lg mb-2">
              <PetalFlowerMark size={32} animate className="animate-spin" />
              <span>Cultivating {uploadQueue.length} Seed{uploadQueue.length > 1 ? 's' : ''}...</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FFF9F0] border border-[#EADBBF] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-[#855627] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-[#4A3566] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#855627]">{item.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'ready' ? (
                      <span className="flex items-center gap-1 text-xs font-display font-bold text-[#1F8C4F] bg-[#DBF5E7] px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-display font-semibold text-[#6C3FE0] bg-[#E7DCFF] px-2.5 py-1 rounded-full animate-pulse">
                        {item.statusText}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Seed Pouch Drag & Drop Zone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-3 border-dashed rounded-organic-md p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-[#9670F5] bg-[#E7DCFF]/50 scale-[1.02]'
                : 'border-[#855627]/40 hover:border-[#9670F5] bg-[#FFFDF9] hover:bg-[#FFFDF0]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {/* Seed Pouch Illustration Icon */}
            <div className="w-20 h-20 mx-auto mb-3 relative flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="w-18 h-18 animate-bob">
                <path
                  d="M20 30 C20 18, 60 18, 60 30 L65 65 C65 72, 15 72, 15 65 Z"
                  fill="#EAD7BA"
                  stroke="#855627"
                  strokeWidth="3.5"
                />
                <path d="M22 32 Q40 38 58 32" stroke="#855627" strokeWidth="3" />
                <circle cx="40" cy="35" r="4" fill="#F5A97D" stroke="#855627" strokeWidth="2" />
                <path d="M40 24 Q40 10 32 8" stroke="#1F8C4F" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M40 24 Q40 12 48 10" stroke="#1F8C4F" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            <h4 className="font-display font-bold text-[20px] text-[#4A3566] mb-1">
              Drop lecture slides or notes here
            </h4>
            <p className="text-[16px] text-[#6C538C] font-body mb-4">
              Upload single or multiple decks (PDF, PPTX, DOCX, TXT, MD)
            </p>

            <div className="flex items-center justify-center gap-2 text-[14px] font-display font-semibold text-[#855627]">
              <span className="px-3 py-1 rounded-xl bg-[#FFF5E4] border border-[#E8D4B0]">.pdf</span>
              <span className="px-3 py-1 rounded-xl bg-[#FFF5E4] border border-[#E8D4B0]">.pptx</span>
              <span className="px-3 py-1 rounded-xl bg-[#FFF5E4] border border-[#E8D4B0]">.docx</span>
              <span className="px-3 py-1 rounded-xl bg-[#FFF5E4] border border-[#E8D4B0]">.md</span>
            </div>
          </div>
        )}

        <p className="text-[13px] text-center text-[#9B83BA] font-body mt-4">
          🔒 Stored permanently in your dedicated database (~/PetalData). Never overwritten.
        </p>
      </div>
    </div>
  );
};
