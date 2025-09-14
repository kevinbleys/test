import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// ✅ CORRECTED: Import jouw exacte bestandsnamen
import Home from './components/Home'; // ✅ Home.jsx (niet HomePage.jsx)
import MemberPage from './components/MemberPage';
import NonMemberForm from './components/NonMemberForm';
// ✅ NEW COMPONENTS for returning visitor flow
import ReturningVisitorChoice from './components/ReturningVisitorChoice';
import ReturningVisitorForm from './components/ReturningVisitorForm';
// Existing components
import LevelPage from './components/LevelPage';
import AssurancePage from './components/AssurancePage';
import PaymentPage from './components/PaymentPage';
// ✅ CORRECTED: Import jouw Styles.css (niet App.css)
import './Styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/member" element={<MemberPage />} />

          {/* ✅ NEW: Returning visitor flow routes */}
          <Route path="/visitor-choice" element={<ReturningVisitorChoice />} />
          <Route path="/returning-visitor-form" element={<ReturningVisitorForm />} />

          {/* Existing non-member flow */}
          <Route path="/non-member" element={<NonMemberForm />} />
          <Route path="/niveau" element={<LevelPage />} />
          <Route path="/assurance" element={<AssurancePage />} />
          <Route path="/paiement" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;