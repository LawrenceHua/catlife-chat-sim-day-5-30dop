"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import type { CatProfile, PhotoAnalysis } from "@/types/catlife";

interface PixelAvatarProps {
  catProfile: CatProfile;
  photoAnalysis?: PhotoAnalysis | null;
  onAvatarGenerated?: (url: string) => void;
  autoGenerate?: boolean;
  compact?: boolean; // For mobile/small displays
}

type AvatarState = "idle" | "eating" | "playing" | "sleeping" | "drinking";

const STATION_POSITIONS: Record<AvatarState, number> = {
  idle: 50,
  eating: 15,
  drinking: 30,
  playing: 70,
  sleeping: 85,
};

export function PixelAvatar({
  catProfile,
  photoAnalysis,
  onAvatarGenerated,
  autoGenerate = true,
  compact = false,
}: PixelAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(catProfile.avatarUrl || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<AvatarState>("idle");
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (autoGenerate && catProfile.name && !avatarUrl && !isGenerating) {
      generateAvatar();
    }
  }, [autoGenerate, catProfile.name, avatarUrl, isGenerating]);

  useEffect(() => {
    if (!avatarUrl) return;
    const states: AvatarState[] = ["idle", "eating", "drinking", "playing", "sleeping"];
    let currentIndex = 0;
    const interval = setInterval(() => {
      setIsWalking(true);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % states.length;
        setCurrentState(states[currentIndex]);
        setTimeout(() => setIsWalking(false), 800);
      }, 200);
    }, 4000);
    return () => clearInterval(interval);
  }, [avatarUrl]);

  const generateAvatar = async () => {
    if (!catProfile.name) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/catlife/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catProfile, photoAnalysis }),
      });
      const data = await response.json();
      if (data.success && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        onAvatarGenerated?.(data.avatarUrl);
      } else if (data.fallbackAvatar) {
        setAvatarUrl(data.fallbackAvatar);
        onAvatarGenerated?.(data.fallbackAvatar);
      } else {
        throw new Error(data.error || "Failed to generate avatar");
      }
    } catch (err) {
      console.error("Avatar generation error:", err);
      setError("Couldn't create the avatar.");
      setAvatarUrl(getFallbackAvatar());
    } finally {
      setIsGenerating(false);
    }
  };

  const getActivityAnimation = () => {
    if (isWalking) return {};
    switch (currentState) {
      case "eating": return { y: [0, 2, 0], transition: { repeat: Infinity, duration: 0.4 } };
      case "drinking": return { y: [0, 1, 0], transition: { repeat: Infinity, duration: 0.6 } };
      case "playing": return { rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.25 } };
      case "sleeping": return { scale: [1, 1.01, 1], transition: { repeat: Infinity, duration: 1.5 } };
      default: return {};
    }
  };

  const getActivityLabel = () => {
    switch (currentState) {
      case "eating": return "🍽️ Eating";
      case "drinking": return "💧 Drinking";
      case "playing": return "🎾 Playing";
      case "sleeping": return "💤 Sleeping";
      default: return "😺 Relaxing";
    }
  };

  // Generating state
  if (isGenerating) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'p-2' : 'p-4'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="mb-2"
        >
          <Sparkles className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} text-amber-500`} />
        </motion.div>
        <p className={`text-amber-700 font-medium ${compact ? 'text-xs' : 'text-sm'} text-center`}>
          Creating {catProfile.name}'s avatar...
        </p>
        {!compact && <p className="text-amber-500 text-xs mt-1">~10-15 seconds</p>}
      </div>
    );
  }

  // No avatar yet - waiting for chat completion
  if (!avatarUrl) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'p-2' : 'p-4'} bg-amber-50 rounded-xl w-full`}>
        <span className={`${compact ? 'text-2xl' : 'text-4xl'} mb-2`}>🐱</span>
        <p className={`text-amber-700 text-center ${compact ? 'text-[10px]' : 'text-xs'} px-2`}>
          {catProfile.name ? `Generate ${catProfile.name}'s avatar` : "Complete chat to generate avatar"}
        </p>
        {catProfile.name && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateAvatar}
            className={`mt-2 ${compact ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs'} bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-md`}
          >
            Generate
          </motion.button>
        )}
      </div>
    );
  }

  // Compact view for mobile
  if (compact) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="relative w-16 h-16 bg-gradient-to-b from-sky-100 to-amber-100 rounded-lg overflow-hidden border border-amber-200 flex-shrink-0">
          <motion.img
            src={avatarUrl}
            alt={catProfile.name || "Cat"}
            className="w-full h-full object-contain p-1"
            animate={getActivityAnimation()}
          />
          <button
            onClick={generateAvatar}
            className="absolute top-0.5 right-0.5 p-0.5 bg-white/80 rounded-full text-amber-600"
          >
            <RefreshCw className="w-2 h-2" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-900 truncate">{catProfile.name}</p>
          <p className="text-[10px] text-amber-600">{isWalking ? "🚶 Walking..." : getActivityLabel()}</p>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-xs h-32 sm:h-40 bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 rounded-xl overflow-hidden border-2 border-amber-200">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-amber-200 to-amber-100" />
        
        {/* Activity stations - smaller icons */}
        <div className="absolute bottom-4 left-[10%] text-lg">🍽️</div>
        <div className="absolute bottom-4 left-[25%] text-lg">💧</div>
        <div className="absolute bottom-4 left-[65%] text-lg">🧶</div>
        <div className="absolute bottom-3 left-[80%] text-xl">🛏️</div>
        
        {/* Walking cat */}
        <motion.div
          className="absolute bottom-6"
          initial={{ left: "45%" }}
          animate={{ left: `${STATION_POSITIONS[currentState] - 5}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15, duration: 0.8 }}
        >
          <motion.div animate={getActivityAnimation()}>
            <motion.img
              src={avatarUrl}
              alt={catProfile.name || ""}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
              animate={{ scaleX: isWalking && STATION_POSITIONS[currentState] < 50 ? -1 : 1 }}
              style={{ transformOrigin: "center" }}
            />
            {isWalking && (
              <motion.div
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2"
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.15 }}
              >
                <span className="text-[8px]">🐾</span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        
        <button
          onClick={generateAvatar}
          className="absolute top-1.5 right-1.5 p-1 bg-white/80 hover:bg-white rounded-full shadow-md text-amber-600 z-10"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      <div className="mt-2 text-center">
        <h3 className="text-sm font-bold text-amber-900">{catProfile.name}</h3>
        <AnimatePresence mode="wait">
          <motion.p 
            key={currentState}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="text-amber-600 text-xs"
          >
            {isWalking ? "🚶 Walking..." : getActivityLabel()}
          </motion.p>
        </AnimatePresence>
      </div>

      {error && <p className="mt-1 text-amber-600 text-[10px] text-center">{error}</p>}
    </div>
  );
}

function getFallbackAvatar(): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">
      <rect width="64" height="64" fill="#FEF3C7"/>
      <rect x="20" y="28" width="24" height="20" fill="#F59E0B" rx="4"/>
      <rect x="18" y="12" width="28" height="20" fill="#F59E0B" rx="6"/>
      <polygon points="18,12 22,4 26,12" fill="#F59E0B"/>
      <polygon points="38,12 42,4 46,12" fill="#F59E0B"/>
      <polygon points="20,10 22,6 24,10" fill="#FBBF24"/>
      <polygon points="40,10 42,6 44,10" fill="#FBBF24"/>
      <circle cx="26" cy="20" r="4" fill="white"/>
      <circle cx="38" cy="20" r="4" fill="white"/>
      <circle cx="26" cy="20" r="2" fill="#1F2937"/>
      <circle cx="38" cy="20" r="2" fill="#1F2937"/>
      <polygon points="32,24 30,28 34,28" fill="#EC4899"/>
      <path d="M28,30 Q32,34 36,30" stroke="#1F2937" stroke-width="1" fill="none"/>
      <line x1="10" y1="26" x2="18" y2="24" stroke="#1F2937" stroke-width="1"/>
      <line x1="10" y1="28" x2="18" y2="28" stroke="#1F2937" stroke-width="1"/>
      <line x1="46" y1="24" x2="54" y2="26" stroke="#1F2937" stroke-width="1"/>
      <line x1="46" y1="28" x2="54" y2="28" stroke="#1F2937" stroke-width="1"/>
      <path d="M44,40 Q56,38 52,28" stroke="#F59E0B" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="22" y="46" width="6" height="6" fill="#F59E0B" rx="2"/>
      <rect x="36" y="46" width="6" height="6" fill="#F59E0B" rx="2"/>
    </svg>
  `)}`;
}

export { getFallbackAvatar };
