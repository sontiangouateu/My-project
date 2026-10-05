import React from 'react'; 
import "./index.css";    
import Header from './header.jsx';
import CaregiverList from './pages/CaregiverList';
import BookingPage from './pages/BookingPage';
import CancelBooking from "./pages/CancelBooking";

import { Routes, Route } from 'react-router-dom'; 

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<CaregiverList />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/cancel/:id" element={<CancelBooking />} />
      </Routes>
    </div>

  );
}

export default App;
