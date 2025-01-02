
# 🌟 BrainyPath E-learning Platform 

### 🚀 **Empowering Education for Everyone**  

**BrainyPath** is an innovative, feature-rich e-learning platform inspired by Udemy, designed to revolutionize online education for learners and instructors. Developed over a year using the **MERN stack**, it offers seamless UI, robust functionality, and powerful automation.  

---
## 🔗 **Repository Links**

### Frontend Repository
[BrainyPath Frontend](https://github.com/Rajveer13a/BrainyPath_Frontend)

## 🌈 **Key Features at a Glance**  

### 🧑‍🎓 **For Learners**  
- 🛒 **Smart Cart & Wishlist**: Add courses, save favorites, and manage selections effortlessly.  
- 📊 **Progress Tracking**: Monitor section-wise and lecture-wise progress dynamically.  
- 🌟 **Rating & Reviews**: Share feedback to help others choose the right course.  
- 🖼️ **Personalized Dashboard**: Track your learning history and view recommended courses.  

### 🧑‍🏫 **For Instructors**  
- 📚 **Course Management**: Create and structure courses with sections, lectures, and resources.  
- 🎥 **Multimedia Support**: Upload videos, thumbnails, PDFs, and more for an enriched learning experience.  
- 💰 **Automated Payroll System**: Get profits distributed automatically on scheduled dates.  
- ✅ **Course Approval**: Review and approve lectures with feedback to maintain quality standards.  

### 🔐 **For Everyone**  
- 🔒 **Secure Authentication**: Password encryption, JWT-based tokens, and multi-step verification.  
- 📈 **Smart Recommendations**: Personalized suggestions based on your learning history and interests.
- 🛠️ **Analytics**: Real-time tracking of interactions, searches, and learning patterns.  

---

## 🛠️ **Tech Stack**  

- 🌐 **Frontend**: React.js for clean, modern UI with responsive designs.  
- 🖇️ **Backend**: Node.js and Express.js with optimized APIs.  
- 🗃️ **Database**: MongoDB for scalable data storage.  
- ☁️ **Cloud Services**: Cloudinary for resource management and optimized delivery.  

---

## 🌟 **Visual Previews**  

### Homepage
![Screenshot (45)](https://github.com/user-attachments/assets/1a644511-11f7-4af7-87b8-9ee2a5fbf264)

### Learner Dashboard  
![Screenshot (57)](https://github.com/user-attachments/assets/eb7e1126-611b-4904-a82a-6da6dedbae86) 

### Instructor Tools  
![Screenshot (67)](https://github.com/user-attachments/assets/dc5b910a-50ca-4561-967a-893a02affd50) 

---

## ✨ **Project Structure**  

```plaintext  
BrainyPath_Backend/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server startup
│   ├── constants.js           # Global constants
│   ├── controllers/           # Request handlers
│   │   ├── course.controller.js
│   │   ├── instructor.controller.js
│   │   ├── management.controller.js
│   │   ├── payment.controller.js
│   │   ├── revenueShare.controller.js
│   │   ├── search.controller.js
│   │   ├── student.controller.js
│   │   └── user.controllers.js
│   ├── db/
│   │   └── dbConnection.js    # Database configuration
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── multer.middleware.js
│   ├── models/              # Database schemas
│   │   ├── Payout/
│   │   │   └── bankAccount.model.js
│   │   ├── course.model.js
│   │   ├── courseReview.model.js
│   │   ├── courseSection.model.js
│   │   ├── enrollment.model.js
│   │   ├── instructor.model.js
│   │   ├── payment.model.js
│   │   ├── rating.model.js
│   │   ├── search.model.js
│   │   ├── sectionLecture.model.js
│   │   ├── studentProgress.model.js
│   │   ├── user.config.js
│   │   └── user.model.js
│   ├── routes/             # API routes
│   │   ├── course.routes.js
│   │   ├── instructor.routes.js
│   │   ├── management.routes.js
│   │   ├── payment.routes.js
│   │   ├── revenueShare.routes.js
│   │   ├── search.routes.js
│   │   ├── students.routes.js
│   │   └── user.routes.js
│   └── utils/             # Helper functions
│       ├── apiError.js
│       ├── apiResponse.js
│       ├── cloudinary.js
│       ├── emailTemplates.js
│       ├── sendEmail.js
│       └── tryCatch.js
├── .env                   # Environment variables
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md


```  

---

## 🚀 **Getting Started**  

### Prerequisites  
- Node.js (v16 or higher)  
- MongoDB (local or cloud-based)  

### Steps  

1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/your-username/brainypath.git  
   cd brainypath  
   ```  

2. **Install Dependencies**  
   ```bash  
   npm install  
   cd frontend && npm install  
   ```  

3. **Set Up Environment Variables**  
    - Copy the `.env.example` file to create `.env`:
      ```bash
      cp .env.example .env
      ```
    - Update the `.env` file with your values:
      ```plaintext
      MONGO_URI=your-mongodb-connection-string
      JWT_TOKEN_SECRET=your-jwt-secret
      ACCESS_TOKEN_EXPIRY=15m
      REFRESH_TOKEN_EXPIRY=7d
      EMAIL_API_KEY=your-email-api-key
      CLOUDINARY_URL=your-cloudinary-url
      ``` 

4. **Run the Application**  
   - Start the backend:  
     ```bash  
     npm run server  
     ```  
   - Start the frontend:  
     ```bash  
     npm start  
     ```  

---

## 📚 **Feature Breakdown**  

### 🎓 **Learning Experience Features**  
- Dynamic dashboards to manage courses and progress.  
- Real-time tracking for section-wise and lecture-wise completion.  
- Access resources such as videos, PDFs.  

### 💰 **Instructor Tools**  
- Add sections, lectures, and resources with intuitive interfaces.  
- Get feedback on lectures for quality assurance.  
- Schedule payments effortlessly with payroll automation.  

### 🔐 **Secure System**  
- OTP-based email verification with rate-limiting to prevent abuse.  
- Encrypted password storage using **bcrypt**.  
- Forgot password functionality with expiration and retry limits.  

### 📊 **Analytics & Personalization**  
- Track user interactions and provide tailored recommendations.  
- Search history tracking with autocomplete suggestions.  
- Interaction analysis for popular tags, categories, and actions.  

---


## 🌍 **Future Enhancements**  

- 🤖 **AI Insights**: Advanced recommendations based on learner behavior.  
- 📜 **Multi-Language Support**: Expanding accessibility with localization.  
- 📊 **Instructor Analytics Dashboard**: Monitor course engagement and performance metrics.  
- 🎮 **Gamification**: Add badges and achievements for learners.  

---

## 🤝 **Contributing**  

1. Fork the repository.  
2. Create a new branch (`git checkout -b feature-name`).  
3. Commit your changes (`git commit -m "Add feature-name"`).  
4. Push to the branch (`git push origin feature-name`).  
5. Open a Pull Request.  

---

## 📜 **License**  

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.  
