; Custom NSIS installer script voor desktop shortcuts
!macro customInstall
  ; Creëer desktop shortcuts voor specifieke URLs
  CreateShortCut "$DESKTOP\Backend API (Escalade).lnk" \
    "http://localhost:3001" "" "$INSTDIR\resources\assets\icon.ico" 0 SW_SHOWNORMAL "" "Backend API Escalade"
  
  CreateShortCut "$DESKTOP\Interface Tablette (Escalade).lnk" \
    "http://localhost:3002" "" "$INSTDIR\resources\assets\icon.ico" 0 SW_SHOWNORMAL "" "Interface Tablette Escalade"
  
  ; Optioneel: Start menu shortcuts
  CreateDirectory "$SMPROGRAMS\Logiciel Escalade"
  CreateShortCut "$SMPROGRAMS\Logiciel Escalade\Backend API.lnk" \
    "http://localhost:3001" "" "$INSTDIR\resources\assets\icon.ico"
  CreateShortCut "$SMPROGRAMS\Logiciel Escalade\Interface Tablette.lnk" \
    "http://localhost:3002" "" "$INSTDIR\resources\assets\icon.ico"
!macroend

!macro customUnInstall
  ; Verwijder desktop shortcuts
  Delete "$DESKTOP\Backend API (Escalade).lnk"
  Delete "$DESKTOP\Interface Tablette (Escalade).lnk"
  
  ; Verwijder start menu shortcuts
  RMDir /r "$SMPROGRAMS\Logiciel Escalade"
!macroend
