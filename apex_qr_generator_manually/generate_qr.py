import qrcode
import os
from pathlib import Path

# ============================================
# CONFIGURATION - EDIT THESE
# ============================================

# Your deployed app URL (change this when you deploy to Vercel)
APP_URL = "https://apexgne.vercel.app/"  # Change to your production URL later

# Paste your event data here (copy from Supabase export)
# Format: event_id,event_name
EVENTS_DATA = """
06a33f6c-8434-4478-ae66-9d25c069a660,Capture the Moment
163e340c-3f58-4bc1-808e-e7dc3faadfee,Bot Race
780e30e7-4cd2-4efb-838c-a1b9486c86ac,Circuit Quest
a3e694a2-4b23-4041-985d-208f2d25c814,Penalty Shootout
ac132920-8d90-46d8-84a9-cfab4c724e38,Poetry Slam
b79b6fef-4e3a-4c22-856f-ffc9a3baa67e,LAN Gaming Challenge
be5eec82-9b88-42b7-9c7b-5a7e7b0d79fa,Street Play
c917bf5e-11f0-4991-ba09-7df6e47ebd26,Pixel Palette
eb2b3be5-ca54-4f6d-af5d-d170b72a5f62,Green Quiz
f8f6fc04-32a1-4d65-9d37-59e70254068f,Battle of Bands
"""

OUTPUT_DIR = 'qr_codes'

# ============================================
# SCRIPT - DON'T EDIT BELOW THIS LINE
# ============================================

def clean_filename(name):
    """Remove special characters from event name for filename"""
    return "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')

def generate_qr_codes():
    """Generate QR codes for all events"""
    
    # Create output directory
    Path(OUTPUT_DIR).mkdir(exist_ok=True)
    
    print("🚀 Apex Fest QR Code Generator")
    print("=" * 50)
    print(f"📱 App URL: {APP_URL}")
    print(f"📁 Output folder: {OUTPUT_DIR}/\n")
    
    # Parse events data
    events = []
    for line in EVENTS_DATA.strip().split('\n'):
        if line.strip() and ',' in line:
            parts = line.split(',', 1)  # Split only on first comma
            event_id = parts[0].strip()
            event_name = parts[1].strip() if len(parts) > 1 else f"Event_{event_id[:8]}"
            events.append((event_id, event_name))
    
    if not events:
        print("❌ No events found! Please paste event data in EVENTS_DATA variable.")
        print("\nExpected format:")
        print("event_id,event_name")
        print("uuid-here,Event Name Here")
        return
    
    print(f"📋 Found {len(events)} events to process\n")
    
    generated_count = 0
    
    for event_id, event_name in events:
        try:
            # Create QR code URL
            qr_url = f"{APP_URL}/scan?event={event_id}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Create filename
            clean_name = clean_filename(event_name)
            short_id = event_id[:8]
            filename = f"{clean_name}_{short_id}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            # Save QR code
            img.save(filepath)
            
            generated_count += 1
            print(f"✅ Generated: {filename}")
            
        except Exception as e:
            print(f"❌ Error generating QR for {event_name}: {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"🎉 Successfully generated {generated_count} QR codes!")
    print(f"📁 Saved in: {OUTPUT_DIR}/")
    print("\n💡 Tips:")
    print("  • Print these QR codes and place them at each event stall")
    print("  • Test by scanning with your phone camera or Google Lens")
    print("  • When you deploy to Vercel, update APP_URL and regenerate")

if __name__ == "__main__":
    generate_qr_codes()