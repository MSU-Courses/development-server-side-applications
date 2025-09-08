import { configDotenv } from "dotenv";

// load env variables
configDotenv();

function required(name, def) {
    const value = process.env[name] ?? def;
    if (value === undefined || value === '') {
        throw new Error(`[ENV] Missing required env variable ${name}`);
    }
    return value;
}

function optional(name, def = '') {
  const value = process.env[name] ?? def;
  return value === '' ? def : value;
}

const CONFIG = {
  app: {
    name: optional('APP_NAME', 'MyApp'),
    port: required('PORT'),
  },
};

export { CONFIG };
