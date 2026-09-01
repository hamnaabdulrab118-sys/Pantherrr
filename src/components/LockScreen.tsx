import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import dinoPantherLogo from '../assets/images/dino_panther_same_size_1788091439765.jpg';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    soundFx.playButtonClick();
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    // Auto-advance
    if (value && index < 3 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-check if 4 digits entered
    if (index === 3 && value) {
      const fullPin = newDigits.join('');
      checkPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      soundFx.playButtonClick();
      inputsRef.current[index - 1]?.focus();
    }
  };

  const checkPin = (pin: string) => {
    if (pin === correctPin) {
      setError(false);
      soundFx.playSuccessChime();
      onUnlock();
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setDigits(['', '', '', '']);
        inputsRef.current[0]?.focus();
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkPin(digits.join(''));
  };

  return (
    <div className="bg-[#000d20] min-h-screen flex items-center justify-center relative overflow-hidden font-sans text-[#1e1b16]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-40 filter blur-sm transform scale-105" 
          style={{ backgroundImage: `url('${dinoPantherLogo}')` }}
        />
        <div className="absolute inset-0 bg-[#000d20]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000d20] via-[#000d20]/60 to-transparent" />
      </div>

      {/* Main Lock Container */}
      <main className="relative z-10 w-full max-w-md px-6 flex flex-col items-center justify-center min-h-screen">
        {/* Header / Logo */}
        <div className="mb-8 text-center flex flex-col items-center transform -translate-y-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#ffddb0]/40 shadow-[0_0_25px_rgba(255,221,176,0.35)] overflow-hidden mb-3.5 bg-[#000d20]">
            <img 
              src={dinoPantherLogo} 
              alt="Dino and Panther" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="font-quicksand text-3xl md:text-4xl font-bold text-[#ffddb0] tracking-wide gold-glow">
            For Panther 🐾✈️
          </h1>
          <p className="font-comfortaa text-sm sm:text-base text-[#e8e2d9]/90 mt-1 italic">
            Dino & Panther's Journey Awaits... 🦖❤️🐾
          </p>
        </div>

        {/* Lock Card */}
        <div className="glass-panel w-full rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Washi Tape decorative element */}
          <div className="absolute -top-3 -right-3 w-16 h-8 bg-[#ffddb0]/20 transform rotate-45 backdrop-blur-sm border border-[#ffddb0]/10" />

          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[#ffddb0] text-4xl mb-2 icon-filled block">
              lock
            </span>
            <p className="font-archivo text-xs text-[#ffddb0] uppercase tracking-[0.2em] font-bold">
              ENTER ACCESS CODE
            </p>
          </div>

          <form onSubmit={handleSubmit} className={`flex flex-col gap-6 items-center w-full ${isShaking ? 'shake' : ''}`}>
            {/* Code Inputs Container */}
            <div className="flex justify-between gap-3 w-full max-w-[280px]">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="code-input w-12 h-16 bg-[#e8e2d9]/10 border-2 border-[#e8e2d9]/30 rounded-lg text-center font-quicksand text-3xl text-[#ffddb0] bg-transparent outline-none focus:ring-0 placeholder-transparent"
                  placeholder="*"
                  required
                />
              ))}
            </div>

            <div className="h-6">
              <p className={`font-archivo text-xs text-[#fdc7cb] transition-opacity ${error ? 'opacity-100' : 'opacity-0'}`}>
                Incorrect Code. Try again.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full bg-[#0b2340] text-[#ffddb0] font-quicksand font-semibold text-lg py-4 px-8 rounded-xl shadow-[0_4px_15px_rgba(0,13,32,0.5)] border border-[#ffddb0]/20 hover:bg-[#000d20] hover:border-[#ffddb0]/50 hover:shadow-[0_8px_25px_rgba(255,221,176,0.15)] transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span>Unlock Memories</span>
              <span className="material-symbols-outlined text-[#ffddb0] group-hover:translate-x-1 transition-transform icon-filled">
                vpn_key
              </span>
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="font-archivo text-xs text-[#e8e2d9]/40 mt-12 text-center uppercase tracking-widest">
          AWAITING CODE ({correctPin})
        </p>
      </main>
    </div>
  );
};
