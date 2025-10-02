import React, { useState, useEffect } from 'react';
import { realizedSessionsService } from '../services/api';
import type { FixedSession } from '../types';
import './SessionHistory.css';

interface SessionHistoryProps {
  fixedSession: FixedSession;
  onBack: () => void;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ fixedSession, onBack }) => {
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedHistorySession, setSelectedHistorySession] = useState<any>(null);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState({
    date: '',
    notes: '',
    students: [] as any[]
  });

  useEffect(() => {
    loadRealizedSessions();
  }, [fixedSession]);

  const loadRealizedSessions = async () => {
    try {
      const response = await realizedSessionsService.getByFixedSessionId(fixedSession.id);
      if (response.success) {
        // Trier les séances par date (plus récentes en premier)
        const sortedSessions = response.realizedSessions.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setSessionHistory(sortedSessions);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    }
  };

  const handleAddSession = () => {
    let students: any[] = [];
    
    if (fixedSession.type === 'individual' && fixedSession.student) {
      students = [{
        studentId: fixedSession.studentId,
        firstName: fixedSession.student.firstName,
        lastName: fixedSession.student.lastName,
        present: true,
        notes: ''
      }];
    } else if (fixedSession.type === 'group' && fixedSession.class?.students) {
      students = fixedSession.class.students.map((student, index) => ({
        studentId: `student-${index}`, // ID temporaire, à remplacer par le vrai ID
        firstName: student.firstName,
        lastName: student.lastName,
        present: true,
        notes: ''
      }));
    }
    
    setNewSessionData({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      students: students
    });
    setShowAddSessionModal(true);
  };

  const handleSaveNewSession = async () => {
    try {
      const sessionData = {
        fixedSessionId: fixedSession.id,
        date: new Date(newSessionData.date).toISOString(),
        duration: fixedSession.duration,
        price: fixedSession.price,
        notes: newSessionData.notes,
        students: newSessionData.students
      };

      const response = await realizedSessionsService.create(sessionData);
      if (response.success) {
        await loadRealizedSessions();
        setShowAddSessionModal(false);
        setNewSessionData({ date: '', notes: '', students: [] });
      } else {
        alert('Erreur lors de l\'ajout de la séance');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout de la séance');
    }
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

  const handleOpenAttendance = (session: any) => {
    setSelectedHistorySession(session);
    setShowAttendanceModal(true);
  };

  const toggleAttendance = async (studentId: string) => {
    if (!selectedHistorySession) return;
    
    const updatedSession = {
      ...selectedHistorySession,
      students: selectedHistorySession.students.map((student: any) => 
        student.studentId === studentId 
          ? { ...student, present: !student.present }
          : student
      )
    };
    
    // Sauvegarder les changements
    try {
      await realizedSessionsService.update(selectedHistorySession.id, updatedSession);
      setSelectedHistorySession(updatedSession);
      
      // Mettre à jour aussi dans la liste principale
      setSessionHistory(prev => prev.map(session => 
        session.id === selectedHistorySession.id ? updatedSession : session
      ));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <div className="session-history-page">
      <div className="history-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <div className="session-info">
          <h1>
            Séances du {getDayName(fixedSession.dayOfWeek)} - {fixedSession.type === 'individual' 
              ? (fixedSession.student 
                  ? `${fixedSession.student.firstName} ${fixedSession.student.lastName}`
                  : 'Étudiant non trouvé'
                )
              : (fixedSession.class?.name || 'Classe non trouvée')
            }
          </h1>
          <p className="session-details">
            Tous les {getDayName(fixedSession.dayOfWeek)} à {fixedSession.startTime} 
            ({fixedSession.duration} min - {fixedSession.price} DA)
          </p>
        </div>
        <button className="add-session-btn" onClick={handleAddSession}>
          ➕ Ajouter une séance
        </button>
      </div>

      <div className="history-content">
        {sessionHistory.length === 0 ? (
          <div className="no-history">
            <div className="no-history-icon">📅</div>
            <h3>Aucune séance passée</h3>
            <p>Cette séance fixe n'a pas encore eu lieu.</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessionHistory.map((session, index) => (
              <div key={session.id} className="history-session-card">
                <div className="session-date">
                  <div className="date-info">
                    <span className="day">
                      {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit' })}
                    </span>
                    <span className="month">
                      {new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="session-meta">
                    <span className="session-number">Séance #{sessionHistory.length - index}</span>
                    <span className="weekday">
                      {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                    </span>
                  </div>
                </div>

                <div className="session-stats">
                  {fixedSession.type === 'individual' ? (
                    <div className="individual-stats">
                      <div className="attendance-status">
                        {session.students[0]?.present ? (
                          <span className="status present">✅ Présent</span>
                        ) : (
                          <span className="status absent">❌ Absent</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="group-stats">
                      <div className="attendance-summary">
                        <span className="present-count">
                          {session.students.filter((s: any) => s.present).length}
                        </span>
                        <span className="total-count">/ {session.students.length}</span>
                        <span className="label">présents</span>
                      </div>
                      <div className="attendance-bar">
                        <div 
                          className="attendance-fill"
                          style={{ 
                            width: `${(session.students.filter((s: any) => s.present).length / session.students.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="session-actions">
                  <button 
                    className="attendance-btn"
                    onClick={() => handleOpenAttendance(session)}
                  >
                    📋 Fiche de présence
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout de séance */}
      {showAddSessionModal && (
        <div className="modal-overlay">
          <div className="modal add-session-modal">
            <div className="modal-header">
              <h2>Ajouter une séance</h2>
              <p>Nouvelle séance pour {fixedSession.type === 'individual' 
                ? (fixedSession.student?.firstName + ' ' + fixedSession.student?.lastName)
                : fixedSession.class?.name
              }</p>
            </div>

            <div className="form-group">
              <label>Date de la séance</label>
              <input 
                type="date" 
                value={newSessionData.date}
                onChange={(e) => setNewSessionData({...newSessionData, date: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Notes de la séance</label>
              <textarea 
                value={newSessionData.notes}
                onChange={(e) => setNewSessionData({...newSessionData, notes: e.target.value})}
                placeholder="Qu'avez-vous fait pendant cette séance ?"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Présences</label>
              <div className="students-attendance-list">
                {newSessionData.students.map((student, index) => (
                  <div key={index} className="student-attendance-item">
                    <div className="student-info">
                      <span className="student-name">
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`attendance-toggle ${student.present ? 'present' : 'absent'}`}
                      onClick={() => {
                        const updatedStudents = [...newSessionData.students];
                        updatedStudents[index].present = !updatedStudents[index].present;
                        setNewSessionData({...newSessionData, students: updatedStudents});
                      }}
                    >
                      {student.present ? '✅ Présent' : '❌ Absent'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-buttons">
              <button 
                type="button" 
                onClick={() => setShowAddSessionModal(false)}
                className="close-btn"
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="save-btn"
                onClick={handleSaveNewSession}
              >
                Ajouter la séance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de fiche de présence */}
      {showAttendanceModal && selectedHistorySession && (
        <div className="modal-overlay">
          <div className="modal attendance-modal">
            <div className="modal-header">
              <h2>Fiche de présence</h2>
              <p className="session-date-info">
                {new Date(selectedHistorySession.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="attendance-list">
              {selectedHistorySession.students.map((student: any) => (
                <div key={student.studentId} className="student-attendance-item">
                  <div className="student-info">
                    <div className="student-avatar">
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                    <div className="student-name">
                      <span className="name">{student.firstName} {student.lastName}</span>
                    </div>
                  </div>
                  <button
                    className={`attendance-toggle ${student.present ? 'present' : 'absent'}`}
                    onClick={() => toggleAttendance(student.studentId)}
                  >
                    {student.present ? '✅ Présent' : '❌ Absent'}
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-buttons">
              <button 
                type="button" 
                onClick={() => setShowAttendanceModal(false)}
                className="close-btn"
              >
                Fermer
              </button>
              <button 
                type="button" 
                className="save-btn"
                onClick={() => {
                  // Ici on pourrait sauvegarder les données
                  setShowAttendanceModal(false);
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
