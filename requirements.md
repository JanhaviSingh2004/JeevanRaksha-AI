# Project Requirements

## Overview
This is a comprehensive healthcare management system consisting of multiple integrated services for rural and urban healthcare delivery. The system includes disease diagnosis, appointment booking, medicine ordering, medical report translation, mental health support, and query management.

## System Architecture

### Services
1. **Jeevan Raksha** (Main Portal) - Port 5000
2. **ArogyaMitra** (Disease Diagnosis) - Port 5001
3. **MediLingo** (Medical Report Translation) - Port 5002
4. **Medicine Booking** - Port 5003
5. **QuietSpace** (Mental Health Support) - Port 5004
6. **Query Portal** (Backend) - Port 3001

## Technology Stack

### Backend
- Python 3.8+
- Flask (Web Framework)
- Node.js 14+ (for Query Portal)
- Express.js

### Database
- MySQL 8.0+
  - Database name: `jeevan_raksha`
  - Default credentials: root/root (configure as needed)

### Machine Learning & NLP
- Transformers (Hugging Face)
- scikit-learn
- pandas

### Frontend
- HTML5, CSS3, JavaScript
- Vanilla JS (no framework dependencies)

## Python Dependencies

### Core Dependencies
```
flask>=2.0.0
flask-cors>=3.0.0
mysql-connector-python>=8.0.0
pandas>=1.3.0
```

### ML & NLP Libraries
```
transformers>=4.0.0
torch>=1.9.0
scikit-learn>=0.24.0
```

### Translation & Text Processing
```
deep-translator>=1.9.0
PyPDF2>=2.0.0
python-docx>=0.8.11
pytesseract>=0.3.8
pdf2image>=1.16.0
Pillow>=8.0.0
```

### AI Integration
```
openai>=1.0.0
```

## Node.js Dependencies

### Query Portal Backend
```json
{
  "cors": "^2.8.5",
  "express": "^5.2.1",
  "mysql2": "^3.16.1"
}
```

## System Requirements

### Windows-Specific Requirements
1. **Tesseract OCR**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Default installation path: `C:\Program Files\Tesseract-OCR\tesseract.exe`
   - Required for MediLingo OCR functionality

2. **Poppler**
   - Required for PDF to image conversion
   - Download from: https://github.com/oschwartz10612/poppler-windows/releases
   - Configure path in MediLingo app.py

### Database Setup

#### Required Tables
```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile VARCHAR(10) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    department VARCHAR(100) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Medicine booking table
CREATE TABLE medicine_booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    medicine VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    doctor VARCHAR(255),
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'Pending',
    price_per_unit DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Medicine price request table
CREATE TABLE medicine_price_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    medicine VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    doctor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Medicine fare table
CREATE TABLE medicine_fare (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queries table (for Query Portal)
CREATE TABLE queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    query TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Data Files Required

### ArogyaMitra
- `village_health_dataset.csv` - Disease symptoms and treatment data
- `severity_model.pkl` - Pre-trained severity classification model
- `vectorizer.pkl` - Text vectorizer for ML model
- `dataset.csv`, `final.csv`, `care_guidelines.csv`, `disease_medicine.csv` - Supporting datasets

## Installation Instructions

### 1. Python Environment Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install flask flask-cors mysql-connector-python pandas transformers torch scikit-learn deep-translator PyPDF2 python-docx pytesseract pdf2image Pillow openai
```

### 2. Node.js Setup
```bash
cd query_portal/backend
npm install
```

### 3. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE jeevan_raksha;

# Run table creation scripts (see Database Setup section)
```

### 4. External Tools
- Install Tesseract OCR (Windows)
- Install Poppler for PDF processing
- Configure paths in respective application files

### 5. Configuration
- Update MySQL credentials in all app.py files
- Configure Tesseract and Poppler paths in MediLingo/app.py
- Set OpenAI API key for QuietSpace (if using)

## Running the Application

### Start All Services
```bash
# Terminal 1 - Main Portal
cd jeevan_raksha
python app.py

# Terminal 2 - ArogyaMitra
cd ArogyaMitra
python app.py

# Terminal 3 - MediLingo
cd MediLingo
python app.py

# Terminal 4 - Medicine Booking
cd medicine_booking
python app.py

# Terminal 5 - QuietSpace
cd quietspace/backend
python app.py

# Terminal 6 - Query Portal
cd query_portal/backend
npm start
```

### Access Points
- Main Portal: http://localhost:5000
- ArogyaMitra: http://localhost:5001
- MediLingo: http://localhost:5002
- Medicine Booking: http://localhost:5003
- QuietSpace: http://localhost:5004
- Query Portal: http://localhost:3001

## Features

### 1. Jeevan Raksha (Main Portal)
- User registration and authentication
- Admin panel
- Service routing and integration
- Session management
- Role-based access control

### 2. ArogyaMitra
- Symptom-based disease detection
- Multi-language support (English, Hindi)
- Medicine recommendations
- Care guidelines
- Duration-based severity assessment
- Safety override for prolonged symptoms

### 3. MediLingo
- Medical report translation
- Support for PDF, DOCX, TXT files
- OCR for scanned documents
- Multi-language output (English, Hindi, Punjabi)
- AI-powered summarization

### 4. Medicine Booking
- Medicine order placement
- Price inquiry system
- Admin fare management
- Delivery tracking
- Order history

### 5. QuietSpace
- Mental health chatbot
- AI-powered responses
- Conversational interface
- Privacy-focused design

### 6. Query Portal
- User query submission
- Admin query management
- Response tracking
- Status updates

## Security Considerations
- Password hashing (SHA-256)
- Session management
- Mobile number validation
- SQL injection prevention (parameterized queries)
- Role-based access control
- Secure file upload handling

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Known Limitations
- Tesseract and Poppler paths are Windows-specific
- ML model loading may take time on first run
- Requires stable internet for translation services
- OpenAI API key required for QuietSpace functionality

## Future Enhancements
- Docker containerization
- Cloud deployment
- Mobile application
- Real-time notifications
- Payment gateway integration
- Telemedicine video consultation
- Electronic health records (EHR)
