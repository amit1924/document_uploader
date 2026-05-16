Act as a Senior MERN Stack Architect and Security Engineer.

I want to build a production-grade Secure Personal Document Vault Web Application using the MERN stack.

The application will allow users to securely upload, organize, preview, search, download, and manage personal documents such as:

- Aadhaar Card
- PAN Card
- Passport
- Driving License
- Medical Reports
- Certificates
- Marksheets
- Insurance Documents
- Bank Documents
- Legal Files
- Photos
- PDFs
- ZIP Files
- Any personal/private document

IMPORTANT:
Do NOT use any third-party file storage services like:

- Cloudinary
- Firebase Storage
- AWS S3
- Supabase Storage

All files must be stored locally on the server filesystem or self-hosted storage.

========================================================
🏗️ TECH STACK
========================================================

Frontend:

- React.js (Latest)
- TypeScript
- Tailwind CSS
- React Router DOM
- TanStack Query
- Axios
- Zustand or Context API
- Framer Motion

Backend:

- Node.js
- Express.js
- MongoDB Atlas with Mongoose
- JWT Authentication
- bcrypt password hashing
- Multer for file uploads
- Node.js fs module for local storage
- Helmet
- Express Rate Limit
- Compression
- Morgan or Winston logger

Database:

- MongoDB Atlas

========================================================
🔐 CORE SECURITY REQUIREMENTS
========================================================

This application handles extremely sensitive user documents.

Implement enterprise-level security practices:

1. Authentication

- JWT Access Token + Refresh Token
- Secure login/register/logout
- Password hashing with bcrypt
- Protected routes
- Session persistence
- Auto token refresh

2. File Security

- Validate MIME types
- Restrict executable uploads
- Max upload size validation
- Virus scan placeholder architecture
- Filename sanitization
- Prevent path traversal attacks
- Encrypt sensitive file metadata
- Prevent public file access

3. API Security

- Helmet middleware
- Rate limiting
- CORS configuration
- Input validation using Zod or Joi
- MongoDB injection prevention
- XSS sanitization

4. Storage Security

- Store uploads outside public folder
- Use unique encrypted filenames
- Organize uploads by userId
- Secure download streaming
- Permission-based file access

========================================================
📂 APPLICATION FEATURES
========================================================

1. User Authentication

- Register/Login
- Forgot password
- Reset password
- Change password
- Profile management

2. Document Upload

- Drag and drop upload
- Multi-file upload
- Upload progress bar
- File preview before upload
- Resume failed uploads
- Large file handling

3. Document Management

- Create folders/categories
- Rename documents
- Delete documents
- Move documents
- Favorite/star important documents
- Tagging system
- Search and filters

4. Supported File Types

- PDF
- JPG
- PNG
- DOCX
- XLSX
- TXT
- ZIP

5. File Preview

- PDF preview
- Image preview
- Metadata viewer
- File information panel

6. Dashboard

- Total files
- Storage usage
- Recent uploads
- File type analytics

========================================================
📁 STORAGE ARCHITECTURE
========================================================

Use local filesystem storage.

Required structure:

storage/
├── users/
│ ├── userId1/
│ │ ├── documents/
│ │ ├── medical/
│ │ ├── ids/
│ │ └── certificates/
│ └── userId2/

Requirements:

- Auto-create folders
- Store original filename separately
- Save encrypted/generated filename on disk
- Prevent duplicate filename conflicts

========================================================
🧠 DATABASE DESIGN
========================================================

Create production-ready MongoDB schemas for:

1. User Schema

- name
- email
- password
- avatar
- storageUsed
- role
- refreshTokens

2. File Schema

- originalName
- storedName
- mimeType
- fileSize
- category
- tags
- folder
- uploadPath
- uploadedBy
- isFavorite
- timestamps

3. Folder Schema

- name
- parentFolder
- userId

========================================================
⚡ PERFORMANCE REQUIREMENTS
========================================================

Implement:

- Pagination
- Lazy loading
- File streaming
- Optimized uploads
- Compression middleware
- Virtualized lists for large files
- Debounced search

========================================================
🎨 FRONTEND REQUIREMENTS
========================================================

Build a modern UI similar to:

- Google Drive
- Dropbox
- OneDrive

UI Requirements:

- Responsive layout
- Dark/light mode
- Sidebar navigation
- Drag-drop upload zone
- File cards/table view toggle
- Animated transitions
- Skeleton loaders
- Empty states
- Error handling

========================================================
📂 PROJECT STRUCTURE
========================================================

Backend Structure:
src/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── models/
├── utils/
├── validators/
├── uploads/
└── server.ts

Frontend Structure:
src/
├── api/
├── pages/
├── components/
├── hooks/
├── store/
├── layouts/
├── context/
├── utils/
├── types/
└── routes/

========================================================
📦 REQUIRED DELIVERABLES
========================================================

STEP 1:
Generate all MongoDB Mongoose Schemas.

STEP 2:
Generate Express.js backend architecture.

STEP 3:
Generate secure Multer configuration.

STEP 4:
Generate JWT authentication system.

STEP 5:
Generate secure file upload APIs.

STEP 6:
Generate React frontend architecture.

STEP 7:
Generate React upload page with:

- drag/drop
- progress bar
- previews
- validation

STEP 8:
Generate secure download API using streams.

STEP 9:
Generate dashboard UI.

STEP 10:
Generate deployment guide for:

- VPS hosting
- Nginx
- PM2
- MongoDB Atlas
- SSL setup

========================================================
🛡️ IMPORTANT SECURITY RULES
========================================================

NEVER:

- Store files inside public/
- Expose direct file paths
- Allow unrestricted uploads
- Trust frontend validation only
- Store plain passwords
- Use insecure JWT secrets

ALWAYS:

- Verify user ownership before download
- Stream files securely
- Validate file extensions and MIME types
- Sanitize all inputs
- Use environment variables
- Implement proper authorization middleware

========================================================
🧪 CODE QUALITY RULES
========================================================

All code must:

- Use TypeScript
- Be modular and scalable
- Follow clean architecture
- Include comments
- Include robust error handling
- Use async/await
- Follow production best practices

========================================================
🎯 FINAL GOAL
========================================================

The final result should be a fully secure production-grade personal document vault system capable of safely storing highly sensitive personal documents without relying on any third-party storage provider.
