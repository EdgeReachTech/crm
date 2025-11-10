# 🚀 EdgeReach Sales CRM

A modern, full-stack Sales Customer Relationship Management system built with **Next.js**, **TypeScript**, **Supabase**, and **Node.js**. Designed for sales teams to efficiently manage leads, opportunities, contacts, and revenue tracking.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎯 Sales Management
- **Lead Management**: Track prospects from initial contact to conversion
- **Opportunity Pipeline**: Visual sales funnel with customizable stages
- **Contact Management**: Comprehensive contact profiles with interaction history
- **Account Management**: Company-level relationship tracking

### 📊 Analytics & Reporting
- **Sales Performance**: Individual and team performance metrics
- **Revenue Tracking**: Real-time revenue analysis and forecasting
- **Pipeline Health**: Visual pipeline analytics with conversion rates
- **Custom Reports**: Flexible reporting system

### 🔄 Activity Management
- **Activity Tracking**: Calls, emails, meetings, and custom activities
- **Follow-up Management**: Automated reminders and task scheduling
- **Calendar Integration**: Sync with external calendar systems
- **Team Collaboration**: Manager coaching and feedback system

### 🔐 Security & Multi-tenancy
- **Firebase Authentication**: Enterprise-grade user authentication
- **Row-Level Security**: Supabase RLS for data isolation
- **Multi-tenant Architecture**: Secure data separation by organization
- **Role-Based Access**: Sales Rep and Manager permission levels
- **JWT Integration**: Secure API authentication with Firebase tokens

## 🏗️ Architecture

### Backend (`/backend`)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK for token verification
- **API Documentation**: Swagger/OpenAPI
- **Security**: JWT-based API authentication

### Frontend (`/front`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Authentication**: Firebase Auth (Client SDK)
- **UI Components**: Custom component library
- **Type Safety**: Full TypeScript integration

### Database Schema
```
📁 Core Tables
├── tenants (Multi-tenancy)
├── users (Sales reps & managers)
├── sales_stages (Pipeline configuration)
├── accounts (Companies)
├── contacts (People)
├── leads (Prospects)
├── opportunities (Deals)
├── activities (Interactions)
├── follow_ups (Tasks & reminders)
└── revenue_tracking (Sales metrics)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or higher
- npm or yarn
- Supabase account
- Firebase account (for auth)

### 1. Clone Repository
```bash
git clone https://github.com/edgereach/crm.git
cd edgereach-crm
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables
# Edit .env with your Supabase and Firebase credentials
```

**Required Environment Variables:**

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_PATH=./path/to/firebase-adminsdk.json
RESEND_API_KEY=your_resend_api_key
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration
```bash
# Run in your Supabase SQL Editor (step by step):
# 1. backend/database/migration_to_sales_crm.sql
# 2. backend/database/migration_rls_security.sql
```

### 4. Frontend Setup
```bash
cd ../front
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure your environment variables
```

### 5. Start Development Servers
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd front
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
edgereach-crm/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & validation
│   │   └── config/          # Database & external services
│   ├── database/            # Migration scripts
│   └── tests/               # API tests
├── front/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utilities
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
└── DESIGN DOCS/             # Technical documentation
```

## 🔧 Development

### Backend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # ESLint check
```

### Frontend Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint check
```

### Database Commands
```bash
# Migration files available in backend/database/
migration_to_sales_crm.sql     # Main schema migration
migration_rls_security.sql     # Security & RLS policies
rollback_migration.sql         # Emergency rollback
pre_migration_check.sql        # Pre-migration validation
```

## 🎯 Key Features Deep Dive

### Sales Pipeline Management
- **Configurable Stages**: Customize your sales process
- **Lead Scoring**: Automatic lead qualification scoring
- **Probability Weighting**: Accurate forecasting with stage probabilities
- **Pipeline Analytics**: Real-time pipeline health metrics

### Activity & Task Management
- **Comprehensive Tracking**: All customer interactions in one place
- **Automated Follow-ups**: Never miss a follow-up opportunity
- **Calendar Integration**: Seamless scheduling workflow
- **Performance Metrics**: Activity-based performance tracking

### Team Management
- **Role-Based Permissions**: Sales reps vs. managers
- **Coaching Tools**: Manager feedback and guidance system
- **Performance Dashboards**: Individual and team analytics
- **Target Tracking**: Quota and goal management

### Reporting & Analytics
- **Pipeline Health**: Visual pipeline analysis
- **Revenue Tracking**: Real-time revenue metrics
- **Sales Performance**: Individual and team performance
- **Custom Views**: Flexible data visualization

## 🔒 Security

### Multi-Tenant Architecture
- **Row-Level Security**: Supabase RLS policies
- **Data Isolation**: Complete tenant separation
- **Secure APIs**: JWT-based authentication
- **Permission Control**: Granular access control

### Authentication Flow
- **Firebase Auth**: Enterprise-grade authentication
- **Admin SDK**: Backend token verification
- **Session Management**: Secure session handling
- **Password Policies**: Configurable security rules
- **Social Login**: Google, GitHub, and other providers
- **2FA Support**: Two-factor authentication ready

### Authentication Setup
1. **Create Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication**: Set up authentication methods
3. **Generate Service Account**: Download admin SDK credentials
4. **Configure Environment**: Set up both frontend and backend env vars

## 📊 API Documentation

API documentation is available via Swagger UI:
- Development: `http://localhost:3001/api-docs`
- Production: `https://your-domain.com/api-docs`

### Core Endpoints
```
GET    /api/leads              # List leads
POST   /api/leads              # Create lead
GET    /api/leads/:id          # Get lead details
PUT    /api/leads/:id          # Update lead
DELETE /api/leads/:id          # Delete lead

GET    /api/opportunities      # List opportunities
POST   /api/opportunities      # Create opportunity
GET    /api/opportunities/:id  # Get opportunity details
PUT    /api/opportunities/:id  # Update opportunity

GET    /api/activities         # List activities
POST   /api/activities         # Create activity
GET    /api/dashboard          # Dashboard analytics
GET    /api/reports/pipeline   # Pipeline reports
```

## 🚢 Deployment

### Backend Deployment
```bash
# Build
npm run build

# Environment variables for production
SUPABASE_URL=your_production_supabase_url
SUPABASE_KEY=your_production_supabase_key
NODE_ENV=production
```

### Frontend Deployment
```bash
# Build
npm run build

# Deploy to Vercel, Netlify, or your preferred platform
```

### Database Setup
1. **Create Supabase project**
2. **Run migration scripts** in SQL Editor:
   - `backend/database/migration_to_sales_crm.sql`
   - `backend/database/migration_rls_security.sql`
3. **Configure RLS policies**
4. **Set up database environment variables**

### Firebase Setup
1. **Create Firebase project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication** with desired providers
3. **Generate service account key** for backend
4. **Configure web app** credentials for frontend
5. **Set up environment variables** for both frontend and backend

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow existing code style
- Run linting before commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

### Documentation
- [Design Documentation](./DESIGN%20DOCS/SALES_CRM_README.md)
- [API Specification](./DESIGN%20DOCS/API_SPECIFICATION.md)
- [Developer Guide](./DESIGN%20DOCS/DEVELOPER_IMPLEMENTATION_GUIDE.md)
- [Migration Guide](./backend/database/MIGRATION_GUIDE.md)

### Getting Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/edgereach-crm/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/edgereach-crm/discussions)
- 📧 **Email Support**: support@edgereach.com

## 🗺️ Roadmap

### v2.0 - Advanced Features
- [ ] Email automation sequences
- [ ] Advanced reporting dashboard
- [ ] Mobile app (React Native)
- [ ] Third-party integrations (Salesforce, HubSpot)
- [ ] AI-powered lead scoring
- [ ] Advanced calendar scheduling

### v1.1 - Enhancements
- [ ] Email templates system
- [ ] Bulk operations
- [ ] Export/Import functionality
- [ ] Advanced search filters
- [ ] Custom fields support

---

**Built with ❤️ by the EdgeReach Team**

*Transforming sales processes through intelligent CRM solutions*