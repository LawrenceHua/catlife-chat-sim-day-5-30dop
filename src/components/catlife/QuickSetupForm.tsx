"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  Loader2, 
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import type { CatProfile, CareRoutine, FeedingFrequency } from "@/types/catlife";
import { PhotoAngle } from "./MultiPhotoUpload";

interface QuickSetupFormProps {
  photos: Record<PhotoAngle, string>;
  initialProfile?: Partial<CatProfile>;
  initialRoutine?: Partial<CareRoutine>;
  onComplete: (profile: CatProfile, routine: CareRoutine) => void;
  onBack: () => void;
}

// Form field options
const SEX_OPTIONS = [
  { value: "male" as const, label: "♂ Male" },
  { value: "female" as const, label: "♀ Female" },
  { value: "unknown" as const, label: "?" },
];

const NEUTERED_OPTIONS = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
  { value: "unknown" as const, label: "?" },
];

const INDOOR_OPTIONS = [
  { value: "indoor" as const, label: "Indoor" },
  { value: "outdoor" as const, label: "Outdoor" },
  { value: "mixed" as const, label: "Both" },
];

const FOOD_TYPE_OPTIONS = [
  { value: "dry" as const, label: "🥣 Dry", desc: "Kibble" },
  { value: "wet" as const, label: "🥫 Wet", desc: "Canned" },
  { value: "mixed" as const, label: "🍽️ Mix", desc: "Both" },
  { value: "raw" as const, label: "🥩 Raw", desc: "Fresh" },
];

const FEEDING_FREQ_OPTIONS = [
  { value: 1 as FeedingFrequency, label: "1x", desc: "Once" },
  { value: 2 as FeedingFrequency, label: "2x", desc: "Twice" },
  { value: 3 as FeedingFrequency, label: "3x", desc: "Three" },
  { value: 4 as FeedingFrequency, label: "Free", desc: "Always" },
];

const BODY_CONDITION_OPTIONS = [
  { value: "underweight" as const, label: "Thin" },
  { value: "ideal" as const, label: "Ideal" },
  { value: "overweight" as const, label: "Heavy" },
  { value: "unknown" as const, label: "?" },
];

export function QuickSetupForm({
  photos,
  initialProfile,
  initialRoutine,
  onComplete,
  onBack,
}: QuickSetupFormProps) {
  // Form state
  const [name, setName] = useState(initialProfile?.name || "");
  const [ageYears, setAgeYears] = useState(initialProfile?.ageYears ?? 3);
  const [sex, setSex] = useState(initialProfile?.sex || "unknown");
  const [neutered, setNeutered] = useState<boolean | "unknown">(initialProfile?.neutered ?? "unknown");
  const [indoorOutdoor, setIndoorOutdoor] = useState(initialProfile?.indoorOutdoor || "indoor");
  const [weightKg, setWeightKg] = useState(initialProfile?.weightKg ?? 4.5);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [bodyCondition, setBodyCondition] = useState(initialProfile?.bodyCondition || "unknown");

  // Weight conversion helpers
  const kgToLbs = (kg: number) => Math.round(kg * 2.205 * 10) / 10;
  const lbsToKg = (lbs: number) => Math.round(lbs / 2.205 * 10) / 10;
  const displayWeight = weightUnit === "kg" ? weightKg : kgToLbs(weightKg);
  const weightMin = weightUnit === "kg" ? 2 : 4.4;
  const weightMax = weightUnit === "kg" ? 12 : 26.5;
  const weightStep = weightUnit === "kg" ? 0.5 : 1;
  
  // Care routine
  const [foodType, setFoodType] = useState(initialRoutine?.foodType || "mixed");
  const [feedingFrequency, setFeedingFrequency] = useState<FeedingFrequency>(initialRoutine?.feedingFrequency ?? 2);
  const [portionSize, setPortionSize] = useState(3); // oz per feeding
  const [playMinutes, setPlayMinutes] = useState(initialRoutine?.playMinutesPerDay ?? 15);
  const [treatsPerDay, setTreatsPerDay] = useState(initialRoutine?.treatsPerDay ?? 3);
  const [vetVisitsPerYear, setVetVisitsPerYear] = useState(initialRoutine?.vetVisitsPerYear ?? 1);
  
  // UI state
  const [step, setStep] = useState<1 | 2>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Partial<CatProfile> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { analyzePhotos(); }, []);

  const analyzePhotos = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/catlife/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photos.front, catProfile: { name } }),
      });
      const data = await response.json();
      if (!data.error && data.photoBodyCondition && data.photoBodyCondition !== "unknown") {
        setAiSuggestions({ bodyCondition: data.photoBodyCondition });
        setBodyCondition(data.photoBodyCondition);
      }
    } catch (err) {
      console.error("Photo analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (!name.trim()) { setError("Please enter your cat's name"); return; }
    setError(null);
    setStep(2);
  };

  const handleSubmit = () => {
    const profile: CatProfile = {
      name: name.trim(),
      ageYears,
      ageMonths: 0,
      sex: sex as CatProfile["sex"],
      neutered: neutered === "unknown" ? null : neutered,
      breed: "Mixed",
      indoorOutdoor: indoorOutdoor as CatProfile["indoorOutdoor"],
      weightKg,
      weightSource: "user_estimate",
      bodyCondition: bodyCondition as CatProfile["bodyCondition"],
      knownConditions: [],
      photoUrl: photos.front,
    };

    const routine: CareRoutine = {
      foodType: foodType as CareRoutine["foodType"],
      foodAmountOzPerDay: portionSize * feedingFrequency,
      feedingFrequency,
      treatsPerDay,
      playMinutesPerDay: playMinutes,
      vetVisitsPerYear,
      litterCleaningFrequency: "daily",
    };

    onComplete(profile, routine);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
        <button onClick={step === 1 ? onBack : () => setStep(1)} className="p-1 text-amber-600 hover:text-amber-800 flex items-center justify-center w-7 h-7">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold text-amber-900 text-sm">Quick Setup</span>
          <span className="text-xs text-amber-500 ml-1">({step}/2)</span>
        </div>
        <div className="w-7" />
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-amber-100 flex-shrink-0">
        <div className={`h-full bg-amber-500 transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`} />
      </div>

      {/* AI Analysis Banner */}
      {isAnalyzing && (
        <div className="px-3 py-1.5 bg-blue-50 flex items-center gap-2 flex-shrink-0">
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
          <span className="text-xs text-blue-700">Analyzing photos...</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-y-auto flex flex-col">
        {step === 1 ? (
          // Step 1: Cat Info
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <img src={photos.front} alt="Cat" className="w-14 h-14 rounded-xl object-cover shadow" />
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cat's name"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-amber-900 placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 content-start">
              {/* Age */}
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-amber-800 mb-1 block">Age: {ageYears}y</label>
                <input type="range" min={0} max={20} value={ageYears}
                  onChange={(e) => setAgeYears(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-full accent-amber-500" />
              </div>

              {/* Weight with unit toggle */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-amber-800">
                    Weight: {displayWeight}{weightUnit}
                  </label>
                  <div className="flex bg-amber-100 rounded-full p-0.5">
                    <button
                      type="button"
                      onClick={() => setWeightUnit("kg")}
                      className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors ${
                        weightUnit === "kg" ? "bg-amber-500 text-white" : "text-amber-600"
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit("lbs")}
                      className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-colors ${
                        weightUnit === "lbs" ? "bg-amber-500 text-white" : "text-amber-600"
                      }`}
                    >
                      lbs
                    </button>
                  </div>
                </div>
                <input 
                  type="range" 
                  min={weightMin} 
                  max={weightMax} 
                  step={weightStep} 
                  value={displayWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setWeightKg(weightUnit === "kg" ? val : lbsToKg(val));
                  }}
                  className="w-full h-2 bg-amber-100 rounded-full accent-amber-500" 
                />
              </div>

              {/* Sex */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Sex</label>
                <div className="flex gap-1">
                  {SEX_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setSex(opt.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                        sex === opt.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Neutered */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Fixed?</label>
                <div className="flex gap-1">
                  {NEUTERED_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setNeutered(opt.value === "yes" ? true : opt.value === "no" ? false : "unknown")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                        (neutered === true && opt.value === "yes") || (neutered === false && opt.value === "no") || (neutered === "unknown" && opt.value === "unknown")
                          ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Indoor/Outdoor */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Lifestyle</label>
                <div className="flex gap-1">
                  {INDOOR_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setIndoorOutdoor(opt.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                        indoorOutdoor === opt.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Body Condition */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block flex items-center gap-1">
                  Body {aiSuggestions?.bodyCondition && <span className="text-green-500">✓AI</span>}
                </label>
                <div className="flex gap-1">
                  {BODY_CONDITION_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setBodyCondition(opt.value)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                        bodyCondition === opt.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            <motion.button onClick={handleNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm flex-shrink-0">
              Next <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          // Step 2: Care Routine with Food Details
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-amber-900 mb-2 flex-shrink-0">🍽️ Feeding & Care for {name}</h3>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Food Type */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1.5 block">What does {name} eat?</label>
                <div className="grid grid-cols-4 gap-1">
                  {FOOD_TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setFoodType(opt.value)}
                      className={`py-2 px-1 rounded-lg text-center ${
                        foodType === opt.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                      <div className="text-sm">{opt.label.split(' ')[0]}</div>
                      <div className="text-[9px] opacity-80">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeding Frequency */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1.5 block">How often do you feed {name}?</label>
                <div className="grid grid-cols-4 gap-1">
                  {FEEDING_FREQ_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setFeedingFrequency(opt.value)}
                      className={`py-2 px-1 rounded-lg text-center ${
                        feedingFrequency === opt.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[9px] opacity-80">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Size */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">
                  Portion: ~{portionSize}oz per meal ({(portionSize * feedingFrequency).toFixed(0)}oz/day)
                </label>
                <input type="range" min={1} max={6} step={0.5} value={portionSize}
                  onChange={(e) => setPortionSize(parseFloat(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-full accent-amber-500" />
                <div className="flex justify-between text-[9px] text-amber-400 mt-0.5">
                  <span>Small</span><span>Medium</span><span>Large</span>
                </div>
              </div>

              {/* Treats */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Treats: {treatsPerDay}/day</label>
                <input type="range" min={0} max={10} value={treatsPerDay}
                  onChange={(e) => setTreatsPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-full accent-amber-500" />
              </div>

              {/* Playtime */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1 block">Playtime: {playMinutes}min/day</label>
                <input type="range" min={0} max={60} step={5} value={playMinutes}
                  onChange={(e) => setPlayMinutes(parseInt(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-full accent-amber-500" />
              </div>

              {/* Vet Visits */}
              <div>
                <label className="text-xs font-medium text-amber-800 mb-1.5 block">Vet checkups per year</label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(v => (
                    <button key={v} type="button" onClick={() => setVetVisitsPerYear(v)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                        vetVisitsPerYear === v ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>{v === 0 ? "Rarely" : v === 3 ? "3+" : v + "x"}</button>
                  ))}
                </div>
              </div>
            </div>

            <motion.button onClick={handleSubmit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={isAnalyzing}
              className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm flex-shrink-0 disabled:opacity-50">
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Check className="w-4 h-4" /> Run Simulation</>}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
