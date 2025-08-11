; Custom NSIS installer script voor Klimzaal Presence Management - GECORRIGEERDE POORTEN
!include "MUI2.nsh"
!include "WinVer.nsh"

; Custom installer functies
!macro customInstall
  ; Installeer Node.js service dependencies
  SetOutPath "$INSTDIR\resources\app"
  
  ; Installeer node-windows voor service management
  ExecWait '"$INSTDIR\resources\app\node.exe" "$INSTDIR\resources\app\npm" install node-windows --save'
  
  ; Installeer en start de Windows service
  ExecWait '"$INSTDIR\resources\app\node.exe" "$INSTDIR\resources\app\install-service.js"'
  
  ; Maak desktop shortcut voor Admin Dashboard - GECORRIGEERDE POORT 4000
  CreateShortcut "$DESKTOP\Klimzaal Admin Dashboard.lnk" "http://localhost:4000" "" "$INSTDIR\resources\app\assets\icon.ico" 0 SW_SHOWMAXIMIZED
  
  ; Maak desktop shortcut voor Tablet Interface - GECORRIGEERDE POORT 4000/tablet  
  CreateShortcut "$DESKTOP\Klimzaal Tablet Interface.lnk" "http://localhost:4000/tablet" "" "$INSTDIR\resources\app\assets\tablet-icon.ico" 0 SW_SHOWMAXIMIZED
  
  ; Start Menu shortcuts - GECORRIGEERDE POORTEN
  CreateDirectory "$SMPROGRAMS\Klimzaal Presence Management"
  CreateShortcut "$SMPROGRAMS\Klimzaal Presence Management\Admin Dashboard.lnk" "http://localhost:4000" "" "$INSTDIR\resources\app\assets\icon.ico"
  CreateShortcut "$SMPROGRAMS\Klimzaal Presence Management\Tablet Interface.lnk" "http://localhost:4000/tablet" "" "$INSTDIR\resources\app\assets\tablet-icon.ico"
  CreateShortcut "$SMPROGRAMS\Klimzaal Presence Management\Backend API.lnk" "http://localhost:3001" "" "$INSTDIR\resources\app\assets\tray-icon.ico"
  CreateShortcut "$SMPROGRAMS\Klimzaal Presence Management\Uninstall.lnk" "$INSTDIR\uninstall.exe"
  
  ; Firewall regels toevoegen (optioneel)
  ; ExecWait 'netsh advfirewall firewall add rule name="Klimzaal Backend" dir=in action=allow protocol=TCP localport=3001'
  ; ExecWait 'netsh advfirewall firewall add rule name="Klimzaal Admin" dir=in action=allow protocol=TCP localport=4000'
!macroend

!macro customUnInstall
  ; Stop en verwijder Windows service
  ExecWait '"$INSTDIR\resources\app\node.exe" "$INSTDIR\resources\app\uninstall-service.js"'
  
  ; Verwijder desktop shortcuts
  Delete "$DESKTOP\Klimzaal Admin Dashboard.lnk"
  Delete "$DESKTOP\Klimzaal Tablet Interface.lnk"
  
  ; Verwijder Start Menu shortcuts
  RMDir /r "$SMPROGRAMS\Klimzaal Presence Management"
  
  ; Optioneel: firewall regels verwijderen
  ; ExecWait 'netsh advfirewall firewall delete rule name="Klimzaal Backend"'
  ; ExecWait 'netsh advfirewall firewall delete rule name="Klimzaal Admin"'
!macroend

; Custom header voor installer venster
!macro customHeader
  !define MUI_WELCOMEPAGE_TEXT "Deze installer zal het Klimzaal Presence Management systeem installeren op uw computer.$\r$\n$\r$\nHet systeem bevat:$\r$\n• Backend service op poort 3001 (automatisch gestart)$\r$\n• Admin dashboard interface op poort 4000$\r$\n• Tablet interface via poort 4000/tablet$\r$\n$\r$\nKlik op Volgende om door te gaan."
  
  ; Custom finish page
  !define MUI_FINISHPAGE_TEXT "Klimzaal Presence Management is succesvol geïnstalleerd!$\r$\n$\r$\nDe backend service draait nu automatisch op de achtergrond.$\r$\n$\r$\nU kunt nu:$\r$\n• Admin Dashboard openen: http://localhost:4000$\r$\n• Tablet Interface gebruiken: http://localhost:4000/tablet$\r$\n• Backend API bereiken: http://localhost:3001$\r$\n$\r$\nBij computerherstarts wordt de service automatisch gestart."
  !define MUI_FINISHPAGE_LINK "Open Admin Dashboard"
  !define MUI_FINISHPAGE_LINK_LOCATION "http://localhost:4000"
!macroend