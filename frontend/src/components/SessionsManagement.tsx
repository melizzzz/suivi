import React, { useState } from 'react';
import { sessionsService } from '../services/api';
import './ManagementComponents.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hourlyRate: number;
  active: boolean;
}

interface Class {
  id: string;
  name: string;
  studentIds: string[];
  hourlyRate: number;
  description: string;
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

interface SessionsManagementProps {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  students: Student[];
  classes: Class[];
}

const SessionsManagement: React.FC<SessionsManagementProps> = ({ 
  sessions, 
  setSessions, 
  students, 
  classes 
}) => {
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    studentId: '', classId: '', date: '', duration: '', subject: '', price: '', notes: '', type: 'individual'
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
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
                  <option value="class">Cours en groupe</option>
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
                  <option value="">Choisir un groupe</option>
                  {classes.filter(c => c.active).map(classItem => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name}
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
              <input
                type="number"
                placeholder="Prix (DA)"
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
                <p className="session-date">{formatDate(session.date)}</p>
              </div>
            </div>
            
            <div className="session-details">
              <div className="detail-item">
                <span className="detail-label">⏱️ Durée</span>
                <span className="detail-value">{session.duration} min</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">💰 Prix</span>
                <span className="detail-value">{session.price} DA</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📝 Statut</span>
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
                ✏️ Modifier
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDeleteSession(session.id)}
                title="Supprimer cette séance"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SessionsManagement;
