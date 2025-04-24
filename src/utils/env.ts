const getEnvironmentVariable = (key: string, defaultVal?: string): string => {
  const value = process.env[key] || defaultVal;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is undefined`);
  }
  return value;
};

export const DB_URI = getEnvironmentVariable("DB_URI");
export const JWT_SECRET = getEnvironmentVariable("JWT_SECRET");
export const PORT = getEnvironmentVariable("PORT");
export const NODE_ENV = getEnvironmentVariable("NODE_ENV", "development");
export const CLIENT_URL = getEnvironmentVariable(
  "CLIENT_URL",
  "http://localhost:3000"
);
export const EMAIL_HOST = getEnvironmentVariable("EMAIL_HOST");
export const EMAIL_PORT = getEnvironmentVariable("EMAIL_PORT", "587");
export const EMAIL_USER = getEnvironmentVariable("EMAIL_USER");
export const EMAIL_PASS = getEnvironmentVariable("EMAIL_PASS");

// export const FB_APIKEY = getEnvironmentVariable("FB_APIKEY");
// export const FB_AUTH_DOMAIN = getEnvironmentVariable("FB_AUTH_DOMAIN");
// export const FB_PROJECTID = getEnvironmentVariable("FB_PROJECTID");
// export const FB_STORAGE_BUCKET = getEnvironmentVariable("FB_STORAGE_BUCKET");
// export const FB_MESSAGING_SENDERID = getEnvironmentVariable(
//   "FB_MESSAGING_SENDERID"
// );
// export const FB_APPID = getEnvironmentVariable("FB_APPID");
// export const FB_MEASUREMENTID = getEnvironmentVariable("FB_MEASUREMENTID");
