import { createStepMetadata } from "./schemas/stepMetadata.js";
import { hashStepMetadata } from "./utils/hashing.js";

const step = createStepMetadata({
  type: "processing",
  description: "Cotton processed",
  location: "Sambalpur, Odisha",
  timestamp: "2026-09-29T10:30:00Z",
});

const result = hashStepMetadata(step);

console.log("Step metadata:");
console.log(step);

console.log("\nCanonical JSON:");
console.log(result.canonicalJSON);

console.log("\nKeccak256 hash:");
console.log(result.hash);