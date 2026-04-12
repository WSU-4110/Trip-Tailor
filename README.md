# TripTailor

TripTailor is a travel planning platform that generates personalized day-by-day itineraries based on your preferences, budget, and travel style. Users answer a short questionnaire and receive a fully customized trip itinerary with real activities sourced from Google Places and Yelp.

## Features

- **Smart Itinerary Generation** — Scoring and ranking engine that selects activities based on user preferences, budget, group size, accessibility needs, and activity type
- **Live Place Ingestion** — Automatically fetches and seeds real activity data from Google Places and Yelp Fusion APIs on demand
- **Edit Mode** — Drag and drop to reorder activities within and across days, swap activities with recommendations, add custom activities, and delete items
- **Activity Details** — Ratings, review counts, cost estimates, duration, badges (family friendly, accessible, ticket required, etc.), address, phone, and maps links
- **Notes** — Add personal notes to any activity in an itinerary
- **User Authentication** — Register, log in, and manage saved trips

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Flask (Python) |
| Database | PostgreSQL |
| Activity Data | Google Places API, Yelp Fusion API |
| Auth | JWT (Flask-JWT-Extended), bcrypt |
| Drag & Drop | dnd-kit |

## Project Structure

The frontend is a Next.js app in the root `/app` directory. The backend is a Flask API in `/backend`, organized into `clients` (API integrations), `repositories` (database layer), `routes` (API endpoints), and `services` (business logic including the trip generation engine). Shared frontend utilities live in `/lib` and `/components`.

## Contributors

| Name | Role |
|---|---|
| Anderson Colburn | System Architect: Backend Design, API Integration, Database Design, Full-Stack Integration |
| Nathaniel Meszaros | Backend Developer: Authentication Systems, User Management, Front-end Integration |
| Raka Farhan | Full-Stack Developer: User Experience, Questionnaire Design and Implementation |
| Hayden Perron | Full-Stack Support: Feature Design, Bug Fixes, Documentation |
| Muqtasid Choudary | Frontend Developer: UI Design and Implementation |
| Abdu Abu-kaud | Frontend Developer: UI Design and Implementation |

## Course

Software Engineering — Wayne State Univeristy — Winter 2026