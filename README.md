# BuildMate — Frontend

The BuildMate frontend provides a clean, user-friendly interface for discovering collaborators, understanding AI-driven match recommendations, and managing projects from idea to execution. The UI emphasizes clarity, transparency, and usability — surfacing match reasoning so users can trust and act on AI recommendations.

---

[![Demo](https://img.shields.io/badge/demo-local-lightgrey)]() [![License](https://img.shields.io/badge/license-MIT-blue)]()

## Table of contents
- [Overview](#overview)
- [Features](#features)
- [AI transparency](#ai-transparency)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [UX & design notes](#ux--design-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
BuildMate is a lightweight collaboration platform UI focused on helping early-stage teams and contributors find one another and work together efficiently. The frontend surfaces AI match scores, explanations, and actionable project management tools while keeping interactions simple and approachable.

## Features
- User onboarding flows for Idea Owners and Contributors
- AI-powered match results with human-readable reasoning
- Match score visualization and skill overlap highlights
- Project dashboards with milestones and progress indicators
- Kanban-style task boards and task assignments
- Feedback collection on match quality and AI suggestions

## AI transparency
To build trust and clarity, the UI exposes:
- Match scores and confidence indicators
- AI-generated explanations for why a match was suggested
- Skill overlap and missing-skill highlights
- Allowance for users to provide feedback (improve model/scores)

## Tech stack
- Framework: React (Vite / CRA)
- Language: JavaScript / TypeScript (adjust to your codebase)
- Styling: Tailwind CSS
- HTTP: Axios
- Routing: React Router
- Icons: Lucide / Heroicons

## Project structure
frontend/
├── src/
│   ├── components/        # Reusable UI components (cards, charts, forms)
│   ├── pages/             # Page-level views (onboarding, dashboard)
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API clients (services/api.js)
│   ├── layouts/           # App-level layouts
│   └── App.jsx            # Root app entry
├── public/
├── .env
└── README.md

(Adjust file names & paths to match your repository.)

## Environment variables
Create a `.env` file (Vite-prefixed variable example):
VITE_API_BASE_URL=http://localhost:5000/api

Add a `.env.example` (without secrets) for contributors.

## Running locally
1. Install dependencies:
   npm install

2. Start the development server:
   npm run dev

3. Open the app:
   http://localhost:5173

## UX & design notes
- Clarity over clutter: show ranked, relevant results and concise reasoning.
- Human-in-the-loop: always surface an easy way for users to accept, reject, or comment on AI suggestions.
- Lightweight PM: Kanban boards and simple milestone tracking aimed at small teams and community projects.

## Contributing
- Open an issue to discuss features or bugs.
- Fork the repo and create a feature branch.
- Keep PRs focused and include screenshots where UI changes are involved.
- Update `.env.example` and docs when adding new config.

---
