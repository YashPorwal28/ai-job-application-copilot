# AI Job Application Copilot

A Chrome extension that fills out job application forms using your resume and your own OpenAI API key. Every AI-generated answer is shown for review before it's inserted into the page — nothing is ever auto-submitted.

## How it works

1. Upload your resume (PDF or DOCX) once in the extension's options page. It's parsed into a structured profile (personal info, experience, education, skills, projects, links, work authorization).
2. Visit a job application page. The extension detects form fields on the page and classifies each one (e.g. name, email, years of experience, custom essay question).
3. Fields that map directly to your profile are filled in automatically. Custom/free-text questions are answered using OpenAI, grounded in your resume and the detected job context.
4. Review every suggested answer in the popup before it's written into the form. Nothing is inserted without your confirmation.

## Supported sites

Dedicated adapters for more accurate field detection on:

- Greenhouse
- Lever
- Workday
- LinkedIn

Any other site falls back to a generic adapter that scans the whole page.

## Privacy

- Your resume and profile data are stored locally via `chrome.storage` — not sent to any server the extension controls.
- You bring your own OpenAI API key (stored locally); requests for AI-generated answers go directly from your browser to OpenAI's API.
- No answer is auto-submitted — you approve each field before it's filled.

## Tech stack

React, TypeScript, Vite, Tailwind CSS, `@crxjs/vite-plugin` (Chrome MV3), Zod for schema validation, `pdfjs-dist` / `mammoth` for resume parsing.

## Development

```bash
npm install
npm run dev       # start Vite in watch mode
npm run build     # type-check and build to dist/
npm run typecheck # type-check only
```

To load the extension in Chrome:

1. Run `npm run build`.
2. Go to `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` folder.
4. Open the extension's options page and add your OpenAI API key and resume.

## Project structure

```
src/
  background/       Service worker
  content/           Page scanning, field classification, form filling, site adapters
  options/           Settings & profile editor UI
  popup/             Review UI shown while filling a form
  services/
    ai/              OpenAI provider and prompts
    resume/          PDF/DOCX resume parsing
    storage/         chrome.storage wrappers (profile, settings, cache)
    profile/         Mapping profile data to form fields
  shared/            Shared schemas, types, constants, messaging
```
