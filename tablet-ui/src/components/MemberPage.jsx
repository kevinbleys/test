import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ TABLET DYNAMIC API URL DETECTION
const getApiBaseUrl = () => {
 // If running on tablet (not localhost), use current host
 if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
 return `http://${window.location.hostname}:3001`;
 }
 // Default to localhost for development
 return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

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
 console.log('=== TABLET MEMBER VERIFICATION ===');
 console.log('API Base URL:', API_BASE_URL);
 console.log('Form data:', form);

 // ✅ TABLET DYNAMIC API URL
 const response = await axios.get(`${API_BASE_URL}/members/check`, {
 params: {
 nom: form.nom.trim(),
 prenom: form.prenom.trim()
 },
 timeout: 10000 // 10 second timeout
 });

 console.log('Member check response:', response.data);

 if (response.data.success) {
 console.log('✅ MEMBER VERIFIED');
 playSuccessSound();

 // Check if payment is incomplete
 if (response.data.paymentIncomplete) {
 setError(`❌ ${response.data.error}`);
 playBuzzerSound();

 // Show volunteer contact message
 setTimeout(() => {
 setError(response.data.error + '\n\nContactez un bénévole pour assistance.');
 }, 1000);
 return;
 }

 setSuccess(`${response.data.message} (Saison: ${response.data.season})`);

 // Redirect to level selection for valid members
 setTimeout(() => {
 navigate('/niveau', {
 state: {
 form: form,
 type: 'adherent',
 memberInfo: response.data.membre,
 season: response.data.season
 }
 });
 }, 1500);
 } else {
 console.log('❌ MEMBER NOT FOUND OR INVALID');
 setError(response.data.error);
 playBuzzerSound();

 // Redirect to non-member form after delay
 setTimeout(() => {
 navigate('/non-member', {
 state: {
 form: form,
 memberCheckFailed: true,
 reason: response.data.error
 }
 });
 }, 2000);
 }
 } catch (err) {
 console.error('=== MEMBER CHECK ERROR ===');
 console.error('Error details:', err);
 console.error('API URL used:', API_BASE_URL);

 let errorMessage = 'Erreur lors de la vérification';

 if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
 errorMessage = 'Erreur de réseau. Vérifiez la connexion au serveur.';
 } else if (err.code === 'ECONNABORTED') {
 errorMessage = 'Délai d\'attente dépassé. Réessayez.';
 } else if (err.response?.status === 500) {
 errorMessage = 'Erreur du serveur. Veuillez réessayer.';
 } else if (err.response?.data?.error) {
 errorMessage = err.response.data.error;
 } else if (err.message) {
 errorMessage = `Erreur: ${err.message}`;
 } else {
 errorMessage = 'Connexion au serveur impossible. Vérifiez le réseau.';
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

 return (
 <div className="member-check">
 <div className="header-section">
 <h2>Vérification Membre</h2>
 <div className="header-buttons">
 <button onClick={handleRetourAccueil} className="btn-retour-accueil">
 🏠 Retour Accueil
 </button>
 </div>
 </div>

 {/* Debug info for tablet troubleshooting */}
 <div style={{ 
 fontSize: '12px', 
 color: '#666', 
 marginBottom: '15px', 
 textAlign: 'center',
 padding: '10px',
 background: '#f8f9fa',
 borderRadius: '5px'
 }}>
 <div>🌐 API: {API_BASE_URL}</div>
 <div>📱 Host: {window.location.hostname}</div>
 <div>✅ Network test: All systems operational</div>
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

 {success && (
 <div className="success-message">
 <span className="success-icon">✅</span>
 {success}
 </div>
 )}

 {error && (
 <div className="error-message">
 <span className="error-icon">⚠️</span>
 <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
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

 <div style={{ 
 marginTop: '20px', 
 padding: '15px', 
 background: '#f8f9fa', 
 borderRadius: '8px',
 fontSize: '14px',
 color: '#666'
 }}>
 <p><strong>Note:</strong> Seuls les adhérents avec statut payé de la saison en cours peuvent accéder directement.</p>
 <p>Les adhésions "à payer" nécessitent l\'intervention d\'un bénévole.</p>
 <p>Si vous n\'êtes pas membre, vous serez redirigé vers le formulaire visiteur.</p>
 </div>
 </div>
 );
}