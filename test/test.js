function jaccardSimilarity(v1, v2) {
    const set1 = new Set(v1);
    const set2 = new Set(v2);
    if (set1.size === 0 || set2.size === 0) {
      return 0;
    } else {
      const intersectionSize = set1.intersection(set2).size;
      const unionSize = set1.size + set2.size - intersectionSize;
      return intersectionSize / unionSize;
    }
  }
  
  // 示例向量
  const vector1 = [1, 2, 3];
  const vector2 = [4, 5, 6];
  
  console.log("Jaccard相似度:", jaccardSimilarity(vector1, vector2));