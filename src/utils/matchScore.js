export const calculateMatchScore = (lostItem, foundItem, answers = []) => {
  let score = 0;

  // Helper for string equality
  const matchString = (a, b) =>
    a?.toLowerCase().trim() === b?.toLowerCase().trim();

  // 1) Item Name (simple fuzzy check)
  if (lostItem.name && foundItem.name) {
    const lostWords = lostItem.name.toLowerCase().trim().split(/\s+/);
    const foundName = foundItem.name.toLowerCase().trim();
    const common = lostWords.filter((w) => foundName.includes(w)).length;
    if (common) {
      const ratio = common / lostWords.length;
      score += ratio * 20; // up to 20 points
    }
  }

  // 2) Size (manual vs predefined)
  const parseSize = (sz) => {
    if (!sz || sz === "N/A") return null;
    // Manual: "10 cm", "5 inch", etc.
    const parts = sz.split(" ");
    if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
      return { type: "manual", value: parseFloat(parts[0]), unit: parts[1] };
    }
    // Predefined
    const map = { XS: 1, S: 2, M: 3, L: 4, XL: 5, "2XL": 6 };
    if (map[sz]) {
      return { type: "predefined", value: map[sz] };
    }
    return null;
  };

  const aSize = parseSize(lostItem.size);
  const bSize = parseSize(foundItem.size);

  if (aSize && bSize) {
    // both manual → numeric tolerance
    if (aSize.type === "manual" && bSize.type === "manual") {
      const diff = Math.abs(aSize.value - bSize.value);
      const tol = 0.1 * aSize.value; // 10%
      if (aSize.unit === bSize.unit) {
        if (diff <= tol) score += 10;
        else if (diff <= 2 * tol) score += 5;
      } else {
        // simple cm↔inch conversion
        const conv = { cm: 0.393701, inch: 2.54 };
        let converted = null;
        if (aSize.unit === "cm" && bSize.unit === "inch")
          converted = aSize.value * conv.cm;
        if (aSize.unit === "inch" && bSize.unit === "cm")
          converted = aSize.value * conv.inch;
        if (converted != null) {
          const cdiff = Math.abs(converted - bSize.value);
          if (cdiff <= tol) score += 10;
          else if (cdiff <= 2 * tol) score += 5;
        }
      }
    }
    // both predefined → ordinal difference
    else if (aSize.type === "predefined" && bSize.type === "predefined") {
      const diff = Math.abs(aSize.value - bSize.value);
      if (diff === 0) score += 10;
      else if (diff === 1) score += 5;
    }
    // otherwise (mixed modes) → no size credit
  }

  // 3) Color overlap (up to 15)
  const commonColors =
    lostItem.color?.filter((c) => foundItem.color?.includes(c)) || [];
  if (commonColors.length) {
    score += (commonColors.length / (lostItem.color.length || 1)) * 15;
  }

  // 4) category / material / condition / distinctiveMarks each 10
  if (matchString(lostItem.category, foundItem.category)) score += 10;
  if (matchString(lostItem.material, foundItem.material)) score += 10;
  if (matchString(lostItem.condition, foundItem.condition)) score += 10;
  if (matchString(lostItem.distinctiveMarks, foundItem.distinctiveMarks))
    score += 10;

  // 5) Location: 10 if both have a value, 5 if lostItem location unknown
  if (lostItem.location && foundItem.location) score += 10;
  else if (!lostItem.location) score += 5;

  // 6) Security answers bonus (up to 5)
  if (Array.isArray(answers) && answers.length) {
    const valid = answers.filter((a) => a.trim().length);
    score += (valid.length / answers.length) * 5;
  }

  return Math.min(Math.round(score), 100);
};
