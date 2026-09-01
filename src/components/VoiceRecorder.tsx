import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';

interface VoiceRecorderProps {
  voiceNoteUrl?: string;
  onSaveVoiceNote: (audioUrl: string | undefined, durationSeconds?: number) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  voiceNoteUrl,
  onSaveVoiceNote,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(voiceNoteUrl);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setAudioUrl(voiceNoteUrl);
  }, [voiceNoteUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    setPermissionError(null);
    soundFx.playRecordBeep(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          onSaveVoiceNote(base64Audio, recordingTime);
          soundFx.playSuccessChime();
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone access failed:', err);
      const errorMsg = err instanceof Error ? err.message : 'Microphone access was denied or unavailable.';
      setPermissionError(errorMsg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      soundFx.playRecordBeep(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playSparkle();
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAudioUrl(result);
        onSaveVoiceNote(result, 30);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
    }

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.warn('Audio playback error:', e));
    }
  };

  const handleDeleteAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
    setAudioUrl(undefined);
    setRecordingTime(0);
    onSaveVoiceNote(undefined, 0);
    soundFx.playButtonClick();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#e8e2d9] shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#7c5357] text-xl">mic</span>
          <div>
            <h4 className="font-quicksand font-bold text-sm text-[#000d20]">
              Personal Voice Note / Voiceover
            </h4>
            <p className="font-comfortaa text-xs text-[#74777e]">
              Record your real voice message or upload an audio memo for Panther
            </p>
          </div>
        </div>
      </div>

      {permissionError && (
        <div className="p-3 bg-[#fdc7cb]/40 border border-[#7c5357]/30 rounded-xl text-xs font-comfortaa text-[#7c5357] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">warning</span>
          <span>{permissionError} (You can also upload an audio file below!)</span>
        </div>
      )}

      {/* Recording in Progress UI */}
      {isRecording && (
        <div className="bg-[#fdc7cb]/30 border-2 border-[#7c5357] rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
            <span className="font-archivo font-bold text-sm text-[#7c5357]">
              Recording Voice Memo: {formatSeconds(recordingTime)}
            </span>
          </div>

          <button
            onClick={stopRecording}
            className="bg-[#7c5357] hover:bg-[#5a3b3e] text-white font-quicksand font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
          >
            <span className="material-symbols-outlined text-base">stop</span>
            <span>Stop & Save</span>
          </button>
        </div>
      )}

      {/* Existing Recorded / Uploaded Audio Preview */}
      {!isRecording && audioUrl && (
        <div className="bg-[#f4ede4] border border-[#000d20]/20 rounded-xl p-4 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-[#000d20] text-[#ffddb0] hover:bg-[#0b2340] flex items-center justify-center cursor-pointer shadow transition-transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-lg">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div>
              <span className="font-quicksand font-bold text-xs text-[#000d20] block">
                🎙️ Voice Note Saved
              </span>
              <span className="font-comfortaa text-[11px] text-[#74777e]">
                {isPlaying ? 'Playing preview...' : 'Ready for Panther to listen'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAudio}
              className="text-[#7c5357] hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Delete voice note"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Recording Trigger Buttons & Upload */}
      {!isRecording && !audioUrl && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={startRecording}
            className="bg-[#000d20] hover:bg-[#0b2340] text-[#ffddb0] font-quicksand font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all hover:scale-[1.02]"
          >
            <span className="material-symbols-outlined text-base">mic</span>
            <span>Record Voice Memo</span>
          </button>

          <label className="bg-[#eee7de] hover:bg-[#e8e2d9] text-[#000d20] font-quicksand font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors">
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>Upload Audio File</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
};
