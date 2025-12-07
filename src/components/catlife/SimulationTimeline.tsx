"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Info, 
  AlertCircle, 
  Loader2, 
  Play, 
  Pause, 
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calendar,
  Activity
} from "lucide-react";
import type {
  CatProfile,
  CareRoutine,
  SimulationResult,
  SimulationAlert,
  HealthStatus,
  EnhancedSimulationResult,
  EnhancedSimulationPoint,
  HealthTrajectory,
  ProgressiveRecommendation,
} from "@/types/catlife";

interface SimulationTimelineProps {
  catProfile: CatProfile;
  careRoutine: CareRoutine;
  onComplete?: (result: SimulationResult | EnhancedSimulationResult) => void;
}

// Preset year buttons for quick navigation
const YEAR_PRESETS = [
  { year: 1, label: "1y" },
  { year: 3, label: "3y" },
  { year: 5, label: "5y" },
  { year: 7, label: "7y" },
  { year: 10, label: "10y" },
  { year: 15, label: "15y" },
  { year: 20, label: "20y" },
];

type TabType = "timeline" | "trajectory" | "recommendations";

export function SimulationTimeline({
  catProfile,
  careRoutine,
  onComplete,
}: SimulationTimelineProps) {
  const [simulation, setSimulation] = useState<EnhancedSimulationResult | SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAgeMonths, setCurrentAgeMonths] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<SimulationAlert | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("timeline");

  const startAge = useMemo(() => {
    return ((catProfile.ageYears ?? 1) * 12) + (catProfile.ageMonths ?? 0);
  }, [catProfile.ageYears, catProfile.ageMonths]);

  // Check if we have enhanced simulation
  const isEnhanced = simulation && "isEnhanced" in simulation && simulation.isEnhanced;
  const enhancedSim = isEnhanced ? (simulation as EnhancedSimulationResult) : null;

  useEffect(() => { runSimulation(); }, []);

  useEffect(() => {
    if (simulation) setCurrentAgeMonths(startAge);
  }, [simulation, startAge]);

  // Auto-play animation - advances every 2 seconds
  useEffect(() => {
    if (!isPlaying || !simulation) return;
    const interval = setInterval(() => {
      setCurrentAgeMonths(prev => {
        if (prev >= 240) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 12; // Advance 1 year at a time
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, simulation]);

  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, get the basic simulation quickly
      const response = await fetch("/api/catlife/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catProfile, careRoutine, enhanced: true }),
      });
      const data = await response.json();
      if (data.success && data.simulation) {
        setSimulation(data.simulation);
        onComplete?.(data.simulation);

        // Check if simulation has GPT-generated notes (not just local enhancement)
        // Local enhancement sets isEnhanced but doesn't add GPT notes
        const hasGPTNotes = data.simulation.enhancedPoints?.some(
          (p: { enhancedNote?: { personalizedNote?: string } }) => p.enhancedNote?.personalizedNote
        );
        
        // If no GPT notes, try to enhance with GPT in background
        if (!hasGPTNotes) {
          enhanceWithGPT(data.simulation);
        }
      } else {
        throw new Error(data.error || "Failed to run simulation");
      }
    } catch (err) {
      console.error("Simulation error:", err);
      setError("Couldn't run the simulation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceWithGPT = async (baseSimulation: SimulationResult) => {
    setIsEnhancing(true);
    try {
      // Get year milestones only
      const yearMilestones = baseSimulation.points.filter(p => p.ageMonths % 12 === 0);
      
      // Build trajectory from base simulation
      const trajectory = analyzeTrajectoryLocally(baseSimulation.points);
      
      const response = await fetch("/api/catlife/generate-milestone-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catProfile,
          careRoutine,
          simulationPoints: yearMilestones,
          trajectory,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.notes) {
          // Merge enhanced notes into simulation
          const enhancedPoints: EnhancedSimulationPoint[] = baseSimulation.points.map(point => {
            const ageYears = Math.floor(point.ageMonths / 12);
            const gptNote = data.notes.find((n: { ageYears: number }) => n.ageYears === ageYears);
            if (gptNote) {
              return {
                ...point,
                enhancedNote: gptNote,
                notes: gptNote.personalizedNote || point.notes,
              };
            }
            return point;
          });

          const enhanced: EnhancedSimulationResult = {
            ...baseSimulation,
            enhancedPoints,
            trajectory,
            breedProfile: null, // Will be filled by server
            progressiveTimeline: [],
            isEnhanced: true,
          };

          setSimulation(enhanced);
          onComplete?.(enhanced);
        }
      }
    } catch (err) {
      console.error("Enhancement error:", err);
      // Keep using base simulation
    } finally {
      setIsEnhancing(false);
    }
  };

  // Local trajectory analysis (simplified version)
  const analyzeTrajectoryLocally = (points: { ageMonths: number; healthStatus: HealthStatus }[]): HealthTrajectory => {
    const statusScores: Record<HealthStatus, number> = {
      thriving: 4, ok: 3, risky: 2, unhealthy: 1
    };
    
    const yearlyPoints = points.filter(p => p.ageMonths % 12 === 0);
    const avgScore = yearlyPoints.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / yearlyPoints.length;
    
    const midpoint = Math.floor(yearlyPoints.length / 2);
    const firstHalf = yearlyPoints.slice(0, midpoint);
    const secondHalf = yearlyPoints.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / secondHalf.length;
    
    let trend: "improving" | "stable" | "declining" = "stable";
    if (secondHalfAvg > firstHalfAvg + 0.3) trend = "improving";
    else if (secondHalfAvg < firstHalfAvg - 0.3) trend = "declining";

    const year10Point = yearlyPoints.find(p => p.ageMonths === 120);
    const year15Point = yearlyPoints.find(p => p.ageMonths === 180);

    return {
      trend,
      projectedStatusAtYear10: year10Point?.healthStatus || "ok",
      projectedStatusAtYear15: year15Point?.healthStatus || "ok",
      riskFactors: [],
      positiveFactors: [],
      averageHealthScore: avgScore,
    };
  };

  const currentPoint = useMemo(() => {
    if (!simulation) return null;
    const points = isEnhanced ? enhancedSim!.enhancedPoints : simulation.points;
    return points.find((p) => p.ageMonths === currentAgeMonths) || 
           points.find((p) => p.ageMonths >= currentAgeMonths);
  }, [simulation, currentAgeMonths, isEnhanced, enhancedSim]);

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "thriving": return "bg-green-500";
      case "ok": return "bg-yellow-500";
      case "risky": return "bg-orange-500";
      case "unhealthy": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusBgColor = (status: HealthStatus) => {
    switch (status) {
      case "thriving": return "bg-green-50 border-green-200 text-green-800";
      case "ok": return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "risky": return "bg-orange-50 border-orange-200 text-orange-800";
      case "unhealthy": return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "declining": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving": return "text-green-600 bg-green-50 border-green-200";
      case "declining": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const jumpToYear = (year: number) => {
    const targetMonths = Math.max(startAge, year * 12);
    setCurrentAgeMonths(Math.min(targetMonths, 240));
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentAgeMonths >= 240) {
      setCurrentAgeMonths(startAge);
    }
    setIsPlaying(!isPlaying);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <p className="text-amber-700 font-medium text-sm">Simulating {catProfile.name}'s journey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-red-50 rounded-xl text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-red-700 font-medium text-sm">{error}</p>
        <button onClick={runSimulation} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700">
          Try Again
        </button>
      </div>
    );
  }

  if (!simulation) return null;

  const currentYear = Math.floor(currentAgeMonths / 12);
  const enhancedPoint = currentPoint && "enhancedNote" in currentPoint ? currentPoint as EnhancedSimulationPoint : null;

  return (
    <div className="flex flex-col">
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-3 bg-amber-50 rounded-lg p-1">
        {[
          { id: "timeline" as TabType, label: "Timeline", icon: Activity },
          { id: "trajectory" as TabType, label: "Health", icon: Heart },
          { id: "recommendations" as TabType, label: "Care Plan", icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-[10px] font-medium transition-all ${
              activeTab === id
                ? "bg-amber-500 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-100"
            }`}
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Enhancing indicator */}
      {isEnhancing && (
        <div className="flex items-center justify-center gap-2 mb-2 py-1 px-2 bg-purple-50 rounded-lg text-[10px] text-purple-700">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>Personalizing with AI...</span>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <>
          {/* Header with Current Status */}
          <div className="flex-shrink-0 mb-2">
            <h3 className="text-sm font-bold text-amber-900 text-center">{catProfile.name}'s Life Journey</h3>
            
            {/* Current Status Card */}
            {currentPoint && (
              <motion.div
                key={currentAgeMonths}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-2 p-2.5 rounded-xl border-2 ${getStatusBgColor(currentPoint.healthStatus)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 min-w-[2.25rem] rounded-full ${getStatusColor(currentPoint.healthStatus)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{currentYear}y</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm capitalize">{currentPoint.healthStatus}</p>
                      <p className="text-[10px] opacity-80">{currentPoint.weightKgEstimate}kg</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    {isEnhanced && enhancedPoint?.enhancedNote && (
                      <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center justify-center gap-0.5">
                        <Sparkles className="w-2 h-2 flex-shrink-0" /> AI
                      </span>
                    )}
                    <button
                      onClick={togglePlay}
                      className="w-8 h-8 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/80 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {/* Notes - Show enhanced if available */}
                {currentPoint.notes && (
                  <p className="mt-1.5 text-[10px] opacity-90 leading-relaxed">{currentPoint.notes}</p>
                )}
                
                {/* Enhanced advice if available */}
                {enhancedPoint?.enhancedNote?.ageAppropriateAdvice && enhancedPoint.enhancedNote.ageAppropriateAdvice.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/10">
                    <p className="text-[9px] font-semibold mb-1 opacity-70">Year {currentYear} Focus:</p>
                    <ul className="text-[9px] opacity-80 space-y-0.5">
                      {enhancedPoint.enhancedNote.ageAppropriateAdvice.slice(0, 2).map((advice, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Breed-specific alerts */}
                {enhancedPoint?.enhancedNote?.breedSpecificAlerts && enhancedPoint.enhancedNote.breedSpecificAlerts.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/10">
                    <p className="text-[9px] font-semibold mb-1 opacity-70 flex items-center justify-start gap-1">
                      <AlertTriangle className="w-2 h-2 flex-shrink-0" /> Breed Alert:
                    </p>
                    <p className="text-[9px] opacity-80">{enhancedPoint.enhancedNote.breedSpecificAlerts[0]}</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Year Quick Jump Buttons */}
          <div className="flex-shrink-0 mb-2">
            <div className="flex gap-1 justify-center flex-wrap">
              {YEAR_PRESETS.map(({ year, label }) => {
                const isActive = currentYear === year;
                const isPast = year * 12 < startAge;
                return (
                  <button
                    key={year}
                    onClick={() => jumpToYear(year)}
                    disabled={isPast}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                      isActive
                        ? "bg-amber-500 text-white shadow-md scale-110"
                        : isPast
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="relative flex-shrink-0 mb-2">
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              {simulation.points.map((point, index) => {
                if (index === 0) return null;
                const prevPoint = simulation.points[index - 1];
                const width = ((point.ageMonths - prevPoint.ageMonths) / 240) * 100;
                const left = (prevPoint.ageMonths / 240) * 100;
                return (
                  <div
                    key={point.ageMonths}
                    className={`absolute h-full ${getStatusColor(point.healthStatus)} opacity-80`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
            </div>
            
            {/* Progress indicator */}
            <motion.div
              className="absolute top-0 h-2 bg-white/50 rounded-full"
              style={{ left: 0, width: `${(currentAgeMonths / 240) * 100}%` }}
              animate={{ width: `${(currentAgeMonths / 240) * 100}%` }}
            />
            
            {/* Thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{ left: `${(currentAgeMonths / 240) * 100}%` }}
            >
              <div className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-amber-500" />
            </motion.div>

            {/* Clickable slider overlay */}
            <input
              type="range"
              min={startAge}
              max={240}
              value={currentAgeMonths}
              onChange={(e) => {
                setCurrentAgeMonths(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-2 flex-shrink-0 mb-2 text-[9px]">
            {[
              { status: "thriving", label: "Great", emoji: "💚" },
              { status: "ok", label: "OK", emoji: "💛" },
              { status: "risky", label: "Risky", emoji: "🧡" },
              { status: "unhealthy", label: "Poor", emoji: "❤️" },
            ].map(({ status, label, emoji }) => (
              <div key={status} className="flex items-center gap-0.5">
                <span>{emoji}</span>
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>

          {/* Key Milestones */}
          <div>
            <h4 className="font-semibold text-amber-900 text-xs flex items-center justify-start gap-1 mb-1.5">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Key Milestones ({simulation.alerts.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
              {simulation.alerts.slice(0, 8).map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => {
                    setCurrentAgeMonths(alert.ageMonths);
                    setSelectedAlert(selectedAlert?.id === alert.id ? null : alert);
                    setIsPlaying(false);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg border text-[10px] transition-all ${
                    selectedAlert?.id === alert.id
                      ? "bg-amber-100 border-amber-300 shadow-sm"
                      : Math.floor(alert.ageMonths / 12) === currentYear
                      ? "bg-amber-50 border-amber-200"
                      : "bg-white border-gray-200 hover:border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <div className="flex items-center justify-center w-3 h-3 mt-0.5 flex-shrink-0">
                      {alert.severity === "critical" ? (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      ) : alert.severity === "warning" ? (
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                      ) : (
                        <Info className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Y{Math.floor(alert.ageMonths / 12)}</span>
                        {alert.severity === "critical" && (
                          <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded">!</span>
                        )}
                      </div>
                      <p className="text-gray-800 font-medium line-clamp-1">{alert.message}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Trajectory Tab */}
      {activeTab === "trajectory" && enhancedSim?.trajectory && (
        <div className="space-y-3">
          {/* Overall Trajectory */}
          <div className={`p-3 rounded-xl border-2 ${getTrendColor(enhancedSim.trajectory.trend)}`}>
            <div className="flex items-center justify-start gap-2 mb-2">
              <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                {getTrendIcon(enhancedSim.trajectory.trend)}
              </div>
              <h4 className="font-bold text-sm capitalize">
                {enhancedSim.trajectory.trend} Trajectory
              </h4>
            </div>
            <p className="text-[11px] opacity-90">
              Based on {catProfile.name}'s current care routine, the health trajectory is{" "}
              <strong>{enhancedSim.trajectory.trend}</strong>.
            </p>
            
            {/* Score */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] opacity-70">Health Score:</span>
              <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    enhancedSim.trajectory.averageHealthScore > 3 ? "bg-green-500" :
                    enhancedSim.trajectory.averageHealthScore > 2 ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  style={{ width: `${(enhancedSim.trajectory.averageHealthScore / 4) * 100}%` }}
                />
              </div>
              <span className="text-[10px] font-bold">
                {enhancedSim.trajectory.averageHealthScore.toFixed(1)}/4
              </span>
            </div>
          </div>

          {/* Projections */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded-lg border">
              <p className="text-[9px] text-gray-500 mb-1">At Year 10</p>
              <p className={`text-xs font-bold capitalize ${
                enhancedSim.trajectory.projectedStatusAtYear10 === "thriving" ? "text-green-600" :
                enhancedSim.trajectory.projectedStatusAtYear10 === "ok" ? "text-yellow-600" :
                enhancedSim.trajectory.projectedStatusAtYear10 === "risky" ? "text-orange-600" :
                "text-red-600"
              }`}>
                {enhancedSim.trajectory.projectedStatusAtYear10}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg border">
              <p className="text-[9px] text-gray-500 mb-1">At Year 15</p>
              <p className={`text-xs font-bold capitalize ${
                enhancedSim.trajectory.projectedStatusAtYear15 === "thriving" ? "text-green-600" :
                enhancedSim.trajectory.projectedStatusAtYear15 === "ok" ? "text-yellow-600" :
                enhancedSim.trajectory.projectedStatusAtYear15 === "risky" ? "text-orange-600" :
                "text-red-600"
              }`}>
                {enhancedSim.trajectory.projectedStatusAtYear15}
              </p>
            </div>
          </div>

          {/* Risk Factors */}
          {enhancedSim.trajectory.riskFactors.length > 0 && (
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <h5 className="text-[10px] font-semibold text-red-700 mb-1 flex items-center justify-start gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Risk Factors
              </h5>
              <ul className="text-[10px] text-red-600 space-y-0.5">
                {enhancedSim.trajectory.riskFactors.map((risk, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Positive Factors */}
          {enhancedSim.trajectory.positiveFactors.length > 0 && (
            <div className="p-2 bg-green-50 rounded-lg border border-green-200">
              <h5 className="text-[10px] font-semibold text-green-700 mb-1 flex items-center justify-start gap-1">
                <Heart className="w-3 h-3 flex-shrink-0" /> Positive Factors
              </h5>
              <ul className="text-[10px] text-green-600 space-y-0.5">
                {enhancedSim.trajectory.positiveFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="mt-0.5">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Breed Profile */}
          {enhancedSim.breedProfile && (
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
              <h5 className="text-[10px] font-semibold text-purple-700 mb-1">
                {enhancedSim.breedProfile.breed} Profile
              </h5>
              <div className="text-[10px] text-purple-600 space-y-0.5">
                <p>Life expectancy: {enhancedSim.breedProfile.lifeExpectancy.min}-{enhancedSim.breedProfile.lifeExpectancy.max} years</p>
                <p>Ideal weight: {enhancedSim.breedProfile.idealWeight.min}-{enhancedSim.breedProfile.idealWeight.max} kg</p>
                {enhancedSim.breedProfile.generalNotes && (
                  <p className="mt-1 opacity-80">{enhancedSim.breedProfile.generalNotes}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-200">
            <h4 className="font-bold text-sm text-amber-900 mb-1">Summary</h4>
            <p className="text-[11px] text-amber-800">{simulation.summary}</p>
          </div>

          {/* Key Recommendations */}
          <div>
            <h4 className="font-semibold text-amber-900 text-xs mb-2">Key Recommendations</h4>
            <div className="space-y-1.5">
              {simulation.recommendations.map((rec, i) => (
                <div key={i} className="p-2 bg-white rounded-lg border flex items-start gap-2">
                  <span className="w-5 h-5 min-w-[1.25rem] bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[10px] text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Timeline */}
          {enhancedSim?.progressiveTimeline && enhancedSim.progressiveTimeline.length > 0 && (
            <div>
              <h4 className="font-semibold text-amber-900 text-xs mb-2 flex items-center justify-start gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" /> Progressive Care Timeline
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {enhancedSim.progressiveTimeline
                  .filter(rec => rec.ageYears >= (catProfile.ageYears ?? 1))
                  .slice(0, 10)
                  .map((rec, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded-lg border text-[10px] ${
                        rec.priority === "high" ? "bg-red-50 border-red-200" :
                        rec.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                        "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold">Year {rec.ageYears}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${
                          rec.category === "screening" ? "bg-blue-100 text-blue-700" :
                          rec.category === "diet" ? "bg-green-100 text-green-700" :
                          rec.category === "activity" ? "bg-orange-100 text-orange-700" :
                          rec.category === "monitoring" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {rec.category}
                        </span>
                      </div>
                      <p className="font-medium">{rec.recommendation}</p>
                      <p className="text-gray-500 mt-0.5">{rec.reason}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Non-enhanced fallback message */}
      {activeTab !== "timeline" && !isEnhanced && !isEnhancing && (
        <div className="p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-[10px] text-gray-500">
            Enhanced analysis is being loaded...
          </p>
        </div>
      )}
    </div>
  );
}
