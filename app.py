from flask import Flask, render_template, request, send_file
from ultralytics import YOLO
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from PIL import Image
import mimetypes
import cv2

# Initialize Flask app
app = Flask(__name__)

# Load YOLO model
model_path = "yolov9s.pt"  # Replace with your YOLO model file
try:
    model = YOLO(model_path)
except Exception as e:
    raise ValueError(f"Error loading YOLO model: {e}")

# Output directory
output_dir = "./output"
os.makedirs(output_dir, exist_ok=True)

def is_valid_image(file_path):
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except (IOError, SyntaxError):
        return False

def is_image_file(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    return mime_type and mime_type.startswith('image')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    image_type = request.form.get('image_type')
    uploaded_file = request.files.get('image')

    if not uploaded_file:
        return {"success": False, "error": "No file uploaded."}

    image_path = os.path.join(output_dir, f"{image_type}.jpg")
    uploaded_file.save(image_path)

    if not is_valid_image(image_path):
        return {"success": False, "error": "Uploaded file is not a valid image."}
    
    if not is_image_file(image_path):
        return {"success": False, "error": "Uploaded file is not an image type."}

    output_name = f"{image_type}_annotated.jpg"
    detect_objects(image_path, output_name)
    return {"success": True}

@app.route('/generate_report', methods=['POST'])
def generate_report_route():
    before_image_path = os.path.join(output_dir, "before.jpg")
    after_image_path = os.path.join(output_dir, "after.jpg")
    before_objects = detect_objects(before_image_path, "before_annotated.jpg")
    after_objects = detect_objects(after_image_path, "after_annotated.jpg")
    before_annotated_path = os.path.join(output_dir, "before_annotated.jpg")
    after_annotated_path = os.path.join(output_dir, "after_annotated.jpg")
    report_path = generate_report(before_objects, after_objects, before_annotated_path, after_annotated_path)
    return send_file(
        report_path,
        as_attachment=True,
        mimetype='application/pdf',
        download_name='cleanup_report.pdf'
    )

def detect_objects(image_path, output_name):
    results = model.predict(image_path, save=False)
    annotated_image = results[0].plot()
    annotated_image_path = os.path.join(output_dir, output_name)
    cv2.imwrite(annotated_image_path, annotated_image)
    return [int(box[-1]) for box in results[0].boxes.data.tolist()]

def generate_report(before_objects, after_objects, before_annotated_path, after_annotated_path):
    removed_objects = set(before_objects) - set(after_objects)
    remaining_objects = set(before_objects) & set(after_objects)
    report_path = os.path.join(output_dir, "cleanup_report.pdf")
    c = canvas.Canvas(report_path, pagesize=letter)
    width, height = letter
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Garbage Cleanup Report")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 100, f"Removed Objects: {len(removed_objects)}")
    for i, obj in enumerate(removed_objects, start=1):
        c.drawString(70, height - 100 - i * 15, f"- Object ID: {obj}")
    remaining_y = height - 120 - len(removed_objects) * 15
    c.drawString(50, remaining_y, f"Remaining Objects: {len(remaining_objects)}")
    for i, obj in enumerate(remaining_objects, start=1):
        c.drawString(70, remaining_y - i * 15, f"- Object ID: {obj}")
    image_y = remaining_y - len(remaining_objects) * 15 - 50
    c.drawString(50, image_y, "Annotated Images:")
    c.drawImage(before_annotated_path, 50, image_y - 250, width=250, height=250)
    c.drawString(50, image_y - 260, "Before Cleanup")
    c.drawImage(after_annotated_path, 320, image_y - 250, width=250, height=250)
    c.drawString(320, image_y - 260, "After Cleanup")
    c.save()
    return report_path

if __name__ == '__main__':
    app.run(debug=True)
