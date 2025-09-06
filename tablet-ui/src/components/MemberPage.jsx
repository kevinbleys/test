import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ FIXED: Separate API URL detection function
const getApiBaseUrl = () => {
 const hostname = window.location.hostname;
 const protocol = window.location.protocol;

 console.log('🌐 API URL Detection:', {
 hostname,
 protocol,
 fullUrl: window.location.href
 });

 // If NOT localhost/127.0.0.1, use the current hostname with port 3001
 if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
 const apiUrl = `${protocol}//${hostname}:3001`;
 console.log('📱 TABLET MODE - API URL:', apiUrl);
 return apiUrl;
 }

 // Default to localhost for development
 const localUrl = 'http://localhost:3001';
 console.log('💻 LOCALHOST MODE - API URL:', localUrl);
 return localUrl;
};

export default function MemberPage() {
 const [form, setForm] = useState({
 nom: '',
 prenom: ''
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 // ✅ FIXED: Call function once, store result
 const apiUrl = getApiBaseUrl();

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
 console.log('=== FIXED TABLET MEMBER VERIFICATION ===');
 console.log('API URL:', apiUrl);
 console.log('Form data:', form);

 // ✅ API call with fixed URL
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

 console.log('✅ Member check response:', response.data);

 if (response.data.success) {
 console.log('✅ MEMBER VERIFIED SUCCESSFULLY');
 playSuccessSound();

 // Check if payment is incomplete
 if (response.data.paymentIncomplete) {
 setError(`❌ PAIEMENT REQUIS\n\n${response.data.error}\n\n👨‍💼 Un bénévole doit valider votre paiement.`);
 playBuzzerSound();
 return;
 }

 setSuccess(`✅ ${response.data.message}\n📅 Saison: ${response.data.season}`);

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
 }, 2000);
 } else {
 console.log('❌ MEMBER VERIFICATION FAILED');
 setError(`❌ ${response.data.error}`);
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
 }, 3000);
 }
 } catch (err) {
 console.error('=== MEMBER CHECK ERROR ===');
 console.error('Error details:', err);
 console.error('API URL used:', apiUrl);

 let errorMessage = 'Erreur lors de la vérification du membre';

 if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
 errorMessage = `❌ ERREUR RÉSEAU\n\nImpossible de contacter le serveur.\n\nAPI: ${apiUrl}\n\nVérifiez:\n• Connexion WiFi\n• Serveur actif\n• Même réseau PC/tablet`;
 } else if (err.code === 'ECONNABORTED') {
 errorMessage = `⏱️ DÉLAI DÉPASSÉ\n\nLa requête a pris trop de temps.\n\nRecommandations:\n• Réessayez\n• Vérifiez la connexion\n• Contactez l'admin`;
 } else if (err.response?.status === 500) {
 errorMessage = `🔧 ERREUR SERVEUR\n\nProblème interne du serveur.\n\nContactez l'administrateur système.`;
 } else if (err.response?.status === 404) {
 errorMessage = `🔍 SERVICE NON TROUVÉ\n\nL'endpoint n'existe pas.\n\nAPI: ${apiUrl}/members/check`;
 } else if (err.response?.data?.error) {
 errorMessage = `📋 RÉPONSE SERVEUR:\n\n${err.response.data.error}`;
 } else if (err.message) {
 errorMessage = `⚠️ ERREUR TECHNIQUE:\n\n${err.message}\n\nAPI: ${apiUrl}`;
 } else {
 errorMessage = `🚫 CONNEXION IMPOSSIBLE\n\nServeur non accessible: ${apiUrl}\n\nActions:\n• Vérifiez que le serveur fonctionne\n• Même réseau WiFi PC/tablet\n• Redémarrez l'application`;
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

 {/* ✅ FIXED DEBUG INFO */}
 <div style={{ 
 fontSize: '14px', 
 color: '#333', 
 marginBottom: '20px',
 padding: '15px',
 background: '#f0f8ff',
 borderRadius: '8px',
 border: '2px solid #4CAF50'
 }}>
 <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>🔧 DEBUG INFO (FIXED):</div>
 <div>🌐 API URL: <strong>{apiUrl}</strong></div>
 <div>📱 Host: <strong>{window.location.hostname}</strong></div>
 <div>🔗 Protocol: <strong>{window.location.protocol}</strong></div>
 <div>📍 Full URL: <strong>{window.location.href}</strong></div>
 <div style={{ marginTop: '10px', color: '#2E7D32' }}>
 ✅ <strong>RECURSION BUG FIXED - Tablet support active</strong>
 </div>
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
 style={{ 
 fontSize: '18px', 
 padding: '12px',
 minHeight: '50px'
 }}
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
 style={{ 
 fontSize: '18px', 
 padding: '12px',
 minHeight: '50px'
 }}
 />
 </div>

 {success && (
 <div className="success-message" style={{
 marginBottom: '20px',
 padding: '20px',
 background: '#e8f5e8',
 color: '#2e7d32',
 borderRadius: '8px',
 border: '2px solid #4caf50',
 whiteSpace: 'pre-line',
 fontSize: '16px'
 }}>
 <span className="success-icon">✅</span>
 <div style={{ marginLeft: '10px' }}>{success}</div>
 </div>
 )}

 {error && (
 <div className="error-message" style={{
 marginBottom: '20px',
 padding: '20px',
 background: '#ffebee',
 color: '#c62828',
 borderRadius: '8px',
 border: '2px solid #f44336',
 whiteSpace: 'pre-line',
 fontSize: '15px',
 lineHeight: '1.4'
 }}>
 <span className="error-icon">⚠️</span>
 <div style={{ marginLeft: '10px' }}>{error}</div>
 </div>
 )}

 <button 
 type="submit"
 className="btn-verify"
 disabled={loading || !form.nom.trim() || !form.prenom.trim()}
 style={{
 fontSize: '18px',
 padding: '15px 30px',
 minHeight: '60px',
 opacity: (loading || !form.nom.trim() || !form.prenom.trim()) ? 0.6 : 1
 }}
 >
 {loading ? '⏳ Vérification en cours...' : '🔍 Vérifier Adhésion'}
 </button>
 </form>

 <div style={{ 
 marginTop: '30px', 
 padding: '20px', 
 background: '#f8f9fa', 
 borderRadius: '8px',
 fontSize: '15px',
 color: '#666',
 lineHeight: '1.5'
 }}>
 <p><strong>📋 RÈGLES DE VÉRIFICATION:</strong></p>
 <div style={{ marginLeft: '20px' }}>
 <p>✅ <strong>Adhérent payé</strong> → Accès direct</p>
 <p>❌ <strong>Adhésion "à payer"</strong> → Bénévole requis</p>
 <p>❌ <strong>Ancien adhérent</strong> → Inscription visiteur</p>
 <p>❌ <strong>Non trouvé</strong> → Inscription visiteur</p>
 </div>
 </div>
 </div>
 );
}