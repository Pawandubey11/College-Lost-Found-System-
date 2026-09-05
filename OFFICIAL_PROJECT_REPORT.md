# DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
## ACADEMIC MINI-PROJECT OFFICIAL REPORT (2025–2026)

---

### PROJECT TITLE:
**Smart College Lost & Found System**

**Course**: Engineering Mini-Project  
**Domain**: Full-Stack Web Engineering & Database Systems  
**Institution**: College of Engineering & Technology  
**Department**: Department of Computer Science & Engineering  

---

## CERTIFICATE OF COMPLETION

This is to certify that the project entitled **"Smart College Lost & Found System"** is a bonafide record of work carried out successfully as part of the academic mini-project requirements.

```
________________________             ________________________
Internal Project Guide               Head of Department (CSE)
Department of CSE                    Department of CSE
```

---

## 1. EXECUTIVE SUMMARY & PROBLEM SPECIFICATION

In higher educational institutions, the loss of personal belongings (such as student identity cards, electronic items, laboratory notebooks, keys, and water bottles) occurs daily. The traditional informal mechanism—relying on WhatsApp group messages, social media posts, and physical paper notices on gate bulletin boards—suffers from severe limitations:

1. **Information Decay**: Messages in instant messaging channels are rapidly displaced by ongoing chat history.
2. **Lack of Indexing**: Items cannot be systematically queried by campus location, item category, date, or primary color.
3. **Security & Privacy Risks**: Displaying personal phone numbers or specific item details publicly exposes students to fraudulent claims and unsolicited spam.
4. **Zero Governance**: Security personnel and college administrators lack audit logs and statistics regarding campus recovery rates.

The **Smart College Lost & Found System** addresses these issues through a centralized, secure web application engineered using a Node.js/Express REST backend, an SQLite relational database, and a React/TypeScript user interface.

---

## 2. COURSE OUTCOMES (CO) & PROGRAM OUTCOMES (PO) MAPPING

### 2.1 Course Outcomes
* **CO 1**: Formulate system requirements and design a normalized relational database schema (3NF) for institutional lost-and-found operations.
* **CO 2**: Implement a full-stack web interface featuring Role-Based Access Control (RBAC) and client-server validation.
* **CO 3**: Develop an attribute-matching algorithm to compute similarity confidence scores between lost and found entries.
* **CO 4**: Conduct software testing, vulnerability mitigation (XSS, IDOR, SQL Injection prevention), and document system performance.

### 2.2 CO–PO Attainment Matrix

| Course Outcome | PO1 | PO2 | PO3 | PO4 | PO5 | PO8 | PO12 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CO 1 (Database Design)** | 3 | 3 | 2 | 2 | 2 | 1 | 2 |
| **CO 2 (Full-Stack Dev & RBAC)** | 3 | 2 | 3 | 2 | 3 | 3 | 2 |
| **CO 3 (Matching Engine)** | 3 | 3 | 3 | 3 | 2 | 1 | 2 |
| **CO 4 (Security & Testing)** | 2 | 2 | 2 | 2 | 3 | 3 | 2 |

---

## 3. SYSTEM ARCHITECTURE & METHODOLOGY

```
 [ Client Layer ]              [ REST API Router ]           [ Database Layer ]
 React + TypeScript    ──►    Node.js / Express Controllers ──►   SQLite (WAL Mode)
 (Tailwind CSS UI)            (JWT & RBAC Middleware)         (Relational Schema)
```

### 3.1 Relational Schema Definition
1. `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `department`, `phone_number`)
2. `categories` (`id`, `name`, `slug`, `description`, `icon_name`)
3. `locations` (`id`, `campus_zone`, `building_name`, `floor_level`)
4. `items` (`id`, `report_type`, `title`, `category_id`, `location_id`, `description`, `incident_date`, `primary_color`, `brand`, `distinguishing_features`, `hidden_details`, `status`, `reporter_id`, `image_url`)
5. `claims` (`id`, `item_id`, `claimant_id`, `verification_answers_json`, `status`, `admin_notes`)
6. `matches` (`id`, `lost_item_id`, `found_item_id`, `match_score`, `status`)
7. `audit_logs` (`id`, `user_id`, `action`, `target_type`, `target_id`, `details`)

---

## 4. MATHEMATICAL FORMULATION OF MATCH SCORING ALGORITHM

The system evaluates potential matches using a weighted multi-attribute similarity function:

$$\text{Similarity Score } S = \sum_{k \in \{\text{Cat, Loc, Date, Col, Brand, Key}\}} S_k$$

Where:
* **Category Match**: $S_{\text{Cat}} = 30$ if $\text{Category}_{\text{Lost}} = \text{Category}_{\text{Found}}$
* **Location Match**: $S_{\text{Loc}} = 25$ (identical building) or $15$ (identical campus zone)
* **Date Proximity**: $S_{\text{Date}} = 20$ ($\Delta t = 0\text{ days}$), $15$ ($\Delta t \le 3\text{ days}$), $10$ ($\Delta t \le 7\text{ days}$)
* **Color Overlap**: $S_{\text{Col}} = 10$ if $\text{Color}_{\text{Lost}} = \text{Color}_{\text{Found}}$
* **Brand Overlap**: $S_{\text{Brand}} = 10$ if $\text{Brand}_{\text{Lost}} = \text{Brand}_{\text{Found}}$
* **Keyword Tokens**: $S_{\text{Key}} = \min(15, 5 \times |T_{\text{Lost}} \cap T_{\text{Found}}|)$

A combined score $S \ge 45\%$ automatically logs a record in the `matches` table and triggers in-app notification alerts to both item reporters.

---

## 5. EXPERIMENTAL TESTING & VERIFICATION LOG

| Test ID | Module | Test Description | Input Data | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TEST-01** | Auth | User Registration | Valid student email + hashed password | ✅ PASS |
| **TEST-02** | Security | IDOR Protection | Student modifying another user's report | ✅ PASS (HTTP 403) |
| **TEST-03** | Reporting | Found Item Submission | Item parameters + hidden detail | ✅ PASS |
| **TEST-04** | Privacy | Hidden Detail Masking | Non-owner requesting GET `/api/items/:id` | ✅ PASS (Masked) |
| **TEST-05** | Claiming | Proof Verification | Claimant answering verification prompt | ✅ PASS |
| **TEST-06** | Admin | Status Arbitration | Admin approving claim -> Item RETURNED | ✅ PASS |

---

## 6. CONCLUSION & ACKNOWLEDGEMENTS
The **Smart College Lost & Found System** fulfills all academic requirements of an engineering mini-project by applying modern software engineering principles, secure database design, and structured testing. The system is fully operational and suitable for campus deployment.
