# SwiftKwacha

SwiftKwacha is a modern digital wallet application designed for seamless money management. Built with .NET Core and React, it provides a secure and user-friendly platform for digital transactions.

![SwiftKwacha](https://via.placeholder.com/800x400?text=SwiftKwacha+Digital+Wallet)

## Features

### Authentication & Security
- JWT-based authentication system
- Secure user registration and login
- Protected routes and endpoints
- Password hashing with BCrypt
- CORS configuration for secure client-server communication

### Wallet Management
- Digital wallet creation for each user
- Real-time balance tracking
- Multiple transaction types:
  - Deposits
  - Withdrawals
  - User-to-user transfers
- Comprehensive transaction history

### User Interface
- Modern, responsive design
- Zambian-themed color scheme (green and orange)
- Adaptive layout for all screen sizes
- Interactive components with Material-UI

### Dashboard
- Welcome message with username
- Current balance display
- Quick action buttons
- Recent transactions list
- Transaction form with validation

### Transactions Page
- Comprehensive transaction history
- Transaction type indicators with color coding
- Amount formatting with currency
- Responsive layouts:
  - Table view on desktop
  - Card view on mobile

## Technology Stack

### Backend
- .NET Core 6.0
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- RESTful API design

### Frontend
- React 18
- TypeScript
- Material-UI
- Formik & Yup for form validation
- Axios for API communication

## Prerequisites

Before you begin, ensure you have the following installed:
- [.NET 6.0 SDK](https://dotnet.microsoft.com/download/dotnet/6.0)
- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (v6 or later)
- [PostgreSQL](https://www.postgresql.org/download/) (v13 or later)

## Installation

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/KumbuyoX64/swiftKwacha.git
   cd swiftKwacha
   ```

2. Navigate to the API project:
   ```bash
   cd SwiftKwacha.Api
   ```

3. Update the database connection string in `appsettings.json` to match your PostgreSQL configuration:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Database=swiftkwacha;Username=your_username;Password=your_password"
   }
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the API:
   ```bash
   dotnet run
   ```
   The API will be available at `https://localhost:7000` and `http://localhost:5000`.

### Frontend Setup

1. Navigate to the client project:
   ```bash
   cd ../swiftkwacha-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in `src/services/api.ts` if needed.

4. Start the development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

## Usage

### Registration and Login
1. Create a new account using the Register page
2. Log in with your credentials

### Managing Your Wallet
1. View your current balance on the Dashboard
2. Make deposits, withdrawals, or transfers using the transaction form
3. View your transaction history on the Transactions page

## Screenshots

### Login Page
![Login Page](https://via.placeholder.com/600x300?text=Login+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/600x300?text=Dashboard)

### Transactions
![Transactions](https://via.placeholder.com/600x300?text=Transactions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Material-UI](https://mui.com/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [JWT Authentication](https://jwt.io/)
