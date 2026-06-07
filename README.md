# 🏥 Vantoor - Hospital Management System

<div align="center">

# 🚀 Modern Full-Stack Healthcare Management Platform

### Simplifying Hospital Operations, Patient Care & Administration

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/MySQL-Database-005C84?style=for-the-badge&logo=mysql)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)

</div>

---

## 📖 About The Project

**Vantoor Hospital Management System** is a comprehensive full-stack healthcare solution developed to streamline and automate hospital operations. The platform centralizes patient management, doctor management, appointment scheduling, prescriptions, billing, and medical records into a single digital ecosystem.

The system helps hospitals improve operational efficiency, reduce paperwork, maintain accurate records, and provide better patient experiences.

---

## ✨ Key Features

### 👨‍⚕️ Doctor Management
- Add New Doctors
- Update Doctor Information
- Manage Specializations
- Department Allocation
- Doctor Availability Management
- Doctor Profile Management

### 🧑 Patient Management
- Patient Registration
- Patient Profile Management
- Medical History Tracking
- Emergency Contact Information
- Patient Search & Filtering
- Patient Record Management

### 📅 Appointment Management
- Book Appointments
- Reschedule Appointments
- Cancel Appointments
- Appointment History
- Doctor Availability Check
- Appointment Status Tracking

### 💊 Prescription Management
- Create Prescriptions
- Medicine Details Management
- Prescription History
- Doctor Notes
- Download Prescriptions

### 🏥 Department Management
- Department Creation
- Department Management
- Doctor Assignment
- Department Statistics

### 💳 Billing & Payments
- Generate Bills
- Invoice Management
- Payment Tracking
- Revenue Monitoring
- Billing History

### 📋 Medical Records
- Digital Patient Records
- Treatment History
- Diagnosis Reports
- Medical Documentation
- Health Record Tracking

### 📊 Dashboard & Analytics
- Total Patients
- Total Doctors
- Appointments Overview
- Revenue Analytics
- Hospital Statistics

---

## 👥 User Roles

### 👑 Admin
- Manage Doctors
- Manage Patients
- Manage Departments
- Manage Appointments
- View Reports & Analytics
- Billing Management
- System Configuration

### 👨‍⚕️ Doctor
- View Assigned Patients
- Manage Appointments
- Create Prescriptions
- Access Medical Records
- Update Treatment Notes

### 🧑 Patient
- Register & Login
- Book Appointments
- View Prescriptions
- Access Medical Records
- Track Payments

---

## 🏗️ System Architecture

```text
┌──────────────────────────────┐
│        React Frontend         │
│ (Admin / Doctor / Patient UI) │
└──────────────┬───────────────┘
               │ REST API
               ▼
┌──────────────────────────────┐
│      Spring Boot Backend      │
│                              │
│ Authentication & Security    │
│ Patient Management           │
│ Doctor Management            │
│ Appointment Management       │
│ Prescription Management      │
│ Billing Management           │
│ Medical Records              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          MySQL DB             │
│                              │
│ Users                        │
│ Patients                     │
│ Doctors                      │
│ Appointments                 │
│ Prescriptions                │
│ Billing                      │
│ Medical Records              │
└──────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- JWT Authentication
- Maven
- Lombok
- Validation API

## Frontend

- React.js
- React Router
- Axios
- Context API
- Bootstrap / Tailwind CSS
- Material UI

## Database

- MySQL

---

# 📂 Project Structure

```text
vantoor-hospital-management-system
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── security
│   ├── config
│   └── exception
│
├── frontend
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   ├── context
│   │   ├── hooks
│   │   └── utils
│
└── database
    └── schema.sql
```

---

# 🔐 Security Features

### Authentication
- JWT Token Authentication
- Secure Login System
- Password Encryption
- Session Management

### Authorization
- Role-Based Access Control
- Admin Authorization
- Doctor Authorization
- Patient Authorization

### Protection
- SQL Injection Prevention
- Request Validation
- Secure API Communication
- Password Hashing

---

# 📊 Core Modules

| Module | Description |
|----------|-------------|
| Authentication | User Login & Security |
| Patient Management | Patient Information Management |
| Doctor Management | Doctor Profiles & Availability |
| Appointment Management | Scheduling System |
| Prescription Management | Medicine & Treatment Records |
| Billing System | Payment & Invoice Management |
| Medical Records | Patient Health History |
| Dashboard | Analytics & Monitoring |
| Reports | Hospital Reports |

---

# 🚀 Installation Guide

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/vantoor-hospital-management-system.git

cd vantoor-hospital-management-system
```

---

## 2️⃣ Configure Database

Create Database:

```sql
CREATE DATABASE vantoor_hms;
```

---

## 3️⃣ Backend Setup

### application.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/vantoor_hms
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update

jwt.secret=your-secret-key
```

### Run Backend

```bash
cd backend

mvn clean install

mvn spring-boot:run
```

Backend Running At:

```text
http://localhost:8080
```

---

## 4️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend Running At:

```text
http://localhost:5173
```

---

# 📸 Application Screens

### 🏠 Dashboard
- Revenue Statistics
- Total Patients
- Total Doctors
- Appointments Overview

### 👨‍⚕️ Doctor Panel
- Patient Records
- Appointment Schedule
- Prescription Management

### 🧑 Patient Portal
- Book Appointments
- Medical History
- Prescription Details

### 👑 Admin Panel
- Complete Hospital Management
- Analytics Dashboard
- User Management

---

# 📈 Future Enhancements

- 🤖 AI Healthcare Assistant
- 📧 Email Notifications
- 📱 SMS Notifications
- 🎥 Video Consultation
- 💳 Payment Gateway Integration
- 🏪 Pharmacy Management
- 🧪 Laboratory Management
- 📱 Mobile Application
- 🌐 Multi-Hospital Support
- 🔍 Advanced Analytics

---

# 🎯 Benefits

✅ Centralized Hospital Management

✅ Reduced Paperwork

✅ Faster Operations

✅ Improved Patient Experience

✅ Better Data Security

✅ Real-Time Monitoring

✅ Automated Workflows

✅ Scalable Architecture

---

# 🤝 Contributing

Contributions are always welcome.

```bash
# Fork Repository

# Create Feature Branch
git checkout -b feature/new-feature

# Commit Changes
git commit -m "Added new feature"

# Push Changes
git push origin feature/new-feature

# Create Pull Request
```

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

# 🏥 VANTOOR

### Transforming Healthcare Through Technology

### Built with ❤️ using Java, Spring Boot, React & MySQL

⭐ Star this repository if you found it useful.

</div>


IMAGES - 

<img width="1901" height="1009" alt="Screenshot 2026-06-06 224902" src="https://github.com/user-attachments/assets/d76cf377-b517-4a25-bd02-ba2df3928c66" />

--

<img width="1109" height="715" alt="Screenshot 2026-06-06 232543" src="https://github.com/user-attachments/assets/e1ff1a62-3d0e-4bbf-a215-c58e719edcf4" />


