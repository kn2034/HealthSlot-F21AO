# HealthSlot F21AO

A robust health management system for managing patients, appointments, lab tests, and more.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourUsername/healthslot-f21ao.git
   cd healthslot-f21ao
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual configuration values.

4. Start the development server:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

Once the server is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api-docs
```

## Features

- User Authentication and Authorization
- Patient Management
- Ward Management
- Lab Test Management
- Test Results Management
- Admission and Discharge Management
- Audit Logging

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.