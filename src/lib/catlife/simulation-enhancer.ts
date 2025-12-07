// CatLife - Simulation Enhancement Service
// Takes raw simulation results and enhances them with GPT-generated personalized notes

import type { 
  CatProfile, 
  CareRoutine, 
  SimulationResult, 
  SimulationPoint,
  SimulationAlert,
  HealthStatus,
} from "@/types/catlife";
import { 
  findBreedProfile, 
  getBreedAlertsForAge,
  getHealthRisksForAge,
  getUpcomingScreenings,
  getAgeSpecificAdvice,
  type BreedHealthProfile,
  type HealthRisk,
} from "./breed-health-data";

// ============================================
// TYPES
// ============================================

export interface HealthTrajectory {
  trend: "improving" | "stable" | "declining";
  projectedStatusAtYear10: HealthStatus;
  projectedStatusAtYear15: HealthStatus;
  riskFactors: string[];
  positiveFactors: string[];
  averageHealthScore: number;
}

export interface EnhancedMilestoneNote {
  ageYears: number;
  personalizedNote: string;
  breedSpecificAlerts: string[];
  ageAppropriateAdvice: string[];
  upcomingMilestones: string[];
  trajectoryInsight: string;
  priority: "high" | "medium" | "low";
}

export interface EnhancedSimulationPoint extends SimulationPoint {
  enhancedNote?: EnhancedMilestoneNote;
  breedHealthRisks?: HealthRisk[];
}

export interface EnhancedSimulationResult extends SimulationResult {
  enhancedPoints: EnhancedSimulationPoint[];
  trajectory: HealthTrajectory;
  breedProfile: BreedHealthProfile | null;
  progressiveTimeline: ProgressiveRecommendation[];
  isEnhanced: boolean;
}

export interface ProgressiveRecommendation {
  ageYears: number;
  category: "screening" | "diet" | "activity" | "monitoring" | "comfort";
  recommendation: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

// ============================================
// TRAJECTORY ANALYSIS
// ============================================

/**
 * Analyze the health trajectory from simulation points
 */
export function analyzeTrajectory(
  points: SimulationPoint[],
  catProfile: CatProfile,
  careRoutine: CareRoutine
): HealthTrajectory {
  const statusScores: Record<HealthStatus, number> = {
    thriving: 4,
    ok: 3,
    risky: 2,
    unhealthy: 1,
  };

  // Get yearly points for analysis
  const yearlyPoints = points.filter(p => p.ageMonths % 12 === 0);
  
  if (yearlyPoints.length < 2) {
    return {
      trend: "stable",
      projectedStatusAtYear10: "ok",
      projectedStatusAtYear15: "ok",
      riskFactors: [],
      positiveFactors: [],
      averageHealthScore: 3,
    };
  }

  // Calculate average health score
  const avgScore = yearlyPoints.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / yearlyPoints.length;

  // Analyze trend by comparing first half to second half
  const midpoint = Math.floor(yearlyPoints.length / 2);
  const firstHalf = yearlyPoints.slice(0, midpoint);
  const secondHalf = yearlyPoints.slice(midpoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, p) => sum + statusScores[p.healthStatus], 0) / secondHalf.length;
  
  let trend: "improving" | "stable" | "declining";
  if (secondHalfAvg > firstHalfAvg + 0.3) {
    trend = "improving";
  } else if (secondHalfAvg < firstHalfAvg - 0.3) {
    trend = "declining";
  } else {
    trend = "stable";
  }

  // Get projected status at year 10 and 15
  const year10Point = yearlyPoints.find(p => p.ageMonths === 120);
  const year15Point = yearlyPoints.find(p => p.ageMonths === 180);
  
  const projectedStatusAtYear10 = year10Point?.healthStatus || extrapolateStatus(avgScore, trend, 10);
  const projectedStatusAtYear15 = year15Point?.healthStatus || extrapolateStatus(avgScore, trend, 15);

  // Identify risk factors
  const riskFactors: string[] = [];
  const positiveFactors: string[] = [];

  // Care routine analysis
  const playMinutes = careRoutine.playMinutesPerDay ?? 0;
  const vetVisits = careRoutine.vetVisitsPerYear ?? 0;
  const treats = careRoutine.treatsPerDay ?? 0;

  if (playMinutes < 10) {
    riskFactors.push("Low activity level (less than 10 min/day)");
  } else if (playMinutes >= 20) {
    positiveFactors.push("Good daily activity level");
  }

  if (vetVisits < 1) {
    riskFactors.push("No regular vet visits");
  } else if (vetVisits >= 2) {
    positiveFactors.push("Regular vet checkups");
  }

  if (treats > 5) {
    riskFactors.push("High treat consumption");
  } else if (treats <= 2) {
    positiveFactors.push("Controlled treat intake");
  }

  if (careRoutine.foodType === "dry") {
    riskFactors.push("Dry food only (lower hydration)");
  } else if (careRoutine.foodType === "wet" || careRoutine.foodType === "mixed") {
    positiveFactors.push("Good food variety for hydration");
  }

  // Weight analysis
  const breedProfile = findBreedProfile(catProfile.breed);
  if (breedProfile && catProfile.weightKg) {
    if (catProfile.weightKg > breedProfile.idealWeight.max) {
      riskFactors.push("Current weight above ideal range");
    } else if (catProfile.weightKg >= breedProfile.idealWeight.min && catProfile.weightKg <= breedProfile.idealWeight.max) {
      positiveFactors.push("Weight in healthy range");
    }
  }

  // Known conditions
  if (catProfile.knownConditions && catProfile.knownConditions.length > 0) {
    riskFactors.push(`Existing health conditions: ${catProfile.knownConditions.join(", ")}`);
  }

  // Age factor
  const currentAge = catProfile.ageYears ?? 1;
  if (currentAge >= 10 && vetVisits < 2) {
    riskFactors.push("Senior cat needs more frequent vet visits");
  }

  return {
    trend,
    projectedStatusAtYear10,
    projectedStatusAtYear15,
    riskFactors,
    positiveFactors,
    averageHealthScore: avgScore,
  };
}

function extrapolateStatus(avgScore: number, trend: "improving" | "stable" | "declining", targetYear: number): HealthStatus {
  let adjustedScore = avgScore;
  
  if (trend === "declining") {
    adjustedScore -= 0.5;
  } else if (trend === "improving") {
    adjustedScore += 0.3;
  }

  // Senior years typically see some decline
  if (targetYear >= 15) {
    adjustedScore -= 0.3;
  }

  if (adjustedScore >= 3.5) return "thriving";
  if (adjustedScore >= 2.5) return "ok";
  if (adjustedScore >= 1.5) return "risky";
  return "unhealthy";
}

// ============================================
// BREED-AWARE ALERT GENERATION
// ============================================

/**
 * Generate breed-specific alerts to inject into the simulation
 */
export function generateBreedSpecificAlerts(
  catProfile: CatProfile,
  careRoutine: CareRoutine,
  points: SimulationPoint[]
): SimulationAlert[] {
  const breedProfile = findBreedProfile(catProfile.breed);
  if (!breedProfile) return [];

  const alerts: SimulationAlert[] = [];
  const catName = catProfile.name || "Your cat";
  const startAge = catProfile.ageYears ?? 1;

  // Generate alerts for health risks at appropriate ages
  breedProfile.healthRisks.forEach(risk => {
    const onsetMonth = risk.typicalOnsetYears * 12;
    
    // Only add alert if it's in the simulation range and not in the past
    if (onsetMonth >= startAge * 12) {
      // Pre-warning alert (1 year before typical onset)
      const preWarningMonth = Math.max(onsetMonth - 12, startAge * 12);
      if (preWarningMonth !== onsetMonth) {
        alerts.push({
          id: `breed-${risk.condition.replace(/\s/g, '-').toLowerCase()}-prewarning-${preWarningMonth}`,
          ageMonths: preWarningMonth,
          severity: risk.riskLevel === "high" ? "warning" : "info",
          message: `${catName} is approaching the typical onset age for ${risk.condition} in ${breedProfile.breed}s.`,
          recommendation: `Start monitoring: ${risk.monitoringAdvice}`,
        });
      }

      // Onset alert
      alerts.push({
        id: `breed-${risk.condition.replace(/\s/g, '-').toLowerCase()}-onset-${onsetMonth}`,
        ageMonths: onsetMonth,
        severity: risk.riskLevel === "high" ? "critical" : "warning",
        message: `${breedProfile.breed}s typically begin showing ${risk.condition} around age ${risk.typicalOnsetYears}.`,
        recommendation: risk.monitoringAdvice,
      });
    }
  });

  // Generate screening schedule alerts
  breedProfile.screeningSchedule.forEach(schedule => {
    const scheduleMonth = schedule.ageYears * 12;
    
    if (scheduleMonth >= startAge * 12) {
      alerts.push({
        id: `breed-screening-${schedule.ageYears}`,
        ageMonths: scheduleMonth,
        severity: "info",
        message: `Year ${schedule.ageYears} screening recommended for ${catName}.`,
        recommendation: `Schedule: ${schedule.screenings.join(", ")}. ${schedule.reason}`,
      });
    }
  });

  // Sort by age
  return alerts.sort((a, b) => a.ageMonths - b.ageMonths);
}

// ============================================
// PROGRESSIVE TIMELINE GENERATION
// ============================================

/**
 * Generate a progressive care timeline with year-by-year recommendations
 */
export function generateProgressiveTimeline(
  catProfile: CatProfile,
  careRoutine: CareRoutine,
  trajectory: HealthTrajectory,
  breedProfile: BreedHealthProfile | null
): ProgressiveRecommendation[] {
  const timeline: ProgressiveRecommendation[] = [];
  const startAge = catProfile.ageYears ?? 1;
  const catName = catProfile.name || "Your cat";

  // Generate recommendations for years 1-20
  for (let year = Math.max(1, startAge); year <= 20; year++) {
    const recommendations = generateYearRecommendations(
      year,
      catProfile,
      careRoutine,
      trajectory,
      breedProfile,
      catName
    );
    timeline.push(...recommendations);
  }

  return timeline;
}

function generateYearRecommendations(
  year: number,
  catProfile: CatProfile,
  careRoutine: CareRoutine,
  trajectory: HealthTrajectory,
  breedProfile: BreedHealthProfile | null,
  catName: string
): ProgressiveRecommendation[] {
  const recs: ProgressiveRecommendation[] = [];

  // Breed-specific screenings
  if (breedProfile) {
    const screening = breedProfile.screeningSchedule.find(s => s.ageYears === year);
    if (screening) {
      recs.push({
        ageYears: year,
        category: "screening",
        recommendation: screening.screenings.join(", "),
        reason: screening.reason,
        priority: year >= 7 ? "high" : "medium",
      });
    }

    // Health risk monitoring
    breedProfile.healthRisks.forEach(risk => {
      if (risk.typicalOnsetYears === year) {
        recs.push({
          ageYears: year,
          category: "monitoring",
          recommendation: `Begin ${risk.condition} monitoring`,
          reason: risk.monitoringAdvice,
          priority: risk.riskLevel === "high" ? "high" : "medium",
        });
      }
    });
  }

  // Age-based general recommendations
  if (year === 1) {
    recs.push({
      ageYears: year,
      category: "screening",
      recommendation: "Complete first-year vaccinations and establish baseline bloodwork",
      reason: "Sets foundation for lifelong health monitoring",
      priority: "high",
    });
  }

  if (year === 7) {
    recs.push({
      ageYears: year,
      category: "screening",
      recommendation: "Begin senior wellness screening",
      reason: `${catName} enters mature adult years - early detection is key`,
      priority: "high",
    });
    
    if ((careRoutine.vetVisitsPerYear ?? 0) < 2) {
      recs.push({
        ageYears: year,
        category: "monitoring",
        recommendation: "Increase to twice-yearly vet visits",
        reason: "Senior cats benefit from more frequent health monitoring",
        priority: "medium",
      });
    }
  }

  if (year === 10) {
    recs.push({
      ageYears: year,
      category: "diet",
      recommendation: "Evaluate transition to senior cat food formula",
      reason: "Senior formulas support kidney function and joint health",
      priority: "medium",
    });
  }

  if (year === 12) {
    recs.push({
      ageYears: year,
      category: "comfort",
      recommendation: "Consider orthopedic bedding and easier litter box access",
      reason: "Supports mobility and comfort in senior years",
      priority: "medium",
    });
  }

  // Trajectory-based recommendations
  if (trajectory.trend === "declining" && year >= (catProfile.ageYears ?? 1) + 2) {
    if (trajectory.riskFactors.includes("Low activity level (less than 10 min/day)")) {
      recs.push({
        ageYears: year,
        category: "activity",
        recommendation: "Gradually increase daily play to 15-20 minutes",
        reason: "Improving activity can reverse declining health trajectory",
        priority: "high",
      });
    }
    if (trajectory.riskFactors.includes("No regular vet visits")) {
      recs.push({
        ageYears: year,
        category: "monitoring",
        recommendation: "Schedule a comprehensive health check",
        reason: "Regular monitoring essential for declining health trajectory",
        priority: "high",
      });
    }
  }

  return recs;
}

// ============================================
// MAIN ENHANCEMENT FUNCTION
// ============================================

/**
 * Enhance simulation results with breed-specific data and trajectory analysis
 * This is the LOCAL enhancement (no API calls) - fast and always available
 */
export function enhanceSimulationLocally(
  result: SimulationResult,
  catProfile: CatProfile,
  careRoutine: CareRoutine
): EnhancedSimulationResult {
  const breedProfile = findBreedProfile(catProfile.breed);
  const trajectory = analyzeTrajectory(result.points, catProfile, careRoutine);
  
  // Generate breed-specific alerts
  const breedAlerts = generateBreedSpecificAlerts(catProfile, careRoutine, result.points);
  
  // Merge with existing alerts and sort
  const mergedAlerts = [...result.alerts, ...breedAlerts]
    .sort((a, b) => a.ageMonths - b.ageMonths)
    // Remove duplicates based on similar messages at same age
    .filter((alert, index, self) => 
      index === self.findIndex(a => 
        a.ageMonths === alert.ageMonths && 
        a.message.substring(0, 30) === alert.message.substring(0, 30)
      )
    );

  // Enhance points with breed health risks
  const enhancedPoints: EnhancedSimulationPoint[] = result.points.map(point => {
    const ageYears = Math.floor(point.ageMonths / 12);
    const breedHealthRisks = breedProfile ? getHealthRisksForAge(breedProfile, ageYears) : [];
    
    return {
      ...point,
      breedHealthRisks,
    };
  });

  // Generate progressive timeline
  const progressiveTimeline = generateProgressiveTimeline(
    catProfile,
    careRoutine,
    trajectory,
    breedProfile
  );

  // Generate enhanced summary
  const enhancedSummary = generateEnhancedSummary(
    result.summary,
    trajectory,
    breedProfile,
    catProfile
  );

  // Generate enhanced recommendations
  const enhancedRecommendations = generateEnhancedRecommendations(
    result.recommendations,
    trajectory,
    breedProfile,
    catProfile,
    careRoutine
  );

  return {
    ...result,
    alerts: mergedAlerts,
    summary: enhancedSummary,
    recommendations: enhancedRecommendations,
    enhancedPoints,
    trajectory,
    breedProfile,
    progressiveTimeline,
    isEnhanced: true,
  };
}

function generateEnhancedSummary(
  originalSummary: string,
  trajectory: HealthTrajectory,
  breedProfile: BreedHealthProfile | null,
  catProfile: CatProfile
): string {
  const catName = catProfile.name || "Your cat";
  let summary = originalSummary;

  // Add trajectory insight
  if (trajectory.trend === "declining") {
    summary += ` The health trajectory shows some decline over time - small changes now can make a big difference.`;
  } else if (trajectory.trend === "improving") {
    summary += ` Great news - the health trajectory is improving with current care!`;
  }

  // Add breed-specific note
  if (breedProfile && breedProfile.breed !== "Domestic Shorthair") {
    const avgLifespan = (breedProfile.lifeExpectancy.min + breedProfile.lifeExpectancy.max) / 2;
    summary += ` As a ${breedProfile.breed}, ${catName} has an average life expectancy of ${Math.round(avgLifespan)} years with proper care.`;
  }

  return summary;
}

function generateEnhancedRecommendations(
  originalRecs: string[],
  trajectory: HealthTrajectory,
  breedProfile: BreedHealthProfile | null,
  catProfile: CatProfile,
  careRoutine: CareRoutine
): string[] {
  const recs = [...originalRecs];
  const catName = catProfile.name || "Your cat";

  // Add trajectory-based recommendations
  trajectory.riskFactors.forEach(risk => {
    if (risk.includes("Low activity") && !recs.some(r => r.includes("play"))) {
      recs.push(`Increase ${catName}'s daily play sessions to at least 15 minutes.`);
    }
    if (risk.includes("vet visits") && !recs.some(r => r.includes("vet"))) {
      recs.push(`Schedule regular vet checkups - at least annually, twice yearly for seniors.`);
    }
    if (risk.includes("treat") && !recs.some(r => r.includes("treat"))) {
      recs.push(`Reduce daily treats to 2-3 to support healthy weight.`);
    }
  });

  // Add breed-specific recommendations
  if (breedProfile) {
    const currentAge = catProfile.ageYears ?? 1;
    const upcomingRisks = breedProfile.healthRisks.filter(
      r => r.typicalOnsetYears > currentAge && r.typicalOnsetYears <= currentAge + 3
    );

    upcomingRisks.forEach(risk => {
      if (risk.riskLevel === "high" && !recs.some(r => r.includes(risk.condition))) {
        recs.push(`${breedProfile.breed}s are prone to ${risk.condition}. ${risk.monitoringAdvice}`);
      }
    });

    // Add age-specific advice
    const ageAdvice = getAgeSpecificAdvice(breedProfile, currentAge);
    if (ageAdvice && ageAdvice.advice.length > 0) {
      const newAdvice = ageAdvice.advice.find(a => !recs.some(r => r.includes(a.substring(0, 20))));
      if (newAdvice) {
        recs.push(newAdvice);
      }
    }
  }

  // Limit to top 6 recommendations
  return recs.slice(0, 6);
}

// ============================================
// GPT ENHANCEMENT (calls API for personalized notes)
// ============================================

/**
 * Enhance simulation with GPT-generated personalized milestone notes
 * This is the FULL enhancement with API calls - more personalized but slower
 */
export async function enhanceSimulationWithGPT(
  result: SimulationResult,
  catProfile: CatProfile,
  careRoutine: CareRoutine
): Promise<EnhancedSimulationResult> {
  // First, do the local enhancement
  const localEnhanced = enhanceSimulationLocally(result, catProfile, careRoutine);

  try {
    // Get year milestones only
    const yearMilestones = result.points.filter(p => p.ageMonths % 12 === 0);

    // Call the GPT API for batch note generation
    const response = await fetch("/api/catlife/generate-milestone-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        catProfile,
        careRoutine,
        simulationPoints: yearMilestones,
        trajectory: localEnhanced.trajectory,
      }),
    });

    if (!response.ok) {
      console.warn("[Simulation Enhancer] GPT API returned non-OK status, using local enhancement only");
      return localEnhanced;
    }

    const data = await response.json();
    
    if (!data.success || !data.notes) {
      console.warn("[Simulation Enhancer] GPT API returned no notes, using local enhancement only");
      return localEnhanced;
    }

    // Merge GPT notes into enhanced points
    const enhancedPoints: EnhancedSimulationPoint[] = localEnhanced.enhancedPoints.map(point => {
      const ageYears = Math.floor(point.ageMonths / 12);
      const gptNote = data.notes.find((n: EnhancedMilestoneNote) => n.ageYears === ageYears);
      
      if (gptNote) {
        return {
          ...point,
          enhancedNote: gptNote,
          notes: gptNote.personalizedNote, // Replace the generic note with personalized one
        };
      }
      
      return point;
    });

    return {
      ...localEnhanced,
      enhancedPoints,
    };
  } catch (error) {
    console.error("[Simulation Enhancer] Error calling GPT API:", error);
    // Fall back to local enhancement
    return localEnhanced;
  }
}

