const fs = require("fs");
const path = require('path');

// Load JSON file
let data = JSON.parse(fs.readFileSync(path.join(__dirname,'HTML5Ques.json'), 'utf8'));

console.log('Lengeth:',data.length);

//Group by topic
// const grouped = {};
// data.forEach(q => {
//   if (!grouped[q.topic]) grouped[q.topic] = [];
//   grouped[q.topic].push(q);
// });
 
// // Validation results
// for (const topic in grouped) {
//   const questions = grouped[topic];

//   // 1. Count total
//   const total = questions.length;

//   const languageName = questions.filter(que => que.languageName);
//   const languageCount = languageName.length;

//   const language = questions.map(que => que.languageName);

//   // 2. Check difficulty distribution
//   const easyCount = questions.filter(q => q.difficulty === "easy").length;
//   const mediumCount = questions.filter(q => q.difficulty === "medium").length;
//   const hardCount = questions.filter(q => q.difficulty === "hard").length;

//   // 3. Check uniqueness of question text
//   const uniqueQuestions = new Set(questions.map(q => q.question));
//   const duplicateCount = total - uniqueQuestions.size;         

//   console.log(`\n📌 Topic: ${topic}\n languageCount: ${languageCount}-${language[0]}`);
//   console.log(`Total: ${total} (Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount})`);
//   console.log(duplicateCount === 0 ? "✅ All questions unique" : `❌ ${duplicateCount} duplicate(s) found`);
//   console.log(easyCount === 12 && mediumCount === 4 && hardCount === 4
//     ? "✅ Difficulty distribution correct"
//     : "❌ Incorrect difficulty distribution");
// }

//----------------------------------------------------------------------
function regroupObjectsAuto(arr, key) {
  // Step 1: group objects by the key
  const groups = {};
  arr.forEach(obj => {
    const k = obj[key];
    if (!groups[k]) groups[k] = [];
    groups[k].push(obj);
  });

  // Step 2: find the maximum group length
  const groupKeys = Object.keys(groups);
  const maxLength = Math.max(...groupKeys.map(k => groups[k].length));

  // Step 3: interleave the objects
  const result = [];
  for (let i = 0; i < maxLength; i++) {
    for (let k of groupKeys) {
      if (groups[k][i]) result.push(groups[k][i]);
    }
  }

  return result;
}
// const result = regroupObjectsAuto(data,"topic");

//----------------------------------------------------------------------
// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// const shuffledData = data.map((q) => ({
//   ...q,
//   options: shuffleArray([...q.options]) // copy before shuffling
// }));
// console.log(shuffledData);

//----------------------------------------------------------------------
function findInvalidDocs(data) {
  // Filter only those where answer.option is not in options
  const invalidDocs = data.filter(doc => !doc.options.includes(doc.answer.option));
  
  return {
    count: invalidDocs.length,
    invalidDocs
  };
}

// const result = findInvalidDocs(data);

// console.log("❌ Total not matched:", result.count);
// console.log("Invalid documents:", result.invalidDocs);


// fs.writeFileSync(path.join(__dirname,'CSSQues.json'), JSON.stringify(shuffledData, null, 2));
