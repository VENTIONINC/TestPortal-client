export const getUserIdFromToken = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.userId;
  } catch {
    return null;
  }
};
