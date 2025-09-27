import React, { useState, useEffect } from 'react';
import { studentsService, sessionsService, paymentsService, classesService } from '../services/api';
import SessionCalendar from '../components/SessionCalendar';
import UserMenu from '../components/UserMenu';
import './TeacherDashboard.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subjects: string[];
  hourlyRate: number;
  active: boolean;
}

interface Session {
  id: string;
  studentId?: string;
  classId?: string;
  date: string;
  duration: number;
  subject: string;
  price: number;
  notes: string;
  status: string;
  type: 'individual' | 'class';
  student?: {
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    students: Array<{
      firstName: string;
      lastName: string;
    }>;
  };
}

interface Class {
  id: string;
  name: string;
  studentIds: string[];
  hourlyRate: number;
  description: string;
  active: boolean;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface Payment {
  id: string;
  studentId: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  student?: {
    firstName: string;
    lastName: string;
  };
}

const TeacherDashboard: React.FC = () => {
  // const { user, logout } = useAuth(); // Maintenant géré par UserMenu
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'sessions' | 'classes' | 'calendar' | 'payments'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les modales
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  // const [showAddPayment, setShowAddPayment] = useState(false); // Pas encore implémenté

  // États pour les formulaires
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', email: '', phone: '', subjects: '', hourlyRate: ''
  });
  const [newSession, setNewSession] = useState({
    studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual'
  });
  const [newClass, setNewClass] = useState({
    name: '', studentIds: [] as string[], hourlyRate: '', description: ''
  });
  // const [newPayment, setNewPayment] = useState({
  //   studentId: '', amount: '', dueDate: '', paymentMethod: ''
  // }); // Pas encore implémenté

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsRes, sessionsRes, paymentsRes, classesRes] = await Promise.all([
        studentsService.getAll(),
        sessionsService.getAll(),
        paymentsService.getAll(),
        classesService.getAll()
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (sessionsRes.success) setSessions(sessionsRes.sessions);
      if (paymentsRes.success) setPayments(paymentsRes.payments);
      if (classesRes.success) setClasses(classesRes.classes);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const studentData = {
        ...newStudent,
        subjects: ['Physique'], // Matière fixe
        hourlyRate: parseFloat(newStudent.hourlyRate)
      };
      
      const response = await studentsService.create(studentData);
      if (response.success) {
        setStudents([...students, response.student]);
        setNewStudent({ firstName: '', lastName: '', email: '', phone: '', subjects: '', hourlyRate: '' });
        setShowAddStudent(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élève:', error);
    }
  };

    const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...newSession,
        subject: 'Physique', // Matiere fixe
        duration: parseInt(newSession.duration),
        price: parseFloat(newSession.price),
        studentId: newSession.type === 'individual' ? newSession.studentId : undefined,
        classId: newSession.type === 'class' ? newSession.classId : undefined
      };
      
      const response = await sessionsService.create(sessionData);
      if (response.success) {
        setSessions([...sessions, response.session]);
        setNewSession({ studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual' });
        setShowAddSession(false);
      }
    } catch (error) {
      console.error('Erreur lors de ajout de la seance:', error);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const classData = {
        ...newClass,
        hourlyRate: parseFloat(newClass.hourlyRate)
      };
      
      const response = await classesService.create(classData);
      if (response.success) {
        setClasses([...classes, response.class]);
        setNewClass({ name: '', studentIds: [], hourlyRate: '', description: '' });
        setShowAddClass(false);
      }
    } catch (error) {
      console.error('Erreur lors de ajout de la classe:', error);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setNewClass(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const markPaymentAsPaid = async (paymentId: string) => {
    try {
      const response = await paymentsService.markAsPaid(paymentId, 'Espèces');
      if (response.success) {
        setPayments(payments.map(p => 
          p.id === paymentId ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors du marquage du paiement:', error);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'élève ${studentName} ? Cette action est irréversible.`)) {
      try {
        const response = await studentsService.delete(studentId);
        if (response.success) {
          setStudents(students.filter(s => s.id !== studentId));
          // Aussi filtrer les séances et paiements de cet élève
          setSessions(sessions.filter(s => s.studentId !== studentId));
          setPayments(payments.filter(p => p.studentId !== studentId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de élève:', error);
        alert('Erreur lors de la suppression de élève');
      }
    }
  };

  // Calculs pour la vue d'ensemble
  const totalStudents = students.filter(s => s.active).length;
  const totalSessions = sessions.length;
  const totalRevenue = sessions.reduce((sum, session) => sum + session.price, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  if (loading) {
    return <div className="loading">🔄 Chargement...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <nav className="header-nav">
          <button
            className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button
            className={`nav-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Élèves
          </button>
          <button
            className={`nav-button ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            Groupes d'élèves
          </button>
          <button
            className={`nav-button ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Séances
          </button>
          <button
            className={`nav-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendrier
          </button>
          <button
            className={`nav-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Paiements
          </button>
        </nav>
        <UserMenu />
      </header>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Élèves actifs</h3>
                <div className="stat-number">{totalStudents}</div>
              </div>
              <div className="stat-card">
                <h3>Séances données</h3>
                <div className="stat-number">{totalSessions}</div>
              </div>
              <div className="stat-card">
                <h3>Revenus totaux</h3>
                <div className="stat-number">{totalRevenue}€</div>
              </div>
              <div className="stat-card">
                <h3>Paiements en attente</h3>
                <div className="stat-number">{pendingPayments}</div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Activité récente</h2>
              <div className="activity-list">
                {sessions.slice(-5).reverse().map(session => (
                  <div key={session.id} className="activity-item">
                    <span>Séance de {session.subject} avec {session.student?.firstName} {session.student?.lastName}</span>
                    <span className="activity-date">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="students-tab">
            <div className="tab-header">
              <h2>Gestion des Élèves</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddStudent(true)}
              >
                ➕ Ajouter un élève
              </button>
            </div>

            {showAddStudent && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Ajouter un nouvel élève</h3>
                  <form onSubmit={handleAddStudent}>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={newStudent.firstName}
                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={newStudent.lastName}
                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                    />
                    <input
                      type="text"
                      placeholder="Matières enseignées"
                      value="Physique"
                      disabled
                      style={{ backgroundColor: '#f5f5f5', color: '#666' }}
                    />
                    <input
                      type="number"
                      placeholder="Tarif horaire (€)"
                      value={newStudent.hourlyRate}
                      onChange={(e) => setNewStudent({...newStudent, hourlyRate: e.target.value})}
                      required
                    />
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setShowAddStudent(false)}>Annuler</button>
                      <button type="submit">Ajouter</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="students-grid">
              {students.map(student => (
                <div key={student.id} className="student-card">
                  <div className="student-header">
                    <h3>{student.firstName} {student.lastName}</h3>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                      title="Supprimer cet élève"
                    >
                      Supprimer
                    </button>
                  </div>
                  <p>{student.email}</p>
                  <p>{student.phone}</p>
                  <p>Physique</p>
                  <p>{student.hourlyRate}€/h</p>
                  <div className={`status ${student.active ? 'active' : 'inactive'}`}>
                    {student.active ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-tab">
            <div className="tab-header">
              <h2>Gestion des Séances</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddSession(true)}
              >
                ➕ Nouvelle séance
              </button>
            </div>

            {showAddSession && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Enregistrer une nouvelle séance</h3>
                  <form onSubmit={handleAddSession}>
                    <div className="form-row">
                      <label>Type de séance:</label>
                      <select
                        value={newSession.type}
                        onChange={(e) => setNewSession({...newSession, type: e.target.value as 'individual' | 'class', studentId: '', classId: ''})}
                        required
                      >
                        <option value="individual">Cours individuel</option>
                        <option value="class">Cours en classe</option>
                      </select>
                    </div>

                    {newSession.type === 'individual' && (
                      <select
                        value={newSession.studentId}
                        onChange={(e) => setNewSession({...newSession, studentId: e.target.value})}
                        required
                      >
                        <option value="">Choisir un élève</option>
                        {students.filter(s => s.active).map(student => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    )}

                    {newSession.type === 'class' && (
                      <select
                        value={newSession.classId}
                        onChange={(e) => setNewSession({...newSession, classId: e.target.value})}
                        required
                      >
                        <option value="">Choisir une classe</option>
                        {classes.filter(c => c.active).map(classItem => (
                          <option key={classItem.id} value={classItem.id}>
                            {classItem.name} ({classItem.students?.length || 0} élèves)
                          </option>
                        ))}
                      </select>
                    )}
                    <input
                      type="datetime-local"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Durée (minutes)"
                      value={newSession.duration}
                      onChange={(e) => setNewSession({...newSession, duration: e.target.value})}
                      required
                    />
                    <div className="subject-display">
                      <label>Matière: <strong>Physique</strong></label>
                    </div>
                    <input
                      type="number"
                      placeholder="Prix (€)"
                      step="0.01"
                      value={newSession.price}
                      onChange={(e) => setNewSession({...newSession, price: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Notes (optionnel)"
                      value={newSession.notes}
                      onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                    />
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setShowAddSession(false)}>Annuler</button>
                      <button type="submit">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="sessions-list">
              {sessions.map(session => (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <h3>
                      {session.type === 'class' && session.class ? 
                        `${session.class.name}` : 
                        `${session.student?.firstName} ${session.student?.lastName}`
                      }
                    </h3>
                    <span className="session-date">
                      {new Date(session.date).toLocaleDateString()} à {new Date(session.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="session-details">
                    <p>{session.subject} • {session.duration}min • {session.price}€</p>
                    {session.notes && <p>{session.notes}</p>}
                    {session.type === 'class' && session.class && (
                      <p>Élèves: {session.class.students.map(s => `${s.firstName} ${s.lastName}`).join(', ')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="classes-tab">
            <div className="tab-header">
              <h2>Gestion des Groupes d'Élèves</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddClass(true)}
              >
                ➕ Nouveau groupe
              </button>
            </div>

            {showAddClass && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Créer un nouveau groupe d'élèves</h3>
                  <form onSubmit={handleAddClass}>
                    <input
                      type="text"
                      placeholder="Nom du groupe"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Tarif horaire du groupe (€)"
                      step="0.01"
                      value={newClass.hourlyRate}
                      onChange={(e) => setNewClass({...newClass, hourlyRate: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Description (optionnel)"
                      value={newClass.description}
                      onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                    />
                    <div className="students-selection">
                      <label>Sélectionner les élèves (minimum 2):</label>
                      <div className="students-checkboxes">
                        {students.filter(s => s.active).map(student => (
                          <label key={student.id} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={newClass.studentIds.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                            />
                            {student.firstName} {student.lastName}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="modal-buttons">
                      <button type="button" onClick={() => setShowAddClass(false)}>Annuler</button>
                      <button type="submit" disabled={newClass.studentIds.length < 2}>
                        Créer le groupe
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="classes-grid">
              {classes.map(classItem => (
                <div key={classItem.id} className="class-card">
                  <h3>{classItem.name}</h3>
                  <p>� {classItem.students?.length || 0} élèves</p>
                  <p>{classItem.hourlyRate}€/heure</p>
                  {classItem.description && <p>{classItem.description}</p>}
                  <div className="class-students">
                    <strong>Élèves:</strong>
                    <ul>
                      {classItem.students?.map(student => (
                        <li key={student.id}>{student.firstName} {student.lastName}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`status ${classItem.active ? 'active' : 'inactive'}`}>
                    {classItem.active ? 'Actif' : 'Inactif'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="calendar-tab">
            <h2>Calendrier des Séances</h2>
            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-color legend-individual"></div>
                <span>Cours individuel</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-class"></div>
                <span>Cours en groupe</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-scheduled"></div>
                <span>Séance planifiée</span>
              </div>
            </div>
            <SessionCalendar
              sessions={sessions}
              onSelectEvent={(event) => {
                console.log('Session sélectionnée:', event.resource);
              }}
              onSelectSlot={(slotInfo) => {
                console.log('Créneau sélectionné:', slotInfo);
                setNewSession({
                  ...newSession,
                  date: slotInfo.start.toISOString().slice(0, 16)
                });
                setShowAddSession(true);
              }}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <h2>Gestion des Paiements</h2>
            
            <div className="payments-list">
              {payments.map(payment => (
                <div key={payment.id} className={`payment-card ${payment.status}`}>
                  <div className="payment-header">
                    <h3>{payment.student?.firstName} {payment.student?.lastName}</h3>
                    <span className={`payment-status ${payment.status}`}>
                      {payment.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </div>
                  <div className="payment-details">
                    <p>Montant: {payment.amount}€</p>
                    <p>Échéance: {new Date(payment.dueDate).toLocaleDateString()}</p>
                    {payment.paidDate && (
                      <p>Payé le: {new Date(payment.paidDate).toLocaleDateString()}</p>
                    )}
                    {payment.status === 'pending' && (
                      <button 
                        className="mark-paid-btn"
                        onClick={() => markPaymentAsPaid(payment.id)}
                      >
                        Marquer comme payé
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
