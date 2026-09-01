import React, { useState, useEffect, useRef } from 'react';
import { soundFx, MUSIC_PRESETS } from '../utils/soundEffects';

interface MusicPlayerBarProps {
  currentPreset?: string;
  songTitle?: string;
  songArtist?: string;
  voiceNoteUrl?: string;
  customAudioUrl?: string;
  autoPlay?: boolean;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  currentPreset = 'lullaby',
  songTitle,
  songArtist,
  voiceNoteUrl,
  customAudioUrl,
  autoPlay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>(currentPreset || 'lullaby');
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);
  const [voiceAudio, setVoiceAudio] = useState<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
  const customAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasAttemptedAutoPlay = useRef<boolean>(false);

  // Set up custom audio if customAudioUrl is provided
  useEffect(() => {
    if (customAudioUrl) {
      const audio = new Audio(customAudioUrl);
      audio.loop = true;
      audio.volume = volume;
      audio.preload = 'auto';

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);

      customAudioRef.current = audio;

      // Auto-play if enabled
      if (autoPlay && !hasAttemptedAutoPlay.current) {
        hasAttemptedAutoPlay.current = true;
        const playTimer = setTimeout(() => {
          soundFx.stopMusic();
          audio.play().catch((e) => {
            console.warn('Auto-play waiting for user interaction:', e);
          });
        }, 600);
        return () => {
          clearTimeout(playTimer);
          audio.pause();
        };
      }

      return () => {
        audio.pause();
        customAudioRef.current = null;
      };
    } else {
      // If no custom audio, use sound synthesizer preset
      if (autoPlay && !hasAttemptedAutoPlay.current) {
        hasAttemptedAutoPlay.current = true;
        const timer = setTimeout(() => {
          soundFx.startMusicPreset(currentPreset || 'lullaby');
          setIsPlaying(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [customAudioUrl, currentPreset, autoPlay]);

  // Voice note setup
  useEffect(() => {
    if (voiceNoteUrl) {
      const audio = new Audio(voiceNoteUrl);
      audio.onended = () => setIsVoicePlaying(false);
      setVoiceAudio(audio);
      return () => {
        audio.pause();
      };
    }
  }, [voiceNoteUrl]);

  useEffect(() => {
    return () => {
      soundFx.stopMusic();
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      if (voiceAudio) {
        voiceAudio.pause();
      }
    };
  }, [voiceAudio]);

  const handleToggleMusic = (presetId?: string) => {
    if (presetId) {
      setActivePreset(presetId);
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
      soundFx.startMusicPreset(presetId);
      setIsPlaying(true);
      return;
    }

    if (customAudioRef.current) {
      if (isPlaying) {
        customAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        soundFx.stopMusic();
        customAudioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((e) => console.warn('Play error:', e));
      }
      return;
    }

    // Otherwise synth preset
    if (isPlaying) {
      soundFx.stopMusic();
      setIsPlaying(false);
    } else {
      soundFx.startMusicPreset(activePreset);
      setIsPlaying(true);
    }
  };

  const handleToggleVoice = () => {
    if (!voiceAudio) return;
    if (isVoicePlaying) {
      voiceAudio.pause();
      setIsVoicePlaying(false);
    } else {
      if (isPlaying) {
        if (customAudioRef.current) customAudioRef.current.pause();
        soundFx.stopMusic();
        setIsPlaying(false);
      }
      voiceAudio.play().then(() => {
        setIsVoicePlaying(true);
      }).catch((e) => console.warn('Voice play error:', e));
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundFx.setMusicVolume(newVol);
    if (customAudioRef.current) {
      customAudioRef.current.volume = newVol;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (customAudioRef.current) {
      customAudioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPresetObj = MUSIC_PRESETS.find((p) => p.id === activePreset) || MUSIC_PRESETS[0];

  const displayName = songTitle
    ? `${songTitle}${songArtist ? ` • ${songArtist}` : ''}`
    : customAudioUrl
    ? '🎵 Dedicated Song / Audio'
    : currentPresetObj.name;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg bg-[#000d20]/95 backdrop-blur-xl border border-[#ffddb0]/30 rounded-2xl shadow-2xl p-3 text-white transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => handleToggleMusic()}
          className="w-11 h-11 rounded-xl bg-[#ffddb0] text-[#000d20] hover:bg-white flex items-center justify-center cursor-pointer shadow transition-transform hover:scale-105 flex-shrink-0"
          title={isPlaying ? 'Pause Background Music' : 'Play Background Music'}
        >
          <span className="material-symbols-outlined text-2xl font-bold">
            {isPlaying ? 'pause' : 'music_note'}
          </span>
        </button>

        {/* Track Info & Animated Waveform */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-quicksand font-bold text-xs text-[#ffddb0] truncate">
              {displayName}
            </span>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                <span className="w-1 bg-green-400 rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
                <span className="w-1 bg-green-400 rounded-full animate-[bounce_1s_infinite_300ms] h-3" />
                <span className="w-1 bg-green-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2.5" />
              </div>
            )}
          </div>
          <p className="font-comfortaa text-[10px] text-[#b2c8ed] truncate">
            {customAudioUrl && duration > 0
              ? `${formatTime(currentTime)} / ${formatTime(duration)} • Playing across slides`
              : isPlaying
              ? 'Background soundtrack playing across slides'
              : 'Tap play to listen to song'}
          </p>
        </div>

        {/* Voice Note Button if available */}
        {voiceNoteUrl && (
          <button
            onClick={handleToggleVoice}
            className={`px-3 py-1.5 rounded-xl font-quicksand font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all ${
              isVoicePlaying
                ? 'bg-[#fdc7cb] text-[#795154] animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Listen to Voice Note"
          >
            <span className="material-symbols-outlined text-sm">
              {isVoicePlaying ? 'stop' : 'mic'}
            </span>
            <span className="hidden sm:inline">Voice Note</span>
          </button>
        )}

        {/* Expand Presets Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#ffddb0] cursor-pointer transition-colors"
          title="Audio Settings & Tracks"
        >
          <span className="material-symbols-outlined text-base">
            {isExpanded ? 'expand_more' : 'queue_music'}
          </span>
        </button>
      </div>

      {/* Track Progress Scrub Bar for Custom Songs (3-4 mins) */}
      {customAudioUrl && duration > 0 && (
        <div className="mt-2 flex items-center gap-2 px-1">
          <span className="text-[9px] text-[#b2c8ed] font-mono">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 accent-[#ffddb0] rounded-lg cursor-pointer"
          />
          <span className="text-[9px] text-[#b2c8ed] font-mono">{formatTime(duration)}</span>
        </div>
      )}

      {/* Expanded Controls & Volume Slider */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-[#b2c8ed]">
            <span>Soundtrack Volume:</span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">volume_down</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-24 h-1 accent-[#ffddb0] cursor-pointer"
              />
              <span className="material-symbols-outlined text-xs">volume_up</span>
            </div>
          </div>

          {customAudioUrl && (
            <div className="bg-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-[10px] text-[#ffddb0] uppercase tracking-wider font-bold block">Active Dedicated Song</span>
                <span className="font-quicksand text-xs text-white truncate block">{songTitle || 'Custom Audio File'}</span>
              </div>
              <button
                onClick={() => handleToggleMusic()}
                className="px-3 py-1 bg-[#ffddb0] text-[#000d20] text-xs font-bold rounded-lg cursor-pointer hover:bg-white"
              >
                {isPlaying ? 'Pause' : 'Play Song'}
              </button>
            </div>
          )}

          <div className="text-[11px] text-[#b2c8ed]">Or switch to ambient melodies:</div>
          <div className="grid grid-cols-2 gap-2">
            {MUSIC_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id && !customAudioUrl;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleToggleMusic(preset.id)}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected && isPlaying
                      ? 'bg-[#ffddb0] text-[#000d20] font-bold shadow'
                      : isSelected
                      ? 'bg-white/20 text-white border border-[#ffddb0]/40'
                      : 'bg-white/5 text-[#e8e2d9] hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isSelected && isPlaying ? 'play_arrow' : preset.icon}
                  </span>
                  <div className="truncate">
                    <p className="font-quicksand font-bold text-xs truncate">{preset.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
