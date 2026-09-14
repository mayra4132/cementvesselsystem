# VIGOR Smart Port Operations — Technical Architecture
## Enterprise Port Logistics & Decision Intelligence Platform

### 1. Executive Summary

The **VIGOR Smart Port Operations** platform is a mission-critical web application purpose-built for **VIGOR Cement Works** (a subsidiary of **Turkys Group of Companies**, Zanzibar, Tanzania). The platform coordinates bulk cement vessel traffic between mainland manufacturing terminals (Tanga Cement, Twiga Cement in Dar es Salaam) and the dedicated **Berth B01** unloader at Zanzibar Port.

The system transitions from an early prototype to a **production-grade enterprise management system**, engineered for:
* **Frontend:** Hosted on **Vercel** with global edge caching and instant responsive UI.
* **Database:** Hosted on corporate **cPanel MySQL** with relational schema enforcement, ACID transactions, and automated fallback caching.
* **Security & Auth:** Strict corporate domain authentication (`@turkysgroup.co.tz`) with 4-tier Role-Based Access Control (RBAC).
* **Decision Support:** Grounded AI operations assistant utilizing terminal telemetry to eliminate anchorage idle hours.

---

### 2. High-Level Architecture Diagram

```
                 +-----------------------------------------------+
                 |              USER BROWSER / DEVICE            |
                 |      (Turkys Group Authorized Personnel)      |
                 +-----------------------------------------------+
                                         |
                                         | HTTPS (TLS 1.3)
                                         v
+---------------------------------------------------------------------------------+
|                                 VERCEL PLATFORM                                 |
|                                                                                 |
|   +-----------------------------+             +-----------------------------+   |
|   |   Static Assets / Frontend  |             |     Node.js Serverless      |   |
|   |      (React 18 + Vite)      |<----------->|         API Routes          |   |
|   |  - Dashboard Summary        |   REST /    |        (/api/v1/*)          |   |
|   |  - Control Tower            |   JSON      |  - Auth & RBAC Middleware   |   |
|   |  - Berth Console (B01)      |             |  - Calculation Engine       |   |
|   |  - Manufacturer Payment Gate|             |  - Activity Audit Logging   |   |
|   |  - Admin & Governance       |             |  - Grounded AI Assistant    |   |
|   +-----------------------------+             +-----------------------------+   |
+--------------------------------------------------------------|------------------+
                                                               |
                                            MySQL Protocol /   |
                                            TLS Connection     v
                              +---------------------------------------------------+
                              |             TURKYS CPANEL HOSTING                 |
                              |                                                   |
                              |              cPanel MySQL Database                |
                              |            (cpaneluser_vigor_port)                |
                              |  - users & roles (RBAC)                           |
                              |  - vessels & voyages                              |
                              |  - berths & vessel_visits                         |
                              |  - operational_readings (Pneumatic)               |
                              |  - delays & root causes                           |
                              |  - activity_logs (Audit Trail)                    |
                              |  - system_settings                                |
                              +---------------------------------------------------+
```

---

### 3. Core Subsystems & Operational Logic

#### 3.1 Berth B01 Pneumatic Discharge & Buffer Calculation
* Bulk cement unloading operates pneumatically via dockside pipe manifolds connected directly to shore silos.
* **Buffer Clearance Rule:** By port engineering protocol, castoff clearance requires an operational buffer of **1.5 hours** after the last tonne is discharged. This buffer accounts for pneumatic line purging, manifold disconnection, draft survey verification, and tug positioning.
* **Expected Berth Release Equation:**
  $$\text{ETA Release} = \text{Current Time} + \left(\frac{\text{Remaining Cargo (MT)}}{\text{Discharge Rate (MT/h)}}\right) + \text{Buffer (1.5h)}$$
* **Conflict Prevention:** When an inbound vessel (e.g., `MV VIGOR 03`) is forecast to arrive before `ETA Release`, the system flags an imminent anchorage delay and computes the required **Eco-Steaming speed** to achieve just-in-time berthing.

#### 3.2 Manufacturer Commercial Payment Gate
* Loading slots at mainland manufacturing terminals (**Tanga Cement** and **Twiga Cement**) are contingent upon invoice settlement.
* **100% Clearance Rule:** Vessels cannot be allocated a confirmed loading queue slot until 100% of advance commercial invoices are verified as received in the treasury.
* Real-time payment tracking connects bank wire records to vessel voyage identifiers.

#### 3.3 Fuel & Eco-Steaming Optimization
* By adjusting transit speed across the Pemba Channel from 11.2 knots to 8.5 knots during detected berth conflicts, vessels eliminate anchorage wait times while conserving ~1.8 to 2.4 metric tonnes of Marine Gas Oil (MGO) per voyage.

---

### 4. Security & Compliance Architecture

#### 4.1 Corporate Domain Authentication
* **Strict Email Whitelisting:** Sign-ups and logins are cryptographically restricted to emails ending in `@turkysgroup.co.tz`. Generic domains (`gmail.com`, `yahoo.com`) are rejected before query execution.
* **Password Hashing:** Passwords are salted and hashed using bcrypt (10 rounds).
* **Token Security:** Bearer tokens are signed with HMAC-SHA256, carrying user ID, role, and expiration timestamp.

#### 4.2 Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin | Management | Operations | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| View Fleet & Berth Dashboard | Yes | Yes | Yes | Yes |
| Record Hourly Pneumatic Readings | Yes | No | Yes | No |
| Log Berth Delays & Incidents | Yes | No | Yes | No |
| Record Wire Payments | Yes | Yes | Yes | No |
| Change Engine Calculation Buffer | Yes | No | No | No |
| Manage Users & Roles | Yes | No | No | No |
| View Audit Trail & Activity Logs | Yes | Yes | No | No |
| Trigger Scenario Resets | Yes | Yes | Yes | No |

#### 4.3 Tamper-Evident Audit Logging
Every sensitive state change—user status modification, rate submission, delay acknowledgement, and payment confirmation—is permanently recorded in the `activity_logs` table with actor email, timestamp, entity ID, and client metadata.

---

### 5. Resilient Database Layer

The backend implements a dual-mode database manager (`server/database.ts`):
1. **Primary Mode:** Standard `mysql2/promise` connection pool targeting cPanel MySQL.
2. **Resilience Fallback:** If network partitioning occurs between the edge and the cPanel server, the system automatically falls back to an in-memory transactional cache. This prevents terminal operators from experiencing white screens or downtime during port shifts.
3. **Health Probe:** `/api/v1/health/database` reports live connection status, host, user, and round-trip ping.

---

### 6. Grounded AI Operations Assistant

* Powered by **Google Gemini** using the modern `@google/genai` TypeScript SDK.
* All prompts are **strictly grounded in live operational facts** injected at query time (e.g. current tonnes remaining on MV VIGOR 01, exact B01 release forecast, Tanga Cement payment deficit).
* The assistant generates **interactive navigational action buttons**, enabling operators to immediately jump to the relevant control screen (Berths console, Payment center, Vessel details) with a single click.
