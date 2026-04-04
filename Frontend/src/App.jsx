import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import GuestJoin from './pages/GuestJoin';
import Layout from './components/Layout';
import FAQPage from './pages/FAQPage';

import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          {/* 1. Navbar ko Router ke andar hona chahiye taaki Links kaam karein */}
          <Navbar /> 
          
          <Routes>
            {/* UNIVERSAL ROUTES */}
            <Route path='/' element={<Layout><LandingPage /></Layout>} />
            <Route path='/guest-join' element={<Layout><GuestJoin /></Layout>} />

            {/* 2. FAQ Page ko bhi Layout mein wrap karo taaki Navbar constant rahe */}
            <Route path="/support" element={<Layout><FAQPage /></Layout>} />

            {/* PUBLIC ONLY ROUTES */}
            <Route path='/auth' element={<PublicRoute><Layout><Authentication /></Layout></PublicRoute>} />

            {/* PROTECTED ROUTES */}
            <Route path='/home' element={<ProtectedRoute><Layout><HomeComponent /></Layout></ProtectedRoute>} />
            <Route path='/history' element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />
            
            {/* MIXED/UNIVERSAL ROUTES (No Layout if you want full screen meeting) */}
            <Route path='/meeting/:meetingCode' element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;