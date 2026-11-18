<div align="center">

<img src="docs/banner.png" alt="PrimeHaven Real Estate Network" width="100%"/>

<br/>

**A full-stack real estate marketplace built on Spring Boot microservices, with role-based dashboards for clients, agents and admins.**

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-Gateway_%2B_Eureka-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Test Accounts](#-test-accounts)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Author](#-author)

---

## 🏡 Overview

**PrimeHaven** is a real estate platform where clients can browse properties, book visits and send inquiries, agents manage their listings and respond to buyers, and admins oversee the whole marketplace.

The backend is split into **independent Spring Boot microservices** that sit behind a single **API Gateway** and register with a **Eureka** discovery server. Each service owns its own **PostgreSQL** database, and access is secured with **JWT authentication and role-based authorization**. The frontend is a responsive **React + Vite** app with a warm sand and terracotta design system.

---

## ✨ Key Features

### For Clients
- 🔎 Browse and filter property listings, with map-based property locations
- ❤️ Save favourite properties to a personal wishlist
- 📅 Book, track and cancel property visits
- 💬 Send inquiries to agents and read their replies

### For Agents
- 🏠 Create, edit, delete and update the status of listings (`AVAILABLE`, `UNDER_NEGOTIATION`, `RESERVED`, `SOLD`)
- ✅ Confirm, complete or cancel visit requests
- 📨 Answer buyer inquiries
- 📊 View performance charts for listings, visits and responsiveness

### For Admins
- 🧭 Platform-wide metrics dashboard
- 🛠️ Moderate every listing, visit and inquiry
- 👥 User directory and analytics reports

### Platform
- 🔐 JWT authentication with role-based access (`CLIENT`, `AGENT`, `ADMIN`)
- 🧩 Database-per-service microservice design
- 🌐 Service discovery and routing through a single gateway
- ⚠️ Centralized exception handling in every service
- 🧪 Unit tests for the service and controller layers

---

## 🏗️ Architecture

<div align="center">
<img src="docs/architecture.png" alt="PrimeHaven system architecture" width="95%"/>
</div>

| Service | Port | Responsibility |
| --- | :---: | --- |
| **Eureka Server** | 8761 | Service registry and discovery |
| **API Gateway** | 6001 | Single entry point, routing and CORS |
| **Auth Service** | 6002 | Sign up, sign in, JWT issuing |
| **Property Service** | 6003 | Property listings and their status |
| **Visit Service** | 6004 | Visit booking and scheduling |
| **Inquiry Service** | 6005 | Client inquiries and agent responses |
| **Frontend** | 5173 | React single-page app |

The Visit and Inquiry services call the Property service to attach property details to each record.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Backend** | Java 17, Spring Boot, Spring Cloud Gateway, Netflix Eureka, Spring Data JPA, Hibernate, Maven |
| **Security** | JWT, role-based authorization, custom auth filters |
| **Database** | PostgreSQL (one database per service) |
| **Frontend** | React 18, Vite, React Router, Axios, Framer Motion, GSAP |
| **Maps & Charts** | Leaflet / React-Leaflet, Recharts |
| **UI** | Custom CSS design tokens, Lucide icons, React Hot Toast |
| **Testing** | JUnit and Spring Boot Test |

---

## 📡 API Reference

All requests go through the gateway at `http://localhost:6001`.

| Service | Endpoint | Method | Access | Description |
| --- | --- | :---: | --- | --- |
| Auth | `/signup` | `POST` | Public | Register a client or agent |
| Auth | `/signin` | `POST` | Public | Log in and receive a JWT |
| Property | `/properties` | `GET` | Public | List all properties |
| Property | `/properties/{id}` | `GET` | Public | Get one property |
| Property | `/properties` | `POST` | Agent, Admin | Create a listing |
| Property | `/properties/{id}` | `PUT` | Agent, Admin | Update a listing |
| Property | `/properties/{id}/status` | `PUT` | Agent, Admin | Change listing status |
| Property | `/properties/{id}` | `DELETE` | Agent, Admin | Delete a listing |
| Visit | `/visits` | `POST` | Client, Admin | Book a visit |
| Visit | `/visits` | `GET` | Authenticated | List visits (filtered by role) |
| Visit | `/visits/{id}/status` | `PUT` | Agent, Admin | Confirm, complete or cancel |
| Visit | `/visits/{id}` | `DELETE` | Client, Admin | Cancel a visit |
| Inquiry | `/inquiries` | `POST` | Client, Admin | Send an inquiry |
| Inquiry | `/inquiries` | `GET` | Authenticated | List inquiries (filtered by role) |
| Inquiry | `/inquiries/{id}` | `PUT` | Authenticated | Edit or answer an inquiry |
| Inquiry | `/inquiries/{id}` | `DELETE` | Client, Admin | Withdraw an inquiry |

Protected endpoints need the header `Authorization: Bearer <token>`.

---

## 🚀 Getting Started

### Prerequisites

- JDK 17 or later
- Maven (or use the included `mvnw` wrapper in each service)
- Node.js 18 or later and npm
- PostgreSQL running on port `5432`

### 1. Clone the repository

```bash
git clone https://github.com/Jogendra-183/PrimeHaven.git
cd PrimeHaven
```

### 2. Create the databases

```sql
CREATE DATABASE primehaven_auth_db;
CREATE DATABASE primehaven_property_db;
CREATE DATABASE primehaven_visit_db;
CREATE DATABASE primehaven_inquiry_db;
```

### 3. Configure each service

In each service's `src/main/resources/application.properties`, set your own database password and JWT secret. **The JWT secret must be the same in all four services** so a token issued by Auth is accepted by the others.

```properties
spring.datasource.username=postgres
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=YOUR_LONG_RANDOM_SECRET
```

### 4. Start the backend (in this order)

```bash
cd project/EUREKA-SERVER   && ./mvnw spring-boot:run   # 8761
cd project/API-GATWAY      && ./mvnw spring-boot:run   # 6001
cd project/AUTH-SERVICE    && ./mvnw spring-boot:run   # 6002
cd project/PROPERTY-SERVICE && ./mvnw spring-boot:run  # 6003
cd project/VISIT-SERVICE   && ./mvnw spring-boot:run   # 6004
cd project/INQUIRY-SERVICE && ./mvnw spring-boot:run   # 6005
```

Open each command in its own terminal. On Windows you can adapt the included `start-all.ps1` script (update the paths inside it first).

Check that all services registered at **http://localhost:8761**.

### 5. Start the frontend

```bash
cd primehaven-frontend
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:6001
npm install
npm run dev
```

Open **http://localhost:5173**.

### Run the tests

```bash
cd project/PROPERTY-SERVICE && ./mvnw test
```

---

## 🔑 Test Accounts

Use these local development accounts, or create your own on the Sign Up page.

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Agent | `agent_sarah` | `agent123` |
| Client | `client_alex` | `client123` |

> For local testing only. Change or remove these before any real deployment.

---

## 📂 Project Structure

```text
PrimeHaven/
├── primehaven-frontend/        # React + Vite app
│   └── src/
│       ├── components/         # auth, common, layout, property
│       ├── pages/              # public, auth, client, agent, admin, properties
│       ├── services/           # API clients (auth, property, visit, inquiry)
│       ├── styles/             # design tokens and global CSS
│       └── utils/
├── project/
│   ├── EUREKA-SERVER/          # Service discovery
│   ├── API-GATWAY/             # Gateway and routing
│   ├── AUTH-SERVICE/           # Authentication and JWT
│   ├── PROPERTY-SERVICE/       # Property listings
│   ├── VISIT-SERVICE/          # Visit scheduling
│   └── INQUIRY-SERVICE/        # Buyer inquiries
├── start-all.ps1               # Windows helper to start everything
└── stop-all.ps1
```

---

## 📸 Screenshots

> Add your own screenshots to `docs/screenshots/` using these file names.

| Home | Property Listings |
| :---: | :---: |
| ![Home](docs/screenshots/home.png) | ![Listings](docs/screenshots/listings.png) |

| Client Dashboard | Agent Workspace |
| :---: | :---: |
| ![Client](docs/screenshots/client.png) | ![Agent](docs/screenshots/agent.png) |

| Admin Dashboard | Analytics |
| :---: | :---: |
| ![Admin](docs/screenshots/admin.png) | ![Analytics](docs/screenshots/analytics.png) |

---

## 🗺️ Roadmap

- [ ] Docker Compose setup to start every service with one command
- [ ] Dedicated admin endpoint in the Auth service for listing users
- [ ] Image upload for property photos
- [ ] Email notifications for visit confirmations
- [ ] Deploy the full stack to the cloud

---

## 👤 Author

**Jogendra Sai**
B.Tech Computer Science and Engineering, KL University

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jogendra-sai-7bb879355/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/Jogendra-183)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat&logo=gmail&logoColor=white)](mailto:jogendrasai780@gmail.com)

---

<div align="center">
⭐ If you find this project useful, please give it a star!
</div>
