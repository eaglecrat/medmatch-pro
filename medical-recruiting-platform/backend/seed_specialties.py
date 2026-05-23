#!/usr/bin/env python3
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.specialty import Specialty

SPECIALTIES = [
    ("Registered Nurse - ICU", "Nursing", "Critical care nursing in intensive care units", "yes"),
    ("Registered Nurse - ER", "Nursing", "Emergency department nursing", "yes"),
    ("Registered Nurse - Med/Surg", "Nursing", "Medical-surgical nursing", "yes"),
    ("Registered Nurse - OR", "Nursing", "Operating room / perioperative nursing", "yes"),
    ("Registered Nurse - PACU", "Nursing", "Post-anesthesia care unit nursing", "yes"),
    ("Registered Nurse - Telemetry", "Nursing", "Cardiac telemetry monitoring", "yes"),
    ("Registered Nurse - Labor & Delivery", "Nursing", "Obstetric and neonatal nursing", "yes"),
    ("Registered Nurse - NICU", "Nursing", "Neonatal intensive care unit", "yes"),
    ("Registered Nurse - PICU", "Nursing", "Pediatric intensive care unit", "yes"),
    ("Registered Nurse - Oncology", "Nursing", "Cancer care nursing", "yes"),
    ("Registered Nurse - CVICU", "Nursing", "Cardiovascular intensive care", "yes"),
    ("Registered Nurse - Cath Lab", "Nursing", "Cardiac catheterization lab", "yes"),
    ("Registered Nurse - Dialysis", "Nursing", "Renal dialysis nursing", "yes"),
    ("Registered Nurse - Home Health", "Nursing", "Home-based patient care", "yes"),
    ("Registered Nurse - Case Management", "Nursing", "Patient care coordination", "yes"),
    ("Registered Nurse - Psychiatric", "Nursing", "Mental health nursing", "yes"),
    ("Registered Nurse - Rehab", "Nursing", "Rehabilitation nursing", "yes"),
    ("Registered Nurse - Skilled Nursing", "Nursing", "Long-term care facility nursing", "yes"),
    ("Registered Nurse - School Nurse", "Nursing", "K-12 health services", "yes"),
    ("Registered Nurse - Travel Nurse", "Nursing", "General travel nursing assignments", "yes"),
    ("Licensed Practical Nurse", "Nursing", "LPN/LVN clinical support", "no"),
    ("Certified Nursing Assistant", "Nursing", "CNA patient care support", "no"),
    ("Nurse Practitioner - Family", "Advanced Practice", "Family practice NP", "yes"),
    ("Nurse Practitioner - Acute Care", "Advanced Practice", "Acute care NP", "yes"),
    ("Nurse Practitioner - Psychiatric", "Advanced Practice", "Psych mental health NP", "yes"),
    ("Physician Assistant", "Advanced Practice", "PA general practice", "yes"),
    ("CRNA", "Advanced Practice", "Certified registered nurse anesthetist", "yes"),
    ("CNM", "Advanced Practice", "Certified nurse midwife", "yes"),
    ("Physician - Hospitalist", "Physician", "Internal medicine hospitalist", "yes"),
    ("Physician - Emergency Medicine", "Physician", "ER attending physician", "yes"),
    ("Physician - Anesthesiology", "Physician", "Anesthesia attending", "yes"),
    ("Physician - Radiology", "Physician", "Diagnostic radiologist", "yes"),
    ("Physician - Pathology", "Physician", "Clinical pathologist", "yes"),
    ("Physician - Surgery - General", "Physician", "General surgeon", "yes"),
    ("Physician - Surgery - Orthopedic", "Physician", "Orthopedic surgeon", "yes"),
    ("Physician - Surgery - Neuro", "Physician", "Neurosurgeon", "yes"),
    ("Physician - Surgery - Cardiac", "Physician", "Cardiothoracic surgeon", "yes"),
    ("Physician - OB/GYN", "Physician", "Obstetrics and gynecology", "yes"),
    ("Physician - Pediatrics", "Physician", "Pediatrician", "yes"),
    ("Physician - Psychiatry", "Physician", "Psychiatrist", "yes"),
    ("Physician - Neurology", "Physician", "Neurologist", "yes"),
    ("Physician - Cardiology", "Physician", "Cardiologist", "yes"),
    ("Physician - Gastroenterology", "Physician", "GI specialist", "yes"),
    ("Physician - Pulmonology", "Physician", "Pulmonary specialist", "yes"),
    ("Physician - Infectious Disease", "Physician", "ID specialist", "yes"),
    ("Physician - Hematology/Oncology", "Physician", "Blood and cancer specialist", "yes"),
    ("Physician - Nephrology", "Physician", "Kidney specialist", "yes"),
    ("Physician - Endocrinology", "Physician", "Endocrine specialist", "yes"),
    ("Physician - Rheumatology", "Physician", "Rheumatology specialist", "yes"),
    ("Physician - Dermatology", "Physician", "Dermatologist", "yes"),
    ("Physician - Ophthalmology", "Physician", "Eye specialist", "yes"),
    ("Physician - ENT", "Physician", "Otolaryngologist", "yes"),
    ("Physician - Urology", "Physician", "Urologist", "yes"),
    ("Physician - Plastic Surgery", "Physician", "Plastic surgeon", "yes"),
    ("Physician - Vascular Surgery", "Physician", "Vascular surgeon", "yes"),
    ("Physician - Trauma Surgery", "Physician", "Trauma surgeon", "yes"),
    ("Physician - Critical Care", "Physician", "Critical care medicine", "yes"),
    ("Physician - Pain Management", "Physician", "Pain medicine specialist", "yes"),
    ("Physician - Physical Medicine", "Physician", "PM&R specialist", "yes"),
    ("Physician - Sports Medicine", "Physician", "Sports medicine physician", "yes"),
    ("Physician - Geriatrics", "Physician", "Geriatric medicine", "yes"),
    ("Physician - Allergy/Immunology", "Physician", "Allergy and immunology", "yes"),
    ("Physician - Medical Genetics", "Physician", "Clinical geneticist", "yes"),
    ("Physician - Nuclear Medicine", "Physician", "Nuclear medicine specialist", "yes"),
    ("Physician - Radiation Oncology", "Physician", "Radiation oncologist", "yes"),
    ("Radiologic Technologist", "Allied Health", "X-ray, CT, MRI technologist", "no"),
    ("Ultrasound Technologist", "Allied Health", "Diagnostic medical sonographer", "no"),
    ("CT Technologist", "Allied Health", "Computed tomography technologist", "no"),
    ("MRI Technologist", "Allied Health", "Magnetic resonance imaging technologist", "no"),
    ("Mammography Technologist", "Allied Health", "Breast imaging technologist", "no"),
    ("Nuclear Medicine Technologist", "Allied Health", "Nuclear med imaging tech", "no"),
    ("Radiation Therapist", "Allied Health", "Radiation therapy delivery", "no"),
    ("Respiratory Therapist", "Allied Health", "RT critical care and vent management", "yes"),
    ("Physical Therapist", "Allied Health", "PT rehabilitation", "yes"),
    ("Occupational Therapist", "Allied Health", "OT functional rehabilitation", "yes"),
    ("Speech Language Pathologist", "Allied Health", "SLP swallow and communication", "yes"),
    ("Phlebotomist", "Allied Health", "Blood draw technician", "no"),
    ("Medical Lab Technician", "Allied Health", "Lab testing and analysis", "no"),
    ("Medical Lab Scientist", "Allied Health", "Advanced lab diagnostics", "no"),
    ("Surgical Technologist", "Allied Health", "OR scrub tech", "no"),
    ("Sterile Processing Tech", "Allied Health", "SPD instrument sterilization", "no"),
    ("Pharmacy Technician", "Allied Health", "Pharmacy support", "no"),
    ("Pharmacist", "Allied Health", "Clinical pharmacist", "yes"),
    ("Dietitian", "Allied Health", "Clinical nutrition specialist", "yes"),
    ("Social Worker - Clinical", "Allied Health", "LCSW hospital social work", "yes"),
    ("Social Worker - Medical", "Allied Health", "Medical social worker", "yes"),
    ("Chaplain", "Allied Health", "Hospital chaplaincy", "no"),
    ("Medical Coder", "Allied Health", "ICD/CPT coding specialist", "no"),
    ("Medical Scribe", "Allied Health", "Provider documentation support", "no"),
    ("Health Information Tech", "Allied Health", "HIM/EHR technician", "no"),
    ("EEG Technologist", "Allied Health", "Electroencephalography tech", "no"),
    ("EKG Technologist", "Allied Health", "Electrocardiography tech", "no"),
    ("Sleep Technologist", "Allied Health", "Polysomnography tech", "no"),
    ("Perfusionist", "Allied Health", "Cardiopulmonary bypass specialist", "yes"),
    ("Wound Care Specialist", "Allied Health", "Wound ostomy continence nurse", "yes"),
    ("Infection Preventionist", "Allied Health", "IC prevention and control", "yes"),
    ("Clinical Documentation Specialist", "Allied Health", "CDI query and review", "no"),
    ("Patient Care Technician", "Allied Health", "PCT bedside support", "no"),
    ("Emergency Medical Technician", "Allied Health", "EMT-B prehospital care", "yes"),
    ("Paramedic", "Allied Health", "Advanced prehospital care", "yes"),
    ("Flight Paramedic", "Allied Health", "Air medical transport paramedic", "yes"),
    ("Critical Care Paramedic", "Allied Health", "Critical care ground transport", "yes"),
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Specialty).count()
        if existing > 0:
            print(f"Database already has {existing} specialties. Skipping.")
            return
        for name, category, description, compact in SPECIALTIES:
            spec = Specialty(name=name, category=category, description=description, compact_eligible=compact)
            db.add(spec)
        db.commit()
        print(f"Seeded {len(SPECIALTIES)} specialties.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
