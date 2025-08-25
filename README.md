# StudyTracker - Smart Focus Timer

A modern, intelligent focus timer that uses webcam face detection to automatically track your study and work sessions. Built with React, TypeScript, and face-api.js.

## ✨ Features

### 🎯 Core Functionality
- **Smart Face Detection**: Automatically detects when you're present at your desk using your webcam
- **Auto-Start Sessions**: Begins focus timer when you're detected (configurable)
- **Auto-Pause**: Pauses timer when you leave your chair
- **Manual Controls**: Full manual control over start, pause, resume, and end sessions
- **Break Tracking**: Automatically tracks breaks when you're away

### 📊 Comprehensive Statistics
- **Real-time Dashboard**: Live view of current session and overall progress
- **Daily/Weekly/Monthly Stats**: Track your focus time across different time periods
- **Streak Tracking**: Monitor consecutive days of focus sessions
- **Productivity Score**: AI-powered productivity scoring based on your patterns
- **Session Analytics**: Average session length, total sessions, and more

### 🏆 Achievement System
- **Milestones**: Unlock achievements for time milestones (1h, 5h, 10h, etc.)
- **Session Milestones**: Rewards for completing multiple sessions
- **Streak Achievements**: Special rewards for maintaining daily streaks
- **Progress Tracking**: Visual progress bars for all milestones

### ⚙️ Smart Settings
- **Auto Features**: Configure auto-start and auto-pause behavior
- **Break Reminders**: Get gentle alerts when away for too long
- **Notifications**: Browser notifications for important events
- **Theme Support**: Light, dark, and auto themes
- **Data Management**: Export and backup your progress data

### 🎨 Modern UI/UX
- **Clean Design**: Beautiful, modern interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop and tablet
- **Real-time Updates**: Live webcam feed with face detection overlay
- **Intuitive Controls**: Easy-to-use timer controls and navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser with webcam support
- Webcam for face detection features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studytracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Download face detection models**
   ```bash
   node download-models.js
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### First Time Setup

1. **Enable Webcam**: Click the "Webcam Off" button in the header to enable face detection
2. **Grant Permissions**: Allow camera access when prompted
3. **Position Yourself**: Sit in front of your webcam for optimal face detection
4. **Start Focusing**: The app will automatically detect when you're present and can auto-start sessions

## 🎮 How to Use

### Basic Timer Usage
1. **Manual Mode**: Click "Start Focus" to begin a session manually
2. **Auto Mode**: Enable webcam and auto-start in settings for automatic session management
3. **Pause/Resume**: Use the pause button to take breaks, resume to continue
4. **End Session**: Click "End" to finish and save your session

### Face Detection Features
- **Presence Detection**: The app detects when you're sitting at your desk
- **Away Detection**: Automatically pauses when you leave (configurable)
- **Break Tracking**: Records breaks when you're away from your desk
- **Confidence Display**: Shows detection confidence percentage

### Statistics & Progress
- **Real-time Stats**: View your current session and daily progress
- **Historical Data**: Access detailed statistics in the Stats tab
- **Achievements**: Track milestones and unlock achievements
- **Productivity Insights**: Get personalized productivity recommendations

## ⚙️ Configuration

### Auto Features
- **Auto-Start**: Automatically begin sessions when face is detected
- **Auto-Pause**: Pause sessions when no face is detected
- **Break Reminders**: Get notified when away for extended periods

### Notifications
- **Session Events**: Notifications for session start/end
- **Break Alerts**: Reminders when away for too long
- **Achievement Unlocks**: Celebrate milestone achievements

### Data Management
- **Local Storage**: All data is stored locally in your browser
- **Export Data**: Backup your progress to JSON files
- **Clear Data**: Reset all progress (use with caution)

## 🛠️ Technical Details

### Built With
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Smooth animations and transitions
- **face-api.js**: Lightweight face detection library
- **date-fns**: Modern date utility library
- **Lucide React**: Beautiful icon library

### Architecture
- **Service Layer**: Separated business logic in service classes
- **Component Structure**: Modular, reusable components
- **State Management**: React hooks for local state
- **Local Storage**: Persistent data storage
- **Real-time Updates**: Live timer and detection updates

### Face Detection
- **Tiny Face Detector**: Fast, lightweight face detection
- **Face Landmarks**: 68-point facial landmark detection
- **Real-time Processing**: 100ms detection intervals
- **Confidence Scoring**: Reliable detection with confidence metrics

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Face detection requires HTTPS in production or localhost for development.

## 🔒 Privacy & Security

- **Local Processing**: All face detection happens locally in your browser
- **No Cloud Storage**: Your data never leaves your device
- **Camera Access**: Webcam is only used for face detection
- **Data Export**: Full control over your data with export functionality

## 🚧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── TimerDisplay.tsx
│   ├── WebcamView.tsx
│   ├── StatsDashboard.tsx
│   ├── MilestonesPanel.tsx
│   └── SettingsPanel.tsx
├── services/           # Business logic
│   ├── timerService.ts
│   └── faceDetection.ts
├── types/             # TypeScript interfaces
│   └── index.ts
├── App.tsx            # Main app component
└── index.tsx          # App entry point
```

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `node download-models.js`: Download face detection models

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🎯 Roadmap

### Planned Features
- [ ] Pomodoro timer integration
- [ ] Focus music/sounds
- [ ] Distraction blocking
- [ ] Cloud sync (optional)
- [ ] Mobile app
- [ ] Team focus sessions
- [ ] Advanced analytics
- [ ] Custom milestones

### Known Issues
- Face detection may be less accurate in low light
- Some browsers may require HTTPS for camera access
- Large model files (~10MB) need to be downloaded initially

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) for face detection
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

---

**Happy Focusing! 🎯✨**
