import React, { useState, useRef } from 'react';
import { SubjectId, Lesson } from '../../types';
import { SUBJECTS } from '../../utils/subjects';
import { parseUploadedFile } from '../../services/parser';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, X, Loader2 } from 'lucide-react';

interface UploadSeedModalProps {
  subjectId: SubjectId;
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: (lesson: Lesson) => void;
}

export const UploadSeedModal: React.FC<UploadSeedModalProps> = ({
  subjectId,
  isOpen,
  onClose,
  onLessonCreated,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const subject = SUBJECTS[subjectId];

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      setProgressStep('Reading slide and document structure...');
      await new Promise((r) => setTimeout(r, 400));

      setProgressStep('Extracting key principles & slide references...');
      const lesson = await parseUploadedFile(file, subjectId);

      setProgressStep('Grounding AI Tutor on your syllabus...');
      await new Promise((r) => setTimeout(r, 500));

      setIsProcessing(false);
      onLessonCreated(lesson);
      onClose();
    } catch (err: any) {
      console.error('File parse error', err);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Could not parse document. Please check the file format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/30 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card rounded-4xl p-6 sm:p-8 max-w-lg w-full shadow-garden-xl border border-white relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-garden-mist hover:bg-garden-sand flex items-center justify-center text-plum-medium hover:text-plum-dark transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold mb-2 bg-pm-soft text-pm-deep">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plant a New Seed</span>
          </div>
          <h3 className="text-2xl font-display font-semibold text-plum-dark">
            Upload for {subject.title}
          </h3>
          <p className="text-xs sm:text-sm text-plum-medium font-body mt-1">
            Drag in your lecture slides, notes, or case studies. Petal parses them strictly for your private learning.
          </p>
        </div>

        {/* Error notice if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dropzone */}
        {!isProcessing ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-pm-accent bg-pm-soft/60 scale-[1.01]'
                : 'border-garden-sand hover:border-pm-pastel bg-garden-ivory/50 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.pptx,.ppt,.docx,.doc,.txt,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-garden-sand">
              <Upload className="w-8 h-8 text-pm-accent animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <h4 className="font-display font-semibold text-sm text-plum-dark mb-1">
              Drop lecture slides or syllabus notes here
            </h4>
            <p className="text-xs text-plum-light font-body mb-4">
              or browse from your laptop (PDF, PPTX, DOCX, TXT, MD)
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] font-display text-plum-medium">
              <span className="px-2 py-0.5 rounded-lg bg-white border border-garden-sand">.pdf</span>
              <span className="px-2 py-0.5 rounded-lg bg-white border border-garden-sand">.pptx</span>
              <span className="px-2 py-0.5 rounded-lg bg-white border border-garden-sand">.docx</span>
              <span className="px-2 py-0.5 rounded-lg bg-white border border-garden-sand">.md</span>
            </div>
          </div>
        ) : (
          /* Processing State with Enchanted Garden Feedback */
          <div className="py-12 px-6 rounded-3xl bg-garden-ivory/70 border border-garden-sand text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-pm-soft flex items-center justify-center border border-pm-pastel">
              <Loader2 className="w-7 h-7 text-pm-deep animate-spin" />
            </div>
            <h4 className="font-display font-semibold text-base text-plum-dark mb-1">
              Nurturing your seed...
            </h4>
            <p className="text-xs text-plum-medium font-body animate-pulse">
              {progressStep}
            </p>
          </div>
        )}

        {/* Quiet Privacy Note */}
        <p className="text-[11px] text-center text-plum-light mt-4 font-body">
          🔒 Private & grounded. Stored locally in your browser. Never fed into training pools.
        </p>
      </div>
    </div>
  );
};
