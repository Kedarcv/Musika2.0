# Musika Food Delivery

A full-stack food delivery application with multiple user roles and real-time order tracking.

## Developers

-Developed by BroCode 
                        - Munyaradzi Namailinga
                        - Michael M. Nkomo
                        - Neil Choeni

## Features

### User App
- Browse restaurants and menus
- Place orders with real-time tracking
- Cart management
- Order history
- Restaurant ratings and reviews
- Favorite restaurants

### Restaurant App
- Menu management
- Order management
- Business analytics
- Profile management
- Real-time order notifications

### Rider App
- Real-time order assignments
- Location tracking
- Earnings management
- Delivery history
- Status management

### Admin Panel
- User management
- Restaurant management
- Rider management
- System analytics
- Performance monitoring

## Tech Stack

### Frontend
- React.js
- Material-UI
- Redux Toolkit
- React Router
- Socket.IO Client
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install backend dependencies
```bash
npm install
```

3. Install frontend dependencies
```bash
cd frontend
npm install
```

4. Set up environment variables
Create a .env file in the root directory with:
```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

5. Run the development server
```bash
# Run backend
npm run server

# Run frontend
cd frontend
npm run dev
```

## Project Structure

```
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── store/
│       └── theme/
└── package.json
```

## API Documentation

### Authentication Routes
- POST /api/users/register
- POST /api/users/login
- POST /api/restaurants/register
- POST /api/restaurants/login
- POST /api/riders/register
- POST /api/riders/login
- POST /api/admin/login

### User Routes
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/orders
- POST /api/users/favorites
- GET /api/users/favorites

### Restaurant Routes
- GET /api/restaurants/profile
- PUT /api/restaurants/profile
- GET /api/restaurants/menu
- PUT /api/restaurants/menu
- GET /api/restaurants/orders
- GET /api/restaurants/analytics

### Rider Routes
- GET /api/riders/profile
- PUT /api/riders/profile
- GET /api/riders/active-order
- PUT /api/riders/location
- GET /api/riders/earnings

### Admin Routes
- GET /api/admin/users
- GET /api/admin/restaurants
- GET /api/admin/riders
- PUT /api/admin/restaurants/:id/status
- PUT /api/admin/riders/:id/status
- GET /api/admin/analytics

### Order Routes
- POST /api/orders
- GET /api/orders/:id
- PUT /api/orders/:id/status
- GET /api/orders
- PUT /api/orders/:id/cancel
- POST /api/orders/:id/rate

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
