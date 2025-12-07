"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CatProfile, PhotoAnalysis } from "@/types/catlife";

interface AnimatedCatProps {
  catProfile: CatProfile;
  photoAnalysis?: PhotoAnalysis | null;
  compact?: boolean;
  autoAnimate?: boolean;
}

type CatState = "idle" | "walking" | "eating" | "drinking" | "sleeping" | "playing" | "meowing";

interface CatColors {
  primaryFur: string;
  secondaryFur: string;
  stripeColor: string | null;
  noseColor: string;
  innerEarColor: string;
  eyeColor: string;
  pattern: string;
}

const DEFAULT_COLORS: CatColors = {
  primaryFur: "#E8A756",
  secondaryFur: "#F5D4A8",
  stripeColor: "#C67B30",
  noseColor: "#E8A0A0",
  innerEarColor: "#FFD4D4",
  eyeColor: "#7CB342",
  pattern: "tabby",
};

const STATE_LABELS: Record<CatState, string> = {
  idle: "😺 Relaxing",
  walking: "🚶 Walking",
  eating: "🍽️ Eating",
  drinking: "💧 Drinking",
  sleeping: "💤 Sleeping",
  playing: "🎾 Playing",
  meowing: "😸 Meowing",
};

export function AnimatedCat({
  catProfile,
  photoAnalysis,
  compact = false,
  autoAnimate = true,
}: AnimatedCatProps) {
  const [catState, setCatState] = useState<CatState>("idle");
  const [colors, setColors] = useState<CatColors>(DEFAULT_COLORS);
  const [blinkOpen, setBlinkOpen] = useState(true);
  const [position, setPosition] = useState(50); // percentage from left

  // Fetch AI-determined colors
  useEffect(() => {
    async function fetchColors() {
      try {
        const response = await fetch("/api/catlife/cat-colors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catProfile, photoAnalysis }),
        });
        const data = await response.json();
        if (data.success && data.colors) {
          setColors(data.colors);
        }
      } catch (error) {
        console.error("Failed to fetch cat colors:", error);
      }
    }
    fetchColors();
  }, [catProfile, photoAnalysis]);

  // Random blinking
  useEffect(() => {
    if (catState === "sleeping") return;
    
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setBlinkOpen(false);
        setTimeout(() => setBlinkOpen(true), 150);
      }
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, [catState]);

  // Auto-animate through states
  useEffect(() => {
    if (!autoAnimate) return;

    const states: CatState[] = ["idle", "walking", "eating", "idle", "drinking", "walking", "playing", "meowing", "idle", "sleeping"];
    let stateIndex = 0;

    const stateInterval = setInterval(() => {
      const newState = states[stateIndex];
      setCatState(newState);

      // Update position for walking
      if (newState === "walking") {
        setPosition((prev) => (prev > 70 ? 20 : prev + 25));
      } else if (newState === "eating") {
        setPosition(15);
      } else if (newState === "drinking") {
        setPosition(35);
      } else if (newState === "playing") {
        setPosition(70);
      } else if (newState === "sleeping") {
        setPosition(85);
      }

      stateIndex = (stateIndex + 1) % states.length;
    }, 3000);

    return () => clearInterval(stateInterval);
  }, [autoAnimate]);

  const getBodyAnimation = useCallback(() => {
    switch (catState) {
      case "sleeping":
        return { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 2 } };
      case "eating":
        return { y: [0, 2, 0], transition: { repeat: Infinity, duration: 0.4 } };
      case "drinking":
        return { y: [0, 1, 0], transition: { repeat: Infinity, duration: 0.5 } };
      case "playing":
        return { y: [0, -8, 0], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.3 } };
      case "meowing":
        return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.6 } };
      case "walking":
        return { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.25 } };
      default:
        return { scale: [1, 1.01, 1], transition: { repeat: Infinity, duration: 3 } };
    }
  }, [catState]);

  const size = compact ? { width: 60, height: 50 } : { width: 100, height: 80 };

  return (
    <div className={`flex flex-col items-center w-full ${compact ? "" : "gap-2"}`}>
      {/* Scene */}
      <div 
        className={`relative w-full bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 rounded-xl overflow-hidden border-2 border-amber-200 ${
          compact ? "h-20" : "h-32 sm:h-40 max-w-xs"
        }`}
      >
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-200 to-amber-100" />
        
        {/* Activity stations (only in full view) */}
        {!compact && (
          <>
            <div className="absolute bottom-3 left-[10%] text-lg">🍽️</div>
            <div className="absolute bottom-3 left-[30%] text-lg">💧</div>
            <div className="absolute bottom-3 left-[65%] text-lg">🧶</div>
            <div className="absolute bottom-2 left-[80%] text-xl">🛏️</div>
          </>
        )}

        {/* Animated Cat */}
        <motion.div
          className="absolute bottom-4"
          initial={{ left: "45%" }}
          animate={{ left: `${position - 5}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        >
          <motion.div animate={getBodyAnimation()}>
            <CatSVG
              colors={colors}
              state={catState}
              blinkOpen={blinkOpen}
              width={size.width}
              height={size.height}
              facingLeft={position < 50}
            />
          </motion.div>
          
          {/* Walking paw prints */}
          {catState === "walking" && (
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2"
              animate={{ opacity: [1, 0], y: [0, 5] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            >
              <span className="text-[8px]">🐾</span>
            </motion.div>
          )}
          
          {/* Meow speech bubble */}
          <AnimatePresence>
            {catState === "meowing" && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.8 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full shadow-sm border border-amber-200"
              >
                <span className="text-[10px] font-medium text-amber-700">meow~</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Zzz for sleeping */}
          <AnimatePresence>
            {catState === "sleeping" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ y: { repeat: Infinity, duration: 1.5 } }}
                className="absolute -top-4 left-1/2"
              >
                <span className="text-sm">💤</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Label */}
      {!compact && (
        <div className="text-center">
          <h3 className="text-sm font-bold text-amber-900">{catProfile.name || "Kitty"}</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={catState}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-amber-600 text-xs"
            >
              {STATE_LABELS[catState]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      {/* Compact label */}
      {compact && (
        <p className="text-[10px] text-amber-600 mt-1">{STATE_LABELS[catState]}</p>
      )}
    </div>
  );
}

// SVG Cat Component with animated parts
interface CatSVGProps {
  colors: CatColors;
  state: CatState;
  blinkOpen: boolean;
  width: number;
  height: number;
  facingLeft?: boolean;
}

function CatSVG({ colors, state, blinkOpen, width, height, facingLeft }: CatSVGProps) {
  const isSleeping = state === "sleeping";
  const isEating = state === "eating";
  const isDrinking = state === "drinking";
  const isMeowing = state === "meowing";
  const isWalking = state === "walking";
  const isPlaying = state === "playing";

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 80"
      style={{ transform: facingLeft ? "scaleX(-1)" : undefined }}
    >
      {/* Body */}
      <motion.ellipse
        cx="50"
        cy="55"
        rx={isSleeping ? "28" : "22"}
        ry={isSleeping ? "12" : "15"}
        fill={colors.primaryFur}
        animate={isSleeping ? { rx: [28, 29, 28] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      
      {/* Belly */}
      <ellipse
        cx="50"
        cy="58"
        rx={isSleeping ? "18" : "12"}
        ry={isSleeping ? "8" : "10"}
        fill={colors.secondaryFur}
      />

      {/* Back legs */}
      <motion.rect
        x="62"
        y="62"
        width="10"
        height={isSleeping ? "6" : "12"}
        rx="4"
        fill={colors.primaryFur}
        animate={isWalking ? { y: [62, 60, 62] } : {}}
        transition={{ repeat: Infinity, duration: 0.3 }}
      />
      <motion.rect
        x="28"
        y="62"
        width="10"
        height={isSleeping ? "6" : "12"}
        rx="4"
        fill={colors.primaryFur}
        animate={isWalking ? { y: [62, 64, 62] } : {}}
        transition={{ repeat: Infinity, duration: 0.3 }}
      />

      {/* Front legs */}
      <motion.rect
        x="55"
        y="60"
        width="8"
        height={isSleeping ? "6" : "14"}
        rx="3"
        fill={colors.primaryFur}
        animate={isWalking ? { y: [60, 58, 60] } : {}}
        transition={{ repeat: Infinity, duration: 0.3 }}
      />
      <motion.rect
        x="37"
        y="60"
        width="8"
        height={isSleeping ? "6" : "14"}
        rx="3"
        fill={colors.primaryFur}
        animate={isWalking ? { y: [60, 62, 60] } : {}}
        transition={{ repeat: Infinity, duration: 0.3 }}
      />

      {/* Tail */}
      <motion.path
        d={isSleeping 
          ? "M 22 55 Q 10 50 15 45" 
          : isPlaying 
            ? "M 22 50 Q 5 35 15 20"
            : "M 22 50 Q 10 45 8 35"
        }
        stroke={colors.primaryFur}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        animate={!isSleeping ? { 
          d: isPlaying 
            ? ["M 22 50 Q 5 35 15 20", "M 22 50 Q 8 38 18 22", "M 22 50 Q 5 35 15 20"]
            : ["M 22 50 Q 10 45 8 35", "M 22 50 Q 12 43 10 33", "M 22 50 Q 10 45 8 35"]
        } : {}}
        transition={{ repeat: Infinity, duration: isPlaying ? 0.3 : 1.5 }}
      />
      
      {/* Stripes (if tabby) */}
      {colors.stripeColor && colors.pattern === "tabby" && (
        <>
          <path d="M 38 48 Q 50 45 62 48" stroke={colors.stripeColor} strokeWidth="2" fill="none" />
          <path d="M 40 53 Q 50 50 60 53" stroke={colors.stripeColor} strokeWidth="2" fill="none" />
          <path d="M 42 58 Q 50 55 58 58" stroke={colors.stripeColor} strokeWidth="2" fill="none" />
        </>
      )}

      {/* Head */}
      <motion.ellipse
        cx="50"
        cy={isEating || isDrinking ? "42" : "35"}
        rx="18"
        ry="16"
        fill={colors.primaryFur}
        animate={isEating || isDrinking ? { cy: [42, 44, 42] } : {}}
        transition={{ repeat: Infinity, duration: 0.4 }}
      />
      
      {/* Face stripes (if tabby) */}
      {colors.stripeColor && colors.pattern === "tabby" && (
        <>
          <path d="M 50 25 L 50 30" stroke={colors.stripeColor} strokeWidth="2" />
          <path d="M 43 27 L 45 32" stroke={colors.stripeColor} strokeWidth="1.5" />
          <path d="M 57 27 L 55 32" stroke={colors.stripeColor} strokeWidth="1.5" />
        </>
      )}

      {/* Ears */}
      <polygon points="35,25 40,12 48,25" fill={colors.primaryFur} />
      <polygon points="65,25 60,12 52,25" fill={colors.primaryFur} />
      <polygon points="38,24 41,16 46,24" fill={colors.innerEarColor} />
      <polygon points="62,24 59,16 54,24" fill={colors.innerEarColor} />

      {/* Eyes */}
      {!isSleeping && (
        <>
          {/* Eye whites */}
          <ellipse cx="43" cy="35" rx="5" ry={isPlaying ? "5" : "4"} fill="white" />
          <ellipse cx="57" cy="35" rx="5" ry={isPlaying ? "5" : "4"} fill="white" />
          
          {/* Pupils */}
          <motion.ellipse
            cx="43"
            cy="35"
            rx="2.5"
            ry={blinkOpen ? (isPlaying ? "3" : "2.5") : "0.5"}
            fill={colors.eyeColor}
            animate={blinkOpen ? {} : { ry: 0.5 }}
            transition={{ duration: 0.1 }}
          />
          <motion.ellipse
            cx="57"
            cy="35"
            rx="2.5"
            ry={blinkOpen ? (isPlaying ? "3" : "2.5") : "0.5"}
            fill={colors.eyeColor}
            animate={blinkOpen ? {} : { ry: 0.5 }}
            transition={{ duration: 0.1 }}
          />
          
          {/* Eye shine */}
          <circle cx="44" cy="34" r="1" fill="white" />
          <circle cx="58" cy="34" r="1" fill="white" />
        </>
      )}

      {/* Sleeping eyes (closed) */}
      {isSleeping && (
        <>
          <path d="M 38 35 Q 43 37 48 35" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 52 35 Q 57 37 62 35" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Nose */}
      <motion.path
        d="M 47 42 L 50 45 L 53 42 Z"
        fill={colors.noseColor}
        animate={isEating || isDrinking ? { y: [0, 2, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.4 }}
      />

      {/* Mouth */}
      {!isMeowing && !isEating && !isDrinking && (
        <path d="M 46 47 Q 50 50 54 47" stroke="#333" strokeWidth="1.5" fill="none" />
      )}

      {/* Open mouth (meowing/eating) */}
      {(isMeowing || isEating) && (
        <motion.ellipse
          cx="50"
          cy={isMeowing ? "49" : "48"}
          rx={isMeowing ? "4" : "3"}
          ry={isMeowing ? "4" : "2"}
          fill="#4A4A4A"
          animate={isEating ? { ry: [2, 3, 2] } : { ry: [3, 4, 3] }}
          transition={{ repeat: Infinity, duration: isMeowing ? 0.6 : 0.4 }}
        />
      )}

      {/* Tongue (drinking) */}
      {isDrinking && (
        <motion.ellipse
          cx="50"
          cy="50"
          rx="2"
          ry="4"
          fill="#FF9999"
          animate={{ cy: [50, 54, 50], ry: [4, 5, 4] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />
      )}

      {/* Whiskers */}
      <g stroke="#333" strokeWidth="0.8">
        <line x1="32" y1="40" x2="20" y2="38" />
        <line x1="32" y1="43" x2="20" y2="43" />
        <line x1="32" y1="46" x2="20" y2="48" />
        <line x1="68" y1="40" x2="80" y2="38" />
        <line x1="68" y1="43" x2="80" y2="43" />
        <line x1="68" y1="46" x2="80" y2="48" />
      </g>
    </svg>
  );
}

export default AnimatedCat;

