import { getJSON } from "./ipfs.js";
import { hashStepMetadata } from "./hashing.js";

export async function verifyStep(cid, expectedHash) {
  // Retrieve the original step metadata from IPFS
  const metadata = await getJSON(cid);

  // Calculate the hash of the retrieved data
  const { hash: calculatedHash } = hashStepMetadata(metadata);

  // Compare hashes
  const verified =
    calculatedHash.toLowerCase() === expectedHash.toLowerCase();

  return {
    verified,
    metadata,
    calculatedHash,
    expectedHash,
  };
}