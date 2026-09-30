import { getJSON } from "./utils/ipfs.js";
import { hashStepMetadata } from "./utils/hashing.js";

const cid =
  "bafkreievpn4l76ioglewzpi7vqxyqo6zp5hsrpfhkq3ir23fjzgrbg5pre";

const originalHash =
  "0xd1f3731c90ca850c591a8b2643f3f468a71fdf1d824c1e399b654f0881a73faf";

// Retrieve original data
const metadata = await getJSON(cid);

console.log("\nOriginal metadata:");
console.log(metadata);

// Simulate tampering
metadata.description = "Cotton processed and modified";

console.log("\nModified metadata:");
console.log(metadata);

// Calculate hash of modified data
const { hash: modifiedHash } = hashStepMetadata(metadata);

console.log("\nOriginal hash:");
console.log(originalHash);

console.log("\nModified hash:");
console.log(modifiedHash);

console.log(
  "\nStatus:",
  modifiedHash.toLowerCase() === originalHash.toLowerCase()
    ? "VERIFIED"
    : "TAMPERED"
);