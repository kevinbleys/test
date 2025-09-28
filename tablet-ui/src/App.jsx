import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import MemberCheck from './components/MemberCheck';
import NonMemberTypePage from './components/NonMemberTypePage';
import NonMemberForm from './components/NonMemberForm';
import QuickNonMemberPage from './components/QuickNonMemberPage';
import LevelPage from './components/LevelPage';
import AssurancePage from './components/AssurancePage';
import ReglementPage from './components/ReglementPage';
import PaymentPage from './components/PaymentPage';
import Confirmation from './components/Confirmation';
import './styles/Styles.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/members" element={<MemberCheck />} />
        <Route path="/non-member-type" element={<NonMemberTypePage />} />
        <Route path="/non-member" element={<NonMemberForm />} />
        <Route path="/quick-non-member" element={<QuickNonMemberPage />} />
        <Route path="/niveau" element={<LevelPage />} />
        <Route path="/assurance" element={<AssurancePage />} />
        <Route path="/reglement" element={<ReglementPage />} />
        <Route path="/paiement" element={<PaymentPage />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
}