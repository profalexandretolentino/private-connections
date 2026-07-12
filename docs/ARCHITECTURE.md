# Private Connections Architecture

Version: 0.3.0

---

## Overview

Private Connections is composed of two independent layers:

- Frontend (GitHub Pages)
- Backend (Google Apps Script)

The frontend is responsible for the user experience.

The backend manages storage, notifications and analytics.

---

## High Level Architecture

```mermaid
flowchart TD

A[User]

A --> B[Frontend<br/>GitHub Pages]

B --> C[Google Apps Script]

C --> D[ConnectionService]

D --> E[SheetService]
D --> F[DriveService]
D --> G[EmailService]
D --> H[TelegramService]
D --> I[Utils]
D --> J[Config]

E --> K[(Google Sheets)]

F --> L[(Google Drive)]

G --> M[Gmail]

H --> N[Telegram Bot]
```

---

## Request Flow

```mermaid
sequenceDiagram

participant U as User
participant F as Frontend
participant B as Backend
participant D as Drive
participant S as Sheets
participant G as Gmail
participant T as Telegram

U->>F: Click CONNECT

F->>B: POST /connect

B->>D: Save attachment

B->>S: Save connection

B->>G: Send email

B->>T: Send Telegram

B-->>F: JSON Response

F->>U: Update Dashboard
```

---

## Backend Modules

| Module | Responsibility |
|---------|----------------|
| Code | HTTP Entry Point |
| Config | Environment Configuration |
| ConnectionService | Business Logic |
| SheetService | Google Sheets |
| DriveService | Google Drive |
| EmailService | Gmail |
| TelegramService | Telegram Bot |
| Utils | Shared Functions |

---

## Frontend Modules

| Module | Responsibility |
|---------|----------------|
| app.js | Application Controller |
| api.js | Backend Communication |
| ui.js | Screen Rendering |
| upload.js | File Processing |
| tracking.js | Analytics |
| utils.js | Helper Functions |
| config.js | Frontend Configuration |

---

## Environments

### Development

- Live Server
- Development Backend
- Development Database

### Production

- GitHub Pages
- Production Backend
- Production Database

---

## Current Version

Current Architecture

```
Frontend
      │
      ▼
Google Apps Script
      │
      ▼
ConnectionService
├── Drive
├── Sheet
├── Email
├── Telegram
└── Utils
```