# 🚀 Skill Sync — Production-Ready Skill Exchange Platform

<p align="center">

![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge\&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge\&logo=springboot)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge\&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge\&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge\&logo=redis)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge\&logo=docker)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)

</p>

A **production-grade full-stack Skill Exchange Platform** that enables users to **teach skills, learn from others, receive intelligent recommendations, schedule sessions, communicate in real time, and build trust through AI-powered verification and reviews.**

Built using **Spring Boot, React, PostgreSQL, Redis, WebSocket, and Docker**, the project follows **clean architecture, scalable backend design, enterprise security practices, and modern software engineering principles**.

---

# ✨ Key Highlights

* 🔐 Secure JWT Authentication with Refresh Token Rotation
* 🔑 Google OAuth 2.0 Authentication
* 🤖 AI-Powered Skill Verification
* 🎯 Intelligent Recommendation Engine
* 💬 Real-Time Chat using WebSocket
* 🔔 Real-Time Notifications
* 📅 Smart Availability & Session Scheduling
* ⭐ Review & Trust Score System
* 🚦 Redis-Based API Rate Limiting
* ⚡ Redis Caching for Performance
* 🐳 Dockerized Application
* 🗄️ Flyway Database Versioning
* 🛡️ Enterprise-Level Spring Security

---

# 🌟 Features

## 🔐 Authentication & Security

Secure authentication using JWT, Google OAuth, Refresh Token Rotation, role-based authorization, protected APIs, and Spring Security best practices.

## 👤 User Profile Management

Create and manage user profiles, teaching preferences, learning interests, skills, and personal availability.

## 🧠 Skill Management

Users can offer skills, request skills to learn, organize them into categories, and define proficiency levels.

## 🤖 AI Skill Verification

AI-assisted verification validates submitted skills to improve user credibility, platform trust, and recommendation quality.

## 🎯 Recommendation Engine

Recommends the most relevant learning partners based on skills, interests, and mutual learning opportunities.

## 📅 Availability & Scheduling

Manage weekly availability, detect scheduling conflicts, and seamlessly book learning sessions.

## 🎓 Session Management

Complete session lifecycle including **Pending**, **Accepted**, **Rejected**, **Completed**, and **Cancelled** states.

## 💬 Real-Time Chat

Instant messaging between matched users using WebSocket and STOMP after session acceptance.

## 🔔 Real-Time Notifications

Receive live updates for session requests, chat messages, recommendations, and important platform activities.

## ⭐ Review & Trust System

Build reputation through ratings, reviews, and an automated trust score after completed learning sessions.

## 🚦 API Rate Limiting

Protects backend APIs against abuse using Redis-backed request throttling for improved reliability and security.

## ⚡ Performance Optimization

Improves application performance through Redis caching, optimized queries, pagination, and efficient API responses.

---
# 🛠️ Technology Stack

### Backend

* Java 17
* Spring Boot
* Spring Security
* Spring Data JPA (Hibernate)
* JWT Authentication
* OAuth 2.0
* PostgreSQL
* Redis
* Flyway
* WebSocket (STOMP)
* Maven
* Lombok
* ModelMapper

### Frontend

* React
* Vite
* Redux Toolkit
* React Router
* Mantine UI
* Axios

### DevOps & Tools

* Docker
* Git & GitHub
* Postman
* IntelliJ IDEA
* VS Code

---

# 📁 Project Structure

## Backend

```text
backend/
└── src/main/java/com/skillxchange/
    ├── auth/
    ├── user/
    ├── skill/
    ├── recommendation/
    ├── availability/
    ├── session/
    ├── review/
    ├── notification/
    ├── chat/
    ├── admin/
    ├── common/
    └── config/
```

## Frontend

```text
frontend/
└── src/
    ├── components/
    ├── pages/
    ├── redux/
    ├── services/
    ├── hooks/
    ├── layouts/
    └── utils/
```

---

# 💻 Engineering Practices

* Clean Layered Architecture
* Feature-Based Modular Design
* DTO-Based Communication
* RESTful API Design
* Global Exception Handling
* Bean Validation (`@Valid`)
* Secure Authentication & Authorization
* Enum-Based State Management
* SLF4J Logging
* Reusable Components
* Production-Ready Code Structure
* Scalable Backend Design

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/RutikGawali01/skill-sync.git
```

---

## 2. Backend Setup

```bash
cd backend
```

Configure your database and Redis credentials inside:

```text
application.yml
```

Run the backend:

```bash
./mvnw spring-boot:run
```

Backend URL

```text
http://localhost:8080
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL

```text
http://localhost:5173
```

---

# 🎯 What This Project Demonstrates

This project showcases practical experience in:

* Enterprise Backend Development
* Full-Stack Application Development
* Secure Authentication & Authorization
* Real-Time Communication
* Recommendation Systems
* AI Integration
* Redis Integration
* Performance Optimization
* REST API Development
* Scalable Application Design
* Clean Architecture
* Modern Software Engineering Practices

---

# 👨‍💻 Author

### Rutik Gawali

**Aspiring Full-Stack Java Developer** passionate about building scalable, secure, and production-ready applications.

### Connect with Me

* 💼 LinkedIn: www.linkedin.com/in/rutik-gawali-35094a32a
* 💻 GitHub: https://github.com/RutikGawali01

---

# ⭐ Support

If you found this project helpful or interesting, please consider giving it a **⭐ Star** on GitHub.

It motivates me to continue building high-quality open-source projects and helps others discover this repository.

**Thank you for visiting! 🚀**
