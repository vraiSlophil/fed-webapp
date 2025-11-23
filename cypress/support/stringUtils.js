// Utilitaires de chaînes pour les tests Cypress

export const generateRandomString = (length = 8) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const buildUniqueThemeName = (prefix = "Theme") => {
  return `${prefix}-${generateRandomString(8)}`;
};

