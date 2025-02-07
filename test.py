import cv2
import openpyxl
from datetime import datetime
import os

# --- Configuration ---

# RTSP URL of your camera (ensure credentials are secured in your actual project)
rtsp_url = "rtsp://admin:Aircom007@192.168.0.136:554/Streaming/Channels/101"

# Excel file where attendance records will be appended
excel_file = "attendance.xlsx"

# --- Setup Excel Workbook ---

if not os.path.exists(excel_file):
    # Create a new workbook if the file does not exist
    workbook = openpyxl.Workbook()
    sheet = workbook.active
    # Write header row
    sheet.append(["Timestamp", "Status"])
    workbook.save(excel_file)
    print("Created new Excel file with headers.")
else:
    workbook = openpyxl.load_workbook(excel_file)
    sheet = workbook.active

# --- Setup Video Capture ---

cap = cv2.VideoCapture(rtsp_url)
if not cap.isOpened():
    print("Error: Cannot open RTSP stream.")
    exit()

# --- Load Haar Cascade for Face Detection ---

# OpenCV comes with pre-trained classifiers; adjust path if necessary.
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
if face_cascade.empty():
    print("Error: Could not load face cascade.")
    exit()

print("Starting video stream. Press 'q' to quit.")

# --- Main Loop ---
while True:
    ret, frame = cap.read()
    if not ret:
        print("Failed to retrieve frame. Exiting...")
        break

    # Convert frame to grayscale for the face detector
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
    
    # If a face is detected, log the attendance
    if len(faces) > 0:
        # Optionally, you could add a condition here so that you only log an attendance
        # record once per interval or per person.
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        status = "Present"
        print(f"Face detected at {timestamp}")
        sheet.append([timestamp, status])
        workbook.save(excel_file)
    
    # Optional: Display the video stream and mark detected faces
    for (x, y, w, h) in faces:
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv2.imshow("RTSP Camera Feed", frame)
    
    # Break the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# --- Cleanup ---
cap.release()
cv2.destroyAllWindows()
