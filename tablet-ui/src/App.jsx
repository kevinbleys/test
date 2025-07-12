import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import MemberCheck from './components/MemberCheck';
import ConfirmationScreen from './components/ConfirmationScreen';
import ErrorScreen from './components/ErrorScreen';
import NonMemberForm from './components/NonMemberForm';
import NonMemberConfirmation from './components/NonMemberConfirmation';
import NonMemberAdmin from './components/NonMemberAdmin';
import PaymentSelection from './components/PaymentSelection';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/member-check" element={<MemberCheck />} />
        <Route path="/confirmation" element={<ConfirmationScreen />} />
        <Route path="/error" element={<ErrorScreen />} />
        <Route path="/non-member" element={<NonMemberForm />} />
        <Route path="/payment-selection" element={<PaymentSelection />} />
        <Route path="/non-member-confirmation" element={<NonMemberConfirmation />} />
        <Route path="/admin/non-members" element={<NonMemberAdmin />} />
      </Routes>
    </Router>
  );
}
