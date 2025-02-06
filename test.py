# import cv2 as cv

# rtsp_url = "rtsp://admin:Aircom007@192.168.0.136:554/Streaming/Channels/101"

# cap = cv.VideoCapture(rtsp_url)

# if not cap.isOpened():
#     print("Cannot open video stream")
#     exit()

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         print("Failed to grab frame")
#         break
    
#     cv.imshow("Frame", frame)
#     if cv.waitKey(1) & 0xFF == ord('q'):
#         break

# cap.release()
# cv.destroyAllWindows()
import cv2
import face_recognition
import os
import numpy as np
from datetime import datetime
import pandas as pd
from openpyxl import load_workbook
import time

class AttendanceSystem:
    def __init__(self, employees_folder, excel_path, rtsp_url):
        self.known_face_encodings = []
        self.known_face_names = []
        self.excel_path = excel_path
        self.rtsp_url = rtsp_url
        self.load_employee_images(employees_folder)
        
    def load_employee_images(self, employees_folder):
        """Load and encode faces from employee images folder"""
        for filename in os.listdir(employees_folder):
            if filename.endswith((".jpg", ".jpeg", ".png")):
                image_path = os.path.join(employees_folder, filename)
                employee_image = face_recognition.load_image_file(image_path)
                face_encoding = face_recognition.face_encodings(employee_image)[0]
                
                # Get employee name from filename (assuming filename format: "john_doe.jpg")
                employee_name = os.path.splitext(filename)[0].replace("_", " ").title()
                
                self.known_face_encodings.append(face_encoding)
                self.known_face_names.append(employee_name)
                print(f"Loaded employee: {employee_name}")

    def mark_attendance(self, name):
        """Mark attendance in Excel file"""
        try:
            df = pd.read_excel(self.excel_path)
        except FileNotFoundError:
            # Create new Excel file if it doesn't exist
            df = pd.DataFrame(columns=['Name', 'Date', 'Time'])

        current_date = datetime.now().strftime('%Y-%m-%d')
        current_time = datetime.now().strftime('%H:%M:%S')
        
        # Check if attendance already marked for today
        today_record = df[(df['Name'] == name) & (df['Date'] == current_date)]
        if len(today_record) == 0:
            new_record = pd.DataFrame({
                'Name': [name],
                'Date': [current_date],
                'Time': [current_time]
            })
            df = pd.concat([df, new_record], ignore_index=True)
            df.to_excel(self.excel_path, index=False)
            print(f"Marked attendance for {name}")
            return True
        return False

    def run(self):
        """Run the attendance system"""
        cap = cv2.VideoCapture(self.rtsp_url)
        if not cap.isOpened():
            print("Cannot open video stream")
            return

        # Process every 30th frame to reduce CPU usage
        frame_count = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame")
                break
                
            frame_count += 1
            if frame_count % 30 != 0:
                # Show frame without processing
                cv2.imshow('Attendance System', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                continue
                
            # Resize frame for faster processing
            small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
            
            # Find faces in frame
            face_locations = face_recognition.face_locations(rgb_small_frame)
            face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
            
            for face_encoding, (top, right, bottom, left) in zip(face_encodings, face_locations):
                matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=0.6)
                name = "Unknown"
                
                if True in matches:
                    first_match_index = matches.index(True)
                    name = self.known_face_names[first_match_index]
                    
                    # Mark attendance
                    attendance_marked = self.mark_attendance(name)
                    
                    # Scale back face locations to original frame size
                    top *= 4
                    right *= 4
                    bottom *= 4
                    left *= 4
                    
                    # Draw rectangle around face
                    color = (0, 255, 0) if attendance_marked else (0, 255, 255)
                    cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                    
                    # Draw name label
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                    cv2.putText(frame, name, (left + 6, bottom - 6), 
                              cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
            
            cv2.imshow('Attendance System', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

# Usage example
if __name__ == "__main__":
    EMPLOYEES_FOLDER = "path/to/employees/folder"  # Folder containing employee photos
    EXCEL_PATH = "attendance_record.xlsx"          # Path for attendance Excel file
    RTSP_URL = "rtsp://admin:Aircom007@192.168.0.136:554/Streaming/Channels/101"
    
    attendance_system = AttendanceSystem(EMPLOYEES_FOLDER, EXCEL_PATH, RTSP_URL)
    attendance_system.run()