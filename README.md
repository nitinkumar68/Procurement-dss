# ProcureSmart DSS

**ProcureSmart DSS** (Decision Support System) is an enterprise-grade web application designed to help procurement teams evaluate parameters and receive AI-powered strategic recommendations for sourcing models. It acts as an intelligent copilot, analyzing supplier density, timelines, and budgets to recommend optimal procurement strategies like Reverse Auctions or Direct Negotiations, complete with formal corporate justifications.

## ✨ Features

- **Enterprise Authentication**: Secure Microsoft Azure Active Directory SSO and Email/Password login.
- **Dynamic Assessment Wizard**: A clean, multi-step interface for capturing key procurement parameters (Supplier Density, Allocation Timeline, Material Classification, Budget, Pricing Matrix, and Share of Business).
- **AI Copilot Justification Engine**: Integrates with OpenAI (or Azure OpenAI) to generate formal, strategic, board-ready justifications for the recommended procurement model. 
- **Rule-Based Evaluation Engine**: Deterministic logic that securely maps user inputs to standard procurement models (English, Dutch, Japanese Reverse Auctions, or Sole-Source Negotiation).
- **PDF Export**: Instant generation of structured, stylized PDF summaries of the AI evaluation using `jsPDF`.
- **Assessment History**: Tracks and logs previous strategy assessments and user feedback/ratings.
- **Graceful Degradation**: Fully functional offline fallback with heuristic-based reasoning if the AI provider or Database is unavailable.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL (via `pg`)
- **Validation**: Zod
- **AI Integration**: OpenAI SDK (supports standard OpenAI and Azure OpenAI endpoints)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally or remotely
- OpenAI API Key (or Azure OpenAI endpoint)

### 1. Database Setup
Create a PostgreSQL database named `procuresmart`:
```sql
CREATE DATABASE procuresmart;
```
*(Ensure the necessary tables `assessments` and `feedback` are created according to your schema)*

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables.
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/procuresmart

# OpenAI / Azure OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Uncomment below if using Azure OpenAI
# AZURE_OPENAI_KEY=your-azure-key
# AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE.openai.azure.com/
# AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```
Start the backend server:
```bash
npm run dev
# or
npm start
```

### 3. Frontend Setup
Navigate to the frontend directory, install dependencies, and run the development server.
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port specified by Vite).

## 🧠 AI Justification Details

The AI engine uses a highly constrained system prompt to enforce a corporate tone and prevent hallucination. It runs over `gpt-4o-mini` by default (for high speed and cost-efficiency) and uses structured JSON output to guarantee a safely parsable response for the frontend.

## 📄 License
[MIT](LICENSE)
