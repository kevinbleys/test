import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ KEEP: Dynamic API URL detection (WORKING!)
const getApiBaseUrl = () => {
 const hostname = window.location.hostname;
 const protocol = window.location.protocol;

 if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
 return `${protocol}//${hostname}:3001`;
 }
 return 'http://localhost:3001';
};

export default function MemberPage() {
 const [form, setForm] = useState({
 nom: '',
 prenom: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const navigate = useNavigate();

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (!form.nom.trim() || !form.prenom.trim()) {
 setError('Veuillez remplir tous les champs');
 playBuzzerSound();
 return;
 }

 setLoading(true);
 setError('');
 setSuccess('');

 try {
 const apiUrl = getApiBaseUrl(); // ✅ KEEP: Dynamic API
 console.log('🌐 MemberPage API URL:', apiUrl);

 const response = await axios.get(`${apiUrl}/members/check`, {
 params: {
 nom: form.nom.trim(),
 prenom: form.prenom.trim()
 },
 timeout: 15000,
 headers: {
 'Content-Type': 'application/json',
 'Accept': 'application/json'
 },
 withCredentials: false
 });

 console.log('Member check response:', response.data);

 if (response.data.success) {
 console.log('✅ MEMBER VERIFIED');
 playSuccessSound();

 // ✅ RESTORED: Check payment status
 if (response.data.paymentIncomplete) {
 setError(response.data.error);
 playBuzzerSound();
 return;
 }

 // ✅ RESTORED: Success message
 setSuccess(`✅ ${response.data.message}`);

 // ✅ RESTORED: Create presence for member
 const presenceData = {
 type: 'adherent',
 nom: form.nom.trim(),
 prenom: form.prenom.trim(),
 niveau: 'Adhérent vérifié'
 };

 const presenceResponse = await axios.post(`${apiUrl}/presences`, presenceData, {
 timeout: 15000,
 headers: { 'Content-Type': 'application/json' }
 });

 if (presenceResponse.data.success) {
 // ✅ RESTORED: Redirect to home after success
 setTimeout(() => {
 navigate('/', {
 state: {
 successMessage: 'Membre vérifié avec succès!',
 memberName: `${form.nom} ${form.prenom}`
 }
 });
 }, 2000);
 }
 } else {
 console.log('❌ MEMBER VERIFICATION FAILED');
 setError(response.data.error);
 playBuzzerSound();

 // ✅ RESTORED: Redirect to non-member after delay
 setTimeout(() => {
 navigate('/non-member', {
 state: {
 form: form,
 memberCheckFailed: true,
 reason: response.data.error
 }
 });
 }, 3000);
 }
 } catch (err) {
 console.error('Member check error:', err);

 let errorMessage = 'Erreur lors de la vérification du membre';

 if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
 errorMessage = 'Erreur de réseau. Vérifiez la connexion.';
 } else if (err.response?.data?.error) {
 errorMessage = err.response.data.error;
 } else if (err.message) {
 errorMessage = `Erreur: ${err.message}`;
 }

 setError(errorMessage);
 playBuzzerSound();
 } finally {
 setLoading(false);
 }
 };

 const handleRetourAccueil = () => {
 navigate('/');
 };

 const handleAppelerBenevole = () => {
 // ✅ RESTORED: Appeler bénévole functionality
 navigate('/benevole-help', {
 state: {
 nom: form.nom,
 prenom: form.prenom,
 issue: 'Problème de vérification membre'
 }
 });
 };

 return (
 <div className="member-check">
 {/* ✅ RESTORED: Original header with buttons */}
 <div className="header-section">
 <h2>Vérification Membre</h2>
 <div className="header-buttons">
 <button onClick={handleRetourAccueil} className="btn-retour-accueil">
 🏠 Retour Accueil
 </button>
 <button onClick={handleAppelerBenevole} className="btn-appeler-benevole">
 📞 Appeler Bénévole
 </button>
 </div>
 </div>

 {/* DEBUG INFO - Small and unobtrusive */}
 <div style={{ 
 fontSize: '12px', 
 color: '#666', 
 marginBottom: '15px',
 padding: '8px',
 background: '#f8f9fa',
 borderRadius: '4px',
 opacity: 0.7
 }}>
 API: {getApiBaseUrl()} | Host: {window.location.hostname}
 </div>

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label htmlFor="nom">Nom de famille:</label>
 <input
 id="nom"
 type="text"
 value={form.nom}
 onChange={(e) => setForm({...form, nom: e.target.value})}
 placeholder="Entrez votre nom"
 disabled={loading}
 />
 </div>

 <div className="form-group">
 <label htmlFor="prenom">Prénom:</label>
 <input
 id="prenom"
 type="text"
 value={form.prenom}
 onChange={(e) => setForm({...form, prenom: e.target.value})}
 placeholder="Entrez votre prénom"
 disabled={loading}
 />
 </div>

 {/* ✅ RESTORED: Success message styling */}
 {success && (
 <div className="success-message">
 <span className="success-icon">✅</span>
 {success}
 <div className="success-submessage">
 Redirection vers l'accueil dans quelques secondes...
 </div>
 </div>
 )}

 {/* ✅ RESTORED: Error message styling */}
 {error && (
 <div className="error-message">
 <span className="error-icon">⚠️</span>
 <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
 {error.includes('payer') && (
 <div className="error-help">
 <button onClick={handleAppelerBenevole} className="btn-help">
 📞 Contacter un bénévole
 </button>
 </div>
 )}
 </div>
 )}

 <button 
 type="submit"
 className="btn-verify"
 disabled={loading || !form.nom.trim() || !form.prenom.trim()}
 >
 {loading ? '⏳ Vérification...' : '🔍 Vérifier Adhésion'}
 </button>
 </form>

 {/* ✅ RESTORED: Info section */}
 <div className="info-section">
 <p><strong>Note:</strong> Seuls les adhérents avec statut payé peuvent accéder directement.</p>
 <p>Si vous n'êtes pas membre, vous serez redirigé vers l'inscription visiteur.</p>
 </div>
 </div>
 );
}