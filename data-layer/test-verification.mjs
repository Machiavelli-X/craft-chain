import { verifyStep } from "./utils/verification.js";

const cid =
  "bafkreievpn4l76ioglewzpi7vqxyqo6zp5hsrpfhkq3ir23fjzgrbg5pre";

const expectedHash =
  "0xd1f3731c90ca850c591a8b2643f3f468a71fdf1d824c1e399b654f0881a73faf";

const result = await verifyStep(cid, expectedHash);

console.log("\nVerification result:");
console.log(result);

console.log(
  `\nStatus: ${result.verified ? "VERIFIED" : "TAMPERED"}`
);