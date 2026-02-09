<<<<<<< HEAD
# Digital Learning Platform

A Progressive Web App (PWA) designed to empower rural students in India with free, accessible, and high-quality educational resources.

## 🎯 Overview

The Digital Learning Platform provides:
- 📚 *Comprehensive Notes* - Subject-wise study materials
- 🧠 *Interactive Quizzes* - Auto-graded assessments with instant feedback
- 🎥 *Recorded Lectures* - Video content from expert educators
- 📝 *Previous Year Questions (PYQs)* - Practice materials for exam preparation
- 📊 *Performance Tracking* - Detailed student reports and analytics

## 🚀 Features

### For Students
- Access notes, quizzes, lectures, and PYQs
- Track performance through detailed reports
- Offline access to downloaded content
- Mobile-first responsive design
- Secure authentication and privacy

### For Teachers
- Upload and manage educational content
- Create interactive quizzes
- View class analytics
- Manage notes, lectures, and PYQs
- Role-based dashboard

### Technical Features
- *PWA Support* - Installable, offline-capable
- *Firebase Integration* - Authentication, Firestore, Storage
- *Role-Based Access Control* - Secure student/teacher separation
- *Responsive Design* - Works on all devices
- *Modern UI* - Built with React and Tailwind CSS

## 🛠 Tech Stack

- *Frontend*: React 18, Vite
- *Styling*: Tailwind CSS
- *Backend*: Firebase (Auth, Firestore, Storage)
- *Charts*: Recharts
- *Icons*: Lucide React
- *PWA*: Vite PWA Plugin, Workbox

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup Steps

1. *Clone the repository*
   bash
   git clone <repository-url>
   cd Digit
   

2. *Install dependencies*
   bash
   npm install
   

3. *Configure Firebase*
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Enable Firebase Storage
   - Copy your Firebase config

4. *Update Firebase Configuration*
   
   Edit src/firebase/config.js with your Firebase credentials:
   javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   

5. *Deploy Firebase Security Rules*
   
   Deploy the Firestore rules from src/firebase/firestore.rules:
   bash
   firebase deploy --only firestore:rules
   
   
   Deploy the Storage rules from src/firebase/storage.rules:
   bash
   firebase deploy --only storage:rules
   

6. *Run the development server*
   bash
   npm run dev
   

7. *Build for production*
   bash
   npm run build
   

8. *Preview production build*
   bash
   npm run preview
   

## 🔐 Firebase Security Rules

The platform implements strict security rules:

### Firestore Rules
- Students can only access their own data
- Teachers can upload and manage content
- Role-based read/write permissions
- Quiz results are private to students and teachers

### Storage Rules
- Authenticated users can read educational content
- Only teachers can upload files
- Students can upload profile pictures

## 📱 PWA Features

- *Offline Support*: Cached content available without internet
- *Installable*: Add to home screen on mobile/desktop
- *Fast Loading*: Optimized with service workers
- *Background Sync*: Queue actions when offline

## 🎨 Design System

### Colors
- *Primary*: Navy Blue (#1E3A8A)
- *Secondary*: White (#F9FAFB)
- *Accent*: Amber (#F59E0B)

### Fonts
- *Headings*: Poppins
- *Body*: Inter

## 👥 Team - Code Nova

- *Sanskar* - Team Leader
- *Janvi* - Developer
- *Sanjana Soni* - Developer
- *Krishnaveer Chaudhary* - Developer
- *Rahul Kumar* - Developer
- *Yashpal Gola* - Developer

## 📄 License

This project is developed by Code Nova for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

For questions or support:
- Email: contact@digitallearning.in
- Phone: +91 1234567890

## 🙏 Acknowledgments

This platform is dedicated to empowering rural students across India with accessible, quality education.

---

*Digital Learning Platform* - Empowering Rural Students Through Digital Learning
=======
# project-msjor
>>>>>>> 973dee2e748f10751833dec312aa5daa6dc02bf8
