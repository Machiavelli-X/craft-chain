import { keccak256, toUtf8Bytes } from "ethers";

export function canonicalizeJSON(data) {
  return JSON.stringify(data);
}

export function hashStepMetadata(stepMetadata) {
  const canonicalJSON = canonicalizeJSON(stepMetadata);

  const hash = keccak256(
    toUtf8Bytes(canonicalJSON)
  );

  return {
    canonicalJSON,
    hash,
  };
}