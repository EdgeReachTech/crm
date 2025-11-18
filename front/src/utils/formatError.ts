// Utility function to format backend enum error messages
export function formatEnumErrorMessage(message: string): string {
  // Match the "Expected 'email' | 'phone' | ..." part
  const expectedRegex = /Expected (.+), received (.+)/;

  const match = message.match(expectedRegex);

  if (!match) return message; // fallback if pattern doesn't match

  let [_, expectedPart, receivedPart] = match;

  // Remove quotes around enum values and replace | with ,
  expectedPart = expectedPart.replace(/'/g, '').replace(/\|/g, ',');

  // Wrap received value in quotes
  receivedPart = receivedPart.replace(/'/g, '').trim();
  receivedPart = `"${receivedPart}"`;

  return `Invalid enum value. Expected ${expectedPart}, received ${receivedPart}`;
}
