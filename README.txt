====================================================
LOGICIEL CLUB D'ESCALADE - VERSION 2.0
====================================================

Bienvenue dans le logiciel de gestion pour votre club d'escalade !

🎯 FONCTIONNALITÉS
==================
• Interface tablette pour l'enregistrement des visiteurs
• Gestion des membres et non-membres
• Calcul automatique des tarifs selon l'âge
• Interface d'administration pour la validation des paiements
• Export Excel pour la comptabilité
• Statistiques et rapports détaillés

🖥️ INTERFACES DISPONIBLES
==========================
• Interface Tablette: http://localhost:3000
  (À utiliser sur tablette à l'entrée du club)

• Interface Administration: http://localhost:3001/admin
  (Pour les bénévoles - validation paiements, statistiques)

🚀 DÉMARRAGE AUTOMATIQUE
========================
Le logiciel démarre automatiquement avec Windows.
Une icône apparaît dans la barre des tâches (en bas à droite).

🔧 UTILISATION DE L'ICÔNE SYSTÈME
=================================
Clic droit sur l'icône 🧗 dans la barre des tâches:

• 🖥️ Interface Admin - Ouvre l'administration
• 📱 Interface Tablette - Ouvre l'interface tablette  
• 📊 Statut des Services - Vérifier si tout fonctionne
• 🔄 Redémarrer Services - En cas de problème
• ❌ Quitter - Fermer l'icône (services continuent)

📱 UTILISATION INTERFACE TABLETTE
=================================
1. Ouverture automatique sur http://localhost:3000
2. Les visiteurs choisissent "Membre" ou "Non-membre"
3. Pour les membres: saisir nom et prénom
4. Pour les non-membres: formulaire complet + niveau + assurance
5. Paiement validé par un bénévole via l'interface admin

🖥️ UTILISATION INTERFACE ADMIN
==============================
1. Ouverture automatique sur http://localhost:3001/admin
2. Voir toutes les présences du jour en temps réel
3. Valider les paiements des non-membres
4. Consulter les statistiques
5. Exporter vers Excel pour la comptabilité
6. Naviguer dans l'historique par date

💰 VALIDATION DES PAIEMENTS
===========================
1. Dans l'interface admin, cliquer "✓ Valider" 
2. Une fenêtre s'ouvre avec les informations du client
3. Le montant est pré-rempli (modifiable si nécessaire)
4. Choisir le mode de paiement: Espèces/CB/Chèque
5. Confirmer - le statut passe à "Payé"

📊 EXPORTS ET STATISTIQUES
==========================
• Export saison courante (1 juillet - 30 juin)
• Export par année civile
• Statistiques en temps réel
• Archivage automatique chaque nuit à minuit

🆘 EN CAS DE PROBLÈME
====================
1. Vérifier l'icône dans la barre des tâches
2. Clic droit → "Statut des Services" 
3. Si services arrêtés: "Redémarrer Services"
4. Si problème persistant: redémarrer l'ordinateur

⚙️ SERVICES WINDOWS INSTALLÉS
=============================
• ClimbingClub-Backend (Port 3001)
• ClimbingClub-Frontend (Port 3000) 
• ClimbingClub-Admin (Port 3002)

Ces services démarrent automatiquement avec Windows.

📞 SUPPORT
==========
En cas de problème technique, consultez les logs dans:
C:\Program Files\Logiciel Club d'Escalade\logs\

====================================================
Bon usage de votre logiciel club d'escalade ! 🧗‍♀️
====================================================
