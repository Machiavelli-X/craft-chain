import { processStep } from "./utils/stepProcessor.js";

try {
  await processStep({
    type: "processing",
    description: "",
    location: "Sambalpur, Odisha",
    timestamp: "2026-09-29T10:30:00Z",
  });

  console.log("Unexpected: validation did not fail.");
} catch (error) {
  console.log("\nValidation test:");
  console.log(error.message);
}