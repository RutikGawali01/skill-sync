# Skill Sync - Skill Exchange Platform 

A production-grade full-stack Skill Exchange Platform where users can **teach skills, learn from others, get matched intelligently, schedule sessions, and build trust through ratings & reviews**.

This project is currently **under active development** 🚧 and new features are continuously being added and improved.

The platform focuses on:

* Real-world system design
* Scalable backend architecture
* Clean code practices
* Intelligent matching systems
* AI-powered verification

---

# 🚧 Project Status

## Current Status

- ✅ Core backend architecture completed
- ✅ Authentication system implemented
- ✅ Skill management system implemented
- ✅ Availability scheduling system integrated
- ✅ Session workflow implemented
- ✅ Frontend integration in progress
- ✅ AI-powered skill verification system added

## 🚀 Currently Working On

- Advanced matching engine
- Recommendation system
- Real-time chat
- Notification system
- Gamification
- Fraud detection

---

# 🌟 Features

## 🔐 Authentication & Authorization

* JWT Authentication
* Secure Login & Registration
* Role-based access control
* Google OAuth

---

## 👤 User Profile Management

* User bio & profile
* Availability scheduling
* Learning preferences
* Teaching preferences

---

## 🧠 Skill Management

Users can:

* Offer skills
* Request skills to learn
* Set skill proficiency levels
* Add categories & descriptions

---

## 🤖 AI-Powered Skill Verification System

Integrated AI-based verification system to improve platform trust and skill authenticity.

### Verification Features

* AI-assisted skill validation
* Content-based verification checks
* Trust enhancement system
* Future-ready recommendation integration

This feature helps reduce fake claims and improves matching quality.

---

## 🔍 Intelligent Matching Engine

### Matching Versions

* ✅ Basic Matching
* ✅ Mutual Skill Exchange
* 🔄 Graph-based Matching (In Progress)
* 🔄 Ranking & Recommendation Engine

### Example

```text id="c9n2zr"
User A teaches React
User B teaches Spring Boot

→ Mutual exchange match generated
```

---

## 📅 Availability & Scheduling System

* Weekly availability slots
* Time slot management
* Conflict detection
* Booking workflow

---

## 🎓 Session Management

Session states:

* PENDING
* ACCEPTED
* REJECTED
* COMPLETED
* CANCELLED

---

## ⭐ Trust & Review System

* Ratings & feedback
* Trust score calculation
* Reputation system

---

## 💬 Communication System

* Pre-session communication
* Real-time chat (In Progress)
* Notifications & reminders

---

## 🏆 Gamification

* XP points
* Levels
* Achievement badges

---

# 🛠️ Tech Stack

## Backend

* Java 17
* Spring Boot
* Spring Security
* JWT
* Spring Data JPA (Hibernate)
* PostgreSQL / MySQL
* Lombok
* ModelMapper

## Frontend

* React + Vite
* Redux Toolkit
* Mantine UI
* React Router
* Axios

---

# 🧱 System Architecture

```text id="jz7ypd"
User
   ↓
UserSkill
   ↓
AI Verification
   ↓
Matching Engine
   ↓
Scheduling System
   ↓
Session Management
   ↓
Review & Trust System
```

---

# 📁 Project Structure

## Backend

```text id="x7r4y9"
backend/
 └── src/main/java/com/skillxchange/
      ├── config/
      ├── common/
      ├── auth/
      ├── user/
      ├── skill/
      ├── match/
      ├── session/
      ├── review/
      ├── notification/
      ├── chat/
      ├── admin/
      └── gamification/
```

---

## Frontend

```text id="c9zv12"
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

# 🔥 Key Engineering Highlights

## ✅ Clean Architecture

* Layered architecture
* DTO-based communication
* Modular feature-based structure
* Service abstraction

## ✅ Security Best Practices

* JWT authentication
* Password encryption
* Protected APIs
* Input validation

## ✅ Scalable Design

* Normalized database design
* Feature-wise modularity
* Future microservice-ready architecture
* Optimized matching workflows

## ✅ Real-world Backend Practices

* Global exception handling
* Logging using SLF4J
* Validation using `@Valid`
* Enum-based state management

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash id="qqz9xf"
git clone https://github.com/RutikGawali01/skill-sync.git
```

---

## 2️⃣ Backend Setup

```bash id="vphj0f"
cd backend
```

Configure database in:

```text id="rzh7z5"
application.yml
```

Run backend:

```bash id="9vhk6s"
./mvnw spring-boot:run
```

Backend runs on:

```text id="m4j22p"
http://localhost:8080
```

---

## 3️⃣ Frontend Setup

```bash id="fr8k8g"
cd frontend
```

Install dependencies:

```bash id="3yq6zz"
npm install
```

Run frontend:

```bash id="yt0pr9"
npm run dev
```

Frontend runs on:

```text id="qk2xxy"
http://localhost:5173
```

---

# 📌 Future Roadmap

## Upcoming Features

* Graph-based matching engine
* AI recommendations
* Real-time notifications
* WebSocket chat system
* Video call integration
* Fraud detection system
* Leaderboards & achievements
* Mobile application

---

# 📚 What This Project Demonstrates

This project showcases:

* Full-stack development
* Scalable system design
* Backend engineering
* Authentication & authorization
* Scheduling systems
* AI-assisted workflows
* Clean architecture principles
* Real-world project structuring

---

# 🤝 Contributing

Contributions are welcome!

```text id="x2h9ka"
Fork → Create Branch → Commit → Push → Pull Request
```

---

# 👨‍💻 Author

**Rutik Gawali**

Aspiring Full Stack Java Developer focused on:

* Spring Boot
* React
* System Design
* Scalable Backend Engineering
* AI-integrated Applications

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
