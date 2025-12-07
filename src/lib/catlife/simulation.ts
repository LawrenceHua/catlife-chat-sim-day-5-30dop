// CatLife Chat Sim - Health Simulation Engine
// Enhanced with breed-specific data and trajectory analysis

import type {
  CatProfile,
  CareRoutine,
  SimulationConfig,
  SimulationPoint,
  SimulationAlert,
  SimulationResult,
  HealthStatus,
  EnhancedSimulationResult,
} from "@/types/catlife";
import { findBreedProfile } from "./breed-health-data";

// ============================================
// Constants & Reference Data
// ============================================

/**
 * Fallback weight ranges by breed category (in kg)
 * Used when breed not found in comprehensive database
 */
const FALLBACK_WEIGHT_RANGES: Record<string, { min: number; max: number }> = {
  small: { min: 2.5, max: 4.0 },
  medium: { min: 4.0, max: 5.5 },
  large: { min: 5.5, max: 8.0 },
  default: { min: 3.5, max: 5.5 },
};

/**
 * Fallback breed size mapping
 */
const FALLBACK_BREED_SIZES: Record<string, keyof typeof FALLBACK_WEIGHT_RANGES> = {
  "maine coon": "large",
  ragdoll: "large",
  "norwegian forest": "large",
  "british shorthair": "large",
  savannah: "large",
  bengal: "medium",
  persian: "medium",
  siamese: "small",
  abyssinian: "small",
  "devon rex": "small",
  "cornish rex": "small",
  sphynx: "small",
  "domestic shorthair": "medium",
  "domestic longhair": "medium",
  tabby: "medium",
  tuxedo: "medium",
  calico: "medium",
  default: "medium",
};

/**
 * Life stage boundaries (in months)
 */
const LIFE_STAGES = {
  kitten: { end: 12 },
  youngAdult: { end: 36 },
  adult: { end: 120 }, // 10 years
  senior: { end: 180 }, // 15 years
  geriatric: { end: 240 }, // 20 years
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get ideal weight range for a cat based on breed
 * Uses comprehensive breed database first, falls back to basic mapping
 */
function getIdealWeightRange(breed: string | null): { min: number; max: number } {
  // Try comprehensive breed database first
  const breedProfile = findBreedProfile(breed);
  if (breedProfile && breedProfile.breed !== "Domestic Shorthair") {
    return breedProfile.idealWeight;
  }

  // Fallback to basic mapping
  if (!breed) return FALLBACK_WEIGHT_RANGES.default;
  const normalizedBreed = breed.toLowerCase().trim();
  const size = FALLBACK_BREED_SIZES[normalizedBreed] || "default";
  return FALLBACK_WEIGHT_RANGES[size];
}

/**
 * Calculate calorie balance proxy
 * Positive = weight gain tendency, Negative = weight loss tendency
 */
function calculateCalorieProxy(
  careRoutine: CareRoutine,
  indoorOutdoor: string | null,
  currentWeight: number,
  idealWeight: number
): number {
  let proxy = 0;

  // Food amount impact
  const foodOz = careRoutine.foodAmountOzPerDay ?? 3.5; // Default ~100g
  const idealFoodOz = (idealWeight * 2.2) * 0.5; // ~0.5 oz per lb
  proxy += (foodOz - idealFoodOz) * 0.1;

  // Treats impact (each treat adds ~10 calories, roughly 0.01 weight drift)
  const treats = careRoutine.treatsPerDay ?? 2;
  proxy += treats * 0.02;

  // Activity impact (more play = negative calorie balance)
  const playMinutes = careRoutine.playMinutesPerDay ?? 15;
  proxy -= playMinutes * 0.01;

  // Indoor cats tend to be less active
  if (indoorOutdoor === "indoor") {
    proxy += 0.05;
  } else if (indoorOutdoor === "outdoor" || indoorOutdoor === "mixed") {
    proxy -= 0.05;
  }

  // Food type impact (wet food generally better for weight management)
  if (careRoutine.foodType === "wet" || careRoutine.foodType === "raw") {
    proxy -= 0.02;
  } else if (careRoutine.foodType === "dry") {
    proxy += 0.02;
  }

  return proxy;
}

/**
 * Determine health status based on weight deviation and other factors
 */
function determineHealthStatus(
  weight: number,
  idealRange: { min: number; max: number },
  vetVisitsPerYear: number | null,
  ageMonths: number,
  hasKnownConditions: boolean
): HealthStatus {
  const midIdeal = (idealRange.min + idealRange.max) / 2;
  const deviation = Math.abs(weight - midIdeal) / midIdeal;

  // Base status on weight
  let status: HealthStatus = "thriving";

  if (deviation < 0.1) {
    status = "thriving";
  } else if (deviation < 0.2) {
    status = "ok";
  } else if (deviation < 0.35) {
    status = "risky";
  } else {
    status = "unhealthy";
  }

  // Adjust for vet visits (no vet visits = higher risk)
  const vetVisits = vetVisitsPerYear ?? 0;
  if (vetVisits === 0 && ageMonths > 24) {
    if (status === "thriving") status = "ok";
    else if (status === "ok") status = "risky";
  }

  // Older cats need more care
  if (ageMonths > LIFE_STAGES.senior.end) {
    if (vetVisits < 1 && status !== "unhealthy") {
      status = status === "thriving" ? "ok" : "risky";
    }
  }

  // Known conditions increase risk
  if (hasKnownConditions) {
    if (vetVisits < 2) {
      if (status === "thriving") status = "ok";
    }
  }

  return status;
}

/**
 * Get life stage description
 */
function getLifeStage(ageMonths: number): string {
  if (ageMonths < LIFE_STAGES.kitten.end) return "kitten";
  if (ageMonths < LIFE_STAGES.youngAdult.end) return "young adult";
  if (ageMonths < LIFE_STAGES.adult.end) return "adult";
  if (ageMonths < LIFE_STAGES.senior.end) return "senior";
  return "geriatric";
}

/**
 * Generate notes for a simulation point
 */
function generateNotes(
  ageMonths: number,
  weight: number,
  status: HealthStatus,
  idealRange: { min: number; max: number },
  catName: string
): string {
  const ageYears = Math.floor(ageMonths / 12);
  const lifeStage = getLifeStage(ageMonths);
  const isOverweight = weight > idealRange.max;
  const isUnderweight = weight < idealRange.min;

  let note = `At age ${ageYears}, ${catName} is a ${lifeStage}. `;

  if (status === "thriving") {
    note += "Weight is in a healthy range and care routine looks great!";
  } else if (status === "ok") {
    if (isOverweight) {
      note += "Weight is slightly above ideal. A bit more playtime could help.";
    } else if (isUnderweight) {
      note += "Weight is slightly below ideal. Consider consulting your vet.";
    } else {
      note += "Overall health is stable, but there's room for improvement.";
    }
  } else if (status === "risky") {
    if (isOverweight) {
      note += "Weight is becoming a concern. Consider reducing treats and increasing activity.";
    } else if (isUnderweight) {
      note += "Weight is low. Please check with your vet to rule out health issues.";
    } else {
      note += "Some health indicators suggest closer attention is needed.";
    }
  } else {
    note += "Health needs attention. Please schedule a vet visit soon.";
  }

  return note;
}

// ============================================
// Alert Generation
// ============================================

/**
 * Check for and generate alerts at simulation milestones
 */
function generateAlerts(
  points: SimulationPoint[],
  catProfile: CatProfile,
  careRoutine: CareRoutine,
  idealRange: { min: number; max: number }
): SimulationAlert[] {
  const alerts: SimulationAlert[] = [];
  const catName = catProfile.name || "Your cat";

  let previousStatus: HealthStatus = "thriving";
  let hasWarnedAboutWeight = false;
  let hasWarnedAboutVet = false;

  for (const point of points) {
    // Status transition alerts
    if (point.healthStatus === "risky" && previousStatus !== "risky" && previousStatus !== "unhealthy") {
      alerts.push({
        id: `alert-risky-${point.ageMonths}`,
        ageMonths: point.ageMonths,
        severity: "warning",
        message: `At age ${Math.floor(point.ageMonths / 12)}, ${catName}'s health moves to "risky" status.`,
        recommendation: "Consider adjusting diet, increasing playtime by 10-15 minutes, and scheduling a vet checkup.",
      });
    }

    if (point.healthStatus === "unhealthy" && previousStatus !== "unhealthy") {
      alerts.push({
        id: `alert-unhealthy-${point.ageMonths}`,
        ageMonths: point.ageMonths,
        severity: "critical",
        message: `At age ${Math.floor(point.ageMonths / 12)}, ${catName} reaches "unhealthy" status.`,
        recommendation: "Urgent: Schedule a vet visit, significantly reduce treats, and increase daily activity.",
      });
    }

    // Weight-specific alerts
    if (!hasWarnedAboutWeight && point.weightKgEstimate > idealRange.max * 1.15) {
      hasWarnedAboutWeight = true;
      alerts.push({
        id: `alert-weight-${point.ageMonths}`,
        ageMonths: point.ageMonths,
        severity: "warning",
        message: `${catName}'s weight is trending 15%+ above ideal.`,
        recommendation: "Reduce treats to 1-2 per day, switch to measured portions, and add 10+ minutes of active play.",
      });
    }

    // Vet visit alerts for seniors
    if (!hasWarnedAboutVet && point.ageMonths >= LIFE_STAGES.adult.end && (careRoutine.vetVisitsPerYear ?? 0) < 1) {
      hasWarnedAboutVet = true;
      alerts.push({
        id: `alert-vet-${point.ageMonths}`,
        ageMonths: point.ageMonths,
        severity: "info",
        message: `${catName} is entering their senior years. Regular vet visits become more important.`,
        recommendation: "Consider scheduling annual or bi-annual vet checkups to catch age-related issues early.",
      });
    }

    previousStatus = point.healthStatus;
  }

  // Life stage milestone alerts
  const milestoneMonths = [
    { month: 12, message: "reaches 1 year old - no longer a kitten!" },
    { month: 84, message: "turns 7 - now considered a mature adult." },
    { month: 120, message: "turns 10 - entering senior years." },
    { month: 180, message: "turns 15 - a wonderful achievement!" },
  ];

  for (const milestone of milestoneMonths) {
    const point = points.find((p) => p.ageMonths === milestone.month);
    if (point) {
      alerts.push({
        id: `milestone-${milestone.month}`,
        ageMonths: milestone.month,
        severity: "info",
        message: `${catName} ${milestone.message}`,
        recommendation: getLifeStageRecommendation(milestone.month, careRoutine),
      });
    }
  }

  // Sort alerts by age
  return alerts.sort((a, b) => a.ageMonths - b.ageMonths);
}

/**
 * Get recommendations based on life stage
 */
function getLifeStageRecommendation(ageMonths: number, careRoutine: CareRoutine): string {
  if (ageMonths === 12) {
    return "Transition to adult food if you haven't already. Keep up the play sessions!";
  }
  if (ageMonths === 84) {
    return "Consider more frequent vet checkups and monitor for any behavior changes.";
  }
  if (ageMonths === 120) {
    return "Switch to senior cat food, increase vet visits to twice yearly, and watch for mobility issues.";
  }
  if (ageMonths === 180) {
    return "Focus on comfort and quality of life. Consider joint supplements and easier-access litter boxes.";
  }
  return "Keep providing love, good food, and regular vet care!";
}

// ============================================
// Main Simulation Function
// ============================================

/**
 * Run the cat health simulation
 * Generates monthly data points from current age to 20 years (240 months)
 */
export function runSimulation(config: SimulationConfig): SimulationResult {
  const { catProfile, careRoutine, startAgeMonths, endAgeMonths } = config;

  const catName = catProfile.name || "Your cat";
  const idealRange = getIdealWeightRange(catProfile.breed);
  const midIdeal = (idealRange.min + idealRange.max) / 2;

  // Starting weight
  let currentWeight = catProfile.weightKg ?? midIdeal;

  // Calculate calorie proxy for weight drift
  const calorieProxy = calculateCalorieProxy(
    careRoutine,
    catProfile.indoorOutdoor,
    currentWeight,
    midIdeal
  );

  const points: SimulationPoint[] = [];

  // Generate monthly simulation points
  for (let month = startAgeMonths; month <= endAgeMonths; month++) {
    // Weight drift with some randomness
    const monthlyDrift = calorieProxy * 0.02; // Small monthly change
    const noise = (Math.random() - 0.5) * 0.05; // Small random noise
    currentWeight = Math.max(1.5, currentWeight + monthlyDrift + noise);

    // Age-related weight changes
    if (month < 12) {
      // Kittens grow
      currentWeight = Math.min(currentWeight * 1.05, idealRange.max);
    } else if (month > LIFE_STAGES.senior.end) {
      // Very old cats may lose weight
      currentWeight = Math.max(currentWeight * 0.998, idealRange.min * 0.8);
    }

    // Determine health status
    const status = determineHealthStatus(
      currentWeight,
      idealRange,
      careRoutine.vetVisitsPerYear,
      month,
      catProfile.knownConditions.length > 0
    );

    // Generate notes (only for year milestones to avoid clutter)
    const isYearMilestone = month % 12 === 0 || month === startAgeMonths;
    const notes = isYearMilestone
      ? generateNotes(month, currentWeight, status, idealRange, catName)
      : "";

    points.push({
      ageMonths: month,
      weightKgEstimate: Math.round(currentWeight * 100) / 100,
      healthStatus: status,
      notes,
    });
  }

  // Generate alerts
  const alerts = generateAlerts(points, catProfile, careRoutine, idealRange);

  // Generate summary and recommendations
  const { summary, recommendations } = generateSummary(
    catProfile,
    careRoutine,
    points,
    alerts,
    idealRange
  );

  return {
    points,
    alerts,
    summary,
    recommendations,
  };
}

/**
 * Generate summary and recommendations based on simulation results
 */
function generateSummary(
  catProfile: CatProfile,
  careRoutine: CareRoutine,
  points: SimulationPoint[],
  alerts: SimulationAlert[],
  idealRange: { min: number; max: number }
): { summary: string; recommendations: string[] } {
  const catName = catProfile.name || "Your cat";
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");

  // Determine overall trajectory
  const lastPoints = points.slice(-24); // Last 2 years
  const avgStatus = lastPoints.reduce((acc, p) => {
    const scores: Record<HealthStatus, number> = { thriving: 4, ok: 3, risky: 2, unhealthy: 1 };
    return acc + scores[p.healthStatus];
  }, 0) / lastPoints.length;

  let trajectory = "stable";
  if (avgStatus > 3.5) trajectory = "excellent";
  else if (avgStatus > 2.5) trajectory = "good";
  else if (avgStatus > 1.5) trajectory = "concerning";
  else trajectory = "needs attention";

  // Generate summary
  let summary = "";
  if (trajectory === "excellent" || trajectory === "good") {
    summary = `Based on ${catName}'s current care routine, the long-term outlook is ${trajectory}! `;
    summary += `With consistent care, ${catName} has a great chance at a healthy, happy life.`;
  } else {
    summary = `${catName}'s health trajectory shows some areas for improvement. `;
    summary += `With a few adjustments to diet and activity, you can help ${catName} thrive.`;
  }

  // Generate recommendations
  const recommendations: string[] = [];

  // Weight recommendations
  const currentWeight = catProfile.weightKg ?? (idealRange.min + idealRange.max) / 2;
  if (currentWeight > idealRange.max) {
    recommendations.push(
      `Reduce daily food portions by about 10% and limit treats to 2-3 per day.`
    );
    recommendations.push(
      `Add 10-15 minutes of active play with wand toys or laser pointers.`
    );
  } else if (currentWeight < idealRange.min) {
    recommendations.push(
      `Consider increasing food portions slightly and consult your vet about weight gain.`
    );
  }

  // Activity recommendations
  const playMinutes = careRoutine.playMinutesPerDay ?? 0;
  if (playMinutes < 15) {
    recommendations.push(
      `Aim for at least 15-20 minutes of interactive play daily to keep ${catName} active and engaged.`
    );
  }

  // Vet recommendations
  const vetVisits = careRoutine.vetVisitsPerYear ?? 0;
  if (vetVisits < 1) {
    recommendations.push(
      `Schedule at least one annual vet checkup to catch any health issues early.`
    );
  } else if ((catProfile.ageYears ?? 0) >= 10 && vetVisits < 2) {
    recommendations.push(
      `For senior cats, consider twice-yearly vet visits for optimal health monitoring.`
    );
  }

  // Diet recommendations
  if (careRoutine.foodType === "dry") {
    recommendations.push(
      `Consider adding some wet food to ${catName}'s diet for better hydration.`
    );
  }

  // Treats
  const treats = careRoutine.treatsPerDay ?? 0;
  if (treats > 5) {
    recommendations.push(
      `Reduce treats to 2-3 per day, or switch to lower-calorie options.`
    );
  }

  // Ensure we have at least 3 recommendations
  if (recommendations.length < 3) {
    recommendations.push(
      `Continue providing fresh water and a clean litter box for ${catName}'s comfort.`
    );
  }
  if (recommendations.length < 3) {
    recommendations.push(
      `Keep up the love and attention - it's the most important part of cat care!`
    );
  }

  return {
    summary,
    recommendations: recommendations.slice(0, 5), // Max 5 recommendations
  };
}

/**
 * Quick simulation preview for UI
 * Returns just key milestone points instead of all 240 months
 */
export function runQuickSimulation(
  catProfile: CatProfile,
  careRoutine: CareRoutine
): SimulationPoint[] {
  const startAge = ((catProfile.ageYears ?? 1) * 12) + (catProfile.ageMonths ?? 0);
  const config: SimulationConfig = {
    catProfile,
    careRoutine,
    startAgeMonths: startAge,
    endAgeMonths: 240,
  };

  const result = runSimulation(config);

  // Return only yearly milestones
  return result.points.filter((p) => p.ageMonths % 12 === 0);
}

// ============================================
// Enhanced Simulation with GPT Personalization
// ============================================

/**
 * Run enhanced simulation with breed-specific data and trajectory analysis
 * This version includes local enhancements without API calls
 */
export async function runEnhancedSimulation(
  catProfile: CatProfile,
  careRoutine: CareRoutine
): Promise<EnhancedSimulationResult> {
  // First run the base simulation
  const startAge = ((catProfile.ageYears ?? 1) * 12) + (catProfile.ageMonths ?? 0);
  const config: SimulationConfig = {
    catProfile,
    careRoutine,
    startAgeMonths: startAge,
    endAgeMonths: 240,
  };

  const baseResult = runSimulation(config);

  // Import and use the enhancer (dynamic import to avoid circular deps)
  const { enhanceSimulationLocally } = await import("./simulation-enhancer");
  
  return enhanceSimulationLocally(baseResult, catProfile, careRoutine);
}

/**
 * Run fully enhanced simulation with GPT-generated personalized notes
 * This version makes API calls for personalized milestone notes
 */
export async function runFullyEnhancedSimulation(
  catProfile: CatProfile,
  careRoutine: CareRoutine
): Promise<EnhancedSimulationResult> {
  // First run the base simulation
  const startAge = ((catProfile.ageYears ?? 1) * 12) + (catProfile.ageMonths ?? 0);
  const config: SimulationConfig = {
    catProfile,
    careRoutine,
    startAgeMonths: startAge,
    endAgeMonths: 240,
  };

  const baseResult = runSimulation(config);

  // Import and use the enhancer with GPT
  const { enhanceSimulationWithGPT } = await import("./simulation-enhancer");
  
  return enhanceSimulationWithGPT(baseResult, catProfile, careRoutine);
}

// ============================================
// Exported Constants
// ============================================

export { LIFE_STAGES };
export { getLifeStage };

