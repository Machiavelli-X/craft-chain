import { createStepMetadata } from "../schemas/stepMetadata.js";
import { uploadJSON } from "./ipfs.js";
import { hashStepMetadata } from "./hashing.js";
import { validateRequiredFields } from "./validation.js";

export async function processStep({
  type,
  description,
  location,
  timestamp,
}) {
  validateRequiredFields(
    {
      type,
      description,
      location,
      timestamp,
    },
    [
      "type",
      "description",
      "location",
      "timestamp",
    ]
  );

  const stepMetadata = createStepMetadata({
    type,
    description,
    location,
    timestamp,
  });

  const uploadResult = await uploadJSON(
    stepMetadata,
    `step-${Date.now()}.json`
  );

  const hashResult = hashStepMetadata(stepMetadata);

  return {
    metadata: stepMetadata,
    canonicalJSON: hashResult.canonicalJSON,
    cid: uploadResult.cid,
    uri: uploadResult.uri,
    hash: hashResult.hash,
  };
}