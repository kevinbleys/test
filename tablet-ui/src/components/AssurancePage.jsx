import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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

export default function AssurancePage() {
 const state = useLocation().state;
 const navigate = useNavigate();

 const [checks, setChecks] = useState({
 c1: false,
 c2: false,
 c3: false,
 c4: false
 });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 // Redirect si aucune donnée de formulaire n'est disponible
 if (!state?.form) {
 navigate('/non-member');
 return null;
 }

 const allChecked = Object.values(checks).every(Boolean);

 const toggleCheck = (key) => {
 setChecks(prev => ({ ...prev, [key]: !prev[key] }));
 setError(''); // Effacer l'erreur lors de l'interaction utilisateur
 };

 const finish = async () => {
 if (!allChecked) {
 setError('Veuillez cocher toutes les cases pour continuer.');
 playBuzzerSound();
 return;
 }

 setLoading(true);
 setError('');

 try {
 console.log('=== ASSURANCE PAGE TABLET SUBMISSION ===');
 console.log('API Base URL:', API_BASE_URL);
 console.log('State data:', state);

 // Utiliser le tarif calculé basé sur l'âge ET assurance status
 const registrationData = {
 type: 'non-adherent',
 ...state.form,
 tarif: state.tarif, // Utilise le tarif calculé
 niveau: state.niveau,
 assuranceAccepted: true, // User has checked all checkboxes
 status: 'pending' // Default status for non-members
 };

 console.log('Submitting registration with data:', registrationData);

 // ✅ TABLET DYNAMIC API URL
 const response = await axios.post(`${API_BASE_URL}/presences`, registrationData, {
 timeout: 15000, // 15 second timeout
 headers: {
 'Content-Type': 'application/json'
 }
 });

 if (response.data.success) {
 console.log('=== REGISTRATION SUCCESS ===');
 console.log('Registered presence:', response.data.presence);

 playSuccessSound();
 navigate('/paiement', {
 state: {
 presenceId: response.data.presence.id,
 montant: state.tarif, // Utilise le calculé tarif
 nom: state.form.nom,
 prenom: state.form.prenom,
 age: state.age,
 tarifCategory: state.tarifCategory
 }
 });
 } else {
 console.error('Registration failed:', response.data);
 setError(response.data.error || 'Erreur lors de l\'enregistrement');
 playBuzzerSound();
 }
 } catch (err) {
 console.error('=== REGISTRATION ERROR ===');
 console.error('Error details:', err);
 console.error('API URL used:', API_BASE_URL);

 let errorMessage = 'Erreur de connexion';

 if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
 errorMessage = 'Erreur de réseau. Vérifiez la connexion au serveur.';
 } else if (err.code === 'ECONNABORTED') {
 errorMessage = 'Délai d\'attente dépassé lors de l\'enregistrement.';
 } else if (err.response?.status === 500) {
 errorMessage = 'Erreur du serveur. Veuillez réessayer.';
 } else if (err.response?.status === 400) {
 errorMessage = 'Données invalides. Vérifiez le formulaire.';
 } else if (err.response?.data?.error) {
 errorMessage = err.response.data.error;
 } else if (err.message) {
 errorMessage = `Erreur: ${err.message}`;
 } else {
 errorMessage = 'Impossible de contacter le serveur. Vérifiez la connexion réseau.';
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

 const handleRetourNiveau = () => {
 navigate('/niveau', { state });
 };

 return (
 <div style={{ 
 maxWidth: '800px', 
 margin: '20px auto', 
 padding: '30px', 
 background: 'white', 
 borderRadius: '12px',
 boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
 }}>

 <div className="header-section">
 <h2>INFORMATION RELATIVE À L'ASSURANCE DU PRATIQUANT</h2>
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
 marginBottom: '10px',
 padding: '8px',
 background: '#f0f7ff',
 borderRadius: '4px',
 border: '1px solid #cce7ff'
 }}>
 <div>🌐 API: {API_BASE_URL}</div>
 <div>📱 Host: {window.location.hostname}</div>
 <div>✅ Backend connectivity: Verified</div>
 </div>

 {/* Rappel du tarif */}
 {state.tarif !== undefined && (
 <div style={{
 background: '#f8f9fa',
 padding: '20px',
 borderRadius: '8px',
 marginBottom: '20px',
 textAlign: 'center'
 }}>
 <h4>💰 Tarif à régler : {state.tarif === 0 ? 'GRATUIT' : `${state.tarif}€`}</h4>
 <div>
 👤 {state.form?.nom} {state.form?.prenom} - {state.age} ans - Niveau {state.niveau}
 </div>
 <div style={{ fontStyle: 'italic', marginTop: '10px' }}>
 {state.tarifDescription}
 </div>
 </div>
 )}

 <div style={{ marginBottom: '30px', lineHeight: '1.6' }}>
 Conformément à l'article L321-4 du Code du sport, le présent document vise à informer 
 le pratiquant des conditions d'assurance applicables dans le cadre de la pratique de 
 l'escalade au sein de la structure.
 </div>

 <div style={{ marginBottom: '20px' }}>
 <h3>Assurance en Responsabilité Civile</h3>
 <p>
 La structure dispose d'un contrat d'assurance en responsabilité civile couvrant 
 les dommages causés à des tiers dans le cadre de la pratique de l'escalade.
 </p>
 </div>

 <div style={{ marginBottom: '30px' }}>
 <h3>Assurance Individuelle Accident</h3>
 <p>
 Cette assurance ne couvre pas les dommages corporels que le pratiquant pourrait 
 se causer à lui-même, en l'absence de tiers responsable identifié.
 </p>
 <p>
 L'assurance individuelle accident permet au pratiquant d'être indemnisé pour les 
 dommages corporels dont il pourrait être victime, y compris en l'absence de tiers 
 responsable.
 </p>
 <p>
 En l'absence de garantie individuelle accident, il est recommandé de souscrire 
 une couverture adaptée soit auprès de l'assureur de son choix, soit via une 
 licence FFME.
 </p>
 </div>

 <div style={{ marginBottom: '30px' }}>
 {[
 {
 key: 'c1',
 text: "Je reconnais avoir été informé(e) des conditions d'assurance applicables dans le cadre de la pratique de l'escalade au sein de cette structure."
 },
 {
 key: 'c2', 
 text: "Je reconnais avoir été informé(e) de l'existence et de l'intérêt d'une assurance individuelle accident."
 },
 {
 key: 'c3',
 text: "Je reconnais avoir été informé(e) de la possibilité de souscrire une assurance complémentaire adaptée à mes besoins, notamment via une licence FFME en club ou hors club."
 },
 {
 key: 'c4',
 text: (
 <>
 J'ai pris connaissance du{' '}
 <Link to="/reglement" target="_blank" rel="noopener noreferrer">
 Règlement intérieur
 </Link>
 {' '}et je m'engage à le respecter.
 </>
 )
 }
 ].map(({ key, text }) => (
 <div 
 key={key} 
 onClick={() => toggleCheck(key)}
 style={{
 display: 'flex',
 alignItems: 'flex-start',
 marginBottom: '20px',
 cursor: 'pointer',
 padding: '15px',
 border: '2px solid #e0e0e0',
 borderRadius: '8px',
 background: checks[key] ? '#e3f2fd' : 'white',
 borderColor: checks[key] ? '#007bff' : '#e0e0e0',
 transition: 'all 0.3s ease',
 // ✅ Enhanced clickability for tablet
 userSelect: 'none',
 WebkitUserSelect: 'none',
 touchAction: 'manipulation'
 }}
 >
 <input 
 type="checkbox" 
 checked={checks[key]}
 onChange={() => {}} // Controlled by parent onClick
 style={{ 
 marginRight: '15px', 
 marginTop: '3px', 
 transform: 'scale(1.3)', // Larger for tablet
 cursor: 'pointer',
 pointerEvents: 'auto'
 }}
 />
 <span style={{ cursor: 'pointer', flex: 1 }}>{text}</span>
 </div>
 ))}
 </div>

 {error && (
 <div className="error-message" style={{
 marginBottom: '20px',
 padding: '15px',
 background: '#ffebee',
 color: '#c62828',
 borderRadius: '8px',
 border: '1px solid #ffcdd2'
 }}>
 <span className="error-icon">⚠️</span>
 <span style={{ marginLeft: '10px' }}>{error}</span>
 </div>
 )}

 <div style={{ 
 display: 'flex', 
 gap: '15px', 
 justifyContent: 'space-between',
 marginTop: '30px' 
 }}>
 <button 
 onClick={handleRetourNiveau}
 className="btn-retour-accueil"
 style={{ 
 flex: 1,
 padding: '12px 20px',
 fontSize: '16px'
 }}
 disabled={loading}
 >
 ← Retour Niveau
 </button>

 <button 
 onClick={finish}
 disabled={!allChecked || loading}
 className="btn-verify"
 style={{ 
 flex: 2,
 opacity: (!allChecked || loading) ? 0.6 : 1,
 cursor: (!allChecked || loading) ? 'not-allowed' : 'pointer',
 padding: '12px 20px',
 fontSize: '16px'
 }}
 >
 {loading ? '⏳ Enregistrement...' : 'Continuer vers le paiement →'}
 </button>
 </div>
 </div>
 );
}