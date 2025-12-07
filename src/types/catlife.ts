// CatLife Chat Sim - Type Definitions

// ============================================
// Cat Profile Types
// ============================================

export type Sex = "male" | "female" | "unknown";
export type BodyCondition = "underweight" | "ideal" | "overweight" | "unknown";
export type IndoorOutdoor = "indoor" | "outdoor" | "mixed";
export type WeightSource = "user_estimate" | "vet_recent" | "unknown";

export interface CatProfile {
  id?: string;
  name: string | null;
  ageYears: number | null;
  ageMonths: number | null;
  sex: Sex | null;
  neutered: boolean | null;
  breed: string | null;
  indoorOutdoor: IndoorOutdoor | null;
  weightKg: number | null;
  weightSource: WeightSource | null;
  bodyCondition: BodyCondition | null;
  knownConditions: string[];
  photoUrl?: string | null;
  avatarUrl?: string | null;
}

// ============================================
// Care Routine Types
// ============================================

export type FoodType = "dry" | "wet" | "mixed" | "raw" | "other";
export type FeedingFrequency = 1 | 2 | 3 | 4; // times per day
export type LitterCleaningFrequency = "daily" | "every_2_days" | "weekly" | "unknown";

export interface CareRoutine {
  foodType: FoodType | null;
  foodAmountOzPerDay: number | null;
  feedingFrequency: FeedingFrequency | null;
  treatsPerDay: number | null;
  playMinutesPerDay: number | null;
  vetVisitsPerYear: number | null;
  litterCleaningFrequency: LitterCleaningFrequency | null;
}

// ============================================
// Chat Session Types
// ============================================

export interface FieldConfidence {
  value: unknown;
  confidence: number;
}

export interface ChatUpdates {
  catProfile?: Record<string, FieldConfidence>;
  careRoutine?: Record<string, FieldConfidence>;
}

export type NextAction = 
  | "ask_question" 
  | "ask_clarification" 
  | "request_photo" 
  | "photo_analysis_pending"
  | "ready_for_simulation";

export interface ChatResponse {
  assistantMessage: string;
  updates: ChatUpdates;
  nextAction: NextAction;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface ChatSession {
  messages: ChatMessage[];
  catProfile: CatProfile;
  careRoutine: CareRoutine;
  photoAnalysis?: PhotoAnalysis;
  step: "intake" | "photo" | "confirmed" | "simulation" | "reminders";
}

// ============================================
// Photo Analysis Types
// ============================================

export interface PhotoAnalysis {
  photoBodyCondition: BodyCondition;
  photoComment: string;
  photoConfidence: number;
  estimatedColor?: string;
  estimatedPattern?: string;
  mismatchDetected?: boolean;
  mismatchMessage?: string;
}

// ============================================
// Simulation Types
// ============================================

export type HealthStatus = "thriving" | "ok" | "risky" | "unhealthy";
export type AlertSeverity = "info" | "warning" | "critical";

export interface SimulationConfig {
  catProfile: CatProfile;
  careRoutine: CareRoutine;
  startAgeMonths: number;
  endAgeMonths: number; // max 240 (20 years)
}

export interface SimulationPoint {
  ageMonths: number;
  weightKgEstimate: number;
  healthStatus: HealthStatus;
  notes: string;
}

export interface SimulationAlert {
  id: string;
  ageMonths: number;
  severity: AlertSeverity;
  message: string;
  recommendation: string;
}

export interface SimulationResult {
  points: SimulationPoint[];
  alerts: SimulationAlert[];
  summary: string;
  recommendations: string[];
}

// ============================================
// Enhanced Simulation Types (GPT-powered)
// ============================================

export type HealthTrend = "improving" | "stable" | "declining";
export type RecommendationCategory = "screening" | "diet" | "activity" | "monitoring" | "comfort";
export type NotePriority = "high" | "medium" | "low";

/**
 * Health trajectory analysis for a cat's projected lifetime
 */
export interface HealthTrajectory {
  trend: HealthTrend;
  projectedStatusAtYear10: HealthStatus;
  projectedStatusAtYear15: HealthStatus;
  riskFactors: string[];
  positiveFactors: string[];
  averageHealthScore: number;
}

/**
 * GPT-generated personalized milestone note
 */
export interface EnhancedMilestoneNote {
  ageYears: number;
  personalizedNote: string;
  breedSpecificAlerts: string[];
  ageAppropriateAdvice: string[];
  upcomingMilestones: string[];
  trajectoryInsight: string;
  priority: NotePriority;
}

/**
 * Enhanced simulation point with breed-specific data
 */
export interface EnhancedSimulationPoint extends SimulationPoint {
  enhancedNote?: EnhancedMilestoneNote;
  breedHealthRisks?: BreedHealthRisk[];
}

/**
 * Breed-specific health risk information
 */
export interface BreedHealthRisk {
  condition: string;
  riskLevel: "low" | "moderate" | "high";
  typicalOnsetYears: number;
  monitoringAdvice: string;
  symptoms?: string[];
}

/**
 * Progressive care recommendation for timeline
 */
export interface ProgressiveRecommendation {
  ageYears: number;
  category: RecommendationCategory;
  recommendation: string;
  reason: string;
  priority: NotePriority;
}

/**
 * Breed health profile summary
 */
export interface BreedProfileSummary {
  breed: string;
  sizeCategory: "small" | "medium" | "large";
  lifeExpectancy: { min: number; max: number };
  idealWeight: { min: number; max: number };
  generalNotes: string;
}

/**
 * Enhanced simulation result with GPT-powered personalization
 */
export interface EnhancedSimulationResult extends SimulationResult {
  enhancedPoints: EnhancedSimulationPoint[];
  trajectory: HealthTrajectory;
  breedProfile: BreedProfileSummary | null;
  progressiveTimeline: ProgressiveRecommendation[];
  isEnhanced: boolean;
}

// ============================================
// Reminder Types
// ============================================

export type ContactType = "email" | "sms";
export type ReminderChannel = "feed" | "play" | "litter" | "vet";

export interface ReminderChannels {
  feed: boolean;
  play: boolean;
  litter: boolean;
  vet: boolean;
}

export interface ReminderSchedule {
  feedTimes?: string[]; // e.g., ["07:30", "18:30"]
  playTimes?: string[];
  vetIntervalMonths?: number; // e.g., 12 for annual
}

export interface ReminderSettings {
  id?: string;
  contactType: ContactType;
  contactValue: string; // phone or email
  catName: string;
  timezone?: string;
  enabled: boolean;
  channels: ReminderChannels;
  schedule: ReminderSchedule;
  createdAt?: Date;
  updatedAt?: Date;
  lastSentAt?: Date;
}

// AI-generated reminder recommendations
export interface ReminderRecommendation {
  channel: ReminderChannel;
  enabled: boolean;
  reason: string;
  priority: "high" | "medium" | "low";
}

// ============================================
// API Request/Response Types
// ============================================

export interface ChatRequest {
  messages: ChatMessage[];
  catProfile: Partial<CatProfile>;
  careRoutine: Partial<CareRoutine>;
}

export interface VisionRequest {
  imageBase64: string;
  catProfile: Partial<CatProfile>;
}

export interface AvatarRequest {
  catProfile: CatProfile;
  photoAnalysis?: PhotoAnalysis;
}

export interface SimulateRequest {
  catProfile: CatProfile;
  careRoutine: CareRoutine;
}

export interface ReminderRequest {
  catName: string;
  contactType: ContactType;
  contactValue: string;
  channels: ReminderChannels;
  schedule?: ReminderSchedule;
  timezone?: string;
}

// ============================================
// Utility Types
// ============================================

export const DEFAULT_CAT_PROFILE: CatProfile = {
  name: null,
  ageYears: null,
  ageMonths: null,
  sex: null,
  neutered: null,
  breed: null,
  indoorOutdoor: null,
  weightKg: null,
  weightSource: null,
  bodyCondition: null,
  knownConditions: [],
  photoUrl: null,
  avatarUrl: null,
};

export const DEFAULT_CARE_ROUTINE: CareRoutine = {
  foodType: null,
  foodAmountOzPerDay: null,
  feedingFrequency: null,
  treatsPerDay: null,
  playMinutesPerDay: null,
  vetVisitsPerYear: null,
  litterCleaningFrequency: null,
};

export const DEFAULT_CHAT_SESSION: ChatSession = {
  messages: [],
  catProfile: { ...DEFAULT_CAT_PROFILE },
  careRoutine: { ...DEFAULT_CARE_ROUTINE },
  step: "intake",
};

