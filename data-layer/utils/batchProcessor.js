import { createBatchMetadata } from "../schemas/batchMetadata.js";
import { uploadJSON } from "./ipfs.js";
import { validateRequiredFields } from "./validation.js";

export async function processBatch({
  name,
  description,
  image,
  material,
  origin,
  productionDate,
}) {
  validateRequiredFields(
    {
      name,
      description,
      image,
      material,
      origin,
      productionDate,
    },
    [
      "name",
      "description",
      "image",
      "material",
      "origin",
      "productionDate",
    ]
  );

  const batchMetadata = createBatchMetadata({
    name,
    description,
    image,
    material,
    origin,
    productionDate,
  });

  const uploadResult = await uploadJSON(
    batchMetadata,
    `batch-${Date.now()}.json`
  );

  return {
    metadata: batchMetadata,
    cid: uploadResult.cid,
    uri: uploadResult.uri,
  };
}