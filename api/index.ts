// Vercel serverless functions do not bundle the root TypeScript server file.
// Import the built Node server instead so the runtime can resolve it.
import app from "../dist/server.cjs";

export default app;
