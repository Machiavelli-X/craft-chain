import { processBatch } from "./utils/batchProcessor.js";

const result = await processBatch({
  name: "Handwoven Cotton Saree",
  description: "Traditional handwoven cotton saree",
  image: "https://example.com/saree.jpg",
  material: "Cotton",
  origin: "Sambalpur, Odisha",
  productionDate: "2026-09-29",
});

console.log("\nBatch metadata:");
console.log(result.metadata);

console.log("\nIPFS CID:");
console.log(result.cid);

console.log("\nIPFS URI:");
console.log(result.uri);