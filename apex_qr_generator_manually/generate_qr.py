import qrcode
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

# ============================================
# CONFIGURATION - EDIT THESE
# ============================================
# Your deployed app URL (change this when you deploy to Vercel)
APP_URL = "https://apexgne.vercel.app/"  # Change to your production URL later

# Paste your event data here (copy from Supabase export)
# Format: event_id,event_name,club_logo_name,club_name
EVENTS_DATA = """
06a33f6c-8434-4478-ae66-9d25c069a660,Capture the Moment,english_logo,English Club
163e340c-3f58-4bc1-808e-e7dc3faadfee,Bot Race,iste_logo,Indian Society for Technical Education
780e30e7-4cd2-4efb-838c-a1b9486c86ac,Circuit Quest,iste_logo,Indian Society for Technical Education
a3e694a2-4b23-4041-985d-208f2d25c814,Penalty Shootout,english_logo,English Club
ac132920-8d90-46d8-84a9-cfab4c724e38,Poetry Slam,english_logo,English Club
b79b6fef-4e3a-4c22-856f-ffc9a3baa67e,LAN Gaming Challenge,iste_logo,Indian Society for Technical Education
be5eec82-9b88-42b7-9c7b-5a7e7b0d79fa,Street Play,english_logo,English Club
c917bf5e-11f0-4991-ba09-7df6e47ebd26,Pixel Palette,english_logo,English Club
eb2b3be5-ca54-4f6d-af5d-d170b72a5f62,Green Quiz,iste_logo,Indian Society for Technical Education
f8f6fc04-32a1-4d65-9d37-59e70254068f,Battle of Bands,english_logo,English Club
"""

OUTPUT_DIR = 'qr_codes'
LOGO_DIR = './club-logos'

# QR Code and Logo Settings
QR_SIZE = 1000  # Base QR code size in pixels
QR_BORDER_RADIUS = 50  # Rounded corners radius for QR code
LOGO_SIZE_PERCENT = 0.25  # Logo will be 25% of QR code size (adjustable)
LOGO_BG_PADDING = 10  # White background padding around logo

# Text Settings
TEXT_HEIGHT = 180  # Space for text below QR code (increased for two lines)
EVENT_FONT_SIZE = 48  # Font size for event name
CLUB_FONT_SIZE = 32  # Font size for club name
TEXT_COLOR = (0, 0, 0)  # Black color for event name
CLUB_TEXT_COLOR = (150, 150, 150)  # Gray color for club name (faded)
LINE_SPACING = 10  # Space between event name and club name

# ============================================
# SCRIPT - DON'T EDIT BELOW THIS LINE
# ============================================

def clean_filename(name):
    """Remove special characters from event name for filename"""
    return "".join(c for c in name if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')


def add_rounded_corners_to_qr(qr_image, radius):
    """Add rounded corners to the QR code"""
    # Convert to RGBA if not already
    qr_img = qr_image.convert('RGBA')
    
    # Create a mask with rounded corners
    mask = Image.new('L', qr_img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), qr_img.size], radius=radius, fill=255)
    
    # Create output with transparency
    output = Image.new('RGBA', qr_img.size, (255, 255, 255, 0))
    output.paste(qr_img, (0, 0))
    output.putalpha(mask)
    
    return output


def find_logo_file(logo_name):
    """Find logo file with various extensions"""
    logo_path = Path(LOGO_DIR)
    
    for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']:
        logo_file = logo_path / f"{logo_name}{ext}"
        if logo_file.exists():
            return str(logo_file)
    
    return None


def add_logo_to_qr(qr_image, logo_path):
    """Add club logo to the center of QR code with white circular background"""
    # Open and convert QR code to RGBA
    qr_img = qr_image.convert('RGBA')
    
    # Open logo
    logo = Image.open(logo_path).convert('RGBA')
    
    # Calculate logo size
    logo_size = int(QR_SIZE * LOGO_SIZE_PERCENT)
    
    # Resize logo maintaining aspect ratio
    logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Make logo circular
    logo_mask = Image.new('L', logo.size, 0)
    draw = ImageDraw.Draw(logo_mask)
    draw.ellipse([(0, 0), logo.size], fill=255)
    logo.putalpha(logo_mask)
    
    # Create circular white background with padding
    bg_size = logo.size[0] + (LOGO_BG_PADDING * 2)
    background = Image.new('RGBA', (bg_size, bg_size), (255, 255, 255, 255))
    
    # Create circular mask for the background
    bg_mask = Image.new('L', (bg_size, bg_size), 0)
    draw_bg = ImageDraw.Draw(bg_mask)
    draw_bg.ellipse([(0, 0), (bg_size, bg_size)], fill=255)
    background.putalpha(bg_mask)
    
    # Paste logo on circular white background
    bg_pos = ((bg_size - logo.size[0]) // 2, (bg_size - logo.size[1]) // 2)
    background.paste(logo, bg_pos, logo)
    
    # Calculate position to center the logo on QR code
    logo_pos = ((QR_SIZE - bg_size) // 2, (QR_SIZE - bg_size) // 2)
    
    # Paste logo with white background onto QR code
    qr_img.paste(background, logo_pos, background)
    
    return qr_img


def add_text_below_qr(qr_image, event_name, club_name):
    """Add event name and club name text below the QR code"""
    # Create new image with extra height for text (white background)
    final_height = QR_SIZE + TEXT_HEIGHT
    final_image = Image.new('RGB', (QR_SIZE, final_height), 'white')
    
    # Convert QR to RGB for pasting (handles transparency by compositing on white)
    qr_rgb = Image.new('RGB', qr_image.size, 'white')
    qr_rgb.paste(qr_image, (0, 0), qr_image if qr_image.mode == 'RGBA' else None)
    
    # Paste QR code at the top
    final_image.paste(qr_rgb, (0, 0))
    
    # Prepare to draw text
    draw = ImageDraw.Draw(final_image)
    
    # Try to load fonts
    try:
        event_font = ImageFont.truetype("arial.ttf", EVENT_FONT_SIZE)
        club_font = ImageFont.truetype("arial.ttf", CLUB_FONT_SIZE)
    except:
        try:
            event_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", EVENT_FONT_SIZE)
            club_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", CLUB_FONT_SIZE)
        except:
            event_font = ImageFont.load_default()
            club_font = ImageFont.load_default()
            print("⚠️  Could not load custom font, using default")
    
    # Get text bounding boxes
    event_bbox = draw.textbbox((0, 0), event_name, font=event_font)
    event_width = event_bbox[2] - event_bbox[0]
    event_height = event_bbox[3] - event_bbox[1]
    
    club_bbox = draw.textbbox((0, 0), club_name, font=club_font)
    club_width = club_bbox[2] - club_bbox[0]
    club_height = club_bbox[3] - club_bbox[1]
    
    # Calculate total height of both lines
    total_text_height = event_height + LINE_SPACING + club_height
    
    # Calculate centered positions
    event_x = (QR_SIZE - event_width) // 2
    event_y = QR_SIZE + (TEXT_HEIGHT - total_text_height) // 2
    
    club_x = (QR_SIZE - club_width) // 2
    club_y = event_y + event_height + LINE_SPACING
    
    # Draw event name (bold effect)
    for offset_x in range(-1, 2):
        for offset_y in range(-1, 2):
            draw.text((event_x + offset_x, event_y + offset_y), event_name, font=event_font, fill=TEXT_COLOR)
    
    # Draw club name (faded, no bold effect)
    draw.text((club_x, club_y), club_name, font=club_font, fill=CLUB_TEXT_COLOR)
    
    return final_image


def generate_qr_codes():
    """Generate QR codes for all events with club logos and event names"""
    
    # Create output directory
    Path(OUTPUT_DIR).mkdir(exist_ok=True)
    
    # Check if logo directory exists
    if not Path(LOGO_DIR).exists():
        print(f"❌ Logo directory not found: {LOGO_DIR}")
        print(f"   Please create the directory and add club logos")
        return
    
    print("🚀 Apex Fest QR Code Generator (Enhanced with Rounded Modules)")
    print("=" * 60)
    print(f"📱 App URL: {APP_URL}")
    print(f"📁 Output folder: {OUTPUT_DIR}/")
    print(f"🎨 Logo folder: {LOGO_DIR}/")
    print(f"📐 Logo size: {int(LOGO_SIZE_PERCENT * 100)}% of QR code")
    print(f"✨ QR Style: Rounded/Globby modules\n")
    
    # Parse events data
    events = []
    for line in EVENTS_DATA.strip().split('\n'):
        if line.strip() and ',' in line:
            parts = line.split(',')
            if len(parts) >= 4:
                event_id = parts[0].strip()
                event_name = parts[1].strip()
                club_logo_name = parts[2].strip()
                club_name = parts[3].strip()
                events.append((event_id, event_name, club_logo_name, club_name))
            elif len(parts) >= 3:
                event_id = parts[0].strip()
                event_name = parts[1].strip()
                club_logo_name = parts[2].strip()
                print(f"⚠️  No club name specified for: {event_name}")
                events.append((event_id, event_name, club_logo_name, "Club"))
            elif len(parts) == 2:
                # Fallback for old format
                event_id = parts[0].strip()
                event_name = parts[1].strip()
                print(f"⚠️  No club logo/name specified for: {event_name}")
                events.append((event_id, event_name, None, "Club"))
    
    if not events:
        print("❌ No events found! Please paste event data in EVENTS_DATA variable.")
        print("\nExpected format:")
        print("event_id,event_name,club_logo_name,club_name")
        print("uuid-here,Event Name Here,club_name,Club Full Name")
        return
    
    print(f"📋 Found {len(events)} events to process\n")
    
    generated_count = 0
    
    for event_id, event_name, club_logo_name, club_name in events:
        try:
            # Create QR code URL
            qr_url = f"{APP_URL}/scan?event={event_id}"
            
            # Generate QR code with high error correction and rounded modules
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,  # Highest error correction
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            # Create QR code image with rounded modules (globby style)
            qr_img = qr.make_image(
                image_factory=StyledPilImage,
                module_drawer=RoundedModuleDrawer(),
                fill_color="black",
                back_color="white"
            )
            qr_img = qr_img.resize((QR_SIZE, QR_SIZE), Image.Resampling.LANCZOS)
            
            # Add logo if available
            if club_logo_name:
                logo_path = find_logo_file(club_logo_name)
                if logo_path:
                    qr_img = add_logo_to_qr(qr_img, logo_path)
                    print(f"  🎨 Added logo: {club_logo_name}")
                else:
                    print(f"  ⚠️  Logo not found: {club_logo_name} (continuing without logo)")
            
            # Add rounded corners to QR code
            qr_img = add_rounded_corners_to_qr(qr_img, QR_BORDER_RADIUS)
            
            # Add event name and club name text below QR code
            final_img = add_text_below_qr(qr_img, event_name, club_name)
            
            # Create filename
            clean_name = clean_filename(event_name)
            short_id = event_id[:8]
            filename = f"{clean_name}_{short_id}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            # Save final image
            final_img.save(filepath, quality=95)
            
            generated_count += 1
            print(f"✅ Generated: {filename}")
            
        except Exception as e:
            print(f"❌ Error generating QR for {event_name}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print(f"🎉 Successfully generated {generated_count} QR codes!")
    print(f"📁 Saved in: {OUTPUT_DIR}/")
    print("\n💡 Tips:")
    print("  • QR codes now have smooth, rounded 'globby' modules")
    print("  • Each has club logo in center with circular design")
    print("  • Event names in bold, club names in faded gray below")
    print("  • Test by scanning with your phone camera or Google Lens")
    print("  • Adjust LOGO_SIZE_PERCENT to change logo size")
    print("  • Adjust QR_BORDER_RADIUS to change corner roundness")
    print("  • When you deploy to Vercel, update APP_URL and regenerate")


if __name__ == "__main__":
    generate_qr_codes()