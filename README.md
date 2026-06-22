# 🏘️ Society Connect - Residential Management Platform

Society Connect is a modern full-stack residential management platform designed to streamline communication, complaint handling, and community engagement within housing societies. The platform enables residents and administrators to collaborate efficiently through complaint tracking, group discussions, announcements, and role-based management tools.

## 🌐 Live Demo

https://client-sowd.onrender.com/

---

# 🚀 Features

## ⚠️ Complaint Management System

A complete complaint tracking solution designed to ensure transparency and accountability.

### Features

* Upload images while reporting maintenance issues.

* Track complaint status in real time.

* Complaint lifecycle:

  ```text
  Submitted → In Review → Resolved
  ```

* Residents receive updates whenever complaint status changes.

* Admins can approve, reject, or resolve complaints.

---

## 👥 Community Groups & Chat

Dedicated community spaces for society members.

### Features

* Create and join community groups.
* Real-time member visibility.
* Persistent group chat history.
* Share updates, discussions, and announcements.
* Easy communication among residents.

Examples:

* Wing A Residents
* Wing B Residents
* Gardening Club
* Sports Club

---

## 📢 Society Announcements

Administrators can broadcast important notices to all residents.

### Features

* Instant society-wide announcements.
* Emergency alerts.
* Maintenance notifications.
* Event updates.

---

## 🔐 Authentication & Security

Secure authentication system built using JWT and Bcrypt.

### Features

* User Registration
* User Login
* JWT Authentication
* Password Hashing with Bcrypt
* Protected Routes
* Role-Based Access Control

### Roles

#### Resident

* Create complaints
* Track complaint status
* Join community groups
* Participate in group chats
* View announcements

#### Administrator

* Manage complaints
* Manage announcements
* Moderate groups
* Manage users
* Access admin dashboard

---

## 🛡️ Admin Dashboard

A centralized control panel for society management.

### Features

* View all complaints
* Manage complaint statuses
* Approve or reject posts
* Monitor community groups
* Manage registered users
* Create announcements
* Society-wide oversight

---

# 🏗️ Tech Stack

## Frontend

* React.js
* Vite
* HTML5
* CSS3
* JavaScript

## Backend

* Node.js
* Express.js

## Database & Backend Services

### Supabase

Used for:

* PostgreSQL Database
* Authentication Services
* Data Storage
* Real-Time Features

## Security

* JWT Authentication
* Bcrypt Password Hashing

## Deployment

* Render

---

# 📂 Project Structure

```bash
Society-Connect/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── assets/
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── config/
│
├── README.md
└── package.json
```

---

# 💡 Key Highlights

### Transparent Complaint Resolution

Residents can monitor every stage of complaint handling without needing to contact management repeatedly.

### Strong Community Engagement

Community groups encourage interaction and collaboration among residents.

### Secure Platform

JWT authentication and encrypted password storage ensure user security.

### Scalable Architecture

Built using React, Node.js, Express, and Supabase for high performance and scalability.

---

# 🔮 Future Enhancements

* Real-time notifications
* Maintenance fee payment integration
* Visitor management system
* Event booking system
* Mobile application
* AI-powered complaint categorization

---

# 👨‍💻 Author

Prince Kumar

B.Tech CSE, IIIT Kottayam

Full Stack Developer | React.js, Node.js, Express.js, PostgreSQL, Supabase | DSA & ML Enthusiast
