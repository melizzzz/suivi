
import React, { useState, useEffect } from 'react';
import { sessionsService, fixedSessionsService } from '../services/api';
import './ManagementComponents.css';
import type { Student, Class, Session, FixedSession } from '../types';

interface SessionsManagementProps {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  fixedSessions: FixedSession[];
  setFixedSessions: (fixedSessions: FixedSession[]) => void;
  students: Student[];
  classes: Class[];
}

const SessionsManagement: React.FC<SessionsManagementProps> = ({ 
  sessions, 
  setSessions,
  fixedSessions,
  setFixedSessions,
  students, 
  classes 
}) => {
  // Par défaut, on affiche l'onglet Séances fixes
  const [activeTab, setActiveTab] = useState<'occasional' | 'fixed'>('fixed');
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddFixedSession, setShowAddFixedSession] = useState(false);
  const [showEditFixedSession, setShowEditFixedSession] = useState(false);
  const [editingFixedSession, setEditingFixedSession] = useState<FixedSession | null>(null);
  const [newSession, setNewSession] = useState({
    studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual'
  });
  const [newFixedSession, setNewFixedSession] = useState({
    type: 'individual' as 'individual' | 'group',
    studentId: '',
    classId: '',
    dayOfWeek: '',
    startTime: '',
    duration: 60,
    price: 0,
    notes: ''
  });
  const [editFixedSession, setEditFixedSession] = useState({
    type: 'individual' as 'individual' | 'group',
    studentId: '',
    classId: '',
    dayOfWeek: '',
    startTime: '',
    duration: 60,
    price: 0,
    notes: ''
  });

  // Charger les séances fixes au montage du composant
  useEffect(() => {
    const loadFixedSessions = async () => {
      try {
        const response = await fixedSessionsService.getAll();
        if (response.success) {
          setFixedSessions(response.fixedSessions);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des séances fixes:', error);
      }
    };

    loadFixedSessions();
  }, [setFixedSessions]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...newSession,
        subject: 'Physique', // Matière fixe
        duration: parseInt(newSession.duration),
        price: parseFloat(newSession.price),
        studentId: newSession.type === 'individual' ? newSession.studentId : undefined,
        classId: newSession.type === 'class' ? newSession.classId : undefined,
        status: 'completed'
      };
      
      const response = await sessionsService.create(sessionData);
      if (response.success) {
        setSessions([...sessions, response.session]);
        setNewSession({ studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual' });
        setShowAddSession(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la séance:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      try {
        const response = await sessionsService.delete(sessionId);
        if (response.success) {
          setSessions(sessions.filter(s => s.id !== sessionId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleAddFixedSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fixedSessionData = {
        ...newFixedSession,
        subject: 'Physique' // Matière fixe
      };
      
      const response = await fixedSessionsService.create(fixedSessionData);
      if (response.success) {
        setFixedSessions([...fixedSessions, response.fixedSession]);
        setNewFixedSession({ 
          type: 'individual' as 'individual' | 'group',
          studentId: '',
          classId: '',
          dayOfWeek: '',
          startTime: '',
          duration: 60,
          price: 0,
          notes: ''
        });
        setShowAddFixedSession(false);
      } else {
        alert('Erreur lors de la création de la séance fixe: ' + (response.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la séance fixe:', error);
      alert('Erreur lors de la création de la séance fixe');
    }
  };

  const handleDeleteFixedSession = async (sessionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance fixe ?')) {
      try {
        const response = await fixedSessionsService.delete(sessionId);
        if (response.success) {
          setFixedSessions(fixedSessions.filter(s => s.id !== sessionId));
        } else {
          alert('Erreur lors de la suppression: ' + (response.message || 'Erreur inconnue'));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la séance fixe');
      }
    }
  };

  const handleEditFixedSession = (fixedSession: FixedSession) => {
    setEditingFixedSession(fixedSession);
    setEditFixedSession({
      type: fixedSession.type,
      studentId: fixedSession.studentId || '',
      classId: fixedSession.classId || '',
      dayOfWeek: fixedSession.dayOfWeek,
      startTime: fixedSession.startTime,
      duration: fixedSession.duration,
      price: fixedSession.price,
      notes: fixedSession.notes || ''
    });
    setShowEditFixedSession(true);
  };

  const handleUpdateFixedSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixedSession) return;

    try {
      const fixedSessionData = {
        ...editFixedSession,
        subject: 'Physique' // Matière fixe
      };
      
      const response = await fixedSessionsService.update(editingFixedSession.id, fixedSessionData);
      if (response.success) {
        setFixedSessions(fixedSessions.map(s => 
          s.id === editingFixedSession.id ? response.fixedSession : s
        ));
        setShowEditFixedSession(false);
        setEditingFixedSession(null);
        setEditFixedSession({ 
          type: 'individual' as 'individual' | 'group',
          studentId: '',
          classId: '',
          dayOfWeek: '',
          startTime: '',
          duration: 60,
          price: 0,
          notes: ''
        });
      } else {
        alert('Erreur lors de la modification: ' + (response.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la séance fixe');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayName = (dayOfWeek: string) => {
    const days: { [key: string]: string } = {
      'monday': 'Lundi',
      'tuesday': 'Mardi', 
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  return (
    <div className="sessions-tab">
      <div className="tab-header">
        <h2>Gestion des Séances</h2>
        <div className="sessions-tabs">
          <button 
            className={`tab-btn ${activeTab === 'occasional' ? 'active' : ''}`}
            onClick={() => setActiveTab('occasional')}
          >
             Séances Occasionnelles
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fixed' ? 'active' : ''}`}
            onClick={() => setActiveTab('fixed')}
          >
             Séances Fixes
          </button>
        </div>
        <button 
          className="add-btn"
          onClick={() => activeTab === 'occasional' ? setShowAddSession(true) : setShowAddFixedSession(true)}
        >
          ➕ {activeTab === 'occasional' ? 'Nouvelle séance' : 'Nouvelle séance fixe'}
        </button>
      </div>

      {activeTab === 'fixed' && (
        <div className="sessions-container">
          {fixedSessions.map(fixedSession => (
            <div key={fixedSession.id} className="session-box fixed-session">
              <div className="session-box-header">
                <div className="session-type-icon">
                  {fixedSession.type === 'individual' ? '👤' : '👥'}
                </div>
                <div className="session-info">
                  <h3>
                    {fixedSession.type === 'individual' 
                      ? (fixedSession.student 
                          ? `${fixedSession.student.firstName} ${fixedSession.student.lastName}`
                          : 'Étudiant non trouvé'
                        )
                      : (fixedSession.class?.name || 'Classe non trouvée')
                    }
                  </h3>
                  <p className="session-schedule">
                     Tous les {getDayName(fixedSession.dayOfWeek)} à {fixedSession.startTime}
                  </p>
                </div>
              </div>
              <div className="session-details">
                <div className="detail-item">
                  <span className="detail-label">⏱️ Durée</span>
                  <span className="detail-value">{fixedSession.duration} min</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💰 Prix</span>
                  <span className="detail-value">{fixedSession.price} DA</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📝 Statut</span>
                  <span className="detail-value">{fixedSession.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              {fixedSession.notes && (
                <div className="session-notes">
                  <h4>Notes :</h4>
                  <p>{fixedSession.notes}</p>
                </div>
              )}
              <div className="session-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => handleEditFixedSession(fixedSession)}
                  title="Modifier cette séance fixe"
                >
                  ✏️ Modifier
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteFixedSession(fixedSession.id)}
                  title="Supprimer cette séance fixe"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal pour les séances fixes */}
      {showAddFixedSession && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Créer une séance fixe</h3>
            <form onSubmit={handleAddFixedSession}>
              <div className="form-group">
                <label>Type de séance</label>
                <select 
                  value={newFixedSession.type} 
                  onChange={(e) => setNewFixedSession({...newFixedSession, type: e.target.value as 'individual' | 'group'})}
                  required
                >
                  <option value="individual">Cours individuel</option>
                  <option value="group">Cours de groupe</option>
                </select>
              </div>

              {newFixedSession.type === 'individual' && (
                <div className="form-group">
                  <label>Étudiant</label>
                  <select 
                    value={newFixedSession.studentId} 
                    onChange={(e) => setNewFixedSession({...newFixedSession, studentId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newFixedSession.type === 'group' && (
                <div className="form-group">
                  <label>Classe</label>
                  <select 
                    value={newFixedSession.classId} 
                    onChange={(e) => setNewFixedSession({...newFixedSession, classId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Jour de la semaine</label>
                <select 
                  value={newFixedSession.dayOfWeek} 
                  onChange={(e) => setNewFixedSession({...newFixedSession, dayOfWeek: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un jour</option>
                  <option value="monday">Lundi</option>
                  <option value="tuesday">Mardi</option>
                  <option value="wednesday">Mercredi</option>
                  <option value="thursday">Jeudi</option>
                  <option value="friday">Vendredi</option>
                  <option value="saturday">Samedi</option>
                  <option value="sunday">Dimanche</option>
                </select>
              </div>

              <div className="form-group">
                <label>Heure de début</label>
                <input 
                  type="time" 
                  value={newFixedSession.startTime} 
                  onChange={(e) => setNewFixedSession({...newFixedSession, startTime: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Durée (minutes)</label>
                <input 
                  type="number" 
                  value={newFixedSession.duration} 
                  onChange={(e) => setNewFixedSession({...newFixedSession, duration: parseInt(e.target.value) || 0})}
                  required 
                  min="15"
                  step="15"
                />
              </div>

              <div className="form-group">
                <label>Prix (DA)</label>
                <input 
                  type="number" 
                  value={newFixedSession.price} 
                  onChange={(e) => setNewFixedSession({...newFixedSession, price: parseFloat(e.target.value) || 0})}
                  required 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowAddFixedSession(false)}>Annuler</button>
                <button type="submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition de séance fixe */}
      {showEditFixedSession && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Modifier la séance fixe</h2>
            <form onSubmit={handleUpdateFixedSession}>
              <div className="form-group">
                <label>Type de séance</label>
                <select 
                  value={editFixedSession.type} 
                  onChange={(e) => setEditFixedSession({...editFixedSession, type: e.target.value as 'individual' | 'group'})}
                  required
                >
                  <option value="individual">Cours individuel</option>
                  <option value="group">Cours de groupe</option>
                </select>
              </div>

              {editFixedSession.type === 'individual' && (
                <div className="form-group">
                  <label>Étudiant</label>
                  <select 
                    value={editFixedSession.studentId || ''} 
                    onChange={(e) => setEditFixedSession({...editFixedSession, studentId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editFixedSession.type === 'group' && (
                <div className="form-group">
                  <label>Classe</label>
                  <select 
                    value={editFixedSession.classId || ''} 
                    onChange={(e) => setEditFixedSession({...editFixedSession, classId: e.target.value})}
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Jour de la semaine</label>
                <select 
                  value={editFixedSession.dayOfWeek} 
                  onChange={(e) => setEditFixedSession({...editFixedSession, dayOfWeek: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un jour</option>
                  <option value="monday">Lundi</option>
                  <option value="tuesday">Mardi</option>
                  <option value="wednesday">Mercredi</option>
                  <option value="thursday">Jeudi</option>
                  <option value="friday">Vendredi</option>
                  <option value="saturday">Samedi</option>
                  <option value="sunday">Dimanche</option>
                </select>
              </div>

              <div className="form-group">
                <label>Heure de début</label>
                <input 
                  type="time" 
                  value={editFixedSession.startTime} 
                  onChange={(e) => setEditFixedSession({...editFixedSession, startTime: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Durée (minutes)</label>
                <input 
                  type="number" 
                  value={editFixedSession.duration} 
                  onChange={(e) => setEditFixedSession({...editFixedSession, duration: parseInt(e.target.value)})}
                  required 
                  min="15"
                  step="15"
                />
              </div>

              <div className="form-group">
                <label>Prix (DA)</label>
                <input 
                  type="number" 
                  value={editFixedSession.price} 
                  onChange={(e) => setEditFixedSession({...editFixedSession, price: parseFloat(e.target.value)})}
                  required 
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowEditFixedSession(false)}>Annuler</button>
                <button type="submit">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contenu des onglets */}
      {activeTab === 'occasional' && (
        <div className="sessions-container">
          {sessions.map(session => (
            <div key={session.id} className="session-box">
              <div className="session-box-header">
                <div className="session-type-icon">
                  {session.type === 'individual' ? '👤' : '👥'}
                </div>
                <div className="session-info">
                  <h3>
                    {session.type === 'individual' 
                      ? `${session.student?.firstName} ${session.student?.lastName}`
                      : session.class?.name
                    }
                  </h3>
                  <p className="session-date">{formatDate(session.date || '')}</p>
                </div>
              </div>
              
              <div className="session-details">
                <div className="detail-item">
                  <span className="detail-label">⏱ Durée</span>
                  <span className="detail-value">{session.duration} min</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"> Prix</span>
                  <span className="detail-value">{session.price} DA</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"> Statut</span>
                  <span className={`session-status ${session.status}`}>
                    {session.status === 'completed' ? 'Terminée' : 
                     session.status === 'planned' ? 'Planifiée' : 'Annulée'}
                  </span>
                </div>
              </div>

              {session.notes && (
                <div className="session-notes">
                  <h4>Notes :</h4>
                  <p>{session.notes}</p>
                </div>
              )}
              
              <div className="session-actions">
                <button 
                  className="action-btn edit-btn"
                  onClick={() => {
                    // TODO: Implémenter la modification
                    console.log('Modifier séance:', session.id);
                  }}
                  title="Modifier cette séance"
                >
                   Modifier
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteSession(session.id)}
                  title="Supprimer cette séance"
                >
                   Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SessionsManagement;
