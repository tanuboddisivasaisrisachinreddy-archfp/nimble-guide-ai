

# AI Learning & Developer Copilot

A personal AI tutor and coding assistant with a dark, developer-focused interface that helps students and beginner developers learn faster and code more efficiently.

## Design & Theme
- Dark developer theme with code-editor aesthetics (dark backgrounds, monospace fonts for code, syntax highlighting)
- Clean sidebar navigation between features
- Responsive layout for desktop and mobile

## Pages & Features

### 1. Authentication
- Sign up / Login page with email-based auth (via Lovable Cloud)
- User profiles to save chat history, notes, and quiz progress

### 2. Chat-based Q&A (Main Page)
- Conversational AI interface powered by Google Gemini (via Lovable AI gateway)
- Streaming responses rendered token-by-token with markdown support
- Skill-level selector (Beginner / Intermediate / Advanced) to adapt explanation depth
- "Explain Like I'm 10" toggle for ultra-simple explanations
- Chat history saved per user

### 3. Code Analyzer
- Code input area with a code-editor-style textarea
- Language selector (Python, JavaScript, TypeScript, etc.)
- AI analyzes pasted code to:
  - Explain logic line-by-line
  - Detect errors and suggest fixes
  - Offer best practices and improvements
- Results displayed with syntax highlighting

### 4. Quiz & Flashcard Generator
- Input a topic or paste notes to generate practice questions
- Multiple choice and short answer quiz formats
- Flashcard mode with flip-to-reveal interaction
- Track quiz scores and progress over time

### 5. Notes Summarizer
- Paste notes or text content
- AI generates structured summaries with:
  - Key points / bullet highlights
  - Concept breakdowns
  - Suggested further reading topics
- Save summaries to user's library

## Backend (Lovable Cloud)
- Supabase Auth for user accounts
- Database tables for: profiles, chat history, saved summaries, quiz progress
- Edge functions for AI calls (chat, code analysis, quiz generation, summarization) — each with tailored system prompts
- Lovable AI gateway with `google/gemini-3-flash-preview` model

