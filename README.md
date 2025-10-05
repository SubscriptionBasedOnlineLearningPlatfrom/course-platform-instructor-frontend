# 🎓 Course Platform - Instructor Frontend

A modern, feature-rich React application for course instructors to create, manage, and track their online courses. Built with React 19, Vite, and Tailwind CSS.

## 🌟 Features

### 📚 Course Management
- **Create Courses**: Full course creation with thumbnail upload, category selection, and detailed descriptions
- **Course Dashboard**: View all created courses with beautiful visual cards and category-based color schemes
- **Course Editing**: Update course details, thumbnails, and content
- **Course Deletion**: Safely delete courses with cascade deletion of associated content

### 🖼️ Media Management
- **Thumbnail Upload**: Drag-and-drop course thumbnail upload with preview
- **Digital Ocean Spaces Integration**: Secure cloud storage for course media
- **Image Optimization**: Automatic image processing and optimization

### 📖 Curriculum Builder
- **Module Management**: Create and organize course modules
- **Chapter Creation**: Add chapters with rich content support
- **Lesson Files**: Upload and manage lesson materials
- **Quiz Integration**: Create interactive quizzes for student assessment

### 👥 Student Management
- **Enrollment Tracking**: Monitor student enrollments and progress
- **Comments System**: Manage student comments and feedback
- **Analytics Dashboard**: View course performance metrics

### 🔐 Authentication & Profile
- **Google OAuth Integration**: Secure login with Google accounts
- **JWT Authentication**: Token-based security system
- **Profile Management**: Update instructor profiles and settings
- **Password Reset**: Secure password recovery system

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Beautiful Gradients**: Category-based color schemes and visual effects
- **Interactive Components**: Smooth animations and hover effects
- **Toast Notifications**: Real-time feedback for user actions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 4000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-platform-instructor-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── course/          # Course-related components
│   ├── dashboard/       # Dashboard components
│   ├── createCourse/    # Course creation components
│   ├── quizes/          # Quiz management components
│   └── ...
├── pages/               # Main page components
│   ├── Dashboard.jsx    # Main instructor dashboard
│   ├── CreateCourse.jsx # Course creation page
│   ├── Profile.jsx      # Instructor profile page
│   └── ...
├── contexts/            # React Context providers
│   └── APIContext.js    # Backend API configuration
├── services/            # API service functions
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── lib/                 # External library configurations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - Latest React with modern features
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Icons** - Popular icon sets
- **Sonner** - Toast notifications

### Form Management
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation
- **Hookform/Resolvers** - Validation resolvers

### HTTP & State
- **Axios** - HTTP client for API calls
- **JWT** - Token-based authentication
- **React Hot Toast** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript Types** - Type definitions
- **Vite Plugins** - Build optimizations

## 🎨 Design System

### Color Schemes
- **Programming**: Purple to Indigo gradient
- **Design**: Pink to Rose gradient  
- **Business**: Green to Emerald gradient
- **Language**: Blue to Cyan gradient
- **Default**: Gray to Slate gradient

### Component Categories
- **Layout**: Sidebar, Headers, Containers
- **Forms**: Input fields, Selects, File uploads
- **Data Display**: Cards, Tables, Lists
- **Feedback**: Toasts, Modals, Alerts
- **Navigation**: Menus, Breadcrumbs, Tabs

## 🔌 API Integration

### Backend Endpoints
```javascript
// Course Management
GET    /overview/created-courses     // Get instructor courses
POST   /instructor/courses          // Create new course
PUT    /overview/edit-course-details/:id  // Update course
DELETE /instructor/courses/:instructorId/:courseId  // Delete course

// Authentication
POST   /auth/login                  // User login
POST   /auth/signup                 // User registration
POST   /auth/reset-password         // Password reset

// Profile Management
GET    /instructor/profile          // Get profile
PUT    /instructor/profile          // Update profile
```

### Configuration
Update `src/contexts/APIContext.js` with your backend URL:
```javascript
const BackendAPI = "http://localhost:4000";
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

## 🎯 Key Features Guide

### Creating a Course
1. Navigate to "Create Course" from sidebar
2. Fill in course details (title, description, category)
3. Upload course thumbnail (drag & drop supported)
4. Add pricing and difficulty level
5. Click "Create Course" to save

### Managing Curriculum
1. Go to created course from dashboard
2. Click "Manage Curriculum"
3. Add modules and organize content
4. Create chapters with rich content
5. Upload lesson files and materials

### Tracking Enrollments
1. Access "Enrollments" from sidebar
2. View student enrollment statistics
3. Monitor course performance metrics
4. Respond to student comments

## 🐛 Troubleshooting

### Common Issues

**Server Connection Error**
```bash
# Check if backend is running
curl http://localhost:4000/test-simple

# Restart backend if needed
cd ../course-platform-backend
npm start
```

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CORS Issues**
- Ensure backend allows frontend origin
- Check API context configuration
- Verify authentication headers

## 🔐 Authentication Flow

1. **Login**: Google OAuth or email/password
2. **Token Storage**: JWT stored in localStorage
3. **API Calls**: Authorization header with Bearer token
4. **Auto Logout**: Token expiration handling
5. **Route Protection**: Private routes for authenticated users

## 📊 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Automatic thumbnail compression
- **Bundle Analysis**: Optimized build outputs
- **Caching**: API response caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deployment

### Production Build
```bash
npm run build
dist/ # Output directory
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=https://your-backend-url.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📞 Support

- **Issues**: [GitHub Issues](link-to-issues)
- **Documentation**: [Wiki](link-to-wiki)
- **Email**: support@courseplatform.com

---

Built with ❤️ by the Course Platform Team
