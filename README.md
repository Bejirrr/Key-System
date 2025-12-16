# Roblox Key System API

## 🚀 Quick Start

### 1. Clone & Setup
git clone <your-repo>
cd roblox-key-system
npm install

### 2. Deploy to Vercel
vercel login
vercel --prod

### 3. Set Environment Variables
vercel env add SECRET_KEY

### 4. Access Your API
- Landing Page: https://your-project.vercel.app
- API Docs: https://your-project.vercel.app/api
- Get Key: https://your-project.vercel.app/api/getkey
- Validate: https://your-project.vercel.app/api/validate

## 📁 Project Structure
roblox-key-system/
├── public/
│   └── index.html          # Landing page
├── api/
│   ├── index.js            # API documentation endpoint
│   ├── getkey.js           # Key generation endpoint
│   └── validate.js         # Key validation endpoint
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── .env                    # Environment variables

## 🔧 Configuration

Environment variables needed:
- SECRET_KEY: Your secret key for hashing

## 📖 API Documentation

Visit `/api` endpoint for full API documentation

## 🔒 Security Features
- Rate limiting
- Key expiration
- HWID verification
- Timestamp validation
- CORS protection
