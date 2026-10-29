import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VehicleInformation from './pages/VehicleInformation';
import BookSlot from './pages/BookSlot';
import ReleaseSlot from './pages/ReleaseSlot';
import ClickSpark from './components/ClickSpark';

export default function App() {
  return (
    <ClickSpark sparkColor="#75CDB5">
      <Router>
        <Routes>
          {/* Landing Page (Completed, preserved untouched) */}
          <Route path="/" element={<Home />} />

          {/* Common Vehicle Information Entry Points */}
          <Route path="/book" element={<VehicleInformation flow="book" />} />
          <Route path="/release" element={<VehicleInformation flow="release" />} />
          <Route path="/vehicle-info" element={<VehicleInformation />} />

          {/* Book Slot Flow: Parking Dashboard */}
          <Route path="/dashboard" element={<BookSlot />} />
          <Route path="/book-slot" element={<BookSlot />} />

          {/* Release Slot Flow: Fee / Release Page */}
          <Route path="/release-fee" element={<ReleaseSlot />} />
          <Route path="/fee" element={<ReleaseSlot />} />
          <Route path="/release-slot" element={<ReleaseSlot />} />
        </Routes>
      </Router>
    </ClickSpark>
  );
}
