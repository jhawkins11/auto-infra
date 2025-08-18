export const mustExist = <T>(
  value: T | undefined,
  message = 'Expected value to be defined',
): T => {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
};
