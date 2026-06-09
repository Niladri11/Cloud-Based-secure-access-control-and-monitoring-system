# 🔐 Cloud-Based Secure Access Control and Monitoring System

A secure cloud-based access control and monitoring platform built with **Node.js**, **Express.js**, **MySQL**, and **Docker**.

The system provides secure authentication, role-based access control, user activity monitoring, and containerized deployment for modern cloud environments.

---

## 🚀 Features

✅ User Registration & Login

✅ JWT Authentication

✅ Role-Based Access Control (RBAC)

✅ Admin Dashboard

✅ Secure Password Hashing (BCrypt)

✅ Rate Limiting Protection

✅ Activity Logging & Monitoring

✅ MySQL Database Integration

✅ Docker Containerization

✅ GitHub Actions CI/CD

✅ Health Check API

✅ Responsive User Interface

---

## 🛠️ Technology Stack

### 🎨 Frontend
- HTML5
- CSS3
- JavaScript

### ⚙️ Backend
- Node.js
- Express.js

### 🗄️ Database
- MySQL 8.0

### 🔒 Security
- JWT Authentication
- BCrypt Password Hashing
- Express Rate Limiter
- Secure Cookies

### ☁️ DevOps
- Docker
- Docker Compose
- GitHub Actions

---

## 📂 Project Structure

```text
project/
│
├── backend/
├── frontend/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🏗️ System Architecture

```text
User
 │
 ▼
Frontend
 │
 ▼
Node.js + Express API
 │
 ├── Authentication
 ├── Authorization
 ├── Logging
 └── Rate Limiting
 │
 ▼
MySQL Database
```

---

## ⚡ Installation

### Clone Repository

```bash
git clone https://github.com/Niladri11/Cloud-Based-secure-access-control-and-monitoring-system.git
cd Cloud-Based-secure-access-control-and-monitoring-system
```

### Install Dependencies

```bash
cd backend
npm install
```

---

## 🔧 Configuration

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=secure_access_db

JWT_SECRET=your_secret_key
```

---

## ▶️ Running the Application

```bash
npm start
```

Application:

```text
http://localhost:5000
```

Health Check:

```text
http://localhost:5000/health
```

---

## 🐳 Docker Deployment

Build Containers:

```bash
docker-compose build
```

Start Containers:

```bash
docker-compose up -d
```

Stop Containers:

```bash
docker-compose down
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| POST | /api/auth/logout |

### Admin

| Method | Endpoint |
|---------|----------|
| GET | /api/admin/users |
| GET | /api/admin/logs |

### Health Check

| Method | Endpoint |
|---------|----------|
| GET | /health |

---

## 🛡️ Security Features

- 🔐 BCrypt Password Hashing
- 🎫 JWT Authentication
- 🚫 Request Rate Limiting
- 👤 Role-Based Authorization
- 📝 Activity Logging
- 🍪 Secure Cookies
- ✔️ Input Validation
- 🔒 Protected Admin Routes

---

## 🔄 CI/CD Pipeline

GitHub Actions automatically:

- ✅ Build Application
- ✅ Validate Code
- ✅ Run Deployment Workflow

---

## 🎯 Future Enhancements

- Multi-Factor Authentication (MFA)
- Email Verification
- Real-Time Monitoring Dashboard
- Cloud Deployment (AWS/Azure/GCP)
- Security Alert Notifications
- Audit Reporting

---

## 👨‍💻 Author

**Niladri Tewari**

🎓 B.Tech CSE (Cyber Security)

🏫 The Neotia University

---

## 📜 License

This project is developed for educational and research purposes.
