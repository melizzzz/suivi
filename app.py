from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre-cle-secrete-ici'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///suivi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    user_type = db.Column(db.String(20), nullable=False, default='parent')  # 'teacher' or 'parent'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)
    
    parent = db.relationship('User', backref=db.backref('enfants', lazy=True))
    sessions = db.relationship('SessionEleve', backref='eleve', lazy=True)

class SessionEleve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date_session = db.Column(db.DateTime, nullable=False)
    prix = db.Column(db.Float, nullable=False)
    matiere = db.Column(db.String(100), nullable=False)
    duree = db.Column(db.Integer, nullable=False)  # en minutes
    payee = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        if current_user.user_type == 'teacher':
            return redirect(url_for('dashboard_teacher'))
        else:
            return redirect(url_for('dashboard_parent'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Nom d\'utilisateur ou mot de passe incorrect')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        user_type = request.form.get('user_type', 'parent')
        
        if User.query.filter_by(username=username).first():
            flash('Ce nom d\'utilisateur existe déjà')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Cet email existe déjà')
            return render_template('register.html')
        
        user = User(username=username, email=email, user_type=user_type)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Inscription réussie')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard/teacher')
@login_required
def dashboard_teacher():
    if current_user.user_type != 'teacher':
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    students = Student.query.all()
    return render_template('dashboard_teacher.html', students=students)

@app.route('/dashboard/parent')
@login_required
def dashboard_parent():
    if current_user.user_type != 'parent':
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    enfants = Student.query.filter_by(parent_id=current_user.id).all()
    return render_template('dashboard_parent.html', enfants=enfants)

@app.route('/add_student', methods=['GET', 'POST'])
@login_required
def add_student():
    if current_user.user_type != 'teacher':
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        nom = request.form['nom']
        prenom = request.form['prenom']
        parent_email = request.form['parent_email']
        
        parent = User.query.filter_by(email=parent_email).first()
        if not parent:
            flash('Parent non trouvé avec cet email')
            return render_template('add_student.html')
        
        student = Student(nom=nom, prenom=prenom, parent_id=parent.id)
        db.session.add(student)
        db.session.commit()
        
        flash('Élève ajouté avec succès')
        return redirect(url_for('dashboard_teacher'))
    
    return render_template('add_student.html')

@app.route('/add_session/<int:student_id>', methods=['GET', 'POST'])
@login_required
def add_session(student_id):
    if current_user.user_type != 'teacher':
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    student = Student.query.get_or_404(student_id)
    
    if request.method == 'POST':
        date_session = datetime.strptime(request.form['date_session'], '%Y-%m-%dT%H:%M')
        prix = float(request.form['prix'])
        matiere = request.form['matiere']
        duree = int(request.form['duree'])
        notes = request.form.get('notes', '')
        
        session_eleve = SessionEleve(
            student_id=student_id,
            date_session=date_session,
            prix=prix,
            matiere=matiere,
            duree=duree,
            notes=notes
        )
        
        db.session.add(session_eleve)
        db.session.commit()
        
        flash('Session ajoutée avec succès')
        return redirect(url_for('view_student', student_id=student_id))
    
    return render_template('add_session.html', student=student)

@app.route('/student/<int:student_id>')
@login_required
def view_student(student_id):
    student = Student.query.get_or_404(student_id)
    
    # Vérifier les permissions
    if current_user.user_type == 'parent' and student.parent_id != current_user.id:
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    sessions = SessionEleve.query.filter_by(student_id=student_id).order_by(SessionEleve.date_session.desc()).all()
    
    # Calculer les totaux
    total_sessions = len(sessions)
    total_a_payer = sum(session.prix for session in sessions if not session.payee)
    total_paye = sum(session.prix for session in sessions if session.payee)
    
    return render_template('view_student.html', 
                         student=student, 
                         sessions=sessions,
                         total_sessions=total_sessions,
                         total_a_payer=total_a_payer,
                         total_paye=total_paye)

@app.route('/mark_paid/<int:session_id>')
@login_required
def mark_paid(session_id):
    if current_user.user_type != 'teacher':
        flash('Accès non autorisé')
        return redirect(url_for('index'))
    
    session_eleve = SessionEleve.query.get_or_404(session_id)
    session_eleve.payee = not session_eleve.payee
    db.session.commit()
    
    flash('Statut de paiement mis à jour')
    return redirect(url_for('view_student', student_id=session_eleve.student_id))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Créer un utilisateur professeur par défaut si il n'existe pas
        if not User.query.filter_by(username='teacher').first():
            teacher = User(username='teacher', email='teacher@example.com', user_type='teacher')
            teacher.set_password('password')
            db.session.add(teacher)
            db.session.commit()
    
    app.run(debug=True)