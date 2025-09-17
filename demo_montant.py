#!/usr/bin/env python3

from app import app, db, User, Student, Session, get_total_montant_du, get_total_montant_paye

# Demonstrate the montant functionality programmatically
with app.app_context():
    print("=== DÉMONSTRATION DE LA FONCTIONNALITÉ MONTANT ===\n")
    
    # Show teacher view summary
    print("🎓 VUE PROFESSEUR - Résumé des montants:")
    students = Student.query.all()
    total_du_global = 0
    total_paye_global = 0
    
    for student in students:
        montant_du = get_total_montant_du(student.id)
        montant_paye = get_total_montant_paye(student.id)
        total_du_global += montant_du
        total_paye_global += montant_paye
        
        print(f"  • {student.name}:")
        print(f"    - Prix par séance: {student.prix_par_seance:.2f}€")
        print(f"    - Montant dû: {montant_du:.2f}€")
        print(f"    - Montant payé: {montant_paye:.2f}€")
        print(f"    - Nombre de séances: {len(student.sessions)}")
        print()
    
    print(f"💰 TOTAL GLOBAL:")
    print(f"  - Total à recevoir: {total_du_global:.2f}€")
    print(f"  - Total reçu: {total_paye_global:.2f}€")
    print()
    
    # Show parent view
    parent = User.query.filter_by(role='parent').first()
    if parent:
        print(f"👨‍👩‍👧‍👦 VUE PARENT ({parent.username}):")
        children = Student.query.filter_by(parent_id=parent.id).all()
        
        for child in children:
            print(f"  📚 Enfant: {child.name}")
            sessions = Session.query.filter_by(student_id=child.id).order_by(Session.date_seance.desc()).all()
            
            montant_du = get_total_montant_du(child.id)
            montant_paye = get_total_montant_paye(child.id)
            
            print(f"    - Prix par séance: {child.prix_par_seance:.2f}€")
            print(f"    - Montant dû: {montant_du:.2f}€ ⚠️")
            print(f"    - Montant payé: {montant_paye:.2f}€ ✅")
            print(f"    - Historique des séances:")
            
            for session in sessions:
                status = "✅ Payé" if session.payee else "⏳ En attente"
                print(f"      • {session.date_seance.strftime('%d/%m/%Y')}: {session.montant:.2f}€ - {status}")
            print()

    # Show unpaid sessions requiring action
    print("🔴 SÉANCES NON PAYÉES NÉCESSITANT UNE ACTION:")
    unpaid_sessions = Session.query.filter_by(payee=False).all()
    for session in unpaid_sessions:
        student = Student.query.get(session.student_id)
        print(f"  • {student.name} - {session.date_seance.strftime('%d/%m/%Y')}: {session.montant:.2f}€")
    
    if not unpaid_sessions:
        print("  ✅ Toutes les séances sont payées!")
    
    print(f"\n💡 Total en attente de paiement: {sum(s.montant for s in unpaid_sessions):.2f}€")