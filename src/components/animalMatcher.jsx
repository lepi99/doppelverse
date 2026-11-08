import React, { useState, useEffect } from 'react';
import { getAnimalMatchScores } from '../services/comparisonService.js';
import { Typography, Box } from '@mui/material';

/**
 * Component to calculate and display top animal matches for a given human profile.
 * @param {object} humanProfile - The profile of the human to be matched.
 */
function AnimalMatcher({ humanProfile }) {
  const [bestMatches, setBestMatches] = useState([]);

  useEffect(() => {
    if (!humanProfile) return;

    // This is where you would load your data
    async function loadAndCompare() {
      const animalsResponse = await fetch('/characterization.json');
      const allAnimals = await animalsResponse.json();

      const scores = getAnimalMatchScores(humanProfile, allAnimals);
      setBestMatches(scores.slice(0, 5)); // Get the top 5 matches
    }

    loadAndCompare();
  }, []);

  return (
    <Box>
      <Typography variant="h5" component="h2" fontWeight="bold">
        Top Animal Matches for {humanProfile.name}
      </Typography>
      <ol>
        {bestMatches.map(animal => (
          <li key={animal.name}>
            <Typography>
              {animal.name} ({animal.type}) - Score: {animal.score}
            </Typography>
          </li>
        ))}
      </ol>
    </Box>
  );
}

export default AnimalMatcher;