# 🌸 Petal — A Calm Storybook LMS for MBA Learning

> *"Every petal holds a quiet insight."*

**Petal** is a private, tranquil personal learning space built for an MBA student with exactly three subjects:
1. **Product Management 2** (`PM-802`) — *Guarded by Faye, the Fairy Builder*
2. **Market Research Methods** (`MR-704`) — *Guarded by Barnaby, the Curious Fox & Scholar*
3. **Microeconomics** (`EC-601`) — *Guarded by Pip, the Friendly Bunny*

---

## 🌿 Visual Direction: "Enchanted Garden"

- **Light Theme Only**: Soft cream and ivory backgrounds (`#FAF7F2`, `#FFFDF9`), pastel accents (blush pink, lavender, mint, butter yellow, sky blue), and deep plum text (`#2D1F38`). **Zero pure black.**
- **Hand-Drawn Storybook Illustrations**: Custom vector SVGs for all three mascots, delicate floating petals, soft clouds, mushrooms, and blooming streak flowers.
- **Micro-Interactions**: Translucent glassmorphism cards (`glass-card`), soft pastel glows, gentle floating animations, and a celebration of falling petals upon mastering a concept. Respects `prefers-reduced-motion`.
- **Minimal, Uncluttered UI**: Maximum of one primary action per view. White space and calm typography (`Fredoka` display + `Nunito` body) ensure sustained focus without cognitive fatigue.

---

## 🏛️ The Three Subject Worlds & Characters

| Subject | Mascot | Color World | Mascot Visual & Narrative Role |
| :--- | :--- | :--- | :--- |
| **Product Management 2** | **Faye** | Lavender (`#EDE9FE`, `#8B5CF6`) | A whimsical fairy with delicate dragonfly wings, a glowing star wand, and a floating architectural blueprint cube. Guides roadmap prioritization, RICE trade-offs, and product-market fit. |
| **Market Research Methods** | **Barnaby** | Mint & Sage (`#DCFCE7`, `#059669`) | A wise fox scholar wearing brass spectacles and tweed coat, inspecting an inquiry sprout with a magnifying glass. Guides construct validity, sampling frames, and survey questions. |
| **Microeconomics** | **Pip** | Butter & Peach (`#FEF3C7`, `#D97706`) | A friendly floppy-eared bunny with a cozy apron, holding a giant honey coin and balancing a wooden equilibrium scale. Demystifies supply-demand shifts, elasticity, and welfare surplus. |

---

## 🚀 Key Features

### 1. Home ("Today's Garden")
- **Warm Greeting**: Time-aware greeting tailored to the student's study session.
- **Today's 3 Petals**: 1 new concept, 1 revision petal (with 20s animation), and 1 quick recall quiz curated dynamically from your uploaded slides.
- **Blooming Streak Flower**: Dynamic botanical flower whose petals open as your daily learning habit builds.
- **3 Big Illustrated Subject Cards**: Featuring Faye, Barnaby, and Pip with soft circular progress rings.

### 2. Universal Document Upload & Grounding Engine
- Drag-and-drop parsing for **PDF**, **PPTX**, **DOCX**, **TXT**, and **MD**.
- Extracts slide-by-slide and section-by-section hierarchies with exact page/slide indices (`from slide 12` citation chips).
- **Strict Grounding Rule**: All AI explanations and quizzes are grounded **strictly in your uploaded course materials**. If a concept isn't in your slides, Petal explicitly informs you and offers an optional labeled "outside the material" mode.

### 3. AI Tutor (The Calm Split View)
- **Left Pane**: Professor's raw material viewer with slide navigation, page jumps, and highlighted citations.
- **Right Pane**: 4 Calm AI Tutor Tabs:
  1. **Explain**: Friendly storybook intuition with bold key terms, whimsical analogies, plus a **"Go Deeper"** toggle for exam-level precision.
  2. **Examples**: Real-world cases including Indian startups (e.g. Zepto peak pricing, Swiggy UPI checkout, Urban Company ethnography), global product cases (Linear, Spotify, Notion), worked numeric elasticity calculations, and Van Westendorp survey designs.
  3. **Animate**: 20-30 second animated explainers with 4-6 scene storyboards, captions, and text-to-speech voiceover:
     - **Dynamic Curve Shifter**: Animates step-by-step shifts in Demand ($D_1 \to D_2$) and Supply curves, dynamically moving the $(P^*, Q^*)$ equilibrium point.
     - **Distribution & Matrix Animators**: Interactive normal bell curves with confidence intervals and 2x2 Value vs. Effort matrices.
     - Optional **Veo API** upgrade toggle.
  4. **Quiz**: 5 grounded recall questions (MCQs and short answer) with instant gentle feedback. Mastering a quiz blooms a permanent plant in your meadow.
- **Ask Anything**: Grounded chat box restricted to the lesson's uploaded slides with honest out-of-syllabus detection.

### 4. Living Meadow (Progress Garden)
- A serene botanical meadow where every mastered concept blooms into an interactive flower (Lavender Orchids for PM2, Mint Clovers for MRM, Golden Sunflowers for Microeconomics).
- Click any flower to view its mastery date and curriculum details.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Canvas Confetti.
- **Backend Proxy**: Express.js server (`server/server.js`) with `pdf-parse`, `mammoth` (DOCX), and `adm-zip` (PPTX XML text extraction).
- **Storage**: IndexedDB (`idb-keyval`) — 100% private, local to your browser.
- **Voiceover**: Browser Web Speech API (`speechSynthesis`).
- **LLM Support**: Configurable via `.env` for Google Gemini or Anthropic Claude (with built-in offline grounded fallback).

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy or edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
VEO_API_KEY=your_veo_api_key_here
PORT=3001
```
*(If left empty, Petal operates in offline grounded mode with complete functionality).*

### 3. Run Petal
```bash
npm run dev
```
- Frontend: `http://localhost:5173` (or `http://localhost:5174`)
- Backend: `http://localhost:3001`

### 4. Build for Production
```bash
npm run build
```

---

## 🔒 Privacy Guarantee

All uploaded slide decks, extracted notes, quiz results, and progress flowers are stored locally on your device in browser IndexedDB. No external tracking, no public sharing, and no advertising.
