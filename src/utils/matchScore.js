export const calculateMatchScore = (lostItem, foundItem, answers = []) => {
  let score = 0;

  // Helper for string equality
  const matchString = (a, b) =>
    a?.toLowerCase().trim() === b?.toLowerCase().trim();

  // Item Name (simple fuzzy check)
  if (lostItem.name && foundItem.name) {
    const lostName = lostItem.name.toLowerCase().trim();
    const foundName = foundItem.name.toLowerCase().trim();

    // Calculate similarity using a basic substring match
    const matchRatio =
      lostName.length && foundName.length
        ? Math.min(
            lostName.split(" ").filter((word) => foundName.includes(word))
              .length / lostName.split(" ").length,
            1
          )
        : 0;

    if (matchRatio > 0) {
      score += matchRatio * 20; // Scale score based on match ratio
    }
  }
  // Enhanced Size Matching with Unit Consideration and Tolerance
  if (lostItem.size && foundItem.size) {
    const lostSizeValue = parseFloat(lostItem.size.value);
    const foundSizeValue = parseFloat(foundItem.size.value);

    if (!isNaN(lostSizeValue) && !isNaN(foundSizeValue)) {
      const sizeDifference = Math.abs(lostSizeValue - foundSizeValue);
      const sizeTolerance = 0.1 * lostSizeValue; // Allow 10% tolerance

      if (lostItem.size.unit === foundItem.size.unit) {
        if (sizeDifference <= sizeTolerance) {
          score += 10; // Full score for close size match
        } else if (sizeDifference <= 2 * sizeTolerance) {
          score += 5; // Partial score for moderate size match
        }
      } else {
        // Handle unit conversion if units differ (e.g., cm to inches)
        const unitConversion = {
          cm: 0.393701, // 1 cm = 0.393701 inches
          inches: 2.54, // 1 inch = 2.54 cm
        };

        const convertedLostSize =
          lostItem.size.unit === "cm" && foundItem.size.unit === "inches"
            ? lostSizeValue * unitConversion.cm
            : lostItem.size.unit === "inches" && foundItem.size.unit === "cm"
            ? lostSizeValue * unitConversion.inches
            : null;

        if (convertedLostSize !== null) {
          const convertedDifference = Math.abs(
            convertedLostSize - foundSizeValue
          );
          if (convertedDifference <= sizeTolerance) {
            score += 10; // Full score for close size match after conversion
          } else if (convertedDifference <= 2 * sizeTolerance) {
            score += 5; // Partial score for moderate size match after conversion
          }
        }
      }
    }
  }

  // Color (check overlap)
  const commonColors = lostItem.color?.filter((color) =>
    foundItem.color?.includes(color)
  );
  if (commonColors?.length) {
    score += (commonColors.length / lostItem.color.length) * 15;
  }

  // Category
  if (matchString(lostItem.category, foundItem.category)) score += 10;

  // Material
  if (matchString(lostItem.material, foundItem.material)) score += 10;

  // Condition
  if (matchString(lostItem.condition, foundItem.condition)) score += 10;

  // Distinctive Marks
  if (matchString(lostItem.distinctiveMarks, foundItem.distinctiveMarks))
    score += 10;

  // Location
  if (lostItem.location && foundItem.location) {
    score += 10;
  } else if (!lostItem.location) {
    score += 5; // Partial score if lost item location is unidentified
  }

  // Bonus: Verify answers (if security Q&A is involved)
  if (Array.isArray(answers) && answers.length > 0) {
    const validAnswers = answers.filter((ans) => ans?.trim()?.length > 0);
    const partialCredit = (validAnswers.length / answers.length) * 5;
    score += partialCredit;
  }

  return Math.min(Math.round(score), 100); // Max score: 100
};
