# SmartHelpX - MERN Chatbot

> AI-powered customer support chatbot built with the MERN Stack, Groq
> LLM, secure JWT authentication, persistent conversations,
> document-assisted querying, voice responses, and deployment-ready
> architecture.

![Banner](docs/images/banner.png)

> **Replace all images under `docs/images/` with your screenshots.**

## Live Demo

-   **Frontend (Vercel):** https://chatberry.vercel.app/chat
-   **Backend (Render):** https://chatberry-backend.onrender.com

## Stable Version

-   **Branch:** `main`
-   **Stable Commit:** `0ddc5f28c3180744550e1965b7393513bc706c70`

------------------------------------------------------------------------

# Overview

SmartHelpX is an AI-driven customer support platform developed using the
MERN stack and the Groq LLM API.

It demonstrates:

-   Secure authentication using JWT stored in HTTP-only cookies
-   Multi-conversation chat management
-   Persistent chat history
-   File-assisted AI conversations (.txt, .md, .csv, .json, .docx)
-   Browser-based voice responses
-   Markdown rendering
-   Deployment on Vercel + Render
-   CI/CD-ready architecture

------------------------------------------------------------------------

# Problem Statement

Traditional customer support systems rely on manual responses,
disconnected knowledge sources, and static FAQ systems that struggle
with scalability and contextual understanding.

SmartHelpX provides a secure, AI-powered conversational platform capable
of maintaining conversation history, understanding uploaded documents,
and delivering intelligent responses while remaining ready for modern
CI/CD workflows.

------------------------------------------------------------------------

# Features

-   User Signup/Login/Logout
-   JWT Authentication (HTTP-only Cookies)
-   Password Hashing (bcrypt)
-   Protected Routes
-   Multi Conversation Support
-   Persistent Chat History
-   Groq LLM Integration
-   Markdown Rendering
-   File Upload (.txt, .md, .csv, .json, .docx)
-   Browser Text-to-Speech
-   Responsive Tailwind UI
-   MongoDB Atlas Storage
-   Production-ready Structure

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   Axios
-   React Router
-   React Markdown
-   Remark GFM
-   React Hot Toast
-   Lucide React

## Backend

-   Node.js
-   Express
-   TypeScript
-   MongoDB Atlas
-   Mongoose
-   JWT
-   bcryptjs
-   cookie-parser
-   multer
-   mammoth
-   axios
-   dotenv

## AI

-   Groq API
-   llama-3.1-8b-instant

------------------------------------------------------------------------

# System Architecture

``` text
Browser
   │
React Frontend
   │
Express REST APIs
   │
Auth Middleware
   │
MongoDB
   │
Groq LLM
```

------------------------------------------------------------------------

# Project Structure

``` text
frontend/
 ├── src/
 │   ├── pages/
 │   ├── context/
 │   ├── helpers/
 │   ├── components/
 │   └── App.tsx

backend/
 ├── src/
 │   ├── controllers/
 │   ├── routes/
 │   ├── middleware/
 │   ├── configs/
 │   ├── utils/
 │   ├── models/
 │   └── index.ts
```

------------------------------------------------------------------------

# Authentication Flow

1.  User signs up or logs in.
2.  Backend validates credentials.
3.  Passwords are hashed using bcrypt.
4.  JWT is generated.
5.  JWT is stored in an HTTP-only cookie.
6.  Browser automatically sends the cookie.
7.  Backend verifies JWT for every protected request.
8.  User identity is extracted before processing chat requests.

------------------------------------------------------------------------

# Chat Workflow

``` text
User
 ↓
Frontend
 ↓
Backend API
 ↓
JWT Validation
 ↓
Fetch Conversation
 ↓
Build Prompt
 ↓
Groq API
 ↓
Store Assistant Reply
 ↓
Return Response
```

------------------------------------------------------------------------

# File Upload

Supported:

-   .txt
-   .md
-   .csv
-   .json
-   .docx

Workflow:

1.  Browser uploads file.
2.  Multer stores it in memory.
3.  Text is extracted.
4.  Extracted content is injected into the prompt.
5.  AI answers using both conversation history and file context.

------------------------------------------------------------------------

# Voice Responses

Uses the browser Web Speech API.

Benefits:

-   No external API cost
-   Low latency
-   Accessibility
-   Instant playback

------------------------------------------------------------------------

# Markdown Rendering

AI responses are rendered using:

-   react-markdown
-   remark-gfm

Supports:

-   Code blocks
-   Tables
-   Lists
-   Headings
-   Inline formatting

------------------------------------------------------------------------

# Database Design

``` text
User
 ├── name
 ├── email
 ├── password
 └── conversations
      ├── title
      └── messages
            ├── role
            ├── content
            └── createdAt
```

------------------------------------------------------------------------

# API Endpoints

## Authentication

-   POST /api/user/signup
-   POST /api/user/login
-   GET /api/user/auth-status
-   GET /api/user/logout

## Chat

-   GET /api/chat/conversations
-   POST /api/chat/conversation
-   GET /api/chat/:conversationId
-   POST /api/chat/:conversationId/message
-   DELETE /api/chat/:conversationId

------------------------------------------------------------------------

# Environment Variables

## Backend

``` env
PORT=
MONGO_URL=
JWT_SECRET=
COOKIE_SECRET=
DOMAIN=
GROQ_API_KEY=
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.1-8b-instant
```

## Frontend

``` env
VITE_API_URL=http://localhost:5000/api
```

------------------------------------------------------------------------

# Local Setup

## Backend

``` bash
npm install
npm run dev
```

## Frontend

``` bash
npm install
npm run dev
```

------------------------------------------------------------------------

# Deployment

Frontend: - Vercel

Backend: - Render

Production uses HTTPS, secure cookies, and environment variables.

------------------------------------------------------------------------

# Screenshots

Replace these placeholders.

``` text
docs/images/
 ├── home.png
 ├── login.png
 ├── signup.png
 ├── dashboard.png
 ├── chat.png
 ├── upload.png
 ├── voice.png
 ├── markdown.png
 ├── mobile.png
 └── architecture.png
```

------------------------------------------------------------------------

# Future Roadmap

-   Knowledge Base Automation
-   CI/CD with GitHub Actions
-   Vector Search
-   RAG
-   PDF Support
-   OCR
-   Admin Dashboard
-   Analytics
-   Docker
-   Kubernetes
-   Streaming Responses

------------------------------------------------------------------------

# Contributors

-   **Venu Gopal** (22BCE2829)
-   **Pranat Agarwal** (22BCE0668)

------------------------------------------------------------------------

# License

MIT License

------------------------------------------------------------------------

> SmartHelpX demonstrates secure authentication, modern AI integration,
> scalable MERN architecture, and deployment-ready design for
> intelligent customer support systems.
