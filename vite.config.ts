import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = "Portfolio_Website_2026";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? `/${repositoryName}/` : "/",
  plugins: [react()],
});
