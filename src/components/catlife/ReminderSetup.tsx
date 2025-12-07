"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Bell,
  Check,
  Loader2,
  AlertCircle,
  Utensils,
  Gamepad2,
  Trash2,
  Stethoscope,
  Sparkles,
  Lightbulb,
  Edit3,
  X,
} from "lucide-react";
import type { ReminderChannels, ContactType, CatProfile, CareRoutine, SimulationResult, ReminderChannel } from "@/types/catlife";

interface ReminderSetupProps {
  catName: string;
  catProfile?: CatProfile;
  careRoutine?: CareRoutine;
  simulationResult?: SimulationResult | null;
  onComplete?: () => void;
}

// AI-powered recommendation from the API
interface AIRecommendation {
  channel: ReminderChannel;
  enabled: boolean;
  reason: string;
  priority: "high" | "medium" | "low";
  frequency: string;
  schedule: string;
  aiInsight: string;
}

export function ReminderSetup({ catName, catProfile, careRoutine, simulationResult, onComplete }: ReminderSetupProps) {
  const [contactType, setContactType] = useState<ContactType>("email");
  const [contactValue, setContactValue] = useState("");
  const [channels, setChannels] = useState<ReminderChannels>({
    feed: true,
    play: false,
    litter: false,
    vet: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false); // Track if user has saved before (for edit mode)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // Channel configuration
  const channelConfig = [
    { key: "feed" as const, icon: Utensils, label: "Feeding" },
    { key: "play" as const, icon: Gamepad2, label: "Play" },
    { key: "vet" as const, icon: Stethoscope, label: "Vet" },
    { key: "litter" as const, icon: Trash2, label: "Litter" },
  ];

  // Fetch AI recommendations on mount
  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoadingRecs(true);
      try {
        const response = await fetch("/api/catlife/reminder-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catProfile, careRoutine, simulationResult }),
        });
        const data = await response.json();
        
        if (data.success && data.recommendations) {
          setRecommendations(data.recommendations);
          // Apply recommended channels
          const newChannels: ReminderChannels = { feed: false, play: false, litter: false, vet: false };
          data.recommendations.forEach((rec: AIRecommendation) => {
            newChannels[rec.channel] = rec.enabled;
          });
          setChannels(newChannels);
        }
      } catch (err) {
        console.error("Failed to fetch AI recommendations:", err);
        // Use default recommendations on error
        setRecommendations(getDefaultRecommendations());
      } finally {
        setIsLoadingRecs(false);
      }
    }
    
    fetchRecommendations();
  }, [catProfile, careRoutine, simulationResult]);

  const toggleChannel = (channel: keyof ReminderChannels) => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const getRecommendation = (channel: keyof ReminderChannels): AIRecommendation | undefined => {
    return recommendations.find(r => r.channel === channel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contactValue.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (contactType === "email" && !contactValue.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!Object.values(channels).some(Boolean)) {
      setError("Please select at least one reminder type");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/catlife/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catName, contactType, contactValue: contactValue.trim(), channels }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setHasBeenSaved(true);
        // Don't call onComplete here - let user click Done
      } else {
        throw new Error(data.error || "Failed to set up reminders");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen with edit option
  if (success) {
    const activeReminders = channelConfig.filter(c => channels[c.key]);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col p-3"
      >
        {/* Success Header */}
        <div className="text-center mb-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 mx-auto"
          >
            <Check className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="text-base font-bold text-green-800">Reminders Active! 🎉</h3>
          <p className="text-green-600 text-xs">{contactValue}</p>
        </div>

        {/* Active Reminders Summary */}
        <div className="flex-1 space-y-1.5 overflow-y-auto">
          <p className="text-xs font-medium text-gray-700 mb-1">Active reminders for {catName}:</p>
          {activeReminders.length > 0 ? (
            activeReminders.map(({ key, icon: Icon, label }) => {
              const rec = getRecommendation(key);
              return (
                <div key={key} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-1.5 bg-green-500 rounded-md text-white flex items-center justify-center">
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-green-800">{label}</span>
                    {rec?.frequency && (
                      <span className="text-[9px] text-green-600 ml-1">• {rec.frequency}</span>
                    )}
                    {rec?.schedule && (
                      <p className="text-[9px] text-green-600">{rec.schedule}</p>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              );
            })
          ) : (
            <p className="text-xs text-gray-500 italic">No reminders selected</p>
          )}
          
          {/* Inactive reminders */}
          {channelConfig.filter(c => !channels[c.key]).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">Not enabled:</p>
              <div className="flex flex-wrap gap-1">
                {channelConfig.filter(c => !channels[c.key]).map(({ key, label }) => (
                  <span key={key} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit & Done Buttons */}
        <div className="flex gap-2 mt-3 flex-shrink-0">
          <motion.button
            type="button"
            onClick={() => setSuccess(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 bg-amber-100 text-amber-700 font-semibold rounded-xl flex items-center justify-center gap-1.5 text-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit
          </motion.button>
          <motion.button
            type="button"
            onClick={() => onComplete?.()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 text-sm shadow-md"
          >
            <Check className="w-4 h-4" /> Done
          </motion.button>
        </div>
        
        <p className="text-center text-[9px] text-gray-400 mt-1">You can edit reminders anytime</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center flex-shrink-0 mb-2">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <h3 className="text-base font-bold text-amber-900">AI-Powered Reminders</h3>
        </div>
        <p className="text-amber-600 text-xs">GPT-4 analyzed {catName}'s profile for personalized timing</p>
      </div>

      {/* Form Content */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* Contact Input */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setContactType("email")}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border-2 text-xs ${
              contactType === "email" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600"
            }`}
          >
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">Email</span>
          </button>
          <button type="button" disabled className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border-2 border-gray-100 text-gray-300 cursor-not-allowed text-xs">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">SMS</span>
            <span className="text-[8px] bg-gray-200 px-1 rounded">Soon</span>
          </button>
        </div>

        <input
          type="email"
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base"
        />

        {/* AI-Recommended Reminders */}
        <div>
          <label className="text-xs font-medium text-amber-800 mb-1.5 block flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Recommendations
            {isLoadingRecs && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
          </label>
          
          {isLoadingRecs ? (
            <div className="flex items-center justify-center py-6 text-amber-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm">Analyzing {catName}'s needs...</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {channelConfig.map(({ key, icon: Icon, label }) => {
                const rec = getRecommendation(key);
                const isEnabled = channels[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChannel(key)}
                    className={`w-full p-2 rounded-lg border-2 text-left transition-all ${
                      isEnabled ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-md flex-shrink-0 flex items-center justify-center ${isEnabled ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-semibold ${isEnabled ? "text-amber-900" : "text-gray-700"}`}>{label}</span>
                          {rec?.frequency && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isEnabled ? "bg-amber-200 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                              {rec.frequency}
                            </span>
                          )}
                          {rec?.priority === 'high' && (
                            <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">Recommended</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{rec?.reason}</p>
                        {rec?.schedule && isEnabled && (
                          <p className="text-[9px] text-amber-600 mt-0.5 flex items-center gap-1">
                            <Bell className="w-2.5 h-2.5 flex-shrink-0" /> {rec.schedule}
                          </p>
                        )}
                        {rec?.aiInsight && isEnabled && (
                          <p className="text-[9px] text-blue-600 mt-0.5 flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Lightbulb className="w-2.5 h-2.5 flex-shrink-0" /> 
                            <span className="line-clamp-1">{rec.aiInsight}</span>
                          </p>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isEnabled ? "border-amber-500 bg-amber-500" : "border-gray-300"
                      }`}>
                        {isEnabled && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit */}
      <div className="flex gap-2 mt-2 flex-shrink-0">
        {hasBeenSaved && (
          <motion.button
            type="button"
            onClick={() => setSuccess(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-xl flex items-center justify-center gap-1 text-sm"
          >
            <X className="w-4 h-4" /> Cancel
          </motion.button>
        )}
        <motion.button
          type="submit"
          disabled={isSubmitting || isLoadingRecs}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin flex-shrink-0" /> {hasBeenSaved ? "Updating..." : "Setting up..."}</>
          ) : (
            <><Bell className="w-4 h-4 flex-shrink-0" /> {hasBeenSaved ? "Update Reminders" : "Enable Reminders"}</>
          )}
        </motion.button>
      </div>

      <p className="text-center text-[10px] text-amber-500 mt-1 flex-shrink-0">
        {hasBeenSaved ? "Changes will update your existing reminders" : "Unsubscribe anytime"}
      </p>
    </form>
  );
}

// Default recommendations when API fails
function getDefaultRecommendations(): AIRecommendation[] {
  return [
    {
      channel: "feed",
      enabled: true,
      reason: "Consistent feeding times help maintain healthy digestion.",
      priority: "medium",
      frequency: "2x daily",
      schedule: "8:00 AM & 6:00 PM",
      aiInsight: "Cats prefer routine - same times each day reduces stress.",
    },
    {
      channel: "play",
      enabled: false,
      reason: "Daily play keeps cats mentally stimulated and physically fit.",
      priority: "medium",
      frequency: "Daily",
      schedule: "5:00 PM",
      aiInsight: "Evening play mimics natural hunting behavior.",
    },
    {
      channel: "vet",
      enabled: true,
      reason: "Regular checkups catch health issues early.",
      priority: "medium",
      frequency: "Yearly",
      schedule: "Next reminder in ~12 months",
      aiInsight: "Preventive care is more affordable than treatment.",
    },
    {
      channel: "litter",
      enabled: false,
      reason: "Clean litter promotes good bathroom habits.",
      priority: "low",
      frequency: "Daily",
      schedule: "7:00 PM",
      aiInsight: "Cats prefer clean litter - scoop daily for best results.",
    },
  ];
}
