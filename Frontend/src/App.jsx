import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import GuestJoin from './pages/GuestJoin';
import Layout from './components/Layout';

import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            {/* PUBLIC ONLY ROUTES */}
            <Route path='/' element={<PublicRoute><Layout><LandingPage /></Layout></PublicRoute>} />
            <Route path='/auth' element={<PublicRoute><Layout><Authentication /></Layout></PublicRoute>} />
            <Route path='/guest-join' element={<Layout><GuestJoin /></Layout>} />

            {/* PROTECTED ROUTES */}
            <Route path='/home' element={<ProtectedRoute><Layout><HomeComponent /></Layout></ProtectedRoute>} />
            <Route path='/history' element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
            
            {/* MIXED/UNIVERSAL ROUTES */}
            <Route path='/meeting/:meetingCode' element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;