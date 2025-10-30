import qrcode
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
import math

class VercelStyleModuleDrawer:
    """
    Custom module drawer that creates Vercel-style QR codes with rounded edges
    on the three positioning squares (markers) and standard square modules for
    the rest of the QR code
    """
    def __init__(self, radius_ratio=0.3):
        self.radius_ratio = radius_ratio

    def drawrect(self, box, is_position_marker=False):
        """
        Draw a rectangle for a QR code module
        """
        # For position markers, draw with rounded corners
        if is_position_marker:
            # Draw a rounded rectangle
            return lambda draw, x, y, size, color: draw.rounded_rectangle(
                [(x, y), (x + size, y + size)],
                radius=size * self.radius_ratio,
                fill=color
            )
        else:
            # For regular modules, draw standard square
            return lambda draw, x, y, size, color: draw.rectangle(
                [(x, y), (x + size, y + size)],
                fill=color
            )


class VercelStyleImage(StyledPilImage):
    """
    Custom QR code image factory that applies Vercel-style rounded corners
    to the position markers while keeping other modules as squares
    """
    def __init__(self, *args, **kwargs):
        self.vercel_drawer = kwargs.pop('vercel_drawer', VercelStyleModuleDrawer())
        super().__init__(*args, **kwargs)
        
    def drawrect(self, row, col, is_active=True):
        """
        Draw a module rectangle, with special handling for position markers
        """
        if not is_active:
            return
            
        # Determine if this module is part of a position marker
        is_position_marker = self._is_position_marker_module(row, col)
        
        # Get the appropriate drawing function from our custom drawer
        draw_func = self.vercel_drawer.drawrect(None, is_position_marker)
        
        # Calculate coordinates
        x = (col + self.border) * self.box_size
        y = (row + self.border) * self.box_size
        size = self.box_size
        
        # Draw the module
        draw_func(self._img, x, y, size, self.fill_color)
        
    def _is_position_marker_module(self, row, col):
        """
        Determine if a module at (row, col) is part of one of the three position markers
        """
        # Position markers are located at fixed positions in QR codes:
        # 1. Top-left marker (always at position (0,0))
        # 2. Top-right marker (at position (0, size-7))
        # 3. Bottom-left marker (at position (size-7, 0))
        
        size = self.width - 2 * self.border  # Size without border
        modules_count = size // self.box_size  # Number of modules
        
        # Check if module is in top-left position marker area (7x7 modules)
        if row < 7 and col < 7:
            # But not in the inner 3x3 "hole"
            if row >= 2 and row < 5 and col >= 2 and col < 5:
                return False
            return True
            
        # Check if module is in top-right position marker area (7x7 modules)
        if row < 7 and col >= modules_count - 7:
            # But not in the inner 3x3 "hole"
            if row >= 2 and row < 5 and col >= modules_count - 5 and col < modules_count - 2:
                return False
            return True
            
        # Check if module is in bottom-left position marker area (7x7 modules)
        if row >= modules_count - 7 and col < 7:
            # But not in the inner 3x3 "hole"
            if row >= modules_count - 5 and row < modules_count - 2 and col >= 2 and col < 5:
                return False
            return True
            
        return False

# ============================================
# CONFIGURATION - EDIT THESE
# ============================================
# Your deployed app URL (change this when you deploy to Vercel)
APP_URL = "https://apexgne.vercel.app/"  # Change to your production URL later

# Paste your student data here (copy from Supabase export)
# Format: student_id (just the last 4 digits of uuid)
STUDENTS_DATA = """
085f
a339
a108
f39e
725b
89c0
7c89
4553
afab
0c19
2477
764a
e876
6580
071c
ad64
674e
8d74
6c6b
7f08
ef08
c396
1e00
c9f8
6e90
a89c
f8d0
7955
2561
d4db
ed6b
4274
45cb
7760
"""

OUTPUT_DIR = 'student_qr_codes'

# QR Code Settings
QR_SIZE = 1000  # Base QR code size in pixels
QR_BORDER_RADIUS = 50  # Rounded corners radius for QR code

# Text Settings
TEXT_HEIGHT = 120  # Space for text below QR code
STUDENT_ID_FONT_SIZE = 48  # Font size for student ID
TEXT_COLOR = (0, 0, 0)  # Black color for text

# ============================================
# SCRIPT - DON'T EDIT BELOW THIS LINE
# ============================================

def clean_filename(name):
    """Remove special characters from student ID for filename"""
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


def add_text_below_qr(qr_image, student_id):
    """Add student ID text below the QR code"""
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
        student_font = ImageFont.truetype("arial.ttf", STUDENT_ID_FONT_SIZE)
    except:
        try:
            student_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", STUDENT_ID_FONT_SIZE)
        except:
            student_font = ImageFont.load_default()
            print("⚠️  Could not load custom font, using default")
    
    # Get text bounding box
    student_bbox = draw.textbbox((0, 0), student_id, font=student_font)
    student_width = student_bbox[2] - student_bbox[0]
    student_height = student_bbox[3] - student_bbox[1]
    
    # Calculate centered positions
    student_x = (QR_SIZE - student_width) // 2
    student_y = QR_SIZE + (TEXT_HEIGHT - student_height) // 2
    
    # Draw student ID (bold effect)
    for offset_x in range(-1, 2):
        for offset_y in range(-1, 2):
            draw.text((student_x + offset_x, student_y + offset_y), student_id, font=student_font, fill=TEXT_COLOR)
    
    return final_image


def generate_student_qr_codes():
    """Generate QR codes for all students"""
    
    # Create output directory
    Path(OUTPUT_DIR).mkdir(exist_ok=True)
    
    print("🚀 Apex Student QR Code Generator (Enhanced with Vercel-style Position Markers)")
    print("=" * 60)
    print(f"📱 App URL: {APP_URL}")
    print(f"📁 Output folder: {OUTPUT_DIR}/")
    print(f"✨ QR Style: Vercel-style with rounded position markers\n")
    
    # Parse students data
    students = []
    for line in STUDENTS_DATA.strip().split('\n'):
        if line.strip():
            student_id = line.strip()
            students.append(student_id)
    
    if not students:
        print("❌ No students found! Please paste student data in STUDENTS_DATA variable.")
        print("\nExpected format:")
        print("student_id")
        print("4-character ID like: abcd")
        return
    
    print(f"📋 Found {len(students)} students to process\n")
    
    generated_count = 0
    
    for student_id in students:
        try:
            # Create QR code URL
            qr_url = f"{APP_URL}/clubdashboard?student_id={student_id}"
            
            # Generate QR code with high error correction and rounded modules
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,  # Highest error correction
                box_size=10,
                border=4,
            )
            qr.add_data(qr_url)
            qr.make(fit=True)
            
            # Create QR code image with Vercel-style position markers
            qr_img = qr.make_image(
                image_factory=VercelStyleImage,
                vercel_drawer=VercelStyleModuleDrawer(),
                fill_color="black",
                back_color="white"
            )
            qr_img = qr_img.resize((QR_SIZE, QR_SIZE), Image.Resampling.LANCZOS)
            
            # Add rounded corners to QR code
            qr_img = add_rounded_corners_to_qr(qr_img, QR_BORDER_RADIUS)
            
            # Add student ID text below QR code
            final_img = add_text_below_qr(qr_img, student_id)
            
            # Create filename
            clean_name = clean_filename(student_id)
            filename = f"student_{clean_name}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            # Save final image
            final_img.save(filepath, quality=95)
            
            generated_count += 1
            print(f"✅ Generated: {filename}")
            
        except Exception as e:
            print(f"❌ Error generating QR for {student_id}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print(f"🎉 Successfully generated {generated_count} student QR codes!")
    print(f"📁 Saved in: {OUTPUT_DIR}/")
    print("\n💡 Tips:")
    print("  • QR codes now have Vercel-style position markers with rounded corners")
    print("  • Each QR code redirects to the club dashboard with student_id parameter")
    print("  • Student ID is displayed below each QR code")
    print("  • Test by scanning with your phone camera or Google Lens")


if __name__ == "__main__":
    generate_student_qr_codes()