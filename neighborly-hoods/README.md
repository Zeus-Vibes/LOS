# LOS - Local Online Shop

A neighborhood marketplace connecting local shops with customers.

## Features

- Browse local shops and products
- Real-time cart and checkout
- Order tracking and management
- Shopkeeper dashboard with analytics
- Admin dashboard for platform management
- Customer reviews and feedback system

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Django REST Framework
- **Database**: SQLite (development)

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.x

### Frontend Setup

```bash
cd neighborly-hoods
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Project Structure

```
├── neighborly-hoods/     # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── contexts/     # React contexts
│   └── ...
├── backend/              # Django backend
│   ├── accounts/         # User authentication
│   ├── shops/            # Shop and product management
│   ├── orders/           # Order management
│   └── ...
└── README.md
```

## License

MIT
