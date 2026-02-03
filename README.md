# TripTailor

A website for generating trip itineraries and finding trips to go on.

## Project Structure

```
Trip-Tailor/
├── app/                    # Next.js app directory (pages and layouts)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── backend/               # Flask backend API
│   ├── app/
│   ├── requirements.txt
│   └── run.py
├── frontend/              # (Reserved for future organization)
├── package.json           # Next.js dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── postcss.config.js      # PostCSS configuration
```

## Getting Started

### Frontend (Next.js)

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend (Flask)

See `backend/README.md` for backend setup instructions.
