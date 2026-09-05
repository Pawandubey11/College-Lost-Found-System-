# Permanent 24/7 Free Cloud Hosting Guide

To make your **Smart College Lost & Found System** stay online **24/7 permanently** (even when your laptop is turned off), follow these 3 simple steps on Render (100% Free):

---

## 🚀 3-Step Permanent Deployment (1 Minute)

### Step 1: Open Render New Web Service Page
Click this direct link:
👉 **[https://dashboard.render.com/web/new](https://dashboard.render.com/web/new)**

*(If not logged in, sign in with your GitHub account **Pawandubey11**)*

---

### Step 2: Select Your GitHub Repository
Under **"Connect a repository"**, select:
👉 **`Pawandubey11/College-Lost-Found-System-`**

---

### Step 3: Enter These Quick Settings & Click Deploy

| Setting Field | What to Select / Enter |
| :--- | :--- |
| **Name** | `college-lost-found-system` |
| **Environment / Runtime** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm run seed && npm start` |
| **Instance Type** | **Free** ($0/month) |

#### Advanced (Environment Variables):
Click **Add Environment Variable**:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `super_secret_college_lost_found_jwt_key_2026`

---

### 🎉 Done!

Click **"Create Web Service"**.

Render will generate your permanent, 24/7 public cloud website address:
`https://college-lost-found-system.onrender.com`

This URL will **never turn off** and will remain accessible to students, faculty, and viva examiners worldwide 24 hours a day, 7 days a week!
