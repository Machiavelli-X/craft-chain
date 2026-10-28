import { processStep } from "./utils/stepProcessor.js";

const result = await processStep({
  type: "processing",
  description: "Cotton processed",
  location: "Sambalpur, Odisha",
  timestamp: "2026-09-29T10:30:00Z",
});

console.log("\nStep metadata:");
console.log(result.metadata);

console.log("\nCanonical JSON:");
console.log(result.canonicalJSON);

console.log("\nIPFS CID:");
console.log(result.cid);

console.log("\nIPFS URI:");
console.log(result.uri);

console.log("\nKeccak256 hash:");
console.log(result.hash);