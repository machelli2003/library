/**
 * Marshmallow validation errors come back as:
 * { message: "Validation failed", errors: { email: ["Not a valid email address."], ... } }
 * This flattens that into a single field -> first message map for easy lookup.
 */
export function getFieldErrors(err) {
  const data = err.response?.data;
  if (!data?.errors) return {};
  const flat = {};
  for (const [field, messages] of Object.entries(data.errors)) {
    flat[field] = Array.isArray(messages) ? messages[0] : messages;
  }
  return flat;
}

export function getGeneralError(err) {
  return err.response?.data?.message || "Something went wrong. Please try again.";
}
