import { NextResponse } from 'next/server';
import levenshtein from 'js-levenshtein';
import keyword_extractor from 'keyword-extractor';

// Tokenizer function for splitting and converting to lowercase
const tokenize = (text) => {
  return new Set(text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)); // Removing punctuation and tokenizing
};

// API handler for POST requests
export async function POST(request) {
  try {
    // Parse the incoming JSON request body
    const { lostItem, foundItem } = await request.json();

    // Ensure all required fields are provided
    if (!lostItem || !foundItem) {
      return NextResponse.json(
        { error: "All fields (lostDescription, foundDescription, lostName, foundName) are required." },
        { status: 400 }
      );
    }

    const lostKeywords = extractKeywords(lostItem.item.description);
    const foundKeywords = extractKeywords(foundItem.item.description);

    // Compute both similarities
    const cosine = cosineSimilarity(lostKeywords, foundKeywords);
    const jaccard = jaccardSimilarity(lostItem.item.name, foundItem.item.name);
    const itemSimilarity = calculateItemSimilarity(lostItem.item, foundItem.item);

    const finalScore = (cosine * 0.3) + (jaccard * 0.3) + (itemSimilarity * 0.4);

    // Return both similarities in the response
    return NextResponse.json(finalScore);
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in similarity calculation:', error);
    return NextResponse.json(
      { error: "An error occurred while calculating similarities." },
      { status: 500 }
    );
  }
}

const extractKeywords = (text) => {
  const options = {
    language: "english",
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: true,
  };

  return keyword_extractor.extract(text, options);
};

// Jaccard similarity function
const jaccardSimilarity = (text1, text2) => {
  let set1 = Array.from(tokenize(text1)); // Tokenize text1
  const set2 = Array.from(tokenize(text2)); // Tokenize text2

  const matchedWords = new Set();
  const maxDistance = 2; // Threshold for fuzzy matching with Levenshtein

  // Match words using exact or fuzzy matching
  set1 = set1.map(word1 => {
    if (matchedWords.size >= 2) return word1;

    let closestMatch = word1; // Default to the original word if no match is found
    let minDistance = Infinity;

    for (const word2 of set2) {
      if (matchedWords.size >= 2) break;
      const distance = levenshtein(word1, word2); // Compute Levenshtein distance
      if (word1 === word2 || distance <= maxDistance) {
        if (distance < minDistance) {
          closestMatch = word2; // Replace typo with the closest matching word
          minDistance = distance;
        }
      }
    }

    // Add the matched word to the set of matched words
    if (closestMatch !== word1) {
      matchedWords.add(closestMatch); // A typo was corrected
    } else if (set2.includes(word1)) {
      matchedWords.add(word1); // Exact match
    }

    return closestMatch; // Replace the word in set1 with the corrected word
  });


  // Determine the denominator
  const isSingleWordCase = set1.length === 1 && set2.length === 1;
  const denominator = isSingleWordCase ? new Set([...set1, ...set2]).size : 2;

  // Compute similarity
  const similarity = (matchedWords.size / denominator) * 100;

  return similarity;
};

// Cosine similarity function
const cosineSimilarity = (keywords1, keywords2) => {
  const freqMap1 = getWordFrequency(keywords1);
  const freqMap2 = getWordFrequency(keywords2);

  // Get the set of unique words from both texts
  const allWords = new Set([...Object.keys(freqMap1), ...Object.keys(freqMap2)]);

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  // Compute dot product and magnitudes
  allWords.forEach(word => {
    const count1 = freqMap1[word] || 0;
    const count2 = freqMap2[word] || 0;

    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });

  // Calculate the cosine similarity, ensuring that division by zero is handled
  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return magnitude === 0 ? 0 : (dotProduct / magnitude) * 100;  // Returning percentage
};

// Helper function to calculate word frequencies
const getWordFrequency = (words) => {
  return words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
};

// Item similarity calculation with additional penalty for missing features
const calculateItemSimilarity = (lostItem, foundItem) => {
  let totalScore = 0;

  const featureWeights = {
    color: 20,
    size: 10,
    material: 20,
    condition: 15,
    category: 15,
    distinctiveMarks: 20
  };

  // Check for missing features and adjust the score accordingly
  const compareFeatures = (feature, weight) => {
    if (lostItem[feature] && foundItem[feature]) {
      if (lostItem[feature] === foundItem[feature]) {
        totalScore += weight;
      }
    }
  };

  // Compare each feature using the compareFeatures function
  compareFeatures("color", featureWeights.color);
  compareFeatures("size", featureWeights.size);
  compareFeatures("material", featureWeights.material);
  compareFeatures("condition", featureWeights.condition);
  compareFeatures("category", featureWeights.category);
  compareFeatures("distinctiveMarks", featureWeights.distinctiveMarks);

  return totalScore;
};
