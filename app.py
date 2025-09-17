from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///suivi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'teacher' or 'parent'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    prix_par_seance = db.Column(db.Float, nullable=False, default=0.0)  # Prix par séance (montant)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    parent = db.relationship('User', backref='children')
    sessions = db.relationship('Session', backref='student', lazy=True)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date_seance = db.Column(db.Date, nullable=False)
    duree_minutes = db.Column(db.Integer, nullable=False, default=60)
    montant = db.Column(db.Float, nullable=False)  # Montant de cette séance
    payee = db.Column(db.Boolean, default=False)  # Si la séance est payée
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def get_total_montant_du(student_id):
    """Calcule le montant total dû pour un étudiant (sessions non payées)"""
    unpaid_sessions = Session.query.filter_by(student_id=student_id, payee=False).all()
    return sum(session.montant for session in unpaid_sessions)

def get_total_montant_paye(student_id):
    """Calcule le montant total payé pour un étudiant"""
    paid_sessions = Session.query.filter_by(student_id=student_id, payee=True).all()
    return sum(session.montant for session in paid_sessions)

# Routes
@app.route('/')
def index():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if user.role == 'teacher':
        return redirect(url_for('teacher_dashboard'))
    else:
        return redirect(url_for('parent_dashboard'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['role'] = user.role
            flash('Connexion réussie!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Nom d\'utilisateur ou mot de passe incorrect', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Déconnexion réussie', 'info')
    return redirect(url_for('index'))

@app.route('/teacher')
def teacher_dashboard():
    if 'user_id' not in session or session.get('role') != 'teacher':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    students = Student.query.all()
    student_stats = []
    
    for student in students:
        stats = {
            'student': student,
            'total_sessions': len(student.sessions),
            'montant_du': get_total_montant_du(student.id),
            'montant_paye': get_total_montant_paye(student.id)
        }
        student_stats.append(stats)
    
    return render_template('teacher_dashboard.html', student_stats=student_stats)

@app.route('/parent')
def parent_dashboard():
    if 'user_id' not in session or session.get('role') != 'parent':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    children = Student.query.filter_by(parent_id=user_id).all()
    
    children_stats = []
    for child in children:
        stats = {
            'child': child,
            'sessions': Session.query.filter_by(student_id=child.id).order_by(Session.date_seance.desc()).all(),
            'montant_du': get_total_montant_du(child.id),
            'montant_paye': get_total_montant_paye(child.id)
        }
        children_stats.append(stats)
    
    return render_template('parent_dashboard.html', children_stats=children_stats)

@app.route('/add_student', methods=['GET', 'POST'])
def add_student():
    if 'user_id' not in session or session.get('role') != 'teacher':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        name = request.form['name']
        parent_email = request.form['parent_email']
        prix_par_seance = float(request.form['prix_par_seance'])
        
        # Chercher ou créer le parent
        parent = User.query.filter_by(email=parent_email).first()
        if not parent:
            flash('Parent non trouvé. Créez d\'abord le compte parent.', 'error')
            return render_template('add_student.html')
        
        student = Student(
            name=name,
            parent_id=parent.id,
            prix_par_seance=prix_par_seance
        )
        
        db.session.add(student)
        db.session.commit()
        
        flash(f'Étudiant {name} ajouté avec succès!', 'success')
        return redirect(url_for('teacher_dashboard'))
    
    return render_template('add_student.html')

@app.route('/add_session/<int:student_id>', methods=['GET', 'POST'])
def add_session(student_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    student = Student.query.get_or_404(student_id)
    
    if request.method == 'POST':
        date_str = request.form['date_seance']
        duree = int(request.form['duree_minutes'])
        montant = float(request.form['montant']) if request.form['montant'] else student.prix_par_seance
        notes = request.form['notes']
        
        session_obj = Session(
            student_id=student_id,
            date_seance=datetime.strptime(date_str, '%Y-%m-%d').date(),
            duree_minutes=duree,
            montant=montant,
            notes=notes
        )
        
        db.session.add(session_obj)
        db.session.commit()
        
        flash(f'Séance ajoutée pour {student.name}', 'success')
        return redirect(url_for('teacher_dashboard'))
    
    return render_template('add_session.html', student=student)

@app.route('/mark_paid/<int:session_id>')
def mark_paid(session_id):
    if 'user_id' not in session or session.get('role') != 'teacher':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    session_obj = Session.query.get_or_404(session_id)
    session_obj.payee = True
    db.session.commit()
    
    flash('Séance marquée comme payée', 'success')
    return redirect(url_for('teacher_dashboard'))

@app.route('/create_parent', methods=['POST'])
def create_parent():
    if 'user_id' not in session or session.get('role') != 'teacher':
        flash('Accès non autorisé', 'error')
        return redirect(url_for('login'))
    
    email = request.form['email']
    username = request.form['username']
    
    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        flash('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà', 'error')
        return redirect(url_for('add_student'))
    
    # Créer le parent avec un mot de passe par défaut
    parent = User(
        username=username,
        email=email,
        password_hash=generate_password_hash('parent123'),  # Mot de passe par défaut
        role='parent'
    )
    
    db.session.add(parent)
    db.session.commit()
    
    flash(f'Compte parent créé pour {email} (mot de passe: parent123)', 'success')
    return redirect(url_for('add_student'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Créer un utilisateur teacher par défaut si il n'existe pas
        if not User.query.filter_by(username='teacher').first():
            teacher = User(
                username='teacher',
                email='teacher@example.com',
                password_hash=generate_password_hash('password123'),
                role='teacher'
            )
            db.session.add(teacher)
            db.session.commit()
            print("Utilisateur teacher créé (username: teacher, password: password123)")
    
    app.run(debug=True, host='0.0.0.0', port=5000)