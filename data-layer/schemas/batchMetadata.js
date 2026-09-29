export function createBatchMetadata({
  name,
  description,
  image,
  material,
  origin,
  productionDate,
}) {
  return {
    name,
    description,
    image,
    attributes: [
      {
        trait_type: "Material",
        value: material,
      },
      {
        trait_type: "Origin",
        value: origin,
      },
      {
        trait_type: "Production Date",
        value: productionDate,
      },
    ],
  };
}