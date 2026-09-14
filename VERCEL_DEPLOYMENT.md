# Vercel Production Deployment Guide
## VIGOR Cement Works · Turkys Group of Companies

This document details the complete deployment procedure for hosting the **VIGOR Smart Port Operations** frontend and API on **Vercel** with connection to the **cPanel MySQL database**.

---

### Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Import Project into Vercel](#step-1-import-project-into-vercel)
4. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
5. [Step 3: Verify Build Settings & Output Directory](#step-3-verify-build-settings--output-directory)
6. [Step 4: Deploy and Verify](#step-4-deploy-and-verify)
7. [Step 5: Custom Corporate Domain Setup](#step-5-custom-corporate-domain-setup)
8. [Health Check & Validation Checklist](#health-check--validation-checklist)

---

### 1. Architecture Overview

* **Edge Delivery**: React 18 + Vite static application served via Vercel Edge Network.
* **Backend Functions**: Node.js Serverless API routes (`/api/v1/*`) proxying business logic, corporate authentication, and database transactions.
* **Routing Configuration**: `vercel.json` maps incoming `/api/*` traffic to `/api/index.ts` and routes all single-page application URLs to `dist/index.html`.
* **Database Connection**: Pool of connections directly to cPanel MySQL instance over TLS.

---

### 2. Prerequisites

1. Access to GitHub repository: `mayra4132/cementvesselsystem` (or your Turkys Group organization fork).
2. A **Vercel** account (Pro or Team recommended for enterprise SLA).
3. Active cPanel MySQL instance configured per `CPANEL_DATABASE_SETUP.md`.
4. Google Gemini API Key (for the Operations Intelligence Assistant).

---

### 3. Step 1: Import Project into Vercel

1. Log in to [https://vercel.com](https://vercel.com).
2. Click **Add New... → Project**.
3. Select the repository: `mayra4132/cementvesselsystem` (or Turkys Group internal repository).
4. Select **Framework Preset**: **Vite**.
5. Set **Root Directory**: `./` (leave default).

---

### 4. Step 2: Configure Environment Variables

Under the **Environment Variables** section in the Vercel import dashboard, add the following key-value pairs for **Production**, **Preview**, and **Development**:

| Variable Name | Example Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `cpanel.turkysgroup.co.tz` | Hostname / IP of cPanel MySQL server |
| `DB_PORT` | `3306` | MySQL TCP port (default 3306) |
| `DB_USER` | `cpaneluser_vigor_user` | cPanel database user |
| `DB_PASSWORD` | `[Secure Database Password]` | MySQL user password |
| `DB_NAME` | `cpaneluser_vigor_port` | MySQL database name |
| `SESSION_SECRET` | `[256-bit Random Key]` | Secret key for JWT/HMAC token signing |
| `GEMINI_API_KEY` | `AIzaSy...` | Google Gemini API Key |
| `VITE_USE_MOCK_API`| `false` | Enables real cPanel database querying |
| `VITE_API_URL` | `/api/v1` | Unified API prefix |

> **Security Note:** Never commit actual passwords or API keys to GitHub. Vercel securely encrypts all environment variables at rest.

---

### 5. Step 3: Verify Build Settings & Output Directory

* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Install Command**: `npm install`

The bundled `vercel.json` handles the necessary URL rewrites:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 6. Step 4: Deploy and Verify

1. Click **Deploy**.
2. Wait for the build and deployment pipeline to complete (~45 seconds).
3. Once deployed, open the assigned `.vercel.app` URL.
4. Verify the login portal appears:
   * Test sign-in using corporate credentials:
     * **Email:** `admin@turkysgroup.co.tz`
     * **Password:** `Turkys@2025`
5. Navigate to **Administration → cPanel MySQL Integration** and click **Test Connection** to confirm connectivity to the MySQL database.

---

### 7. Step 5: Custom Corporate Domain Setup

To mount the application under the official Turkys Group domain (e.g. `port.turkysgroup.co.tz` or `vigor.turkysgroup.co.tz`):

1. In the Vercel Project Dashboard, navigate to **Settings → Domains**.
2. Enter the domain: `port.turkysgroup.co.tz`.
3. In your domain registrar or cPanel DNS Zone Editor, add a **CNAME** record:
   * **Name**: `port`
   * **TTL**: `14400`
   * **Type**: `CNAME`
   * **Record**: `cname.vercel-dns.com.`
4. Vercel automatically issues an SSL certificate via Let's Encrypt within 5 minutes.

---

### Health Check & Validation Checklist

- [ ] HTTPS is enforced with TLS 1.3.
- [ ] Login only allows `@turkysgroup.co.tz` corporate email addresses.
- [ ] Unauthorized attempts reject with `HTTP 403 / Domain unauthorized`.
- [ ] Berths page reflects real-time pneumatic discharge throughput and release calculations.
- [ ] Payments page enforces the 100% advance clearance gate for Tanga / Twiga Cement.
- [ ] AI Operations Assistant responds using facts grounded in live port telemetry.
- [ ] Activity logs record all login and operational change events.
