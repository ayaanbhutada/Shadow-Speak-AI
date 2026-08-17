<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/36db0991-fb08-437b-a7ef-2f74ee1276ae

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set your API keys and optional model defaults in [.env.local](.env.local), for example:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (default: `gemini-3.6-flash`)
   - `GROQ_API_KEY`
   - `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
3. Run the app:
   `npm run dev`
