# Design Document - JeevanRaksha Healthcare Platform

## 1. Executive Summary

JeevanRaksha is a comprehensive, multi-service healthcare platform designed to bridge the healthcare gap in rural and underserved areas of India. The system integrates six specialized services into a unified ecosystem, providing AI-powered diagnosis, multilingual support, appointment management, medicine delivery, mental health support, and query resolution.

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JeevanRaksha Main Portal                  │
│                    (Flask - Port 5000)                       │
│              Authentication & Service Routing                │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────────────┐
             │                                                 │
    ┌────────▼────────┐  ┌──────────────┐  ┌────────────────┐│
    │  ArogyaMitra    │  │  MediLingo   │  │ Medicine       ││
    │  (Port 5001)    │  │ (Port 5002)  │  │ Booking        ││
    │  AI Diagnosis   │  │ Translation  │  │ (Port 5003)    ││
    └─────────────────┘  └──────────────┘  └────────────────┘│
                                                               │
    ┌─────────────────┐  ┌──────────────┐                    │
    │  QuietSpace     │  │ Query Portal │                    │
    │  (Port 5004)    │  │ (Port 3001)  │                    │
    │  Mental Health  │  │ Node.js API  │                    │
    └─────────────────┘  └──────────────┘                    │
                                                               │
             └─────────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   MySQL Database   │
                    │  jeevan_raksha DB  │
                    └────────────────────┘
```

### 2.2 Technology Stack

#### Backend Services
- **Primary Framework**: Flask (Python 3.8+)
- **API Server**: Express.js (Node.js)
- **Session Management**: Flask sessions with secret keys
- **Database**: MySQL 8.0+ with mysql-connector-python

#### Frontend
- **Architecture**: Server-side rendering with Jinja2 templates
- **Styling**: Custom CSS with modern design patterns
- **Interactivity**: Vanilla JavaScript (no framework dependencies)
- **Progressive Enhancement**: PWA support for ArogyaMitra

#### AI/ML Components
- **NLP**: Hugging Face Transformers (DistilBART)
- **Classification**: scikit-learn (Logistic Regression, TF-IDF)
- **Translation**: deep-translator (Google Translate API)
- **Conversational AI**: OpenAI API

## 3. Service-Level Design

### 3.1 JeevanRaksha Main Portal

#### Purpose
Central authentication hub and service router for the entire ecosystem.

#### Key Features
- Dual authentication system (User/Admin)
- Role-based access control (RBAC)
- Session-based routing with "next" parameter preservation
- Unified navigation across all services

#### Authentication Flow
```
User Request → Login Check → Session Validation
                    ↓
            Role Detection (User/Admin)
                    ↓
        Service-Specific Redirect
                    ↓
        Preserve "next" URL for post-login
```

#### Security Design
- **Password Hashing**: SHA-256 with hashlib
- **Mobile Validation**: Regex pattern `[6-9][0-9]{9}`
- **SQL Injection Prevention**: Parameterized queries
- **Session Security**: Secret key-based session management

#### Database Schema
```sql
users (id, name, mobile, password, created_at)
admins (id, mobile, password, created_at)
appointments (id, user_id, patient_name, phone, age, date, 
              gender, department, mode, doctor, time_slot, status)
```

### 3.2 ArogyaMitra - AI Health Companion

#### Purpose
AI-powered symptom analysis and health guidance for rural populations with limited healthcare access.

#### Design Philosophy
- **Accessibility First**: Multi-language support (English, Hindi)
- **Progressive Disclosure**: Multi-step form with visual progress
- **Safety Override**: Automatic doctor referral for symptoms > 4 days
- **Offline Capability**: PWA with service worker

#### ML Architecture
```
User Symptoms (Text Input)
        ↓
TF-IDF Vectorization (1-2 grams)
        ↓
Heuristic Matching Algorithm
        ↓
Disease Detection (Best Match Scoring)
        ↓
Duration-Based Severity Assessment
        ↓
Medicine & Care Recommendations
        ↓
Translation (if Hindi selected)
```

#### Severity Model
- **Input Features**: Symptom text (TF-IDF) + Duration (numeric)
- **Algorithm**: Logistic Regression
- **Training**: Supervised learning on labeled dataset
- **Output**: Severity classification (Low/Medium/High)

#### Safety Logic
```python
if duration > 4:
    medicines = ["No self-medication"]
    care = ["Consult a doctor immediately"]
    warning = True
```

#### UI/UX Design
- **Step Indicators**: Visual progress with icons
- **Typing Animation**: AI personality with typing effect
- **Micro-interactions**: Button animations, input focus states
- **Particle Background**: Subtle animated background
- **Toast Notifications**: User feedback system

#### Data Structure
```csv
disease, symptoms, medicine, care, warning
Fever, "fever, headache, body pain", "Paracetamol|Rest", "Drink water|Rest", false
```

### 3.3 MediLingo - Medical Report Translator

#### Purpose
Multilingual medical report summarization and translation for patients with language barriers.

#### Processing Pipeline
```
File Upload (PDF/DOCX/TXT)
        ↓
Text Extraction
    ├─ PDF: PyPDF2 (text layer)
    └─ PDF (scanned): Tesseract OCR
        ↓
Text Truncation (2000 chars)
        ↓
AI Summarization (DistilBART)
        ↓
Translation (English → Hindi, Punjabi)
        ↓
Multi-language Display
```

#### OCR Configuration
- **Engine**: Tesseract 5.0+
- **PDF Conversion**: pdf2image with Poppler
- **Image Processing**: PIL/Pillow
- **Fallback Strategy**: Text extraction → OCR if empty

#### Summarization Model
- **Model**: `sshleifer/distilbart-cnn-12-6`
- **Max Length**: 80 tokens
- **Min Length**: 20 tokens
- **Strategy**: Extractive + abstractive hybrid

#### UI Design
- **Minimalist Interface**: Single upload button
- **File Status Display**: Real-time file name preview
- **Result Layout**: Three-column language display
- **Language Icons**: Visual language identification

### 3.4 Medicine Booking System

#### Purpose
Dual-purpose medicine ordering and price inquiry system with admin management.

#### User Flows

**Flow 1: Direct Booking**
```
User → Medicine Options → Book Medicine Form
    → Submit (medicine, quantity, doctor, delivery_date)
    → Database Insert → Review Medicines Page
```

**Flow 2: Price Inquiry**
```
User → Medicine Options → Review Price Form
    → Submit (medicine, quantity, doctor)
    → Price Request Table → Admin Review
    → Admin Sets Fare → User Notification
```

#### Admin Features
- **Booking Management**: View all orders, update status
- **Fare Management**: Set medicine prices
- **Delivery Scheduling**: Update delivery dates

#### Database Design
```sql
medicine_booking (id, user_id, name, phone, medicine, 
                  quantity, doctor, delivery_date, status,
                  price_per_unit, total_price, created_at)

medicine_price_request (id, user_id, name, phone, medicine,
                        quantity, doctor, created_at)

medicine_fare (id, medicine, price_per_unit, created_at)
```

### 3.5 QuietSpace - Mental Health Support

#### Purpose
AI-powered mental health chatbot providing empathetic, judgment-free support.

#### Architecture
```
Frontend (HTML/CSS/JS)
        ↓
Flask Backend (Port 5004)
        ↓
OpenAI API (GPT-based)
        ↓
Prompt Engineering Layer
        ↓
Response Generation
```

#### Interaction Modes
1. **Chat Mode**: Text-based conversation
2. **Talk Mode**: Voice input (future enhancement)

#### Prompt Design
- **System Role**: Empathetic mental health companion
- **Tone**: Non-judgmental, supportive, professional
- **Safety**: Crisis detection and resource referral
- **Privacy**: No data persistence, session-based

#### UI Design
- **Calming Aesthetics**: Soft gradients, nature-inspired colors
- **Minimal Distractions**: Clean, focused interface
- **Accessibility**: High contrast, readable fonts

### 3.6 Query Portal

#### Purpose
Bidirectional communication system between users and healthcare administrators.

#### Architecture
- **Backend**: Node.js + Express
- **Database**: MySQL with relational schema
- **Frontend**: Vanilla JavaScript with fetch API

#### Message Threading System
```sql
queries (query_id, user_id, message, status, created_at)
query_messages (id, query_id, sender, sender_id, message, sent_at)
```

#### Status Flow
```
OPEN → User creates query
    ↓
REPLIED → Admin responds
    ↓
CLOSED → Query resolved (future)
```

#### API Design
```
POST   /api/queries          - Create new query
GET    /api/queries/:userId  - Get user's queries
GET    /api/queries          - Get all queries (admin)
POST   /api/messages         - Send message
GET    /api/messages/:queryId - Get thread
DELETE /api/queries/:queryId - Delete query
POST   /api/reply            - Admin quick reply
```

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
users ──┬─< appointments
        ├─< medicine_booking
        ├─< medicine_price_request
        └─< queries ──< query_messages

admins (separate authentication)
medicine_fare (reference table)
```

### 4.2 Key Relationships
- **One-to-Many**: User → Appointments, Bookings, Queries
- **One-to-Many**: Query → Messages (threading)
- **Reference**: Medicine Fare (lookup table)

### 4.3 Indexing Strategy
- Primary keys: Auto-increment integers
- Foreign keys: user_id, query_id
- Unique constraints: mobile numbers
- Timestamps: created_at, sent_at

## 5. UI/UX Design Principles

### 5.1 Design Language

#### Color Palette
- **Primary**: #0077ff (Trust, Healthcare)
- **Secondary**: #00b4ff (Calm, Technology)
- **Success**: #48c9b0 (Healing, Growth)
- **Warning**: #d9534f (Urgency, Attention)
- **Neutral**: #f5f8fb (Clean, Professional)

#### Typography
- **Primary Font**: Arial, sans-serif
- **Headings**: 22-36px, bold (700)
- **Body**: 15-16px, medium (500)
- **Labels**: 14px, regular (400)

#### Spacing System
- **Base Unit**: 8px
- **Component Padding**: 24-32px
- **Section Gaps**: 60px
- **Card Spacing**: 40px

### 5.2 Component Design

#### Navigation Bar
- **Height**: 70px
- **Background**: White with subtle shadow
- **Logo**: Left-aligned, blue (#0077ff)
- **Menu**: Right-aligned, horizontal
- **Login Button**: Outlined, rounded (20px)
