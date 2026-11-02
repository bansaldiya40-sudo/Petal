import React, { useState, useEffect } from 'react';
import { Flower2, Sparkles, Wand2, TreePine, Star, X, Volume2, VolumeX, Download, Upload, Database, CheckCircle2, AlertCircle, Loader2, Key, RefreshCw, Flame } from 'lucide-react';
import { AppSettings, exportBackupUrl, importBackupFile, fetchDataStorageInfo, triggerManualBackup, DataStorageInfo, testAiConnection, checkVideoModel } from '../../services/api';
import { PetalLogo } from '../brand/PetalLogo';

interface TopNavProps {
  currentScreen: 'home' | 'subject' | 'lesson' | 'quiz' | 'progress' | 'design-system';
  onNavigate: (screen: 'home' | 'progress' | 'design-system') => void;
  streak: number;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  onNavigate,
  streak,
  settings,
  onUpdateSettings,
  onResetData,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [dataInfo, setDataInfo] = useState<DataStorageInfo | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ connected: boolean; model?: string; error?: string } | null>(null);
  const [isReplacingGeminiKey, setIsReplacingGeminiKey] = useState(false);
  const [isReplacingClaudeKey, setIsReplacingClaudeKey] = useState(false);
  const [checkingVideoModel, setCheckingVideoModel] = useState(false);
  const [videoModelResult, setVideoModelResult] = useState<{ exists: boolean; message: string } | null>(null);

  useEffect(() => {
    if (showSettingsModal) {
      setLocalSettings(settings);
      setIsReplacingGeminiKey(false);
      setIsReplacingClaudeKey(false);
      setAiTestResult(null);
      setVideoModelResult(null);
      fetchDataStorageInfo().then(setDataInfo);
    }
  }, [showSettingsModal, settings]);

  const handleTestAi = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    const res = await testAiConnection(localSettings.llmProvider);
    setTestingAi(false);
    setAiTestResult(res);
  };

  const handleCheckVideoModel = async () => {
    setCheckingVideoModel(true);
    setVideoModelResult(null);
    const res = await checkVideoModel(localSettings.videoModel || 'veo-2.0-generate-001');
    setCheckingVideoModel(false);
    setVideoModelResult(res);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setShowSettingsModal(false);
  };

  return (
    <>
      <nav className="w-full max-w-7xl mx-auto pt-4 px-6 sm:px-10 flex items-center justify-between relative z-40">
        {/* Brand Petal Logo on the Left */}
        <button
          onClick={() => onNavigate('home')}
          className="focus:outline-none transition-transform hover:scale-105 active:scale-95"
          aria-label="Petal Home"
        >
          <PetalLogo variant="header" animate />
        </button>

        {/* Colourful Sticker-Style Icon Buttons with Tooltips on the Right */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sticker 1: Living Meadow / Progress Garden */}
          <div className="relative group">
            <button
              onClick={() => onNavigate('progress')}
              className={`min-h-[44px] px-3.5 rounded-full border-[2.5px] border-[#4B2A7B] font-display font-extrabold text-sm transition-all duration-200 flex items-center gap-2 shadow-[0_4px_0_#4B2A7B] hover:shadow-[0_2px_0_#4B2A7B] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none ${
                currentScreen === 'progress'
                  ? 'bg-[#7BE0A8] text-[#155E38]'
                  : 'bg-[#CFF2E0] hover:bg-[#AEE9C7] text-[#1F8C4F]'
              }`}
              aria-label="Living Meadow Progress"
            >
              <TreePine className="w-4 h-4 text-[#1F8C4F]" />
              <span className="hidden sm:inline">Garden</span>
            </button>
            {/* Tooltip */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-[#4B2A7B] text-white text-[11px] font-display font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
              Living Meadow Garden
            </span>
          </div>

          {/* Sticker 2: Daily Learning Streak */}
          <div className="relative group">
            <div
              className="min-h-[44px] px-3.5 rounded-full bg-[#FFC93C] border-[2.5px] border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <Flame className="w-4 h-4 text-[#E65100] fill-[#FF9800]" />
              <span className="font-brand font-black text-sm text-[#4B2A7B]">
                {streak}d
              </span>
            </div>
            {/* Tooltip */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-[#4B2A7B] text-white text-[11px] font-display font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
              {streak} Day Study Streak 🌸
            </span>
          </div>

          {/* Sticker 3: Settings & AI Key Drawer */}
          <div className="relative group">
            <button
              onClick={() => {
                setLocalSettings(settings);
                setShowSettingsModal(true);
              }}
              className="w-11 h-11 rounded-full bg-[#D9C8FF] hover:bg-[#C4AEFF] border-[2.5px] border-[#4B2A7B] shadow-[0_4px_0_#4B2A7B] hover:shadow-[0_2px_0_#4B2A7B] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none flex items-center justify-center transition-all duration-200"
              aria-label="Garden Settings"
            >
              <Wand2 className="w-5 h-5 text-[#4B2A7B]" />
            </button>
            {/* Tooltip */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl bg-[#4B2A7B] text-white text-[11px] font-display font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
              Garden Settings & AI Keys
            </span>
          </div>
        </div>
      </nav>

      {/* Settings Modal (Hand-drawn Storybook dialog) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3566]/25 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-organic-md bg-[#FFF5E4] border-2 border-[#855627] shadow-[0_20px_45px_rgba(74,53,102,0.22)] p-6 sm:p-7 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8D4B0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9670F5]" />
                <h3 className="font-display font-bold text-lg text-[#4A3566]">
                  Garden Sanctuary Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-7 h-7 rounded-full bg-[#EAD7BA] hover:bg-[#DFC29D] text-[#855627] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-body text-[#4A3566]">
              {/* Student Name */}
              <div>
                <label className="block font-display font-semibold text-sm mb-1 text-[#4A3566]">
                  Your Name
                </label>
                <input
                  type="text"
                  value={localSettings.userName || 'Diya'}
                  onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
                  placeholder="Diya"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-[15px] font-display font-bold text-[#4A3566] focus:outline-none focus:border-[#9670F5]"
                />
              </div>

              {/* Intelligence Provider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-display font-semibold text-xs text-[#4A3566]">
                    AI Tutor Engine
                  </label>
                  <button
                    type="button"
                    onClick={handleTestAi}
                    disabled={testingAi}
                    className="px-2.5 py-1 rounded-xl bg-[#EFE7FD] hover:bg-[#E3D3FB] text-[#6C3FE0] border border-[#CBB3F7] font-display font-semibold text-[11px] flex items-center gap-1 transition-all"
                  >
                    {testingAi ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Test connection</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-1.5">
                  {(['gemini', 'claude'] as const).map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, llmProvider: prov })}
                      className={`py-2 px-3 rounded-2xl font-display text-xs capitalize transition-all border-2 ${
                        localSettings.llmProvider === prov
                          ? 'bg-[#E7DCFF] text-[#6C3FE0] border-[#9670F5] font-bold shadow-sm'
                          : 'bg-[#FFFDF9] text-[#6C538C] border-[#E8D4B0] hover:border-[#B196F5]'
                      }`}
                    >
                      {prov === 'gemini' ? 'Google Gemini' : 'Anthropic Claude'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#7C5A99] leading-tight mb-2">
                  Petal uses real AI intelligence for all study explanations, quizzes, and visual stories. Template filler is disabled.
                </p>

                {/* Connection Status Badge */}
                {aiTestResult && (
                  <div className="mb-2">
                    {aiTestResult.connected ? (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-[#EAF7EE] border border-[#9EE2B3] text-[#1D7A44]">
                        <CheckCircle2 className="w-4 h-4 text-[#2E9B57] shrink-0" />
                        <span className="font-display font-bold text-xs">
                          Connected ({aiTestResult.model})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 p-2 rounded-xl bg-[#FDECEE] border border-[#F5B4BE] text-[#B32638]">
                        <AlertCircle className="w-4 h-4 text-[#D9384D] shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-snug">
                          <strong>Connection failed:</strong> {aiTestResult.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* API Keys (Stored on backend only) */}
              {localSettings.llmProvider === 'gemini' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-display font-semibold text-xs text-[#4A3566]">
                      Google Gemini API Key
                    </label>
                    {localSettings.hasGeminiKey && !isReplacingGeminiKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacingGeminiKey(true);
                          setLocalSettings({ ...localSettings, geminiKey: '' });
                        }}
                        className="text-[#6C3FE0] hover:underline font-display text-[11px] flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Replace key
                      </button>
                    )}
                  </div>

                  {localSettings.hasGeminiKey && !isReplacingGeminiKey ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value="••••••••••••••••••••••••••••••••"
                        disabled
                        className="w-full px-3 py-2 rounded-xl border border-[#E8D4B0] bg-[#F7F2EA] text-xs font-mono text-[#8C7A68] cursor-not-allowed"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="password"
                        placeholder="Paste your Gemini API key (AQ... or AIza...)"
                        value={localSettings.geminiKey || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, geminiKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                      />
                      {isReplacingGeminiKey && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsReplacingGeminiKey(false);
                              setLocalSettings({ ...localSettings, geminiKey: undefined });
                            }}
                            className="text-[#855627] text-[11px] hover:underline"
                          >
                            Cancel replacement
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-[#8C7A68] block mt-1">
                    Stored on backend only in ~/PetalData/secrets.json. Never saved in browser storage.
                  </span>
                </div>
              )}

              {localSettings.llmProvider === 'claude' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-display font-semibold text-xs text-[#4A3566]">
                      Anthropic Claude API Key
                    </label>
                    {localSettings.hasClaudeKey && !isReplacingClaudeKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsReplacingClaudeKey(true);
                          setLocalSettings({ ...localSettings, claudeKey: '' });
                        }}
                        className="text-[#6C3FE0] hover:underline font-display text-[11px] flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Replace key
                      </button>
                    )}
                  </div>

                  {localSettings.hasClaudeKey && !isReplacingClaudeKey ? (
                    <input
                      type="password"
                      value="••••••••••••••••••••••••••••••••"
                      disabled
                      className="w-full px-3 py-2 rounded-xl border border-[#E8D4B0] bg-[#F7F2EA] text-xs font-mono text-[#8C7A68] cursor-not-allowed"
                    />
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={localSettings.claudeKey || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, claudeKey: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                      />
                      {isReplacingClaudeKey && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setIsReplacingClaudeKey(false);
                              setLocalSettings({ ...localSettings, claudeKey: undefined });
                            }}
                            className="text-[#855627] text-[11px] hover:underline"
                          >
                            Cancel replacement
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-[#8C7A68] block mt-1">
                    Stored on backend only in ~/PetalData/secrets.json.
                  </span>
                </div>
              )}

              {/* AI Video Provider & Spend Cap */}
              <div className="pt-2 border-t border-[#E8D4B0] space-y-2">
                <span className="font-display font-semibold text-xs text-[#4A3566] block">
                  AI Video Provider (Google Veo / Gemini)
                </span>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-mono text-[#855627]">
                      Video Model Name
                    </label>
                    <button
                      type="button"
                      onClick={handleCheckVideoModel}
                      disabled={checkingVideoModel}
                      className="text-[#6C3FE0] hover:underline font-display text-[11px] flex items-center gap-1 font-semibold"
                    >
                      {checkingVideoModel ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Check model
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list="video-model-options"
                      placeholder="veo-2.0-generate-001"
                      value={localSettings.videoModel || 'veo-2.0-generate-001'}
                      onChange={(e) => setLocalSettings({ ...localSettings, videoModel: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                    />
                    <datalist id="video-model-options">
                      <option value="veo-2.0-generate-001" />
                      <option value="veo-3.0-generate-preview" />
                      <option value="gemini-2.0-flash" />
                      <option value="gemini-3.5-flash" />
                    </datalist>
                  </div>
                  {videoModelResult && (
                    <div className={`mt-1 text-[11px] px-2 py-0.5 rounded border ${
                      videoModelResult.exists
                        ? 'bg-[#EAF7EE] border-[#9EE2B3] text-[#1D7A44]'
                        : 'bg-[#FFF7E6] border-[#F2D18D] text-[#8C5D08]'
                    }`}>
                      {videoModelResult.message}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#855627] mb-0.5">
                    Video API Key (Leave blank to use free in-app animator)
                  </label>
                  <input
                    type="password"
                    placeholder="Optional Video API Key"
                    value={localSettings.videoApiKey || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, videoApiKey: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-[#855627] mb-0.5">
                      Daily Spend Cap ($)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      value={localSettings.dailySpendCapUsd ?? 5.0}
                      onChange={(e) => setLocalSettings({ ...localSettings, dailySpendCapUsd: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-[#855627] mb-0.5">
                      Price / Second ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={localSettings.pricePerSecondUsd ?? 0.05}
                      onChange={(e) => setLocalSettings({ ...localSettings, pricePerSecondUsd: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E8D4B0] bg-[#FFFDF9] text-xs font-mono focus:outline-none focus:border-[#9670F5]"
                    />
                  </div>
                </div>
              </div>

              {/* Sound & Motion Toggles (Calm Narration consolidated to 1 toggle) */}
              <div className="pt-2 border-t border-[#E8D4B0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-xs">
                    Calm Narration (Web Speech)
                  </span>
                  <input
                    type="checkbox"
                    checked={localSettings.speechVoiceEnabled}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, speechVoiceEnabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9670F5] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-xs">
                    Soft Chime on Completion (Off by default)
                  </span>
                  <input
                    type="checkbox"
                    checked={localSettings.soundEffects || false}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, soundEffects: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9670F5] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-xs">
                    Reduce Motion
                  </span>
                  <input
                    type="checkbox"
                    checked={localSettings.reducedMotion || false}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, reducedMotion: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9670F5] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Single Consolidated Data & Backup Section */}
              <div className="pt-3 border-t border-[#E8D4B0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-[#4A3566]">
                    Data & Backup Storage
                  </span>
                  <span
                    className="text-[11px] font-mono text-[#855627] bg-[#FFFBF4] px-2 py-0.5 rounded border border-[#E8D4B0] truncate max-w-[210px]"
                    title={dataInfo?.dataDir || '~/PetalData'}
                  >
                    {dataInfo?.dataDir || '~/PetalData'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6C538C]">
                  <span>Saved Materials: <strong>{dataInfo?.totalMaterials ?? '...'}</strong></span>
                  <span>Last backup: <strong>{dataInfo?.lastBackup ? dataInfo.lastBackup.slice(0, 24) : 'None yet'}</strong></span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      setBackupMessage('Backing up...');
                      const res = await triggerManualBackup();
                      if (res.success) {
                        setBackupMessage('✓ Backed up!');
                        fetchDataStorageInfo().then(setDataInfo);
                        setTimeout(() => setBackupMessage(null), 2500);
                      } else {
                        setBackupMessage('Failed');
                      }
                    }}
                    className="py-2 px-2.5 rounded-2xl bg-[#FFF9F0] border border-[#EADBBF] hover:border-[#855627] font-display text-[11px] font-bold text-center flex items-center justify-center gap-1 text-[#4A3566]"
                  >
                    <Database className="w-3.5 h-3.5 text-[#855627]" />
                    <span>{backupMessage || 'Back up now'}</span>
                  </button>

                  <a
                    href={exportBackupUrl()}
                    download
                    className="py-2 px-2.5 rounded-2xl bg-[#FFF9F0] border border-[#EADBBF] hover:border-[#855627] font-display text-[11px] font-bold text-center flex items-center justify-center gap-1 text-[#4A3566]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#855627]" />
                    <span>Export all</span>
                  </a>

                  <label className="py-2 px-2.5 rounded-2xl bg-[#FFF9F0] border border-[#EADBBF] hover:border-[#855627] font-display text-[11px] font-bold text-center flex items-center justify-center gap-1 text-[#4A3566] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#855627]" />
                    <span>Import</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        if (e.target.files?.[0]) {
                          await importBackupFile(e.target.files[0]);
                          window.location.reload();
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <p className="text-[10px] text-[#9B83BA] italic text-center pt-1">
                  Backups and exports NEVER include API keys or secrets. Deletions are only ever performed individually per material with confirmation.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 font-display text-xs text-[#6C538C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="btn-storybook bg-gradient-to-r from-[#D9C8FF] to-[#FFD6E0] border-2 border-[#B196F5] text-[#4A3566] text-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
