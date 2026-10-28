import {
  processStep,
  processBatch,
} from "./index.js";

const step = await processStep({
  type: "processing",
  description: "Cotton processed",
  location: "Sambalpur, Odisha",
  timestamp: "2026-09-29T10:30:00Z",
});

console.log("\nStep result:");
console.log(step);

const batch = await processBatch({
  name: "Handwoven Cotton Saree",
  description: "Traditional handwoven cotton saree",
  image: "https://example.com/saree.jpg",
  material: "Cotton",
  origin: "Sambalpur, Odisha",
  productionDate: "2026-09-29",
});

console.log("\nBatch result:");
console.log(batch);