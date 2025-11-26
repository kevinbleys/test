import json
from datetime import datetime

def clean_presence_history(input_file, output_file):
    """
    Removes duplicate presences from presence-history.json
    """
    print(f"\n{'='*60}")
    print(f"🧹 PRESENCE HISTORY CLEANUP TOOL")
    print(f"{'='*60}\n")
    
    # Read file
    with open(input_file, 'r', encoding='utf-8') as f:
        history = json.load(f)
    
    print(f"📁 Loaded: {input_file}")
    print(f"📊 Total dates in history: {len(history)}\n")
    
    total_before = 0
    total_after = 0
    dates_fixed = 0
    
    cleaned_history = []
    
    for day_entry in history:
        if not day_entry.get('presences') or not isinstance(day_entry['presences'], list):
            cleaned_history.append(day_entry)
            continue
        
        date_str = day_entry.get('date', 'Unknown')
        before_count = len(day_entry['presences'])
        total_before += before_count
        
        # Deduplicate using unique key: nom + prenom + timestamp
        seen = {}
        deduplicated = []
        
        for presence in day_entry['presences']:
            nom = (presence.get('nom') or '').strip().lower()
            prenom = (presence.get('prenom') or '').strip().lower()
            date_timestamp = datetime.fromisoformat(presence['date'].replace('Z', '+00:00')).timestamp()
    
