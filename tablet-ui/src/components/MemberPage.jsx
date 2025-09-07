import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { playSuccessSound, playBuzzerSound } from '../utils/soundUtils';

// ✅ ONLY CHANGE: Dynamic API URL detection
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
 const apiUrl = getApiBaseUrl(); // ✅ ONLY CHANGE: Dynamic API

 const response = await axios.get(`${apiUrl}/members/check`, {
 params: {
 nom: form.nom.trim(),
 prenom: form.prenom.trim()
 },
 timeout: 15000
 });

 if (response.data.success) {
 playSuccessSound();

 // Check if payment is incomplete
 if (response.data.paymentIncomplete) {
 setError(`❌ ${response.data.error}`);
 playBuzzerSound();
 return;
 }

 setSuccess(`✅ Vérification réussie! Vous pouvez aller grimper. 🧗‍♀️`);

 // ✅ RESTORED: Auto redirect to home after 3 seconds
 setTimeout(() => {
 navigate('/', {
 state: {
 successMessage: `Bienvenue ${form.prenom} ${form.nom}!`,
 memberVerified: true
 }
 });
 }, 3000);

 } else {
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

 <form onSubmit={handleSubmit}>
 <div className="form-group">
 <label htmlFor="nom">Nom:</label>
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
 <div className="redirect-message">
 Redirection vers l'accueil dans quelques secondes...
 </div>
 </div>
 )}

 {error && (
 <div className="error-message">
 <span className="error-icon">⚠️</span>
 <div>{error}</div>
 {error.includes('payer') && (
 <div className="error-actions">
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
 {loading ? '⏳ Vérification...' : '🔍 Vérifier'}
 </button>
 </form>

 <div className="info-section">
 <p><strong>Note:</strong> Seuls les adhérents avec statut payé peuvent accéder directement.</p>
 <p>Si vous n'êtes pas membre, vous serez redirigé vers l'inscription visiteur.</p>
 </div>
 </div>
 );
}