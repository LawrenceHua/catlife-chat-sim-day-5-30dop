// CatLife - Comprehensive Breed Health Database
// 30+ breeds with detailed health profiles, screening schedules, and risk factors

export type SizeCategory = "small" | "medium" | "large";
export type RiskLevel = "low" | "moderate" | "high";

export interface HealthRisk {
  condition: string;
  riskLevel: RiskLevel;
  typicalOnsetYears: number;
  monitoringAdvice: string;
  symptoms?: string[];
}

export interface ScreeningSchedule {
  ageYears: number;
  screenings: string[];
  reason: string;
}

export interface AgeSpecificAdvice {
  ageRange: [number, number]; // [minYears, maxYears]
  advice: string[];
  focus: string;
}

export interface BreedHealthProfile {
  breed: string;
  aliases: string[];
  sizeCategory: SizeCategory;
  lifeExpectancy: { min: number; max: number };
  idealWeight: { min: number; max: number }; // in kg
  healthRisks: HealthRisk[];
  screeningSchedule: ScreeningSchedule[];
  ageSpecificAdvice: AgeSpecificAdvice[];
  generalNotes: string;
}

// ============================================
// LARGE BREEDS
// ============================================

const maineCoon: BreedHealthProfile = {
  breed: "Maine Coon",
  aliases: ["maine coon", "mainecoon", "maine-coon"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 5.5, max: 10 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "high",
      typicalOnsetYears: 4,
      monitoringAdvice: "Annual echocardiograms starting at age 3-4. Watch for lethargy, rapid breathing.",
      symptoms: ["Lethargy", "Rapid breathing", "Open-mouth breathing", "Decreased appetite"],
    },
    {
      condition: "Hip Dysplasia",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Watch for difficulty jumping or climbing. X-rays if limping develops.",
      symptoms: ["Difficulty jumping", "Limping", "Reluctance to climb stairs"],
    },
    {
      condition: "Spinal Muscular Atrophy (SMA)",
      riskLevel: "low",
      typicalOnsetYears: 0.5,
      monitoringAdvice: "Genetic testing available. Usually apparent in kittens.",
      symptoms: ["Muscle weakness", "Abnormal gait", "Tremors"],
    },
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "moderate",
      typicalOnsetYears: 7,
      monitoringAdvice: "Ultrasound screening after age 5. Monitor water intake.",
      symptoms: ["Increased thirst", "Weight loss", "Lethargy"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Baseline bloodwork", "Dental exam"], reason: "Establish baseline health markers" },
    { ageYears: 3, screenings: ["Echocardiogram", "Heart murmur check"], reason: "Early HCM detection - critical for Maine Coons" },
    { ageYears: 5, screenings: ["Echocardiogram", "Kidney ultrasound", "Full bloodwork"], reason: "Monitor heart and early kidney screening" },
    { ageYears: 7, screenings: ["Echocardiogram", "Kidney function panel", "Thyroid check"], reason: "Senior screening begins" },
    { ageYears: 10, screenings: ["Bi-annual echocardiogram", "Complete senior panel", "Blood pressure"], reason: "Intensive monitoring for geriatric care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Growth & Development", advice: ["Support healthy bone development with quality nutrition", "Monitor growth rate - Maine Coons grow until age 4-5", "Establish jumping-friendly furniture arrangements"] },
    { ageRange: [2, 5], focus: "Heart Health Baseline", advice: ["Schedule first echocardiogram by age 3-4", "Learn to monitor resting respiratory rate at home", "Maintain healthy weight to reduce heart strain"] },
    { ageRange: [5, 8], focus: "Preventive Monitoring", advice: ["Annual echocardiograms are essential", "Begin kidney function monitoring", "Watch for mobility changes - hip issues may emerge"] },
    { ageRange: [8, 12], focus: "Senior Care", advice: ["Bi-annual vet visits recommended", "Consider joint supplements", "Monitor for signs of heart disease progression"] },
    { ageRange: [12, 20], focus: "Quality of Life", advice: ["Focus on comfort and pain management", "Easy access to food, water, and litter", "Regular heart monitoring continues"] },
  ],
  generalNotes: "Maine Coons are gentle giants prone to heart disease. Regular cardiac screening is essential. They continue growing until age 4-5.",
};

const ragdoll: BreedHealthProfile = {
  breed: "Ragdoll",
  aliases: ["ragdoll", "rag doll", "rag-doll"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 17 },
  idealWeight: { min: 4.5, max: 9 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "high",
      typicalOnsetYears: 3,
      monitoringAdvice: "Annual echocardiograms starting at age 2-3. Genetic test available.",
      symptoms: ["Lethargy", "Rapid breathing", "Fainting"],
    },
    {
      condition: "Bladder Stones",
      riskLevel: "moderate",
      typicalOnsetYears: 4,
      monitoringAdvice: "Ensure adequate water intake. Watch for urinary difficulties.",
      symptoms: ["Straining to urinate", "Blood in urine", "Frequent urination attempts"],
    },
    {
      condition: "Feline Infectious Peritonitis (FIP)",
      riskLevel: "moderate",
      typicalOnsetYears: 1,
      monitoringAdvice: "More susceptible than average. Watch for fever, weight loss.",
      symptoms: ["Fever", "Weight loss", "Abdominal swelling"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Baseline bloodwork", "Urinalysis"], reason: "Establish baseline" },
    { ageYears: 2, screenings: ["Echocardiogram", "Genetic HCM test"], reason: "Early cardiac screening" },
    { ageYears: 5, screenings: ["Echocardiogram", "Urinalysis", "Kidney panel"], reason: "Regular monitoring" },
    { ageYears: 8, screenings: ["Full senior panel", "Echocardiogram", "Blood pressure"], reason: "Senior screening" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Growth & Immunity", advice: ["Complete vaccination schedule is crucial", "Monitor for FIP symptoms", "Support slow, healthy growth"] },
    { ageRange: [2, 5], focus: "Heart & Urinary Health", advice: ["First echocardiogram by age 2-3", "Encourage water intake for bladder health", "Consider wet food to increase hydration"] },
    { ageRange: [5, 10], focus: "Preventive Care", advice: ["Annual heart screening", "Regular urinalysis for bladder health", "Maintain healthy weight"] },
    { ageRange: [10, 20], focus: "Senior Support", advice: ["Bi-annual checkups", "Joint support as needed", "Continue heart monitoring"] },
  ],
  generalNotes: "Ragdolls are docile and often don't show pain. Regular health checks are important as they may hide symptoms.",
};

const norwegianForest: BreedHealthProfile = {
  breed: "Norwegian Forest Cat",
  aliases: ["norwegian forest", "norwegian forest cat", "wegie", "norsk skogkatt"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 16 },
  idealWeight: { min: 4.5, max: 9 },
  healthRisks: [
    {
      condition: "Glycogen Storage Disease IV (GSD IV)",
      riskLevel: "moderate",
      typicalOnsetYears: 0.5,
      monitoringAdvice: "Genetic test available. Fatal if present - usually shows in kittens.",
      symptoms: ["Muscle weakness", "Fever", "Tremors"],
    },
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart checks after age 4.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
    {
      condition: "Hip Dysplasia",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Monitor mobility, especially as they age.",
      symptoms: ["Difficulty jumping", "Stiffness"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["GSD IV genetic test", "Baseline bloodwork"], reason: "Rule out genetic disease" },
    { ageYears: 4, screenings: ["Echocardiogram", "Hip evaluation"], reason: "Begin cardiac monitoring" },
    { ageYears: 7, screenings: ["Full panel", "Heart check", "Joint assessment"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Genetic Screening", advice: ["GSD IV test if not done by breeder", "Support healthy coat with omega fatty acids", "Establish grooming routine for long coat"] },
    { ageRange: [2, 6], focus: "Coat & Joint Care", advice: ["Regular grooming to prevent mats", "Monitor activity levels for joint health", "Begin cardiac screening at 4"] },
    { ageRange: [6, 12], focus: "Senior Transition", advice: ["Joint supplements may help", "Continue regular heart checks", "Watch weight as activity decreases"] },
    { ageRange: [12, 20], focus: "Comfort Care", advice: ["Easy access accommodations", "Regular vet visits", "Pain management if needed"] },
  ],
  generalNotes: "Hardy breed adapted to cold climates. Requires regular grooming. GSD IV is a serious genetic concern.",
};

const britishShorthair: BreedHealthProfile = {
  breed: "British Shorthair",
  aliases: ["british shorthair", "british blue", "bsh"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 17 },
  idealWeight: { min: 4, max: 8 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "high",
      typicalOnsetYears: 4,
      monitoringAdvice: "Annual echocardiograms starting at age 3.",
      symptoms: ["Lethargy", "Labored breathing", "Weakness in hind legs"],
    },
    {
      condition: "Obesity",
      riskLevel: "high",
      typicalOnsetYears: 2,
      monitoringAdvice: "Strict portion control essential. This breed gains weight easily.",
      symptoms: ["Visible weight gain", "Decreased activity", "Difficulty grooming"],
    },
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "moderate",
      typicalOnsetYears: 7,
      monitoringAdvice: "Ultrasound screening after age 5.",
      symptoms: ["Increased thirst", "Weight loss"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Weight assessment", "Baseline bloodwork"], reason: "Establish healthy baseline" },
    { ageYears: 3, screenings: ["Echocardiogram", "Body condition score"], reason: "Heart and weight monitoring" },
    { ageYears: 6, screenings: ["Kidney ultrasound", "Heart check", "Diabetes screening"], reason: "Preventive screening" },
    { ageYears: 9, screenings: ["Full senior panel", "Cardiac assessment"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Weight Management Foundation", advice: ["Establish portion-controlled feeding early", "Encourage active play despite calm nature", "Avoid free-feeding"] },
    { ageRange: [2, 5], focus: "Heart & Weight", advice: ["First echocardiogram by age 3", "Monitor weight monthly", "Interactive play sessions daily"] },
    { ageRange: [5, 10], focus: "Metabolic Health", advice: ["Watch for diabetes signs", "Annual heart screening", "Kidney monitoring begins"] },
    { ageRange: [10, 20], focus: "Senior Weight & Heart", advice: ["Careful calorie management", "Regular cardiac checks", "Joint support for heavier cats"] },
  ],
  generalNotes: "Calm, easy-going breed prone to obesity. Requires strict diet management and regular exercise encouragement.",
};

const savannah: BreedHealthProfile = {
  breed: "Savannah",
  aliases: ["savannah", "savannah cat"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 20 },
  idealWeight: { min: 5.5, max: 11 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart screening after age 4.",
      symptoms: ["Lethargy", "Breathing issues"],
    },
    {
      condition: "Hybrid Male Sterility",
      riskLevel: "low",
      typicalOnsetYears: 0,
      monitoringAdvice: "Early generation males (F1-F4) are typically sterile.",
      symptoms: [],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork", "Heart check"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Echocardiogram", "Full panel"], reason: "Cardiac monitoring" },
    { ageYears: 8, screenings: ["Senior screening", "Heart assessment"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "High Energy Management", advice: ["Provide extensive enrichment and space", "High-protein diet essential", "Socialize well during this period"] },
    { ageRange: [3, 8], focus: "Active Adult Care", advice: ["Maintain high activity levels", "Regular heart monitoring", "Mental stimulation crucial"] },
    { ageRange: [8, 15], focus: "Mature Care", advice: ["May still be very active", "Regular health checks", "Watch for any slowing down"] },
    { ageRange: [15, 20], focus: "Senior Years", advice: ["Adjust activity to comfort", "Regular monitoring", "Comfort-focused care"] },
  ],
  generalNotes: "Exotic hybrid breed requiring experienced owners. Very active and intelligent. Long lifespan if well cared for.",
};

// ============================================
// MEDIUM BREEDS
// ============================================

const persian: BreedHealthProfile = {
  breed: "Persian",
  aliases: ["persian", "persian cat", "longhair"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 17 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "high",
      typicalOnsetYears: 7,
      monitoringAdvice: "Genetic test available. Ultrasound screening by age 5.",
      symptoms: ["Increased thirst", "Increased urination", "Weight loss", "Lethargy"],
    },
    {
      condition: "Brachycephalic Airway Syndrome",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Present from birth due to flat face. Avoid heat and stress.",
      symptoms: ["Noisy breathing", "Snoring", "Exercise intolerance"],
    },
    {
      condition: "Progressive Retinal Atrophy (PRA)",
      riskLevel: "moderate",
      typicalOnsetYears: 4,
      monitoringAdvice: "Eye exams yearly. Watch for night blindness.",
      symptoms: ["Night blindness", "Dilated pupils", "Bumping into objects"],
    },
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart screening after age 4.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["PKD genetic test", "Eye exam", "Baseline bloodwork"], reason: "Early genetic screening" },
    { ageYears: 3, screenings: ["Eye exam", "Heart check", "Kidney ultrasound"], reason: "Preventive monitoring" },
    { ageYears: 5, screenings: ["Kidney ultrasound", "Full bloodwork", "Echocardiogram"], reason: "PKD typically shows by now" },
    { ageYears: 8, screenings: ["Complete senior panel", "Kidney function", "Eye exam"], reason: "Senior monitoring" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Breathing & Eye Care", advice: ["Keep face clean and dry", "Monitor breathing in warm weather", "Daily eye cleaning routine", "PKD genetic test if not done"] },
    { ageRange: [2, 5], focus: "Kidney & Vision Monitoring", advice: ["Begin kidney screening by age 3", "Annual eye exams essential", "Maintain grooming routine for coat"] },
    { ageRange: [5, 10], focus: "Kidney Health Focus", advice: ["Regular kidney function tests", "Consider renal-support diet if needed", "Keep stress levels low", "Monitor water intake"] },
    { ageRange: [10, 20], focus: "Supportive Care", advice: ["Kidney management is key", "Climate control important", "Regular gentle grooming", "Easy access to resources"] },
  ],
  generalNotes: "Beautiful but high-maintenance breed. Flat face requires special care. PKD is a major concern - genetic testing highly recommended.",
};

const bengal: BreedHealthProfile = {
  breed: "Bengal",
  aliases: ["bengal", "bengal cat"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 16 },
  idealWeight: { min: 4, max: 7 },
  healthRisks: [
    {
      condition: "Pyruvate Kinase Deficiency (PK Deficiency)",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Genetic test available. Causes anemia.",
      symptoms: ["Lethargy", "Pale gums", "Weakness"],
    },
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 4,
      monitoringAdvice: "Annual echocardiograms after age 3.",
      symptoms: ["Lethargy", "Rapid breathing"],
    },
    {
      condition: "Progressive Retinal Atrophy (PRA)",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Genetic test available. Annual eye exams.",
      symptoms: ["Night blindness", "Vision changes"],
    },
    {
      condition: "Flat Chested Kitten Syndrome",
      riskLevel: "low",
      typicalOnsetYears: 0,
      monitoringAdvice: "Apparent at birth. Reputable breeders screen for this.",
      symptoms: ["Flattened chest", "Breathing difficulties in kittens"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["PK deficiency test", "PRA genetic test", "Baseline bloodwork"], reason: "Genetic screening" },
    { ageYears: 3, screenings: ["Echocardiogram", "Eye exam"], reason: "Begin cardiac monitoring" },
    { ageYears: 6, screenings: ["Heart check", "Full bloodwork", "Eye exam"], reason: "Ongoing monitoring" },
    { ageYears: 10, screenings: ["Senior panel", "Cardiac assessment"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Energy & Genetics", advice: ["Genetic testing for PK and PRA", "Provide extensive exercise opportunities", "Mental stimulation is crucial", "High-protein diet supports activity level"] },
    { ageRange: [2, 6], focus: "Heart & Activity", advice: ["First echocardiogram by age 3", "Maintain high activity lifestyle", "Regular eye exams", "Monitor energy levels for anemia signs"] },
    { ageRange: [6, 12], focus: "Maintaining Vitality", advice: ["Continue active lifestyle", "Annual heart screening", "Watch for vision changes", "Regular health checks"] },
    { ageRange: [12, 20], focus: "Active Senior", advice: ["Bengals often remain active into old age", "Adjust play to comfort level", "Regular monitoring", "Joint support as needed"] },
  ],
  generalNotes: "Extremely active and intelligent breed. Requires lots of stimulation. Genetic testing recommended for PK deficiency and PRA.",
};

const siamese: BreedHealthProfile = {
  breed: "Siamese",
  aliases: ["siamese", "siamese cat", "meezer"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 20 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Amyloidosis",
      riskLevel: "high",
      typicalOnsetYears: 7,
      monitoringAdvice: "Liver form common in Siamese. Regular bloodwork to monitor liver function.",
      symptoms: ["Lethargy", "Weight loss", "Jaundice", "Loss of appetite"],
    },
    {
      condition: "Dental Disease",
      riskLevel: "high",
      typicalOnsetYears: 2,
      monitoringAdvice: "Annual dental exams. Consider dental diet or regular brushing.",
      symptoms: ["Bad breath", "Difficulty eating", "Drooling", "Red gums"],
    },
    {
      condition: "Respiratory Issues",
      riskLevel: "moderate",
      typicalOnsetYears: 0,
      monitoringAdvice: "More prone to asthma and bronchial disease.",
      symptoms: ["Coughing", "Wheezing", "Labored breathing"],
    },
    {
      condition: "Progressive Retinal Atrophy (PRA)",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Annual eye exams recommended.",
      symptoms: ["Night blindness", "Dilated pupils"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Dental exam", "Baseline bloodwork", "Eye exam"], reason: "Establish baseline" },
    { ageYears: 3, screenings: ["Dental cleaning if needed", "Liver panel", "Eye exam"], reason: "Early monitoring" },
    { ageYears: 6, screenings: ["Full bloodwork including liver", "Dental assessment", "Respiratory check"], reason: "Amyloidosis monitoring begins" },
    { ageYears: 9, screenings: ["Senior panel with liver focus", "Dental care", "Full exam"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Dental Foundation", advice: ["Start dental care routine early", "Consider dental-friendly diet", "Socialize well - Siamese are very social", "Monitor for respiratory issues"] },
    { ageRange: [2, 6], focus: "Dental & Liver Health", advice: ["Regular dental checkups essential", "Watch for signs of liver issues", "Keep stress low - they're sensitive", "Mental stimulation crucial"] },
    { ageRange: [6, 12], focus: "Amyloidosis Watch", advice: ["Liver function monitoring important", "Continue dental care", "Watch for appetite changes", "Regular comprehensive bloodwork"] },
    { ageRange: [12, 20], focus: "Long-Lived Senior", advice: ["Siamese often live into late teens", "Monitor liver and kidney function", "Dental health remains important", "Lots of companionship needed"] },
  ],
  generalNotes: "Vocal, social breed that bonds deeply. Prone to dental issues and liver amyloidosis. Often lives 15-20 years with good care.",
};

const abyssinian: BreedHealthProfile = {
  breed: "Abyssinian",
  aliases: ["abyssinian", "aby", "abyssinian cat"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 3, max: 5 },
  healthRisks: [
    {
      condition: "Renal Amyloidosis",
      riskLevel: "high",
      typicalOnsetYears: 5,
      monitoringAdvice: "Regular kidney function tests starting at age 4.",
      symptoms: ["Increased thirst", "Weight loss", "Lethargy"],
    },
    {
      condition: "Pyruvate Kinase Deficiency (PK Deficiency)",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Genetic test available.",
      symptoms: ["Anemia", "Lethargy", "Pale gums"],
    },
    {
      condition: "Progressive Retinal Atrophy (PRA)",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Genetic test available. Annual eye exams.",
      symptoms: ["Night blindness", "Vision loss"],
    },
    {
      condition: "Patellar Luxation",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Watch for limping or skipping gait.",
      symptoms: ["Limping", "Holding leg up", "Skipping gait"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["PK deficiency test", "PRA test", "Baseline bloodwork"], reason: "Genetic screening" },
    { ageYears: 4, screenings: ["Kidney function panel", "Eye exam", "Joint assessment"], reason: "Begin amyloidosis monitoring" },
    { ageYears: 7, screenings: ["Full bloodwork", "Kidney ultrasound", "Heart check"], reason: "Senior preparation" },
    { ageYears: 10, screenings: ["Comprehensive senior panel", "Kidney monitoring"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Genetic Testing & Activity", advice: ["Complete genetic testing", "Provide lots of climbing and play", "Monitor joints during growth", "High-quality protein diet"] },
    { ageRange: [2, 5], focus: "Kidney Baseline", advice: ["Establish kidney function baseline by age 4", "Encourage hydration", "Regular eye exams", "Monitor activity levels for anemia"] },
    { ageRange: [5, 10], focus: "Kidney Health Priority", advice: ["Regular kidney monitoring crucial", "Consider kidney-supportive diet", "Watch water intake closely", "Continue active lifestyle"] },
    { ageRange: [10, 15], focus: "Senior Support", advice: ["Intensive kidney monitoring", "Joint support if needed", "Keep activity appropriate", "Regular comprehensive checks"] },
  ],
  generalNotes: "Active, playful breed with a shorter coat. Renal amyloidosis is a major concern - early and regular kidney monitoring essential.",
};

const exoticShorthair: BreedHealthProfile = {
  breed: "Exotic Shorthair",
  aliases: ["exotic shorthair", "exotic", "shorthaired persian"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 3.5, max: 6 },
  healthRisks: [
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "high",
      typicalOnsetYears: 7,
      monitoringAdvice: "Same as Persian. Genetic test and ultrasound screening.",
      symptoms: ["Increased thirst", "Weight loss", "Lethargy"],
    },
    {
      condition: "Brachycephalic Airway Syndrome",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Flat face causes breathing issues. Avoid heat stress.",
      symptoms: ["Noisy breathing", "Snoring", "Heat intolerance"],
    },
    {
      condition: "Dental Crowding",
      riskLevel: "moderate",
      typicalOnsetYears: 1,
      monitoringAdvice: "Flat face can cause dental issues. Regular dental exams.",
      symptoms: ["Bad breath", "Difficulty eating"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["PKD genetic test", "Dental exam", "Baseline bloodwork"], reason: "Genetic screening" },
    { ageYears: 4, screenings: ["Kidney ultrasound", "Dental assessment"], reason: "PKD monitoring" },
    { ageYears: 7, screenings: ["Full panel", "Kidney function", "Respiratory assessment"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Breathing & Dental", advice: ["Keep environment cool", "Monitor breathing especially in summer", "Regular dental care", "PKD genetic test"] },
    { ageRange: [3, 7], focus: "Kidney Monitoring", advice: ["Begin kidney screening", "Maintain dental health", "Climate control important", "Monitor weight"] },
    { ageRange: [7, 15], focus: "Senior Care", advice: ["Regular kidney monitoring", "Dental care continues", "Keep stress low", "Easy breathing environment"] },
  ],
  generalNotes: "Persian temperament with short coat. Same flat-face issues as Persian. PKD testing essential.",
};

const burmese: BreedHealthProfile = {
  breed: "Burmese",
  aliases: ["burmese", "burmese cat"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 15, max: 18 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Diabetes Mellitus",
      riskLevel: "high",
      typicalOnsetYears: 8,
      monitoringAdvice: "More prone than other breeds. Regular glucose monitoring after age 7.",
      symptoms: ["Increased thirst", "Increased urination", "Weight loss despite eating"],
    },
    {
      condition: "Hypokalaemia",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Genetic predisposition to low potassium. Bloodwork monitoring.",
      symptoms: ["Muscle weakness", "Difficulty walking", "Head droop"],
    },
    {
      condition: "Cranial Deformities",
      riskLevel: "low",
      typicalOnsetYears: 0,
      monitoringAdvice: "Present at birth in affected kittens. Reputable breeders screen.",
      symptoms: [],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork including potassium", "General health check"], reason: "Establish baseline" },
    { ageYears: 6, screenings: ["Glucose screening", "Potassium levels", "Full panel"], reason: "Pre-diabetes monitoring" },
    { ageYears: 9, screenings: ["Glucose tolerance", "Full senior panel"], reason: "Diabetes monitoring" },
    { ageYears: 12, screenings: ["Comprehensive senior workup", "Glucose monitoring"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Establishing Health", advice: ["Monitor potassium levels", "High-quality diet", "Regular exercise to maintain weight", "Socialize well"] },
    { ageRange: [3, 7], focus: "Metabolic Health", advice: ["Watch weight carefully", "Regular bloodwork", "Maintain active lifestyle", "Avoid overfeeding"] },
    { ageRange: [7, 12], focus: "Diabetes Prevention", advice: ["Regular glucose monitoring", "Weight management critical", "Consider low-carb diet", "Watch for diabetes signs"] },
    { ageRange: [12, 20], focus: "Long-Lived Senior", advice: ["Burmese often live 15-18 years", "Continue metabolic monitoring", "Maintain healthy weight", "Regular comprehensive exams"] },
  ],
  generalNotes: "Affectionate, people-oriented breed with long lifespan. Higher diabetes risk requires weight management and glucose monitoring.",
};

const orientalShorthair: BreedHealthProfile = {
  breed: "Oriental Shorthair",
  aliases: ["oriental shorthair", "oriental", "osh"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 3, max: 5 },
  healthRisks: [
    {
      condition: "Amyloidosis (Liver)",
      riskLevel: "high",
      typicalOnsetYears: 6,
      monitoringAdvice: "Related to Siamese. Regular liver function tests.",
      symptoms: ["Lethargy", "Weight loss", "Jaundice"],
    },
    {
      condition: "Dilated Cardiomyopathy (DCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart screening after age 4.",
      symptoms: ["Lethargy", "Breathing difficulties", "Weakness"],
    },
    {
      condition: "Dental Disease",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Similar to Siamese. Regular dental care essential.",
      symptoms: ["Bad breath", "Red gums", "Difficulty eating"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Dental exam", "Baseline bloodwork"], reason: "Establish baseline" },
    { ageYears: 4, screenings: ["Heart check", "Liver panel", "Dental assessment"], reason: "Begin cardiac monitoring" },
    { ageYears: 7, screenings: ["Full bloodwork", "Echocardiogram", "Dental care"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Dental Care Start", advice: ["Begin dental routine early", "High-protein diet", "Lots of social interaction", "Mental stimulation crucial"] },
    { ageRange: [3, 7], focus: "Heart & Liver Watch", advice: ["Begin cardiac screening", "Monitor liver function", "Continue dental care", "Keep active and engaged"] },
    { ageRange: [7, 15], focus: "Monitoring & Care", advice: ["Regular comprehensive exams", "Watch for signs of amyloidosis", "Dental health maintenance", "Heart monitoring continues"] },
  ],
  generalNotes: "Related to Siamese with similar health concerns. Very vocal and social. Requires lots of attention and mental stimulation.",
};

const russianBlue: BreedHealthProfile = {
  breed: "Russian Blue",
  aliases: ["russian blue", "archangel blue"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 15, max: 20 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Bladder Stones",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Encourage water intake. Regular urinalysis.",
      symptoms: ["Straining to urinate", "Blood in urine", "Frequent urination"],
    },
    {
      condition: "Obesity",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "This breed loves food. Strict portion control needed.",
      symptoms: ["Weight gain", "Decreased activity"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork", "Weight assessment"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Urinalysis", "Weight check", "Bloodwork"], reason: "Bladder health monitoring" },
    { ageYears: 8, screenings: ["Senior panel", "Urinalysis"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Weight Foundation", advice: ["Establish portion control early", "Encourage play despite shy nature", "High-quality diet", "Gradual socialization"] },
    { ageRange: [3, 8], focus: "Weight & Urinary Health", advice: ["Monitor weight closely", "Ensure adequate water intake", "Consider wet food for hydration", "Regular urinalysis"] },
    { ageRange: [8, 15], focus: "Healthy Aging", advice: ["Continue weight management", "Regular health checks", "This breed ages gracefully", "Maintain enrichment"] },
    { ageRange: [15, 20], focus: "Long Life Care", advice: ["Russian Blues often live very long", "Regular senior checks", "Comfortable environment", "Monitor for age-related changes"] },
  ],
  generalNotes: "Generally healthy breed with long lifespan. Prone to weight gain and bladder issues. Shy but loyal temperament.",
};

// ============================================
// SMALL BREEDS
// ============================================

const sphynx: BreedHealthProfile = {
  breed: "Sphynx",
  aliases: ["sphynx", "sphinx", "hairless cat"],
  sizeCategory: "small",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 3, max: 5 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "high",
      typicalOnsetYears: 3,
      monitoringAdvice: "Annual echocardiograms starting at age 2. High prevalence in breed.",
      symptoms: ["Lethargy", "Rapid breathing", "Weakness"],
    },
    {
      condition: "Skin Issues",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Regular bathing needed. Watch for oil buildup and infections.",
      symptoms: ["Oily skin", "Skin infections", "Acne"],
    },
    {
      condition: "Temperature Sensitivity",
      riskLevel: "moderate",
      typicalOnsetYears: 0,
      monitoringAdvice: "No fur means they need warmth. Provide heated beds, sweaters.",
      symptoms: ["Shivering", "Seeking warmth constantly"],
    },
    {
      condition: "Hereditary Myopathy",
      riskLevel: "moderate",
      typicalOnsetYears: 1,
      monitoringAdvice: "Genetic predisposition. Watch for muscle weakness.",
      symptoms: ["Muscle weakness", "Difficulty swallowing", "Fatigue"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Skin assessment", "Baseline bloodwork", "Heart check"], reason: "Establish baseline" },
    { ageYears: 2, screenings: ["Echocardiogram", "Skin check"], reason: "Critical - begin HCM monitoring early" },
    { ageYears: 4, screenings: ["Annual echocardiogram", "Full panel"], reason: "Ongoing cardiac monitoring" },
    { ageYears: 8, screenings: ["Senior panel", "Cardiac assessment", "Skin health"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Skin & Heart Foundation", advice: ["Establish bathing routine (weekly)", "First echocardiogram by age 2", "Provide warmth - heated beds essential", "Sun protection if exposed to windows"] },
    { ageRange: [2, 6], focus: "Cardiac Priority", advice: ["Annual echocardiograms essential", "Maintain skin care routine", "Temperature regulation important", "High-calorie diet for heat generation"] },
    { ageRange: [6, 12], focus: "Continuing Care", advice: ["Heart monitoring continues", "Watch skin for changes", "Dental care - no whiskers to detect food", "Keep environment warm"] },
    { ageRange: [12, 15], focus: "Senior Sphynx", advice: ["Increased cardiac monitoring", "Extra warmth needed", "Skin may need more care", "Comfortable, heated spaces"] },
  ],
  generalNotes: "Hairless breed requiring special care. High HCM risk - cardiac screening essential. Needs weekly bathing and warmth.",
};

const devonRex: BreedHealthProfile = {
  breed: "Devon Rex",
  aliases: ["devon rex", "devon", "pixie cat"],
  sizeCategory: "small",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 2.5, max: 4 },
  healthRisks: [
    {
      condition: "Hereditary Myopathy",
      riskLevel: "high",
      typicalOnsetYears: 0.5,
      monitoringAdvice: "Genetic condition causing muscle weakness. Usually apparent in kittens.",
      symptoms: ["Muscle weakness", "Head bobbing", "Difficulty swallowing", "Fatigue"],
    },
    {
      condition: "Patellar Luxation",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Watch for limping or abnormal gait.",
      symptoms: ["Limping", "Leg held up", "Skipping gait"],
    },
    {
      condition: "Hip Dysplasia",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Monitor mobility as they age.",
      symptoms: ["Reluctance to jump", "Stiffness"],
    },
    {
      condition: "Skin Sensitivity",
      riskLevel: "moderate",
      typicalOnsetYears: 0,
      monitoringAdvice: "Curly coat can cause skin issues. Regular grooming needed.",
      symptoms: ["Skin irritation", "Oily skin"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Myopathy assessment", "Joint evaluation", "Baseline bloodwork"], reason: "Screen for hereditary issues" },
    { ageYears: 3, screenings: ["Joint assessment", "Heart check"], reason: "Monitor for developing issues" },
    { ageYears: 7, screenings: ["Full panel", "Joint evaluation"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Genetic Monitoring", advice: ["Watch for myopathy signs", "Monitor joint health", "Gentle skin care for curly coat", "High-calorie diet - high metabolism"] },
    { ageRange: [2, 6], focus: "Joint Care", advice: ["Monitor for patella issues", "Keep weight healthy for joints", "Regular exercise appropriate for build", "Skin care routine"] },
    { ageRange: [6, 12], focus: "Maintenance", advice: ["Joint supplements may help", "Regular health checks", "Maintain healthy weight", "Skin monitoring continues"] },
    { ageRange: [12, 15], focus: "Senior Support", advice: ["Joint care priority", "Soft bedding", "Warmth - thin coat provides less insulation", "Regular vet visits"] },
  ],
  generalNotes: "Playful, mischievous breed with unique curly coat. Hereditary myopathy is a concern. Needs warmth and joint care.",
};

const cornishRex: BreedHealthProfile = {
  breed: "Cornish Rex",
  aliases: ["cornish rex", "cornish"],
  sizeCategory: "small",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 2.5, max: 4.5 },
  healthRisks: [
    {
      condition: "Hypotrichosis",
      riskLevel: "moderate",
      typicalOnsetYears: 0,
      monitoringAdvice: "Some may develop bald patches. Usually cosmetic.",
      symptoms: ["Hair loss", "Thin coat areas"],
    },
    {
      condition: "Patellar Luxation",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Similar to Devon Rex. Monitor joint health.",
      symptoms: ["Limping", "Abnormal gait"],
    },
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Less common than in Sphynx but still monitor.",
      symptoms: ["Lethargy", "Breathing changes"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Joint evaluation", "Skin assessment", "Baseline bloodwork"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Heart check", "Joint assessment"], reason: "Cardiac monitoring begins" },
    { ageYears: 8, screenings: ["Senior panel", "Full assessment"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Growth & Joints", advice: ["Monitor joint development", "High-calorie diet for high metabolism", "Warmth needed - wavy coat provides less insulation", "Gentle grooming"] },
    { ageRange: [3, 8], focus: "Active Adult", advice: ["Keep joints healthy with appropriate exercise", "Maintain healthy weight", "Begin heart monitoring", "Skin care"] },
    { ageRange: [8, 15], focus: "Senior Years", advice: ["Joint support", "Regular cardiac checks", "Warmth important", "Regular health monitoring"] },
  ],
  generalNotes: "Elegant, athletic breed with unique wavy coat. Similar to Devon Rex in care needs. Needs warmth and joint monitoring.",
};

const scottishFold: BreedHealthProfile = {
  breed: "Scottish Fold",
  aliases: ["scottish fold", "scottish", "fold"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 11, max: 14 },
  idealWeight: { min: 3, max: 6 },
  healthRisks: [
    {
      condition: "Osteochondrodysplasia",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Genetic condition affecting all Scottish Folds. Causes arthritis and cartilage issues.",
      symptoms: ["Stiffness", "Reluctance to move", "Thick/stiff tail", "Limping"],
    },
    {
      condition: "Arthritis",
      riskLevel: "high",
      typicalOnsetYears: 2,
      monitoringAdvice: "Develops early due to osteochondrodysplasia. Pain management essential.",
      symptoms: ["Stiffness", "Reluctance to jump", "Difficulty grooming"],
    },
    {
      condition: "Cardiomyopathy",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Regular heart monitoring recommended.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Joint assessment", "Baseline X-rays", "Bloodwork"], reason: "Assess bone/joint development" },
    { ageYears: 3, screenings: ["Joint X-rays", "Pain assessment", "Heart check"], reason: "Monitor progression" },
    { ageYears: 5, screenings: ["Full joint evaluation", "Cardiac screening", "Pain management review"], reason: "Ongoing care" },
    { ageYears: 8, screenings: ["Comprehensive assessment", "Pain management"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Joint Baseline", advice: ["X-rays to assess bone development", "Soft bedding essential", "Low-impact play", "Watch for early stiffness signs"] },
    { ageRange: [2, 5], focus: "Pain Prevention", advice: ["Joint supplements from early age", "Maintain healthy weight - critical for joints", "Pain medication if needed", "Accessible litter boxes and food"] },
    { ageRange: [5, 10], focus: "Comfort Priority", advice: ["Pain management review regularly", "Heated beds can help", "Gentle handling", "Monitor mobility closely"] },
    { ageRange: [10, 14], focus: "Quality of Life", advice: ["Focus on comfort and pain control", "Easy access to everything", "Regular pain assessments", "Consider mobility aids"] },
  ],
  generalNotes: "Sweet, gentle breed but ALL Scottish Folds have a genetic condition affecting bones/cartilage. Early and ongoing joint care is essential. Pain management is a priority.",
};

const birman: BreedHealthProfile = {
  breed: "Birman",
  aliases: ["birman", "sacred cat of burma"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 16 },
  idealWeight: { min: 3.5, max: 6 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual cardiac screening after age 4.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
    {
      condition: "Renal Disease",
      riskLevel: "moderate",
      typicalOnsetYears: 8,
      monitoringAdvice: "Monitor kidney function from middle age.",
      symptoms: ["Increased thirst", "Weight loss"],
    },
    {
      condition: "Feline Hyperesthesia Syndrome",
      riskLevel: "low",
      typicalOnsetYears: 1,
      monitoringAdvice: "Watch for skin rippling and excessive grooming.",
      symptoms: ["Skin rippling", "Tail chasing", "Excessive grooming"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork", "General health check"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Echocardiogram", "Kidney panel"], reason: "Begin cardiac/renal monitoring" },
    { ageYears: 8, screenings: ["Full senior panel", "Heart check", "Kidney function"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Socialization & Grooming", advice: ["Regular grooming for silky coat", "Gentle socialization", "Establish health baseline", "Watch for hyperesthesia signs"] },
    { ageRange: [3, 8], focus: "Preventive Care", advice: ["Begin cardiac screening at 5", "Monitor kidney function", "Maintain grooming routine", "Keep stress low"] },
    { ageRange: [8, 16], focus: "Senior Care", advice: ["Regular cardiac and kidney checks", "Comfortable environment", "Continue gentle grooming", "Monitor for age-related changes"] },
  ],
  generalNotes: "Gentle, quiet breed with beautiful coat. Generally healthy but monitor heart and kidneys as they age.",
};

const turkishAngora: BreedHealthProfile = {
  breed: "Turkish Angora",
  aliases: ["turkish angora", "angora"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 18 },
  idealWeight: { min: 3, max: 5 },
  healthRisks: [
    {
      condition: "Deafness (White Cats)",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "White Turkish Angoras, especially with blue eyes, often deaf. BAER test available.",
      symptoms: ["No response to sounds", "Startles easily when touched"],
    },
    {
      condition: "Ataxia",
      riskLevel: "moderate",
      typicalOnsetYears: 0.5,
      monitoringAdvice: "Hereditary condition affecting coordination. Usually apparent in kittens.",
      symptoms: ["Uncoordinated movement", "Head bobbing", "Balance issues"],
    },
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart screening from age 4.",
      symptoms: ["Lethargy", "Breathing changes"],
    },
  ],
  screeningSchedule: [
    { ageYears: 0.5, screenings: ["BAER hearing test (white cats)", "Neurological assessment"], reason: "Screen for deafness and ataxia" },
    { ageYears: 4, screenings: ["Echocardiogram", "General health check"], reason: "Begin cardiac monitoring" },
    { ageYears: 8, screenings: ["Heart check", "Senior panel"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Genetic Screening", advice: ["BAER test for white cats", "Monitor for ataxia signs", "Establish grooming routine for long coat", "Indoor-only recommended for deaf cats"] },
    { ageRange: [2, 6], focus: "Active Adult Care", advice: ["Very active breed - provide lots of play", "Begin cardiac monitoring at 4", "Keep coat well-groomed", "Mental stimulation important"] },
    { ageRange: [6, 12], focus: "Healthy Aging", advice: ["Regular heart checks", "Maintain activity level", "Grooming routine continues", "Watch for any mobility changes"] },
    { ageRange: [12, 18], focus: "Long-Lived Senior", advice: ["Turkish Angoras can live very long", "Regular monitoring", "Comfort-focused care", "Gentle grooming"] },
  ],
  generalNotes: "Elegant, ancient breed known for long silky coat. White cats often deaf. Active and intelligent, often lives into late teens.",
};

const himalayan: BreedHealthProfile = {
  breed: "Himalayan",
  aliases: ["himalayan", "himmie", "colorpoint persian"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "high",
      typicalOnsetYears: 7,
      monitoringAdvice: "Same as Persian - genetic test and ultrasound essential.",
      symptoms: ["Increased thirst", "Weight loss", "Lethargy"],
    },
    {
      condition: "Brachycephalic Airway Syndrome",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Flat face causes breathing issues. Avoid heat and stress.",
      symptoms: ["Noisy breathing", "Snoring", "Exercise intolerance"],
    },
    {
      condition: "Progressive Retinal Atrophy (PRA)",
      riskLevel: "moderate",
      typicalOnsetYears: 4,
      monitoringAdvice: "Annual eye exams recommended.",
      symptoms: ["Night blindness", "Vision loss"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["PKD genetic test", "Eye exam", "Baseline bloodwork"], reason: "Genetic screening" },
    { ageYears: 4, screenings: ["Kidney ultrasound", "Eye exam"], reason: "PKD monitoring" },
    { ageYears: 7, screenings: ["Full panel", "Kidney function", "Eye exam"], reason: "Senior preparation" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Breathing & Grooming", advice: ["Keep environment cool", "Establish daily grooming routine", "PKD genetic test", "Monitor breathing"] },
    { ageRange: [3, 7], focus: "Kidney & Eye Health", advice: ["Begin kidney screening", "Annual eye exams", "Maintain grooming", "Climate control important"] },
    { ageRange: [7, 15], focus: "Senior Care", advice: ["Regular kidney monitoring", "Keep stress low", "Comfortable environment", "Gentle care routine"] },
  ],
  generalNotes: "Persian with Siamese coloring. Same health concerns as Persian including PKD and breathing issues. High-maintenance coat.",
};

// ============================================
// GENERAL/MIXED BREEDS
// ============================================

const domesticShorthair: BreedHealthProfile = {
  breed: "Domestic Shorthair",
  aliases: ["domestic shorthair", "dsh", "house cat", "moggy", "mixed breed", "tabby", "mixed"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 20 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Obesity",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Very common in pet cats. Portion control and regular exercise essential.",
      symptoms: ["Visible weight gain", "Decreased activity", "Difficulty grooming"],
    },
    {
      condition: "Dental Disease",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Common in all cats. Annual dental exams recommended.",
      symptoms: ["Bad breath", "Difficulty eating", "Red gums"],
    },
    {
      condition: "Diabetes",
      riskLevel: "moderate",
      typicalOnsetYears: 8,
      monitoringAdvice: "Often linked to obesity. Weight management is key.",
      symptoms: ["Increased thirst", "Increased urination", "Weight changes"],
    },
    {
      condition: "Kidney Disease",
      riskLevel: "moderate",
      typicalOnsetYears: 10,
      monitoringAdvice: "Common in senior cats. Regular bloodwork after age 7.",
      symptoms: ["Increased thirst", "Weight loss", "Decreased appetite"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Baseline bloodwork", "Dental exam", "Weight assessment"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Full bloodwork", "Dental assessment", "Weight check"], reason: "Middle-age check" },
    { ageYears: 7, screenings: ["Senior bloodwork including kidney/thyroid", "Dental care"], reason: "Begin senior monitoring" },
    { ageYears: 10, screenings: ["Bi-annual senior panels", "Complete assessment"], reason: "Senior care intensifies" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Foundation Health", advice: ["Spay/neuter if not done", "Establish feeding routine and portions", "Complete vaccinations", "Regular play for healthy development"] },
    { ageRange: [2, 7], focus: "Maintenance & Prevention", advice: ["Annual checkups", "Maintain healthy weight", "Dental care important", "Keep mentally and physically active"] },
    { ageRange: [7, 12], focus: "Senior Transition", advice: ["Switch to bi-annual vet visits", "Monitor for diabetes and kidney disease", "Adjust diet as needed", "Watch for arthritis signs"] },
    { ageRange: [12, 20], focus: "Senior Care", advice: ["Regular bloodwork monitoring", "Comfort and quality of life focus", "Easy access to resources", "Watch for cognitive changes"] },
  ],
  generalNotes: "Mixed breed cats are generally hardy with genetic diversity. Still need regular care and preventive health measures. Can live very long with proper care.",
};

const domesticLonghair: BreedHealthProfile = {
  breed: "Domestic Longhair",
  aliases: ["domestic longhair", "dlh", "long-haired cat", "longhair"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 18 },
  idealWeight: { min: 3.5, max: 6 },
  healthRisks: [
    {
      condition: "Hairballs",
      riskLevel: "moderate",
      typicalOnsetYears: 1,
      monitoringAdvice: "Long coat leads to more hairballs. Regular grooming and hairball remedies help.",
      symptoms: ["Frequent vomiting", "Constipation", "Dry heaving"],
    },
    {
      condition: "Matted Fur",
      riskLevel: "moderate",
      typicalOnsetYears: 0,
      monitoringAdvice: "Regular grooming essential. Mats can cause skin issues.",
      symptoms: ["Tangled fur", "Skin irritation under mats"],
    },
    {
      condition: "Obesity",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Same as DSH. Long fur can hide weight gain.",
      symptoms: ["Weight gain", "Difficulty grooming"],
    },
    {
      condition: "Kidney Disease",
      riskLevel: "moderate",
      typicalOnsetYears: 10,
      monitoringAdvice: "Common in senior cats.",
      symptoms: ["Increased thirst", "Weight loss"],
    },
  ],
  screeningSchedule: [
    { ageYears: 1, screenings: ["Baseline bloodwork", "Coat/skin assessment"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Full bloodwork", "Weight check"], reason: "Middle-age check" },
    { ageYears: 7, screenings: ["Senior panel", "Thyroid check"], reason: "Senior monitoring begins" },
    { ageYears: 10, screenings: ["Bi-annual senior panels"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Grooming Foundation", advice: ["Establish daily grooming routine early", "Train to accept brushing", "Hairball prevention diet/treats", "Regular play"] },
    { ageRange: [2, 7], focus: "Coat & Weight Care", advice: ["Maintain grooming routine", "Monitor weight under the fluff", "Dental care", "Annual checkups"] },
    { ageRange: [7, 12], focus: "Senior Prep", advice: ["May need grooming help as they age", "Regular senior bloodwork", "Watch for mobility affecting self-grooming", "Hairball management continues"] },
    { ageRange: [12, 18], focus: "Senior Support", advice: ["Assist with grooming if needed", "Regular health monitoring", "Comfort-focused care", "Watch for matting in hard-to-reach areas"] },
  ],
  generalNotes: "Mixed breed with long coat. Needs regular grooming to prevent mats and hairballs. Generally healthy with good genetic diversity.",
};

const tuxedo: BreedHealthProfile = {
  breed: "Tuxedo",
  aliases: ["tuxedo", "tuxedo cat", "black and white"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 20 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    ...domesticShorthair.healthRisks, // Same as DSH - it's a color pattern, not a breed
  ],
  screeningSchedule: [...domesticShorthair.screeningSchedule],
  ageSpecificAdvice: [...domesticShorthair.ageSpecificAdvice],
  generalNotes: "Tuxedo is a color pattern, not a breed. Health considerations are same as Domestic Shorthair. Known for personality and intelligence!",
};

const calico: BreedHealthProfile = {
  breed: "Calico",
  aliases: ["calico", "calico cat", "tricolor"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 18 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    ...domesticShorthair.healthRisks,
    {
      condition: "Klinefelter Syndrome (Male Calicos)",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Male calicos are extremely rare and have XXY chromosomes. Often have health issues.",
      symptoms: ["Developmental issues", "Cognitive problems", "Behavioral differences"],
    },
  ],
  screeningSchedule: [...domesticShorthair.screeningSchedule],
  ageSpecificAdvice: [...domesticShorthair.ageSpecificAdvice],
  generalNotes: "Calico is a color pattern (almost always female). Health considerations similar to Domestic Shorthair. Male calicos are rare and may have genetic issues.",
};

const tabby: BreedHealthProfile = {
  breed: "Tabby",
  aliases: ["tabby", "tabby cat", "striped cat", "tiger cat"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 20 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [...domesticShorthair.healthRisks],
  screeningSchedule: [...domesticShorthair.screeningSchedule],
  ageSpecificAdvice: [...domesticShorthair.ageSpecificAdvice],
  generalNotes: "Tabby is a coat pattern, not a breed. Health considerations same as Domestic Shorthair. Very common and hardy pattern.",
};

// Additional breeds to reach 30+

const americanShorthair: BreedHealthProfile = {
  breed: "American Shorthair",
  aliases: ["american shorthair", "ash"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 15, max: 20 },
  idealWeight: { min: 4, max: 6 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Annual heart screening from age 4.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
    {
      condition: "Obesity",
      riskLevel: "moderate",
      typicalOnsetYears: 3,
      monitoringAdvice: "Muscular breed that can become overweight. Portion control needed.",
      symptoms: ["Weight gain", "Decreased activity"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork", "Weight assessment"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Echocardiogram", "Full panel"], reason: "Cardiac monitoring" },
    { ageYears: 8, screenings: ["Senior panel", "Heart check"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Foundation", advice: ["Establish portion control", "Regular play sessions", "Annual checkups"] },
    { ageRange: [3, 8], focus: "Weight & Heart", advice: ["Monitor weight", "Begin cardiac screening", "Maintain activity"] },
    { ageRange: [8, 15], focus: "Senior Care", advice: ["Regular heart monitoring", "Joint support if needed", "Weight management continues"] },
    { ageRange: [15, 20], focus: "Golden Years", advice: ["Very long-lived breed", "Regular monitoring", "Comfort-focused care"] },
  ],
  generalNotes: "Hardy, athletic breed with long lifespan. Generally healthy but watch weight and heart. Can live 15-20 years.",
};

const manx: BreedHealthProfile = {
  breed: "Manx",
  aliases: ["manx", "manx cat", "tailless cat"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 14 },
  idealWeight: { min: 3.5, max: 5.5 },
  healthRisks: [
    {
      condition: "Manx Syndrome",
      riskLevel: "high",
      typicalOnsetYears: 0,
      monitoringAdvice: "Spinal defects from the tailless gene. Can affect bowel/bladder control.",
      symptoms: ["Incontinence", "Difficulty walking", "Constipation", "Hind leg weakness"],
    },
    {
      condition: "Arthritis",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Spine issues can lead to early arthritis.",
      symptoms: ["Stiffness", "Reluctance to jump"],
    },
    {
      condition: "Corneal Dystrophy",
      riskLevel: "moderate",
      typicalOnsetYears: 4,
      monitoringAdvice: "Annual eye exams recommended.",
      symptoms: ["Cloudy eyes", "Vision changes"],
    },
  ],
  screeningSchedule: [
    { ageYears: 0.5, screenings: ["Spinal assessment", "Neurological evaluation"], reason: "Screen for Manx syndrome" },
    { ageYears: 3, screenings: ["X-rays if needed", "Eye exam"], reason: "Ongoing monitoring" },
    { ageYears: 6, screenings: ["Full assessment", "Pain evaluation", "Eye exam"], reason: "Monitor for arthritis" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Spinal Assessment", advice: ["Thorough evaluation for Manx syndrome", "Monitor bowel/bladder function", "Gentle exercise appropriate", "Watch for hind leg issues"] },
    { ageRange: [2, 7], focus: "Mobility Support", advice: ["Monitor for early arthritis", "Keep weight healthy for spine", "Regular eye exams", "Appropriate exercise levels"] },
    { ageRange: [7, 14], focus: "Comfort Care", advice: ["Pain management as needed", "Soft bedding important", "Easy access to litter box", "Regular monitoring"] },
  ],
  generalNotes: "Unique tailless breed with genetic spinal concerns. Manx syndrome is a serious risk. Requires careful monitoring from kittenhood.",
};

const ragamuffin: BreedHealthProfile = {
  breed: "Ragamuffin",
  aliases: ["ragamuffin", "raga muffin"],
  sizeCategory: "large",
  lifeExpectancy: { min: 12, max: 16 },
  idealWeight: { min: 4.5, max: 9 },
  healthRisks: [
    {
      condition: "Hypertrophic Cardiomyopathy (HCM)",
      riskLevel: "moderate",
      typicalOnsetYears: 5,
      monitoringAdvice: "Related to Ragdoll - similar cardiac risks.",
      symptoms: ["Lethargy", "Breathing difficulties"],
    },
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "moderate",
      typicalOnsetYears: 7,
      monitoringAdvice: "Some PKD present in breeding lines. Ultrasound screening recommended.",
      symptoms: ["Increased thirst", "Weight loss"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Baseline bloodwork", "Heart check"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Echocardiogram", "Kidney ultrasound"], reason: "Begin monitoring" },
    { ageYears: 8, screenings: ["Full senior panel", "Cardiac/renal check"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Growth Period", advice: ["Support healthy growth - large breed", "Regular grooming", "Socialize well", "Establish vet relationship"] },
    { ageRange: [3, 8], focus: "Adult Care", advice: ["Begin cardiac screening", "Monitor kidney health", "Maintain coat with regular grooming", "Keep active for weight management"] },
    { ageRange: [8, 16], focus: "Senior Years", advice: ["Regular heart and kidney monitoring", "Joint support for large frame", "Continue grooming assistance", "Comfort-focused care"] },
  ],
  generalNotes: "Sweet, docile breed related to Ragdoll. Large size requires joint and heart attention. Generally healthy but monitor for HCM.",
};

const somali: BreedHealthProfile = {
  breed: "Somali",
  aliases: ["somali", "somali cat", "longhaired abyssinian"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 16 },
  idealWeight: { min: 3, max: 5 },
  healthRisks: [
    ...abyssinian.healthRisks, // Same as Abyssinian - it's the longhaired version
  ],
  screeningSchedule: [...abyssinian.screeningSchedule],
  ageSpecificAdvice: [
    { ageRange: [0, 2], focus: "Genetic Testing & Coat Care", advice: ["Complete genetic testing (same as Aby)", "Establish grooming routine for long coat", "Provide lots of activity", "High-quality protein diet"] },
    { ageRange: [2, 5], focus: "Kidney Baseline", advice: ["Establish kidney function baseline", "Regular grooming", "Eye exams for PRA", "Keep active and stimulated"] },
    { ageRange: [5, 10], focus: "Kidney Health Priority", advice: ["Regular kidney monitoring crucial", "Consider kidney-supportive diet", "Maintain grooming", "Continue active lifestyle"] },
    { ageRange: [10, 16], focus: "Senior Support", advice: ["Intensive kidney monitoring", "May need grooming help", "Joint support if needed", "Regular comprehensive checks"] },
  ],
  generalNotes: "Long-haired version of Abyssinian with same health concerns. Active, intelligent breed. Renal amyloidosis is primary concern.",
};

const chartreux: BreedHealthProfile = {
  breed: "Chartreux",
  aliases: ["chartreux"],
  sizeCategory: "medium",
  lifeExpectancy: { min: 12, max: 15 },
  idealWeight: { min: 4, max: 7 },
  healthRisks: [
    {
      condition: "Patellar Luxation",
      riskLevel: "moderate",
      typicalOnsetYears: 2,
      monitoringAdvice: "Watch for limping or unusual gait.",
      symptoms: ["Limping", "Skipping gait", "Leg held up"],
    },
    {
      condition: "Polycystic Kidney Disease (PKD)",
      riskLevel: "low",
      typicalOnsetYears: 7,
      monitoringAdvice: "Less common but can occur. Monitor kidney function in seniors.",
      symptoms: ["Increased thirst", "Weight loss"],
    },
  ],
  screeningSchedule: [
    { ageYears: 2, screenings: ["Joint assessment", "Baseline bloodwork"], reason: "Establish baseline" },
    { ageYears: 5, screenings: ["Full bloodwork", "Joint check"], reason: "Middle age monitoring" },
    { ageYears: 8, screenings: ["Senior panel", "Kidney function"], reason: "Senior care" },
  ],
  ageSpecificAdvice: [
    { ageRange: [0, 3], focus: "Joint Development", advice: ["Monitor joint health", "Maintain healthy weight", "Regular play", "Establish brushing routine for dense coat"] },
    { ageRange: [3, 8], focus: "Maintenance", advice: ["Regular checkups", "Watch for patella issues", "Keep active", "Coat care"] },
    { ageRange: [8, 15], focus: "Senior Years", advice: ["Joint support if needed", "Regular bloodwork", "Continue coat care", "Monitor kidney function"] },
  ],
  generalNotes: "Quiet, gentle French breed with distinctive blue-gray coat. Generally healthy. Watch joints and maintain dense coat.",
};

// ============================================
// EXPORT ALL BREED PROFILES
// ============================================

export const BREED_HEALTH_DATABASE: BreedHealthProfile[] = [
  // Large breeds
  maineCoon,
  ragdoll,
  norwegianForest,
  britishShorthair,
  savannah,
  ragamuffin,
  // Medium breeds
  persian,
  bengal,
  siamese,
  abyssinian,
  exoticShorthair,
  burmese,
  orientalShorthair,
  russianBlue,
  scottishFold,
  birman,
  turkishAngora,
  himalayan,
  americanShorthair,
  manx,
  somali,
  chartreux,
  // Small breeds
  sphynx,
  devonRex,
  cornishRex,
  // Pattern-based (not true breeds)
  domesticShorthair,
  domesticLonghair,
  tuxedo,
  calico,
  tabby,
];

// ============================================
// LOOKUP FUNCTIONS
// ============================================

/**
 * Find a breed profile by name (case-insensitive, checks aliases)
 */
export function findBreedProfile(breedName: string | null): BreedHealthProfile | null {
  if (!breedName) return domesticShorthair; // Default to DSH for unknown

  const normalized = breedName.toLowerCase().trim();
  
  return BREED_HEALTH_DATABASE.find(profile => 
    profile.breed.toLowerCase() === normalized ||
    profile.aliases.some(alias => alias.toLowerCase() === normalized)
  ) || domesticShorthair; // Default to DSH if not found
}

/**
 * Get health risks for a specific age
 */
export function getHealthRisksForAge(profile: BreedHealthProfile, ageYears: number): HealthRisk[] {
  return profile.healthRisks.filter(risk => 
    risk.typicalOnsetYears <= ageYears + 2 // Include risks that could emerge soon
  );
}

/**
 * Get recommended screenings for a specific age
 */
export function getScreeningsForAge(profile: BreedHealthProfile, ageYears: number): ScreeningSchedule | null {
  // Find the most recent screening milestone at or before this age
  const screenings = profile.screeningSchedule
    .filter(s => s.ageYears <= ageYears)
    .sort((a, b) => b.ageYears - a.ageYears);
  
  return screenings[0] || null;
}

/**
 * Get upcoming screenings (next milestone)
 */
export function getUpcomingScreenings(profile: BreedHealthProfile, ageYears: number): ScreeningSchedule | null {
  const upcoming = profile.screeningSchedule
    .filter(s => s.ageYears > ageYears)
    .sort((a, b) => a.ageYears - b.ageYears);
  
  return upcoming[0] || null;
}

/**
 * Get age-specific advice for current age
 */
export function getAgeSpecificAdvice(profile: BreedHealthProfile, ageYears: number): AgeSpecificAdvice | null {
  return profile.ageSpecificAdvice.find(advice => 
    ageYears >= advice.ageRange[0] && ageYears < advice.ageRange[1]
  ) || null;
}

/**
 * Get all relevant breed alerts for a specific age (things to watch for)
 */
export function getBreedAlertsForAge(
  profile: BreedHealthProfile, 
  ageYears: number
): { alerts: string[]; screenings: string[]; advice: string[] } {
  const alerts: string[] = [];
  const screenings: string[] = [];
  const advice: string[] = [];

  // Check health risks approaching their onset
  profile.healthRisks.forEach(risk => {
    if (risk.typicalOnsetYears === ageYears) {
      alerts.push(`${profile.breed}s typically begin showing ${risk.condition} around age ${ageYears}. ${risk.monitoringAdvice}`);
    } else if (risk.typicalOnsetYears === ageYears + 1) {
      alerts.push(`Watch for early signs of ${risk.condition} - common in ${profile.breed}s starting around age ${risk.typicalOnsetYears}.`);
    }
  });

  // Get current screening recommendations
  const screening = profile.screeningSchedule.find(s => s.ageYears === ageYears);
  if (screening) {
    screenings.push(...screening.screenings.map(s => `Recommended: ${s} - ${screening.reason}`));
  }

  // Get age-specific advice
  const ageAdvice = getAgeSpecificAdvice(profile, ageYears);
  if (ageAdvice) {
    advice.push(...ageAdvice.advice);
  }

  return { alerts, screenings, advice };
}

