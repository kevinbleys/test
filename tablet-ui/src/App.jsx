import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import MemberCheck from './components/MemberCheck';
import NonMemberForm from './components/NonMemberForm';
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
        <Route path="/member-check" element={<MemberCheck />} />
        <Route path="/non-member" element={<NonMemberForm />} />
        <Route path="/niveau" element={<LevelPage />} />
        <Route path="/assurance" element={<AssurancePage />} />
        <Route path="/reglement" element={<ReglementPage />} />
        <Route path="/paiement" element={<PaymentPage />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Router>
  );
}
