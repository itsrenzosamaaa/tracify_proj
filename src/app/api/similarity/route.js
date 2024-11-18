import { NextResponse } from 'next/server';

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

    // Compute both similarities
    const cosine = cosineSimilarity(lostItem.item.description, foundItem.item.description);
    const jaccard = jaccardSimilarity(lostItem.item.name, foundItem.item.name);
    const itemSimilarity = calculateItemSimilarity(lostItem.item, foundItem.item);

    let score = 0;

    if (cosine >= 70) {
      score += 25;
    }

    if (jaccard >= 50) {
      score += 25;
    }

    if (itemSimilarity >= 50) {
      score += 50;  // Adjust the weight for item similarity as needed
    }

    // Return both similarities in the response
    return NextResponse.json(score);

  } catch (error) {
    // Handle unexpected errors
    console.error('Error in similarity calculation:', error);
    return NextResponse.json(
      { error: "An error occurred while calculating similarities." },
      { status: 500 }
    );
  }
}

// Jaccard similarity function
const jaccardSimilarity = (itemName1, itemName2) => {
  const set1 = tokenize(itemName1);
  const set2 = tokenize(itemName2);

  // Intersection and union of the two sets
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  // Jaccard similarity is the size of the intersection divided by the size of the union
  return (intersection.size / union.size) * 100;
};

// Cosine similarity function
const cosineSimilarity = (text1, text2) => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  // Get word frequencies for both texts
  const freqMap1 = getWordFrequency(words1);
  const freqMap2 = getWordFrequency(words2);

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
  const totalWeight = 6; // Number of features

  const featureWeights = {
    color: 1,
    size: 0.8,
    material: 1,
    condition: 0.5,
    category: 1,
    distinctiveMarks: 0.8
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

  // Normalize the score to 0-100
  const finalScore = (totalScore / totalWeight) * 100;
  return finalScore;
};
