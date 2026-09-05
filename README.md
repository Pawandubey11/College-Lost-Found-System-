# Smart College Lost & Found System

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React_19_--_TypeScript-blue)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_--_Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite_WAL_Mode-003B57)](https://www.sqlite.org/)

A centralized, role-based, and privacy-preserving item recovery web application engineered for higher education institutions.

---

## 📌 Project Overview

In university campuses, students and staff frequently lose essential personal belongings—such as identity cards, wallets, mobile phones, headphones, laptops, keys, and water bottles. Traditional informal mechanisms (WhatsApp chat feeds, social media posts, physical flyers on bulletin boards) lead to rapid message decay, lack searchability, expose sensitive personal contact information, and lack administrative governance.

The **Smart College Lost & Found System** solves these challenges by providing:
1. **Centralized Multi-Filter Search**: Instant search by category, campus zone, building, date, color, and status.
2. **Dual Reporting Workflow**: Structured Lost and Found notice submission.
3. **Privacy-Preserving Verification**: Sensitive details (such as cash amounts or key ring inscriptions) are masked from public view and used exclusively during ownership verification claims.
4. **Rule-Based Match Engine**: Similarity scoring algorithm ($\ge 45\%$ confidence) that automatically matches lost and found entries and alerts both users.
5. **Institutional Admin Console**: Comprehensive dashboard for report moderation, user role assignment, claim arbitration, and audit compliance logging.

---

## 🔗 Live Links & Credentials

- **Live Shareable URL**: [https://2ba51b0605a4f5.lhr.life](https://2ba51b0605a4f5.lhr.life)
- **GitHub Repository**: [https://github.com/Pawandubey11/College-Lost-Found-System-](https://github.com/Pawandubey11/College-Lost-Found-System-)

### Demo Test Credentials for Viva & Grading

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Institutional Admin** | `admin@college.edu` | `Admin@123` | Full access to user roles, report moderation, claim arbitration, & audit logs |
| **Student (Alex Rivera)** | `alex.student@college.edu` | `Student@123` | Submit reports, file claims, view suggested matches |
| **Student (Priya Sharma)**| `priya.student@college.edu` | `Student@123` | Submit reports, file claims, view suggested matches |
| **Faculty / Staff** | `rahul.staff@college.edu` | `Student@123` | Faculty badge status reporting |

---

## 🌐 UN Sustainable Development Goals (SDG) Alignment

- **SDG 4: Quality Education** — Minimizes educational disruption by facilitating the rapid recovery of academic tools (laptops, lab manuals, IDs, calculators).
- **SDG 16: Peace, Justice & Strong Institutions** — Enhances institutional integrity, accountability, and fraud prevention through audited item returns.

---

## 🎓 Course Outcome (CO) & Program Outcome (PO) Attainment

### Course Outcomes
- **CO 1**: Formulate system requirements and design a normalized relational database schema for campus recovery operations.
- **CO 2**: Develop a full-stack web interface featuring Role-Based Access Control (RBAC) and client-server validation.
- **CO 3**: Implement a rule-based similarity scoring algorithm to detect potential matches between lost and found reports.
- **CO 4**: Conduct software integration testing, security vulnerability mitigation, and project documentation.

### CO–PO Attainment Matrix

| Course Outcome | PO1 (Engg Knowledge) | PO2 (Problem Analysis) | PO3 (Design/Dev) | PO4 (Investigations) | PO5 (Modern Tools) | PO8 (Ethics & Privacy) | PO12 (Life-long Learning) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CO 1** | 3 | 3 | 2 | 2 | 2 | 1 | 2 |
| **CO 2** | 3 | 2 | 3 | 2 | 3 | 3 | 2 |
| **CO 3** | 3 | 3 | 3 | 3 | 2 | 1 | 2 |
| **CO 4** | 2 | 2 | 2 | 2 | 3 | 3 | 2 |

---

## 🧮 Rule-Based Similarity Scoring Formulation

The similarity engine computes a match confidence score $S \in [0, 100]$:

$$S = S_{\text{Category}} + S_{\text{Location}} + S_{\text{Date}} + S_{\text{Color}} + S_{\text{Brand}} + S_{\text{Keywords}}$$

Where:
- $S_{\text{Category}} = 30$ points if $\text{Category}_{\text{Lost}} = \text{Category}_{\text{Found}}$
- $S_{\text{Location}} = 25$ points (same building) or $15$ points (same campus zone)
- $S_{\text{Date}} = 20$ points ($\Delta t = 0$), $15$ points ($\Delta t \le 3$), $10$ points ($\Delta t \le 7$)
- $S_{\text{Color}} = 10$ points if $\text{Color}_{\text{Lost}} = \text{Color}_{\text{Found}}$
- $S_{\text{Brand}} = 10$ points if $\text{Brand}_{\text{Lost}} = \text{Brand}_{\text{Found}}$
- $S_{\text{Keywords}} = \min(15, 5 \times |T_{\text{Lost}} \cap T_{\text{Found}}|)$

Score $S \ge 45\%$ automatically logs a record in the `matches` table and triggers in-app notification alerts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React Icons, React Router DOM v7.
- **Backend**: Node.js, Express, TypeScript, Zod input validation, Bcrypt password hashing, JWT session cookies.
- **Database**: SQLite via `better-sqlite3` (WAL journal mode, foreign key constraints enabled).
- **Storage**: Server-side local upload folder with MIME validation and 5MB size caps.

---

## 📡 REST API Architecture

| HTTP Method | Endpoint Signature | Access Level | Function |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & set JWT session |
| `GET` | `/api/master/categories` | Public | List item categories |
| `GET` | `/api/master/locations` | Public | List campus locations |
| `GET` | `/api/items` | Public | Search & multi-filter items |
| `GET` | `/api/items/:id` | Public / Protected | Get item details (masks hidden details) |
| `POST` | `/api/items/report` | Authenticated | Create Lost/Found item notice |
| `POST` | `/api/claims/item/:itemId` | Authenticated | Submit ownership claim proof |
| `GET` | `/api/notifications` | Authenticated | Fetch in-app user notifications |
| `GET` | `/api/admin/stats` | Admin Only | Administrative metrics overview |
| `GET` | `/api/admin/users` | Admin Only | User management table |
| `PUT` | `/api/admin/users/:id/role` | Admin Only | Update user role (`student`/`staff`/`admin`) |
| `GET` | `/api/admin/audit` | Admin Only | Fetch system audit log entries |

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Steps

1. **Clone Repository**:
   ```bash
   git clone https://github.com/Pawandubey11/College-Lost-Found-System-.git
   cd College-Lost-Found-System-
   ```

2. **Install All Dependencies**:
   ```bash
   npm run postinstall
   ```

3. **Build Application & Seed Database**:
   ```bash
   npm run build
   npm run seed
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```
   Open `http://localhost:5000` in your web browser.

---

## 📂 Project Repository Structure

```
College-Lost-Found-System-/
├── client/                     # React + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Footer, ItemCard, ClaimModal
│   │   ├── context/           # AuthContext provider
│   │   ├── pages/             # LandingPage, BrowseItemsPage, ItemDetailPage, etc.
│   │   ├── services/          # API client service layer
│   │   └── App.tsx            # Main router & auth guards
│   ├── index.html
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/       # Auth, Item, Claim, Admin, Notification controllers
│   │   ├── db/                # SQLite database setup & seed script
│   │   ├── middleware/        # Auth RBAC & Multer upload middleware
│   │   ├── routes/            # REST API router endpoints
│   │   └── services/          # Rule-based similarity match engine
│   └── index.ts               # Server entry point
├── ACADEMIC_DOCUMENTATION.md   # Comprehensive academic documentation
├── OFFICIAL_PROJECT_REPORT.md  # Formal project report & certificate for viva
├── render.yaml                 # Render cloud deployment configuration
└── package.json                # Root build & start scripts
```

---

## 📄 License & Authors

- **Author**: Pawan Dubey
- **Institution**: Department of Computer Science & Engineering
- **License**: MIT License
