# Smart College Lost & Found System — Comprehensive Project Documentation

---

## 1. Project Title
**Smart College Lost & Found System** — A Centralized, Role-Based, and Privacy-Preserving Item Recovery Engine for Academic Campuses.

---

## 2. Project Abstract & Objectives
Higher education campuses host thousands of daily students, faculty, and administrative staff. Displaced personal belongings (ID cards, wallets, electronics, laboratory equipment, textbooks) frequently cause academic disruption and financial distress. 

This project delivers a production-quality, web-based platform that replaces informal communication channels with an automated, searchable, and verified item recovery engine.

### Core Objectives:
1. **Centralize Recovery Data**: Provide a structured relational database storing lost and found entries across campus zones.
2. **Automated Attribute Matching**: Implement a rule-based scoring engine evaluating category, location, date proximity, color, and keyword similarity.
3. **Protect User Privacy**: Enforce hidden attribute verification to eliminate false or fraudulent ownership claims.
4. **Institutional Governance**: Provide administrative tools for report moderation, claim arbitration, and audit logging.

---

## 3. SDG Mapping (UN Sustainable Development Goals)

```
┌───────────────────────────────────────┐   ┌────────────────────────────────────────────────────────┐
│ UN SDG                                │   │ Project Contribution & Mechanism                       │
├───────────────────────────────────────┤   ├────────────────────────────────────────────────────────┤
│ SDG 4: Quality Education              │   │ Protects student learning continuity by minimizing     │
│                                       │   │ disruption caused by lost laptops, IDs, lab manuals,   │
│                                       │   │ and study materials.                                   │
├───────────────────────────────────────┤   ├────────────────────────────────────────────────────────┤
│ SDG 16: Peace, Justice & Strong       │   │ Enhances institutional integrity and transparency via  │
│ Institutions                          │   │ audited item handovers, role-based security, and fraud │
│                                       │   │ prevention.                                            │
└───────────────────────────────────────┘   └────────────────────────────────────────────────────────┘
```

---

## 4. Academic Course Outcomes (CO) & Mapping Matrices

### Course Outcomes (COs)
* **CO 1**: Analyze institutional lost-and-found requirements and engineer a multi-role relational database schema.
* **CO 2**: Develop a full-stack web application incorporating role-based access control (RBAC) and privacy protection.
* **CO 3**: Design a rule-based scoring algorithm to compute similarity confidence between displaced items.
* **CO 4**: Implement end-to-end security, input sanitization, IDOR protection, and system audit logging.

### CO–PO Mapping Matrix
*(Scale: 1 = Low, 2 = Medium, 3 = High)*

| Course Outcome | PO1 (Engg Knowledge) | PO2 (Problem Analysis) | PO3 (Design/Dev) | PO4 (Investigations) | PO5 (Modern Tool Usage) | PO8 (Ethics & Privacy) | PO12 (Life-long Learning) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CO 1** | 3 | 3 | 2 | 2 | 2 | 1 | 2 |
| **CO 2** | 3 | 2 | 3 | 2 | 3 | 3 | 2 |
| **CO 3** | 3 | 3 | 3 | 3 | 2 | 1 | 2 |
| **CO 4** | 2 | 2 | 2 | 2 | 3 | 3 | 2 |

### CO–PSO Mapping Matrix

| Course Outcome | PSO1 (Software System Architecture) | PSO2 (Data Security & Analytics) |
| :--- | :---: | :---: |
| **CO 1** | 3 | 2 |
| **CO 2** | 3 | 3 |
| **CO 3** | 3 | 2 |
| **CO 4** | 2 | 3 |

---

## 5. System Architecture & Relational Entity-Relationship (ER) Model

```
 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
 │     USERS     │ 1    N │     ITEMS     │ N    1 │  CATEGORIES   │
 ├───────────────┤───────►├───────────────┤◄───────├───────────────┤
 │ id (PK)       │        │ id (PK)       │        │ id (PK)       │
 │ email         │        │ report_type   │        │ name          │
 │ role          │        │ status        │        └───────────────┘
 └───────┬───────┘        └───────┬───────┘
         │ 1                      │ 1
         │ N                      │ N
         ▼                        ▼
 ┌───────────────┐        ┌───────────────┐        ┌───────────────┐
 │    CLAIMS     │        │    MATCHES    │        │   LOCATIONS   │
 ├───────────────┤        ├───────────────┤        ├───────────────┤
 │ id (PK)       │        │ id (PK)       │        │ id (PK)       │
 │ claimant_id   │        │ match_score   │        │ building_name │
 └───────────────┘        └───────────────┘        └───────────────┘
```

---

## 6. Rule-Based Similarity Scoring Formulation

$$\text{Match Score} = S_{\text{Category}} + S_{\text{Location}} + S_{\text{Date}} + S_{\text{Color}} + S_{\text{Brand}} + S_{\text{Keywords}}$$

Where:
* $S_{\text{Category}} = 30$ points if $\text{Category}_{\text{Lost}} = \text{Category}_{\text{Found}}$
* $S_{\text{Location}} = 25$ points (same building) or $15$ points (same zone)
* $S_{\text{Date}} = 20$ points ($\Delta t = 0$), $15$ points ($\Delta t \le 3$), $10$ points ($\Delta t \le 7$)
* $S_{\text{Color}} = 10$ points if $\text{Color}_{\text{Lost}} = \text{Color}_{\text{Found}}$
* $S_{\text{Brand}} = 10$ points if $\text{Brand}_{\text{Lost}} = \text{Brand}_{\text{Found}}$
* $S_{\text{Keywords}} = \min(15, 5 \times |T_{\text{Lost}} \cap T_{\text{Found}}|)$

Threshold Score $\ge 45\%$ automatically triggers a **Suggested Match** notification to both item reporters.

---

## 7. Testing & Verification Results Matrix

| Test Suite | Test Scenario | Input Data | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :---: |
| **AUTH-01** | Student Account Registration | Valid college email + password | HTTP 201 Created & JWT Cookie | ✅ PASS |
| **AUTH-02** | RBAC Role Access Gate | Student accessing `/admin` | HTTP 403 Forbidden / Redirect | ✅ PASS |
| **REPORT-01** | Submit Found Report | Form + Hidden Detail | Item record saved; detail masked | ✅ PASS |
| **MATCH-01** | Match Engine Trigger | Lost Wallet vs Found Wallet | Score = 92%; Notification sent | ✅ PASS |
| **CLAIM-01** | Submit Ownership Claim | Verification Answers | Claim created; Item -> CLAIM_PENDING | ✅ PASS |
| **CLAIM-02** | Approve Ownership Claim | Admin / Finder Decision | Claim APPROVED; Item -> RETURNED | ✅ PASS |

---

## 8. Viva Presentation Quick Reference Guide

### Q1: Why did you choose a rule-based match engine instead of machine learning?
> *"For a college mini-project, a rule-based similarity algorithm evaluating category, location, date delta, and attribute tokens provides deterministic, explainable, and instantaneous match scoring without requiring massive training datasets or expensive GPU infrastructure."*

### Q2: How does your system protect student privacy?
> *"Sensitive attributes (such as cash amounts inside a wallet or key ring inscriptions) are entered into a `hidden_details` field. This field is stripped from all public API queries and visible only to the item owner and reviewing admin."*

---

## 9. Conclusion & Deployment Readiness
The **Smart College Lost & Found System** successfully solves campus item displacement through structured multi-filter search, rule-based match scoring, privacy-first claim verification, and institutional admin oversight. It is fully implemented with zero mock functionality, verified with live database persistence, and ready for deployment.
