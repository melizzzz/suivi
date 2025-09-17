#!/usr/bin/env python3

from app import app, db, User, Student, Session
from werkzeug.security import generate_password_hash
from datetime import date, datetime

with app.app_context():
    # Create tables
    db.create_all()
    
    # Create teacher if not exists
    if not User.query.filter_by(username='teacher').first():
        teacher = User(
            username='teacher',
            email='teacher@example.com',
            password_hash=generate_password_hash('password123'),
            role='teacher'
        )
        db.session.add(teacher)
    
    # Create parent if not exists
    if not User.query.filter_by(email='parent@example.com').first():
        parent = User(
            username='parent1',
            email='parent@example.com',
            password_hash=generate_password_hash('parent123'),
            role='parent'
        )
        db.session.add(parent)
        db.session.commit()
    
    # Create student with montant (pricing)
    parent = User.query.filter_by(email='parent@example.com').first()
    if not Student.query.filter_by(name='Sophie Martin').first():
        student = Student(
            name='Sophie Martin',
            parent_id=parent.id,
            prix_par_seance=25.50  # This is the key "montant" field
        )
        db.session.add(student)
        db.session.commit()
        
        # Add some sessions to demonstrate montant tracking
        sessions_data = [
            {'date': date(2025, 9, 10), 'montant': 25.50, 'payee': True},
            {'date': date(2025, 9, 12), 'montant': 25.50, 'payee': True},
            {'date': date(2025, 9, 15), 'montant': 25.50, 'payee': False},  # Unpaid
            {'date': date(2025, 9, 17), 'montant': 25.50, 'payee': False},  # Unpaid
        ]
        
        for session_data in sessions_data:
            session_obj = Session(
                student_id=student.id,
                date_seance=session_data['date'],
                duree_minutes=60,
                montant=session_data['montant'],
                payee=session_data['payee'],
                notes=f"Séance du {session_data['date'].strftime('%d/%m/%Y')}"
            )
            db.session.add(session_obj)
        
        db.session.commit()
        print(f"✅ Student {student.name} created with prix_par_seance: {student.prix_par_seance}€")
        print(f"✅ Added 4 sessions (2 paid, 2 unpaid) - Total unpaid: {2 * 25.50}€")
    
    # Create another student
    if not Student.query.filter_by(name='Lucas Dubois').first():
        student2 = Student(
            name='Lucas Dubois',
            parent_id=parent.id,
            prix_par_seance=30.00  # Different pricing
        )
        db.session.add(student2)
        db.session.commit()
        
        # Add sessions for second student
        session_obj = Session(
            student_id=student2.id,
            date_seance=date(2025, 9, 16),
            duree_minutes=60,
            montant=30.00,
            payee=False,  # Unpaid
            notes="Première séance"
        )
        db.session.add(session_obj)
        db.session.commit()
        print(f"✅ Student {student2.name} created with prix_par_seance: {student2.prix_par_seance}€")
    
    print("✅ Test data created successfully!")
    print("🔑 Teacher login: username=teacher, password=password123")
    print("🔑 Parent login: username=parent1, password=parent123")