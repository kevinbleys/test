# NSIS Installer Script voor Climbing Club Software
# Automatische installer met alle dependencies en services

# Installer configuratie
!define APP_NAME "Logiciel Club d'Escalade"
!define APP_VERSION "2.0.0"
!define APP_PUBLISHER "Club d'Escalade"
!define APP_URL "http://localhost:3001"
!define APP_EXECUTABLE "ClimbingClubTray.exe"

# Include moderne interface
!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

# Installer eigenschappen
Name "${APP_NAME}"
OutFile "ClimbingClubSoftware-Setup.exe"
InstallDir "$PROGRAMFILES\${APP_NAME}"
InstallDirRegKey HKCU "Software\${APP_NAME}" ""
RequestExecutionLevel admin

# Interface configuratie
!define MUI_ABORTWARNING
!define MUI_ICON "climbing-icon.ico"
!define MUI_UNICON "climbing-icon.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "header.bmp"
!define MUI_WELCOMEPAGE_TITLE "Bienvenue dans l'installation du Logiciel Club d'Escalade"
!define MUI_WELCOMEPAGE_TEXT "Cet assistant va installer le logiciel de gestion pour votre club d'escalade.$\r$\n$\r$\nIl est recommandé de fermer tous les autres programmes avant de continuer."

!define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXECUTABLE}"
!define MUI_FINISHPAGE_RUN_TEXT "Démarrer le logiciel maintenant"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Afficher les instructions d'utilisation"

# Pages d'installation
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

# Pages de désinstallation
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

# Langues
!insertmacro MUI_LANGUAGE "French"

# Sections d'installation
Section "Application principale" SecMain
    SectionIn RO ; Read-only section

    # Définir le répertoire de sortie
    SetOutPath "$INSTDIR"

    # Copier tous les fichiers de l'application
    File /r "dist\*.*"

    # Copier les fichiers système
    File "ClimbingClubTray.exe"
    File "install-services.bat"
    File "uninstall-services.bat"
    File "README.txt"
    File "LICENSE.txt"

    # Enregistrer dans le registre
    WriteRegStr HKCU "Software\${APP_NAME}" "" $INSTDIR
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${APP_VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${APP_PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\${APP_EXECUTABLE}"

    # Créer l'uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"

SectionEnd

Section "Node.js Runtime" SecNodeJS
    # Vérifier si Node.js est déjà installé
    ClearErrors
    ReadRegStr $0 HKLM "SOFTWARE\Node.js" "InstallPath"
    IfErrors 0 NodeJSExists

    # Télécharger et installer Node.js
    DetailPrint "Installation de Node.js..."
    NSISdl::download "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi" "$TEMP\nodejs-installer.msi"
    ExecWait '"msiexec" /i "$TEMP\nodejs-installer.msi" /quiet'
    Delete "$TEMP\nodejs-installer.msi"

    NodeJSExists:
    DetailPrint "Node.js est installé"

SectionEnd

Section "Dependencies NPM" SecDependencies
    # Installer les dépendances NPM
    DetailPrint "Installation des dépendances NPM..."
    SetOutPath "$INSTDIR"

    # Installer les packages globaux nécessaires
    nsExec::ExecToLog '"npm" install -g node-windows'
    nsExec::ExecToLog '"npm" install'

    # Aller dans chaque sous-répertoire et installer
    SetOutPath "$INSTDIR\backend"
    nsExec::ExecToLog '"npm" install'

    SetOutPath "$INSTDIR\admin-dashboard"
    nsExec::ExecToLog '"npm" install'

    SetOutPath "$INSTDIR\tablet-ui"
    nsExec::ExecToLog '"npm" install'

SectionEnd

Section "Services Windows" SecServices
    DetailPrint "Installation des services Windows..."
    SetOutPath "$INSTDIR"

    # Exécuter le script d'installation des services
    nsExec::ExecToLog '"$INSTDIR\install-services.bat"'

SectionEnd

Section "Démarrage automatique" SecAutoStart
    # Ajouter au démarrage Windows
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}" "$INSTDIR\${APP_EXECUTABLE}"

    # Créer un raccourci sur le bureau
    CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0

    # Créer un raccourci dans le menu démarrer
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE}" "" "$INSTDIR\${APP_EXECUTABLE}" 0
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Interface Admin.lnk" "http://localhost:3001/admin"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Interface Tablette.lnk" "http://localhost:3000"
    CreateShortCut "$SMPROGRAMS\${APP_NAME}\Désinstaller.lnk" "$INSTDIR\uninstall.exe"

SectionEnd

# Descriptions des sections
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} "Fichiers principaux de l'application (requis)"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecNodeJS} "Runtime Node.js pour exécuter l'application"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecDependencies} "Dépendances NPM nécessaires au fonctionnement"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecServices} "Installation comme services Windows"
    !insertmacro MUI_DESCRIPTION_TEXT ${SecAutoStart} "Démarrage automatique avec Windows"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

# Section de désinstallation
Section "Uninstall"
    # Arrêter et supprimer les services
    nsExec::ExecToLog '"$INSTDIR\uninstall-services.bat"'

    # Supprimer du démarrage automatique
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${APP_NAME}"

    # Supprimer les fichiers
    RMDir /r "$INSTDIR"

    # Supprimer les raccourcis
    Delete "$DESKTOP\${APP_NAME}.lnk"
    RMDir /r "$SMPROGRAMS\${APP_NAME}"

    # Supprimer les clés du registre
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
    DeleteRegKey HKCU "Software\${APP_NAME}"

SectionEnd

# Fonction appelée à la fin de l'installation
Function .onInstSuccess
    # Démarrer les services
    nsExec::ExecToLog '"net" start "ClimbingClub-Backend"'
    nsExec::ExecToLog '"net" start "ClimbingClub-Frontend"'
    nsExec::ExecToLog '"net" start "ClimbingClub-Admin"'

    # Attendre un peu et ouvrir l'interface admin
    Sleep 3000
    ExecShell "open" "http://localhost:3001/admin"

FunctionEnd
