# Wellness Wave - Fitness Tracker

A comprehensive web-based fitness tracking application that helps users monitor their health journey through BMI calculations, workout tracking, diet planning, and progress visualization.

## Features

- **User Authentication**: Secure login and registration system with password hashing
- **BMI Calculator**: Calculate and track your Body Mass Index
- **Workout Tracker**: Log and monitor gym sessions and exercises
- **Diet Planner**: Plan and track your meals and nutrition
- **Training Programs**: Access various workout routines and training plans
- **Progress Dashboard**: Visualize your fitness journey with charts and statistics
- **Session Management**: Secure user sessions with Express Session

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- A modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/fitness-tracker.git
   cd fitness-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
fitness-tracker/
│
├── server.js              # Express server and API routes
├── package.json           # Project dependencies
├── package-lock.json      # Locked versions of dependencies
│
├── index.html             # Login/Registration page
├── face.html              # Main dashboard
├── home.html              # Home page
├── bmi.html               # BMI Calculator
├── gym.html               # Workout tracker
├── diet.html              # Diet planner
├── progress.html          # Progress tracking
├── training-programs.html # Training programs
│
└── data/                  # User data storage (auto-generated)
    ├── users.json         # User accounts
    └── entries/           # User workout/diet entries
```

## Technologies Used

### Backend
- **Express.js** - Web application framework
- **bcryptjs** - Password hashing for security
- **express-session** - Session management
- **body-parser** - Parse incoming request bodies
- **cors** - Enable CORS for cross-origin requests

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with modern animations
- **JavaScript (ES6+)** - Client-side functionality
- **Google Fonts (Poppins)** - Typography

## Security Features

- Password hashing using bcryptjs
- Secure session management
- HTTP-only cookies
- Protected API routes with authentication middleware
- Input validation and sanitization

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Check authentication status

### User Data
- `GET /api/entries/:username` - Get user entries
- `POST /api/entries/:username` - Save user entries

## Features in Detail

### 1. Authentication System
- Modern, gradient-based UI
- Secure password handling
- Session persistence
- Automatic redirection for authenticated users

### 2. BMI Calculator
- Real-time BMI calculation
- Health category classification
- Visual feedback with color coding

### 3. Workout Tracker
- Log exercises with sets, reps, and weights
- Track workout duration
- Exercise history

### 4. Diet Planner
- Meal planning interface
- Calorie tracking
- Nutrition monitoring

### 5. Progress Dashboard
- Visual charts and graphs
- Historical data tracking
- Performance metrics

## Configuration

### Port Configuration
The default port is `3000`. To change it, modify the `PORT` constant in `server.js`:
```javascript
const PORT = 3000; // Change this value
```

### Session Secret
For production, change the session secret in `server.js`:
```javascript
secret: 'your-secure-secret-key-here'
```

## Deployment

### Local Deployment
1. Ensure all dependencies are installed
2. Run `node server.js`
3. Access via `http://localhost:3000`

### Production Deployment
1. Set `NODE_ENV` to `production`
2. Update CORS settings for your domain
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js
   ```
4. Configure a reverse proxy (Nginx/Apache)
5. Enable HTTPS with SSL certificates

## Usage

1. **Register**: Create a new account on the registration tab
2. **Login**: Sign in with your credentials
3. **Dashboard**: Access your personalized fitness dashboard
4. **Track**: Log workouts, meals, and monitor progress
5. **Analyze**: View your progress through charts and statistics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Future Enhancements

- Mobile app integration
- Social features (friends, sharing workouts)
- Integration with fitness wearables
- Advanced analytics and AI recommendations
- Meal photo recognition
- Custom workout builder
- Export data functionality

---

**Stay consistent! 💪 Built with 💙**
