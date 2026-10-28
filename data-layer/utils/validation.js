export function validateRequiredFields(data, fields) {
  const missingFields = [];

  for (const field of fields) {
    const value = data[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields: ${missingFields.join(", ")}`
    );
  }

  return true;
}