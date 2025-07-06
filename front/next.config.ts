import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";
import { existsSync } from "fs";
import { join } from "path";

// Load environment variables when running within the "front" directory.
// If a .env file exists in the project root (one level up), load it so that
// Firebase configuration variables are available during build and runtime.
const rootEnv = join(__dirname, "../.env");
if (existsSync(rootEnv)) {
  loadEnv({ path: rootEnv });
}
// Also load .env from this directory if present.
loadEnv();

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
