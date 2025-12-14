# BoloSign Prototype

This is a **Role-Based Prototype** for a legal e-signature system.

## Setup & Run

### Prerequisites
- Node.js installed.
- MongoDB (optional, defaults to `mongodb://localhost:27017/bolosign`).

### 1. Backend (Terminal 1)
```bash
cd server
npm install
node generatePdf.js # Generates the sample PDF
node index.js
```
Server runs on **http://localhost:5000**.

### 2. Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Client runs on **http://localhost:5173**.

## Architecture & Coordinate Logic

### Coordinate Normalization
All fields are stored as **percentage values (0-1)** relative to the PDF rendering.
- `xPct = x / pdfRenderWidth`
- `yPct = y / pdfRenderHeight`

This ensures that regardless of the screen size (Desktop vs Mobile), the fields remain proportionally positioned over the correct text.

### Burn-in Logic
The backend converts these normalized coordinates back to PDF points (72 DPI).
- **Y-Axis Flip**: Accounts for Browser (Top-Left) vs PDF (Bottom-Left) origin differences.
- **Aspect Ratio**: Ensures the signature image scales to fit the box without stretching, maintaining its original aspect ratio.
- **Security**: Hashes the original and signed document for audit trails.

## Verification
1. Open the UI.
2. Drag "Add Signature" to the line.
3. Resize the window to mobile size -> Verify signature stays on line (relative).
4. Click "Finish & Sign" -> Downloads PDF.
5. Open PDF -> Verify signature is burned in correctly.

## Explicit Assumptions
- **Single Page Workflow**: The current prototype loads a single-page sample PDF. The data model supports `pageNumber`, but the UI renders only the first page.
- **Single Signer**: The system is designed for a single session/user.
- **Field Types**: Frontend API supports 'signature' and 'text', but the backend `sign-pdf` endpoint currently optimizes for a primary signature field burn-in.
- **PDF Origin**: We assume standard PDF coordinate system (Bottom-Left origin).
