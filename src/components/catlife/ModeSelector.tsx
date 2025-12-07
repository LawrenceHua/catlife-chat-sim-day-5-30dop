"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, MessageCircle, Zap, Clock, Sparkles } from "lucide-react";

export type SetupMode = "quick" | "chat";

interface ModeSelectorProps {
  onSelectMode: (mode: SetupMode) => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-4xl">🐱</span>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold text-amber-900 mb-2"
      >
        Welcome to CatLife!
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-amber-700 mb-8 max-w-md text-sm md:text-base"
      >
        Let's create a health simulation for your cat. How would you like to get started?
      </motion.p>

      {/* Mode Selection Cards */}
      <div className="w-full max-w-md space-y-4">
        {/* Quick Setup - Recommended */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("quick")}
          className="w-full p-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-lg text-white text-left relative overflow-hidden group"
        >
          {/* Recommended badge */}
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/20 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span className="text-xs font-medium">Faster</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                Quick Setup
                <Sparkles className="w-4 h-4 text-amber-200" />
              </h3>
              <p className="text-amber-100 text-sm mb-2">
                Upload 4 photos of your cat, then fill in a quick form
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-200">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>~2-3 minutes</span>
              </div>
            </div>
          </div>

          {/* Hover effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        {/* Chat Mode */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectMode("chat")}
          className="w-full p-5 bg-white border-2 border-amber-200 rounded-2xl shadow-md text-left hover:border-amber-400 transition-colors group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-amber-900 mb-1">
                Chat with Me
              </h3>
              <p className="text-amber-600 text-sm mb-2">
                Have a conversation while I learn about your cat
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>~5-10 minutes</span>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Info text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-xs text-amber-500 max-w-sm"
      >
        Both options collect the same information. Quick Setup is recommended for a faster experience!
      </motion.p>
    </div>
  );
}

