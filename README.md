# 📈 Stock Broker Client Dashboard

A real-time stock broker client web application that allows multiple users to log in, subscribe to stocks, and receive live stock price updates without refreshing the page.  
This project demonstrates **authentication, real-time communication, and user-specific dashboards** using **React, Node.js, Express, and Socket.IO**.

---

## 🚀 Project Overview

The Stock Broker Dashboard enables users to:
- Log in using their email credentials
- Subscribe or unsubscribe from supported stocks
- View live stock price updates in real time
- Maintain separate dashboards for multiple users simultaneously
- Observe asynchronous updates across different user sessions

The application uses a **monorepo structure** with separate **frontend** and **backend** folders.

---

## 📁 Project Structure
stock-broker-app/
│
├── backend/
│ ├── server.js
│ ├── package.json
│ └── node_modules/
│
├── frontend/
│ ├── public/
│ ├── src/
│ │ ├── assets/
│ │ ├── pages/
│ │ │ ├── Auth.jsx
│ │ │ ├── Auth.css
│ │ │ ├── Dashboard.jsx
│ │ │ └── Dashboard.css
│ │ ├── App.jsx
│ │ ├── App.css
│ │ ├── main.jsx
│ │ └── index.css
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
└── README.md

