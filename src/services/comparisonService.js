// src/services/comparisonService.js

/**
 * Scoring weights for each facial feature category.
 * Based on your notes, Head Shape and Eyes are most important.
 */
const SCORE_WEIGHTS = {
  "Face/Head Shape": 30,
  "Eyes": 20,
  "Nose": 20, // Corresponds to Muzzle
  "Cheeks & Cheekbones": 10,
  "Hair": 10, // Corresponds to Fur/Feathers/etc.
  "Facial Hair": 10,
  "Eyelashes": 5,
  "Teeth": 5,
  // Add other categories with their weights if needed
  "Jaw & Chin": 10,
  "Forehead": 5,
  "Mouth": 5,
  "Overall Jaw/Mouth Appearance": 5,
  "Ears (hears)": 5,
  "Expressive Face": 5,
  "Cranio-Facial Angle": 10,
};

/**
 * Compares a single feature between a human and an animal.
 * The human feature can be an array of possibilities, while the animal's is a single value.
 * @param {Array<string>} humanFeatureOptions - e.g., ["Long", "Oval"]
 * @param {string} animalFeatureValue - e.g., "Long"
 * @returns {boolean} - True if there is a match.
 */
function featuresMatch(humanFeatureOptions, animalFeatureValue) {
  if (!humanFeatureOptions || !animalFeatureValue) {
    return false;
  }
  // Some animal features might have clarifying text in parentheses, e.g., "Long (Egg-shaped)"
  // We can check if the core value exists in the human options.
  return humanFeatureOptions.some(option => animalFeatureValue.includes(option));
}

/**
 * Calculates a match score for a single animal against a human profile.
 * @param {object} humanProfile - The human's feature profile.
 * @param {object} animalProfile - The animal's feature profile.
 * @returns {number} - The total match score.
 */
function calculateSingleScore(humanProfile, animalProfile) {
  let score = 0;
  const humanFeatures = humanProfile.features;
  const animalFeatures = animalProfile.features;

  // Iterate over the weighted categories
  for (const category in SCORE_WEIGHTS) {
    const humanCategory = humanFeatures[category];
    const animalCategory = animalFeatures[category];

    if (humanCategory && animalCategory) {
      const subFeatureKeys = Object.keys(humanCategory);
      const weightPerSubFeature = SCORE_WEIGHTS[category] / subFeatureKeys.length;

      // Iterate over sub-features in the category (e.g., "Shape", "Height")
      for (const subFeature of subFeatureKeys) {
        if (animalCategory[subFeature]) {
          const humanOptions = humanCategory[subFeature];
          const animalValue = animalCategory[subFeature];

          if (featuresMatch(humanOptions, animalValue)) {
            // Add a fraction of the category's weight for each matching sub-feature.
            // This provides a more granular and fair score.
            score += weightPerSubFeature;
          }
        }
      }
    }
  }
  return score;
}

/**
 * Main function to get a sorted list of animal matches for a given human profile.
 * @param {object} humanProfile - The profile of the human to be matched.
 * @param {Array<object>} allAnimals - The full list of animals from characterization.json.
 * @returns {Array<object>} - A sorted list of animals with their scores.
 */
export function getAnimalMatchScores(humanProfile, allAnimals) {
  const scoredAnimals = allAnimals.map(animal => {
    const score = calculateSingleScore(humanProfile, animal);
    return {
      name: animal.name,
      type: animal.type,
      score: score,
      // You can also include the original animal data if needed
      // ...animal 
    };
  });

  // Sort the animals by score in descending order
  return scoredAnimals.sort((a, b) => b.score - a.score);
}
