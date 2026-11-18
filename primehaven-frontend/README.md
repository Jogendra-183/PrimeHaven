# PRIMEHAVEN REAL ESTATE NETWORK
## Premium Frontend Architecture & Integration Guide

> *"Find Your Place. Build Your Future."*

PrimeHaven is an enterprise real-estate technology marketplace and residential property management platform built with React 18, Vite, Framer Motion, and pure CSS custom properties. It connects directly with the **PrimeHaven Spring Boot Microservices Fleet** through an API Gateway.

---

## 1. Visual & Design Direction — Warm Sand & Terracotta

The user experience is styled according to the **Warm Sand & Terracotta** luxury design system inspired by contemporary architectural journals and boutique residential portals.

### Color Tokens
| Token | Hex Value | Purpose |
|---|---|---|
| `--color-background` | `#F4EBDD` | Warm Sand Canvas |
| `--color-surface` | `#FFFCF7` | Ivory & Cream Card Surfaces |
| `--color-primary` | `#B86648` | Terracotta Primary CTA & Accents |
| `--color-primary-hover` | `#9F5037` | Terracotta Interactive Hover |
| `--color-accent` | `#D9B98C` | Champagne Gold Accents |
| `--color-earth` | `#76644E` | Earth-Brown Headings & Typography |
| `--color-sage` | `#43594A` | Muted Sage Secondary & Verification |
| `--color-text` | `#302D29` | Charcoal-Slate Body Text |
| `--color-text-secondary`| `#81776C` | Muted Neutral Meta Info |
| `--color-border` | `#E6D8C6` | Warm Sand Card Separators |
| `--color-soft-terracotta`| `#F5E2D8`| Soft Terracotta Icon & Pill Wells |
| `--color-soft-sage` | `#E7EBE3` | Soft Sage Status Badges |
| `--color-success` | `#357A55` | Transaction & Confirmed States |
| `--color-error` | `#BD4848` | Danger & Deletion States |
| `--color-warning` | `#A97832` | Pending & Under Negotiation |

### Typography
- **Headings & Editorial Statements**: `DM Serif Display`, serif
- **Interface, Controls & Data**: `Plus Jakarta Sans`, sans-serif

---

## 2. Microservices Architecture & Route Mapping

The frontend operates through a single, centralized entrypoint: **API Gateway** running on port `6001`.

```
                        ┌───────────────────────────────────────┐
                        │      PrimeHaven React Frontend        │
                        │       (Vite on Port 5173)             │
                        └───────────────────┬───────────────────┘
                                            │ HTTP / JSON
                                            ▼
                        ┌───────────────────────────────────────┐
                        │       API-GATEWAY (Port 6001)         │
                        │      CORS + Token Header Forward      │
                        └───────┬───────┬───────┬───────┬───────┘
                                │       │       │       │
       ┌────────────────────────┘       │       │       └────────────────────────┐
       ▼                                ▼       ▼                                ▼
┌─────────────┐                  ┌─────────────┐ ┌─────────────┐          ┌─────────────┐
│AUTH-SERVICE │                  │ PROPERTY-   │ │   VISIT-    │          │  INQUIRY-   │
│ (Port 6002) │                  │   SERVICE   │ │   SERVICE   │          │   SERVICE   │
│             │                  │ (Port 6003) │ │ (Port 6004) │          │ (Port 6005) │
└──────┬──────┘                  └──────┬──────┘ └──────┬──────┘          └──────┬──────┘
       │                                │       ▲       │ Feign / Rest           │
       ▼                                ▼       └───────┼────────────────────────┘
┌─────────────┐                  ┌─────────────┐ ┌──────┴──────┐          ┌─────────────┐
│  Database:  │                  │  Database:  │ │  Database:  │          │  Database:  │
│ primehaven_ │                  │ primehaven_ │ │ primehaven_ │          │ primehaven_ │
│   auth_db   │                  │ property_db │ │  visit_db   │          │ inquiry_db  │
└─────────────┘                  └─────────────┘ └─────────────┘          └─────────────┘
                                        ▲
                                        │ Discovery
                                 ┌──────┴──────┐
                                 │EUREKA-SERVER│
                                 │ (Port 8761) │
                                 └─────────────┘
```

---

## 3. Verified Backend API Inventory

| Microservice | Path / Endpoint | Method | Required Role | Description |
|---|---|---|---|---|
| **AUTH-SERVICE** | `/signin` | `POST` | Public | Authenticates username/email & password. Returns JWT token & user claims. |
| **AUTH-SERVICE** | `/signup` | `POST` | Public | Registers new `CLIENT` (`role: 1`) or `AGENT` (`role: 2`). Public cannot grant `ADMIN`. |
| **PROPERTY-SERVICE** | `/properties` | `GET` | Public | Returns complete property directory with pricing, specs, and status. |
| **PROPERTY-SERVICE** | `/properties/{id}` | `GET` | Public | Returns single residence details with assigned agent ID. |
| **PROPERTY-SERVICE** | `/properties` | `POST` | `AGENT`, `ADMIN` | Publishes new luxury listing. |
| **PROPERTY-SERVICE** | `/properties/{id}` | `PUT` | `AGENT`, `ADMIN` | Modifies architectural specs, description, pricing. |
| **PROPERTY-SERVICE** | `/properties/{id}` | `DELETE`| `AGENT`, `ADMIN` | Deletes listing from property database. |
| **PROPERTY-SERVICE** | `/properties/{id}/status` | `PUT` | `AGENT`, `ADMIN` | Updates status (`AVAILABLE`, `UNDER_NEGOTIATION`, `RESERVED`, `SOLD`). |
| **VISIT-SERVICE** | `/visits` | `POST` | `CLIENT`, `ADMIN` | Books walkthrough tour for authenticated client. |
| **VISIT-SERVICE** | `/visits` | `GET` | Authenticated | Role-filtered: Clients see own visits; Agents see visits for their listings; Admins see all. |
| **VISIT-SERVICE** | `/visits/{id}/status` | `PUT` | `AGENT`, `ADMIN` | Updates status (`REQUESTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`). |
| **VISIT-SERVICE** | `/visits/{id}` | `DELETE`| `CLIENT`, `ADMIN` | Cancels client visit appointment. |
| **INQUIRY-SERVICE** | `/inquiries` | `POST` | `CLIENT`, `ADMIN` | Submits property advisory question. |
| **INQUIRY-SERVICE** | `/inquiries` | `GET` | Authenticated | Role-filtered: Clients see own; Agents see their properties; Admins see all. |
| **INQUIRY-SERVICE** | `/inquiries/{id}` | `PUT` | Authenticated | Clients edit question (if `OPEN`); Agents & Admins supply advisory `response` and update `status`. |
| **INQUIRY-SERVICE** | `/inquiries/{id}` | `DELETE`| `CLIENT`, `ADMIN` | Deletes/withdraws inquiry thread. |

> [!NOTE]
> **API Gateway Authentication**: Requests through the gateway inject both `Authorization: Bearer <token>` and `Token: <token>`.
> **Role Normalization**: Backend role integers (`0` or `3` = `ADMIN`, `1` = `CLIENT`, `2` = `AGENT`) are normalized into standard role strings in `AuthContext`.

---

## 4. Role-Specific Dashboards

### A. CLIENT Dashboard (`/client/*`)
- **Sanctuary Discovery**: Browse, filter, and inspect luxury properties.
- **Wishlist & Saved Properties**: Scoped persistent client favorites with one-click tour booking.
- **My Tours & Walkthroughs**: Track requested appointments, view confirmation state, and cancel visits.
- **My Inquiries**: View submitted questions, read agent responses, edit pending messages, or withdraw threads.
- **Client Profile**: Verified membership credentials and contact details.

### B. AGENT Workspace (`/agent/*`)
- **Agent Overview**: Live scorecards for assigned listings, pending tour requests, and unanswered buyer questions.
- **Portfolio Management**: Interactive listings table, inline status toggle, add new property form, and edit suite.
- **Tour Scheduling Queue**: Review walkthrough requests with one-click **Confirm**, **Mark Completed**, or **Cancel**.
- **Inquiry Inbox & Advisory**: Dispatch official answers to prospective buyers and update inquiry statuses.
- **Performance Analytics**: Recharts visualizations for listing status distribution, tour appointment pipeline, and responsiveness rate.
- **Credentials & Profile**: Licensed partner verification badge and portfolio assignments.

### C. ADMIN Command Center (`/admin/*`)
- **Executive Oversight**: Global platform metrics (Total Properties, Active Listings, Transacting Users, Tour Volume).
- **Global Inventory Oversight**: Moderate, update status, or delete any listing across the network.
- **Global Visit Management**: System-wide appointment calendar with inspection modal.
- **Global Inquiries Management**: Inspect all buyer threads, moderate responses, and update statuses.
- **User Directory**: Identity directory discovering client and agent accounts from live database transactions.
- **Platform Analytics**: Gross marketplace valuation, average listing price, category distribution charts.

---

## 5. Architectural Gap Disclosure

In strict adherence to project standards, the following backend contract limitation is explicitly documented:

| Feature | Backend Reality | Frontend Handling |
|---|---|---|
| **Administrative User Listing** (`/admin/users`) | `AUTH-SERVICE` implements `/signin` and `/signup` but currently lacks a dedicated administrative endpoint (`GET /admin/users`) for full database user enumeration. | The frontend honestly discloses this in an architectural banner and synthesizes active user identities discovered from live foreign keys in `properties` (`agentId`), `visits` (`userId`), and `inquiries` (`userId`, `agentId`). |

---

## 6. Getting Started & Startup Instructions

### Prerequisites
- **Node.js**: `v18.0.0` or higher (tested on `v24.14.1`)
- **npm**: `v9.0.0` or higher (tested on `v11.11.0`)
- **Java**: JDK 17 or higher (for backend microservices)
- **PostgreSQL**: Running on port `5432` with databases:
  - `primehaven_auth_db`
  - `primehaven_property_db`
  - `primehaven_visit_db`
  - `primehaven_inquiry_db`

### Frontend Installation & Execution
```bash
# Navigate to frontend directory
cd primehaven-frontend

# Install dependencies (already installed)
npm install

# Start development server
npm run dev
# Running on http://localhost:5173

# Create production build
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
The frontend uses environment variables via `.env`:
```env
VITE_API_BASE_URL=http://localhost:6001
```

### Starting the Backend Microservices
Ensure each service is started in the following order:
1. `EUREKA-SERVER` (`port 8761`)
2. `API-GATWAY` (`port 6001`)
3. `AUTH-SERVICE` (`port 6002`)
4. `PROPERTY-SERVICE` (`port 6003`)
5. `VISIT-SERVICE` (`port 6004`)
6. `INQUIRY-SERVICE` (`port 6005`)

---

## 7. Role Testing Credentials

| Role | Username | Password | Permitted Portals |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | `/admin/*`, `/client/*`, `/agent/*` |
| **AGENT** | `agent_sarah` | `agent123` | `/agent/*`, `/properties` |
| **CLIENT** | `client_alex` | `client123` | `/client/*`, `/properties` |

*(You can also use the `/signup` page to register custom Client or Agent accounts instantly).*
