import React, { useState, useEffect, useRef } from 'react';
import { Material, MaterialVisualEpisode, SubjectId } from '../../types';
import { ConceptAnimatorPlayer } from '../animator/ConceptAnimatorPlayer';
import { regenerateMaterial } from '../../services/api';
import {
  Play,
  Pause,
  RotateCcw,
  Film,
  Sparkles,
  RefreshCw,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Maximize2,
  Volume2,
} from 'lucide-react';

interface VisualTabProps {
  material: Material;
  subjectId: SubjectId;
  onRefreshMaterial: () => Promise<void>;
  reducedMotion?: boolean;
}

// Per-visual error boundary so one bad visual never crashes the other 7
class VisualCardErrorBoundary extends React.Component<
  { episodeTitle: string; onRetry: () => void; children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[VisualCardErrorBoundary Caught]', error, error?.stack, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-[28px] bg-[#FFF5F5] border-2 border-[#FEB2B2] shadow-storybook text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white border border-[#FC8181] flex items-center justify-center mx-auto shadow-2xs">
            <AlertTriangle className="w-6 h-6 text-[#C53030]" />
          </div>
          <h5 className="font-display font-bold text-[17px] text-[#742A2A]">
            Couldn't bloom visual: {this.props.episodeTitle}
          </h5>
          <p className="text-xs text-[#9B2C2C] font-mono max-w-sm mx-auto truncate">
            {this.state.error?.message || 'Animation rendering failed'}
          </p>
          <div className="pt-1">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onRetry();
              }}
              className="btn-storybook min-h-[38px] px-5 bg-white border-2 border-[#FEB2B2] text-[#C53030] text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs hover:bg-[#FFF0F0] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry this visual</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback HTML if episode lacks animationHtml
function getFallbackAnimationHtml(ep: MaterialVisualEpisode): string {
  const title = ep.sectionTitle || ep.title || 'Interactive Visual';
  const slides = ep.slidesRange || `Episode ${ep.episodeNumber}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #FFFDF9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #3B2252;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 12px 16px;
      user-select: none;
    }
    .header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6C3FE0;
      border-bottom: 1px solid #F2E8D8;
      padding-bottom: 6px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: #ECFDF5;
      color: #10B981;
      border-radius: 999px;
      border: 1px solid #A7F3D0;
      font-size: 10px;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: p 1.5s infinite; }
    @keyframes p { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .footer {
      background: #FFFFFF;
      border: 1px solid #EFE5D5;
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 11px;
      color: #6C538C;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <span>Episode ${ep.episodeNumber} • ${slides}</span>
    <span class="badge"><span class="dot"></span>Interactive Visual</span>
  </div>
  <div class="stage">
    <svg viewBox="0 0 480 180" width="100%" height="100%">
      <rect x="30" y="40" width="110" height="90" rx="14" fill="#F3ECFB" stroke="#B196F5" stroke-width="2"/>
      <text x="85" y="75" font-size="12" font-weight="bold" fill="#6C3FE0" text-anchor="middle">Input Layer</text>
      <text x="85" y="95" font-size="10" fill="#6C538C" text-anchor="middle">${slides}</text>

      <path d="M 140 85 L 220 85" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="4,4"/>
      <circle r="6" fill="#6C3FE0"><animateMotion path="M 140 85 L 220 85" dur="1.8s" repeatCount="indefinite"/></circle>

      <rect x="220" y="30" width="130" height="110" rx="16" fill="#FFF0B8" stroke="#F59E0B" stroke-width="2.5"/>
      <text x="285" y="75" font-size="12" font-weight="bold" fill="#B45309" text-anchor="middle">${title.slice(0, 18)}</text>
      <text x="285" y="95" font-size="10" fill="#855627" text-anchor="middle">Processing Trade-offs</text>

      <path d="M 350 85 L 410 85" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="4,4"/>
      <circle r="6" fill="#10B981"><animateMotion path="M 350 85 L 410 85" dur="1.8s" begin="0.9s" repeatCount="indefinite"/></circle>

      <rect x="410" y="40" width="60" height="90" rx="14" fill="#DBF5E7" stroke="#10B981" stroke-width="2"/>
      <text x="440" y="85" font-size="11" font-weight="bold" fill="#047857" text-anchor="middle">Output</text>
    </svg>
  </div>
  <div class="footer">
    ${ep.narration || `Visual simulation of ${title}`}
  </div>
  <script>
    window.addEventListener('message', function(e) {
      const svg = document.querySelector('svg');
      if (!svg) return;
      if (e.data === 'pause') svg.pauseAnimations();
      else if (e.data === 'play') svg.unpauseAnimations();
      else if (e.data === 'replay') { svg.setCurrentTime(0); svg.unpauseAnimations(); }
    });
  </script>
</body>
</html>`;
}

// Single Visual Episode Card with sandboxed iframe, Play/Pause/Replay toolbar, and auto-play
interface SingleVisualCardProps {
  episode: MaterialVisualEpisode;
  index: number;
  onOpenPlayer: (index: number) => void;
  onRegenerate: (episodeId: string) => void;
  isRegenerating: boolean;
  reducedMotion: boolean;
}

const SingleVisualCard: React.FC<SingleVisualCardProps> = ({
  episode,
  index,
  onOpenPlayer,
  onRegenerate,
  isRegenerating,
  reducedMotion,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false);

  const animationHtml = episode.animationHtml || getFallbackAnimationHtml(episode);

  // Send control message to iframe
  const sendIframeMessage = (cmd: 'play' | 'pause' | 'replay') => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(cmd, '*');
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      sendIframeMessage('pause');
      setIsPlaying(false);
    } else {
      sendIframeMessage('play');
      setIsPlaying(true);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendIframeMessage('replay');
    setIsPlaying(true);
  };

  // IntersectionObserver for auto-play when card scrolls into view
  useEffect(() => {
    if (reducedMotion || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && isIframeLoaded) {
            sendIframeMessage('play');
            setIsPlaying(true);
          } else if (!entry.isIntersecting && isIframeLoaded) {
            sendIframeMessage('pause');
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isIframeLoaded, reducedMotion]);

  return (
    <div
      ref={cardRef}
      className="p-5 sm:p-6 rounded-[28px] bg-[#FFFDF9] border-2 border-[#EADBBF] hover:border-[#D4A373] shadow-storybook transition-all flex flex-col justify-between space-y-4"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E7DCFF] text-[#6C3FE0] text-xs font-display font-bold">
              Episode {episode.episodeNumber}
            </span>
            <span className="text-xs font-mono font-medium text-[#855627] bg-[#FFF0B8] px-2 py-0.5 rounded-full border border-[#E6CB67]/50">
              {episode.slidesRange || `Slide ${index + 1}`}
            </span>
          </div>

          <h4 className="font-display font-bold text-[18px] sm:text-[19px] text-[#3B2252] leading-snug">
            {episode.sectionTitle || episode.title}
          </h4>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPlayer(index);
            }}
            className="w-9 h-9 rounded-full bg-[#FAF5FF] hover:bg-[#EBE0F8] border border-[#D8C7F5] flex items-center justify-center text-[#6C3FE0] transition-colors shadow-2xs"
            title="Open in Storyboard Director Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(episode.id);
            }}
            disabled={isRegenerating}
            className="w-9 h-9 rounded-full bg-[#FFF5E4] hover:bg-[#EFE2CC] border border-[#EADBBF] flex items-center justify-center text-[#855627] transition-colors shadow-2xs disabled:opacity-50"
            title="Regenerate this visual"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-[#9670F5]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sandboxed Interactive Animated Iframe */}
      <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl overflow-hidden border-2 border-[#EADBBF] bg-white shadow-inner">
        {isRegenerating && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-xs font-display font-bold text-[#6C3FE0]">
            <Loader2 className="w-6 h-6 animate-spin text-[#6C3FE0]" />
            <span>Regenerating Visual Episode...</span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          srcDoc={animationHtml}
          sandbox="allow-scripts"
          title={`Animated Visual: ${episode.sectionTitle}`}
          onLoad={() => setIsIframeLoaded(true)}
          className="w-full h-full border-0 pointer-events-auto"
        />

        {/* Visible Play / Pause / Replay Toolbar overlay */}
        <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-[#FFFDF9]/95 backdrop-blur-xs p-1 px-2 rounded-xl border border-[#EADBBF] shadow-sm">
          <button
            onClick={togglePlay}
            className="p-1 rounded-lg hover:bg-[#F3ECFB] text-[#6C3FE0] transition-colors flex items-center gap-1 text-[11px] font-display font-bold"
            title={isPlaying ? 'Pause animation' : 'Play animation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-[#6C3FE0]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-[#6C3FE0]" />
                <span>Play</span>
              </>
            )}
          </button>

          <span className="w-px h-3 bg-[#EADBBF]" />

          <button
            onClick={handleReplay}
            className="p-1 rounded-lg hover:bg-[#FAF5FF] text-[#855627] transition-colors flex items-center gap-1 text-[11px] font-display font-bold"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Episode Metadata & Story Hook */}
      <div className="space-y-2 text-xs font-body text-[#6C538C] pt-1">
        <p className="line-clamp-2 leading-relaxed">
          {episode.narration}
        </p>
        <div className="flex items-center justify-between text-[11px] font-display font-bold text-[#855627] border-t border-[#F2E8D8] pt-2">
          <span>🏷️ {episode.takeawayProp || episode.slidesRange}</span>
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-[#855627]" />
            {episode.durationSeconds || 24}s
          </span>
        </div>
      </div>
    </div>
  );
};

export const VisualTab: React.FC<VisualTabProps> = ({
  material,
  subjectId,
  onRefreshMaterial,
  reducedMotion = false,
}) => {
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState<number | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [regeneratingEpisodeId, setRegeneratingEpisodeId] = useState<string | null>(null);
  const [isRegeneratingAll, setIsRegeneratingAll] = useState<boolean>(false);

  const episodes: MaterialVisualEpisode[] = Array.isArray(material.visualEpisodes)
    ? material.visualEpisodes
    : [];

  const totalDuration = episodes.reduce((acc, ep) => acc + (ep.durationSeconds || 24), 0);

  const handleOpenPlayer = (idx: number) => {
    if (episodes.length === 0) return;
    setActiveEpisodeIdx(idx);
    setIsPlayerOpen(true);
  };

  const handlePlayAll = () => {
    if (episodes.length === 0) return;
    setActiveEpisodeIdx(0);
    setIsPlayerOpen(true);
  };

  const handleRegenerateAllVisual = async () => {
    setIsRegeneratingAll(true);
    try {
      await regenerateMaterial(material.id, 'visual');
      await onRefreshMaterial();
    } catch (e) {
      console.error('Visual regenerate failed:', e);
    } finally {
      setIsRegeneratingAll(false);
    }
  };

  const handleRegenerateSingle = async (episodeId: string) => {
    setRegeneratingEpisodeId(episodeId);
    try {
      await regenerateMaterial(material.id, 'visual');
      await onRefreshMaterial();
    } catch (e) {
      console.error('Single visual regenerate failed:', e);
    } finally {
      setRegeneratingEpisodeId(null);
    }
  };

  // -------------------------------------------------------------
  // EXPLICIT STATES: QUEUED, PROCESSING, FAILED, EMPTY
  // -------------------------------------------------------------

  if (material.visualStatus === 'queued') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#FFF0B8] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md animate-pulse">
            <Film className="w-9 h-9 text-[#855627]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#855627] inline-block shadow-2xs">
            Visual Studio Queued 🎨
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Story Episodes in Queue
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Directing animated story episodes and interactive architecture diagrams for this lecture. Production will begin shortly...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-display font-bold text-[#855627] pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#855627]" />
            <span>Connecting with garden engine...</span>
          </div>
        </div>
      </div>
    );
  }

  if (material.visualStatus === 'processing') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#FFF0B8] border-2 border-[#F5A97D] shadow-storybook space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md">
            <Loader2 className="w-10 h-10 text-[#855627] animate-spin" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#F5A97D] text-[15px] font-display font-bold text-[#855627] inline-block shadow-2xs">
            Directing Episodes 🎨
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            Staging Animated Story Episodes
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] max-w-md mx-auto leading-relaxed">
            Illustrating stages and rendering interactive animated diagrams for each section of your deck.
          </p>
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="relative w-full h-3 rounded-full bg-[#EAD7BA] p-0.5 border border-[#855627]/30 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-500 animate-pulse"
                style={{
                  width: '75%',
                  background: 'linear-gradient(90deg, #F5A97D 0%, #FFD6E0 50%, #9670F5 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (material.visualStatus === 'failed') {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-[#FFF5F5] border-2 border-[#FEB2B2] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-white border-2 border-[#FC8181] flex items-center justify-center shadow-md">
            <AlertTriangle className="w-10 h-10 text-[#C53030]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#FEB2B2] text-[15px] font-display font-bold text-[#C53030] inline-block shadow-2xs">
            Visual Story Issue 🥀
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#742A2A]">
            Couldn't produce story episodes
          </h3>
          <p className="text-[17px] font-body text-[#742A2A] leading-relaxed max-w-lg mx-auto">
            We couldn't generate the visual story episodes for this deck. Tap below to retry production.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRegenerateAllVisual}
              disabled={isRegeneratingAll}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#DBF5E7] to-[#FFF0B8] border-2 border-[#83D9A7] text-[#1F8C4F] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRegeneratingAll ? 'animate-spin' : ''}`} />
              <span>{isRegeneratingAll ? 'Retrying Production...' : 'Retry Episodes Generation'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (material.visualStatus === 'empty' || episodes.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fadeIn">
        <div className="p-8 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#FFF9F0] via-[#FFFDF9] to-[#FFF0B8] border-2 border-[#EADBBF] shadow-storybook space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF0B8] border-2 border-[#E6CB67] flex items-center justify-center shadow-md">
            <Film className="w-9 h-9 text-[#855627]" />
          </div>
          <span className="px-4 py-1.5 rounded-full bg-white border border-[#EADBBF] text-[15px] font-display font-bold text-[#855627] inline-block shadow-2xs">
            Visual Story Episodes 🎭
          </span>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            No Story Episodes Yet
          </h3>
          <p className="text-[17px] font-body text-[#6C538C] leading-relaxed max-w-lg mx-auto">
            Bring this lecture to life with animated interactive episodes and diagrams explaining each concept step by step.
          </p>
          <div className="pt-2">
            <button
              onClick={handleRegenerateAllVisual}
              disabled={isRegeneratingAll}
              className="btn-storybook min-h-[48px] px-6 bg-gradient-to-r from-[#D9C8FF] via-[#FFD6E0] to-[#FFF0B8] border-2 border-[#B196F5] text-[#4A3566] text-[16px] font-bold shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isRegeneratingAll ? 'Directing Episodes...' : 'Generate Visual Episodes'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safe storyboard construction for modal director player
  const currentEpisode = activeEpisodeIdx !== null ? episodes[activeEpisodeIdx] : episodes[0];
  const safeSourceSlide = currentEpisode?.slidesRange
    ? parseInt(String(currentEpisode.slidesRange).match(/\d+/)?.[0] || '1', 10)
    : 1;

  const activeStoryboard: any = currentEpisode
    ? {
        conceptId: currentEpisode.id,
        subjectId,
        conceptTitle: `Episode ${currentEpisode.episodeNumber}: ${currentEpisode.sectionTitle || currentEpisode.title}`,
        sourceSlide: safeSourceSlide,
        totalDuration: currentEpisode.durationSeconds || 24,
        scenes: currentEpisode.scenes && currentEpisode.scenes.length > 0
          ? currentEpisode.scenes.map((sc: any, sIdx: number) => ({
              ...sc,
              background: currentEpisode.thumbnailType || 'meadow',
              actors: [{ id: subjectId === 'pm2' ? 'fairy' : 'owl', position: 'center', scale: 1 }],
              beats: [
                { t: 0.5, actor: subjectId === 'pm2' ? 'fairy' : 'owl', action: 'wave', say: sc.title || 'Welcome!' },
                { t: 3.5, actor: subjectId === 'pm2' ? 'fairy' : 'owl', action: 'point', say: sc.narration || '' },
              ],
              caption: sc.narration || sc.title,
              takeaway_prop: currentEpisode.slidesRange,
              data: {
                badge: currentEpisode.sectionTitle || currentEpisode.title,
                subheadline: currentEpisode.slidesRange,
                headline: sc.title,
                speechBubble: sc.narration,
              },
            }))
          : [
              currentEpisode.directorScene || {
                background: 'meadow',
                actors: [{ id: subjectId === 'pm2' ? 'fairy' : 'owl', position: 'center', scale: 1 }],
                beats: [{ t: 0.5, actor: subjectId === 'pm2' ? 'fairy' : 'owl', action: 'wave', say: 'Welcome!' }],
                caption: currentEpisode.narration,
                data: {
                  badge: currentEpisode.sectionTitle,
                  subheadline: currentEpisode.slidesRange,
                  headline: currentEpisode.sectionTitle,
                  speechBubble: currentEpisode.narration,
                },
              },
            ],
        inRealLifeBridge: currentEpisode.inRealLifeBridge,
        generatedAt: new Date().toISOString(),
      }
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 space-y-8 animate-fadeIn pb-16">
      {/* Top Banner: Mini-Series Overview & "Play All" Button */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#F4EFFF] via-[#FFFDF9] to-[#FFF0B8] border-2 border-[#D4A373] shadow-storybook flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EADBBF] text-xs font-display font-bold text-[#6C3FE0]">
            <Film className="w-3.5 h-3.5 text-[#6C3FE0]" />
            <span>Interactive Animated Series ({episodes.length} Episodes)</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#4A3566]">
            {material.title} Visual Studio
          </h3>

          <p className="text-[16px] font-body text-[#6C538C] leading-relaxed">
            {episodes.length} animated interactive episodes • {Math.round(totalDuration / 60)} mins total runtime. Visualizing architecture, packet flows, and engineering trade-offs.
          </p>
        </div>

        <button
          onClick={handlePlayAll}
          className="btn-storybook min-h-[52px] px-7 bg-gradient-to-r from-[#D9C8FF] via-[#FFD6E0] to-[#FFF0B8] border-2 border-[#B196F5] text-[#4A3566] text-[17px] font-display font-bold shadow-storybook-hover hover:scale-105 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-[#4A3566]" />
          <span>Play Full Series ▶</span>
        </button>
      </div>

      {/* Episode Cards Grid - Each wrapped in its own Error Boundary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[20px] font-display font-bold text-[#4A3566] flex items-center gap-2">
            <span>Episodes in this deck</span>
            <span className="text-sm font-semibold text-[#855627] font-body">
              ({episodes.length} episodes)
            </span>
          </h4>
          <span className="text-xs font-display font-semibold text-[#855627] hidden sm:inline">
            Auto-plays when scrolled into view
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {episodes.map((ep, idx) => (
            <VisualCardErrorBoundary
              key={ep.id || idx}
              episodeTitle={ep.sectionTitle || ep.title || `Episode ${idx + 1}`}
              onRetry={() => handleRegenerateSingle(ep.id)}
            >
              <SingleVisualCard
                episode={ep}
                index={idx}
                onOpenPlayer={handleOpenPlayer}
                onRegenerate={handleRegenerateSingle}
                isRegenerating={regeneratingEpisodeId === ep.id}
                reducedMotion={reducedMotion}
              />
            </VisualCardErrorBoundary>
          ))}
        </div>
      </div>

      {/* Full Storyboard Modal Player */}
      {isPlayerOpen && activeStoryboard && (
        <ConceptAnimatorPlayer
          storyboard={activeStoryboard}
          subjectId={subjectId}
          onClose={() => setIsPlayerOpen(false)}
          onBloomConcept={() => setIsPlayerOpen(false)}
          onRegenerate={async () => {
            if (activeEpisodeIdx !== null && episodes[activeEpisodeIdx]) {
              await handleRegenerateSingle(episodes[activeEpisodeIdx].id);
            }
          }}
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
};
