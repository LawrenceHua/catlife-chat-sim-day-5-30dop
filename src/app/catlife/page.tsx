"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Cat, MessageCircle, Camera, Sparkles, Activity, Bell, Info } from "lucide-react";
import { 
  CatChat, 
  PhotoUpload, 
  PixelAvatar, 
  SimulationTimeline, 
  ReminderSetup,
  ModeSelector,
  MultiPhotoUpload,
  QuickSetupForm,
} from "@/components/catlife";
import { AnimatedCat } from "@/components/catlife/AnimatedCat";
import type { SetupMode, PhotoAngle } from "@/components/catlife";
import type { CatProfile, CareRoutine, PhotoAnalysis, SimulationResult } from "@/types/catlife";
import { DEFAULT_CAT_PROFILE, DEFAULT_CARE_ROUTINE } from "@/types/catlife";

// App flow steps
type AppStep = 
  | "mode_select"     // Choose Quick Setup vs Chat
  | "quick_photos"    // Multi-photo upload for Quick Setup
  | "quick_form"      // Form with sliders/dropdowns
  | "chat"            // Chat flow
  | "photo"           // Single photo for chat flow
  | "simulation"      // Health simulation
  | "reminders"       // Reminder setup
  | "complete";       // Done!

export default function CatLifePage() {
  // State
  const [currentStep, setCurrentStep] = useState<AppStep>("mode_select");
  const [setupMode, setSetupMode] = useState<SetupMode | null>(null);
  const [catProfile, setCatProfile] = useState<CatProfile>({ ...DEFAULT_CAT_PROFILE });
  const [careRoutine, setCareRoutine] = useState<CareRoutine>({ ...DEFAULT_CARE_ROUTINE });
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [quickPhotos, setQuickPhotos] = useState<Record<PhotoAngle, string> | null>(null);

  // Handlers
  const handleModeSelect = useCallback((mode: SetupMode) => {
    setSetupMode(mode);
    if (mode === "quick") {
      setCurrentStep("quick_photos");
    } else {
      setCurrentStep("chat");
    }
  }, []);

  const handleQuickPhotosComplete = useCallback((photos: Record<PhotoAngle, string>) => {
    setQuickPhotos(photos);
    setCatProfile(prev => ({ ...prev, photoUrl: photos.front }));
    setCurrentStep("quick_form");
  }, []);

  const handleQuickFormComplete = useCallback((profile: CatProfile, routine: CareRoutine) => {
    setCatProfile(profile);
    setCareRoutine(routine);
    setCurrentStep("simulation");
  }, []);

  const handleProfileUpdate = useCallback(
    (profileUpdates: Partial<CatProfile>, routineUpdates: Partial<CareRoutine>) => {
      if (Object.keys(profileUpdates).length > 0) {
        setCatProfile((prev) => ({ ...prev, ...profileUpdates }));
      }
      if (Object.keys(routineUpdates).length > 0) {
        setCareRoutine((prev) => ({ ...prev, ...routineUpdates }));
      }
    },
    []
  );

  const handlePhotoRequested = useCallback(() => {
    setShowPhotoModal(true);
  }, []);

  const handlePhotoAnalyzed = useCallback(
    (analysis: PhotoAnalysis, imageUrl: string) => {
      setPhotoAnalysis(analysis);
      setCatProfile((prev) => ({ ...prev, photoUrl: imageUrl }));
      setShowPhotoModal(false);
      if (!analysis.mismatchDetected) {
        setTimeout(() => setCurrentStep("simulation"), 500);
      }
    },
    []
  );

  const handlePhotoSkipped = useCallback(() => {
    setShowPhotoModal(false);
    setCurrentStep("simulation");
  }, []);

  const handleReadyForSimulation = useCallback(() => {
    if (!showPhotoModal) {
      setCurrentStep("simulation");
    }
  }, [showPhotoModal]);

  const handleSimulationComplete = useCallback((result: SimulationResult) => {
    setSimulationResult(result);
  }, []);

  const handleAvatarGenerated = useCallback((url: string) => {
    setCatProfile((prev) => ({ ...prev, avatarUrl: url }));
  }, []);

  const handleReset = useCallback(() => {
    setCatProfile({ ...DEFAULT_CAT_PROFILE });
    setCareRoutine({ ...DEFAULT_CARE_ROUTINE });
    setPhotoAnalysis(null);
    setSimulationResult(null);
    setQuickPhotos(null);
    setSetupMode(null);
    setCurrentStep("mode_select");
  }, []);

  // Progress steps for header (only show after mode selection)
  const getProgressSteps = () => {
    if (setupMode === "quick") {
      return [
        { id: "quick_photos", label: "Photos", icon: Camera },
        { id: "quick_form", label: "Details", icon: Sparkles },
        { id: "simulation", label: "Simulate", icon: Activity },
        { id: "reminders", label: "Reminders", icon: Bell },
      ];
    }
    return [
      { id: "chat", label: "Chat", icon: MessageCircle },
      { id: "simulation", label: "Simulate", icon: Activity },
      { id: "reminders", label: "Reminders", icon: Bell },
    ];
  };

  const steps = getProgressSteps();
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const showProgress = currentStep !== "mode_select" && currentStep !== "complete";

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      {/* Header - Compact */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-lg border-b border-amber-200">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <Link
              href="/30-days-of-product"
              className="inline-flex items-center text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="font-medium text-sm hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <Cat className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-amber-900 text-sm">CatLife</span>
            </div>
            <div className="w-12" />
          </div>
        </div>
      </header>

      {/* Progress Steps - Compact */}
      {showProgress && (
        <div className="flex-shrink-0 bg-white/50 py-2">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => {
                      if (isCompleted) {
                        setCurrentStep(step.id as AppStep);
                      }
                    }}
                    disabled={!isCompleted && !isActive}
                    className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full transition-all text-xs ${
                      isActive
                        ? "bg-amber-500 text-white shadow-md"
                        : isCompleted
                        ? "bg-amber-200 text-amber-700 hover:bg-amber-300"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="font-medium hidden sm:inline">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-3 sm:w-4 h-0.5 ${
                        index < currentStepIndex ? "bg-amber-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content - Fills remaining space */}
      <main className="flex-1 min-h-0 overflow-hidden p-2 sm:p-3">
        <div className="h-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Mode Selection */}
            {currentStep === "mode_select" && (
              <motion.div
                key="mode_select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <ModeSelector onSelectMode={handleModeSelect} />
              </motion.div>
            )}

            {/* Quick Setup - Photo Upload */}
            {currentStep === "quick_photos" && (
              <motion.div
                key="quick_photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <MultiPhotoUpload 
                  onAllPhotosUploaded={handleQuickPhotosComplete}
                  onBack={() => setCurrentStep("mode_select")}
                />
              </motion.div>
            )}

            {/* Quick Setup - Form */}
            {currentStep === "quick_form" && quickPhotos && (
              <motion.div
                key="quick_form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <QuickSetupForm
                  photos={quickPhotos}
                  onComplete={handleQuickFormComplete}
                  onBack={() => setCurrentStep("quick_photos")}
                />
              </motion.div>
            )}

            {/* Chat Flow */}
            {currentStep === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col lg:grid lg:grid-cols-2 gap-2 sm:gap-3"
              >
                {/* Chat Panel */}
                <div className="flex-1 lg:flex-none bg-white rounded-2xl shadow-xl overflow-hidden">
                  <CatChat
                    catProfile={catProfile}
                    careRoutine={careRoutine}
                    onProfileUpdate={handleProfileUpdate}
                    onPhotoRequested={handlePhotoRequested}
                    onReadyForSimulation={handleReadyForSimulation}
                    photoAnalysis={photoAnalysis ? { mismatchDetected: false } : undefined}
                  />
                </div>

                {/* Preview Panel - Compact on mobile, full on desktop */}
                <div className={`bg-white rounded-2xl shadow-xl p-2 lg:p-3 flex items-center lg:items-center lg:justify-center ${
                  catProfile.name ? 'flex-shrink-0' : 'hidden lg:flex'
                }`}>
                  {catProfile.name ? (
                    <>
                      {/* Compact view on mobile */}
                      <div className="lg:hidden w-full">
                        <PixelAvatar
                          catProfile={catProfile}
                          photoAnalysis={photoAnalysis}
                          onAvatarGenerated={handleAvatarGenerated}
                          autoGenerate={false}
                          compact={true}
                        />
                      </div>
                      {/* Full view on desktop */}
                      <div className="hidden lg:block w-full">
                        <PixelAvatar
                          catProfile={catProfile}
                          photoAnalysis={photoAnalysis}
                          onAvatarGenerated={handleAvatarGenerated}
                          autoGenerate={false}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Cat className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                      <h3 className="text-sm font-semibold text-amber-900 mb-1">
                        Your Cat's Avatar
                      </h3>
                      <p className="text-amber-600 text-xs">
                        Tell me about your cat!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Simulation */}
            {currentStep === "simulation" && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col lg:grid lg:grid-cols-2 gap-2 sm:gap-3"
              >
                {/* Animated Cat & Info - Compact on mobile */}
                <div className="flex-shrink-0 lg:flex-1 bg-white rounded-2xl shadow-xl p-3 flex flex-col">
                  <div className="flex flex-col gap-3">
                    {/* Animated Cat - cute lifelike animations */}
                    <AnimatedCat
                      catProfile={catProfile}
                      photoAnalysis={photoAnalysis}
                      compact={false}
                      autoAnimate={true}
                    />
                    
                    {/* Profile Summary */}
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <h4 className="font-semibold text-amber-900 mb-1 text-xs lg:text-sm">{catProfile.name || "Cat"}</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>
                          <span className="text-amber-600">Age:</span>{" "}
                          <span className="text-amber-900">{catProfile.ageYears || "?"} yrs</span>
                        </div>
                        <div>
                          <span className="text-amber-600">Weight:</span>{" "}
                          <span className="text-amber-900">{catProfile.weightKg ? `${catProfile.weightKg}kg` : "?"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation Timeline */}
                <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-xl p-3 flex flex-col overflow-y-auto">
                  <div className="flex-shrink-0">
                    <SimulationTimeline
                      catProfile={catProfile}
                      careRoutine={careRoutine}
                      onComplete={handleSimulationComplete}
                    />
                  </div>
                  
                  {/* Continue Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep("reminders")}
                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 flex-shrink-0 text-sm"
                  >
                    <Bell className="w-4 h-4 flex-shrink-0" />
                    Set Up Reminders
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Reminders */}
            {currentStep === "reminders" && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col lg:grid lg:grid-cols-2 gap-2 sm:gap-3"
              >
                {/* Animated Cat - Hidden on mobile */}
                <div className="hidden lg:flex bg-white rounded-2xl shadow-xl p-4 flex-col items-center justify-center">
                  <AnimatedCat
                    catProfile={catProfile}
                    photoAnalysis={photoAnalysis}
                    compact={false}
                    autoAnimate={true}
                  />
                </div>

                {/* Reminder Setup */}
                <div className="flex-1 bg-white rounded-2xl shadow-xl p-3 overflow-hidden">
                  <ReminderSetup
                    catName={catProfile.name || "Your cat"}
                    catProfile={catProfile}
                    careRoutine={careRoutine}
                    simulationResult={simulationResult}
                    onComplete={() => setCurrentStep("complete")}
                  />
                </div>
              </motion.div>
            )}

            {/* Complete */}
            {currentStep === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex items-center justify-center"
              >
                <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl p-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mb-3 text-center"
                  >
                    <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
                  </motion.div>
                  
                  <h2 className="text-lg font-bold text-amber-900 mb-2 text-center">
                    You're All Set! 🎉
                  </h2>
                  <p className="text-amber-700 mb-4 text-sm text-center">
                    {catProfile.name}'s simulation is complete!
                  </p>

                  {catProfile.avatarUrl && (
                    <img
                      src={catProfile.avatarUrl}
                      alt={`${catProfile.name}'s avatar`}
                      className="w-24 h-24 mx-auto rounded-xl shadow-lg mb-4"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 bg-amber-100 text-amber-700 font-semibold rounded-xl hover:bg-amber-200 transition-colors text-sm"
                    >
                      Start Over
                    </button>
                    <Link
                      href="/30-days-of-product"
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg text-center text-sm"
                    >
                      Back to 30 Days
                    </Link>
                  </div>
                  
                  {/* Inline Disclaimer */}
                  <div className="mt-4 flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <Info className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-600 leading-tight">
                      CatLife is for fun, not medical advice. Consult a vet for health concerns.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Photo Upload Modal (for Chat mode) */}
      <PhotoUpload
        isOpen={showPhotoModal}
        catProfile={catProfile}
        onPhotoAnalyzed={handlePhotoAnalyzed}
        onSkip={handlePhotoSkipped}
      />
    </div>
  );
}
