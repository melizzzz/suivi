import React, { useState, useEffect } from 'react';
import { studentAttendanceService } from '../services/api';
import type { Student } from '../types';
import './StudentDetail.css';

interface StudentDetailProps {
  student: Student;
  onBack: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onBack }) => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [student.id]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      // Charger les présences
      const attendanceResponse = await studentAttendanceService.getStudentAttendance(student.id);
      if (attendanceResponse.success && 'attendance' in attendanceResponse) {
        setAttendance(attendanceResponse.attendance);
      }

      // Charger les statistiques
      const statsResponse = await studentAttendanceService.getStudentStats(student.id);
      if (statsResponse.success && 'stats' in statsResponse) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceIcon = (present: boolean) => {
    return present ? '✅' : '❌';
  };

  const getAttendanceText = (present: boolean) => {
    return present ? 'Présent' : 'Absent';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return '#4A655A'; // Vert
    if (rate >= 70) return '#f59e0b'; // Orange
    return '#ef4444'; // Rouge
  };

  return (
    <div className="student-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <div className="student-info">
          <div className="student-avatar-large">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="student-details">
            <h1>{student.firstName} {student.lastName}</h1>
            <p className="student-meta">
              📧 {student.email} • 📞 {student.phone}
            </p>
            <p className="student-meta">
              🏫 {student.level} • 💰 {student.hourlyRate} DA/h
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <p>Chargement des données...</p>
        </div>
      ) : (
        <div className="detail-content">
          {/* Statistiques de présence */}
          {stats && (
            <div className="stats-section">
              <h2>Statistiques de présence</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalSessions}</div>
                  <div className="stat-label">Séances totales</div>
                </div>
                <div className="stat-card present">
                  <div className="stat-number">{stats.presentSessions}</div>
                  <div className="stat-label">Présences</div>
                </div>
                <div className="stat-card absent">
                  <div className="stat-number">{stats.absentSessions}</div>
                  <div className="stat-label">Absences</div>
                </div>
                <div className="stat-card rate">
                  <div 
                    className="stat-number"
                    style={{ color: getAttendanceColor(stats.attendanceRate) }}
                  >
                    {stats.attendanceRate}%
                  </div>
                  <div className="stat-label">Taux de présence</div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="attendance-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${stats.attendanceRate}%`,
                      backgroundColor: getAttendanceColor(stats.attendanceRate)
                    }}
                  />
                </div>
                <span className="progress-text">
                  Taux de présence: {stats.attendanceRate}%
                </span>
              </div>
            </div>
          )}

          {/* Historique des séances */}
          <div className="attendance-section">
            <h2>Historique des séances</h2>
            {attendance.length === 0 ? (
              <div className="no-attendance">
                <div className="no-attendance-icon">📚</div>
                <h3>Aucune séance enregistrée</h3>
                <p>Cet étudiant n'a pas encore participé à des séances enregistrées.</p>
              </div>
            ) : (
              <div className="attendance-list">
                {attendance.map((session, index) => (
                  <div key={session.sessionId} className={`attendance-item ${session.present ? 'present' : 'absent'}`}>
                    <div className="attendance-date">
                      <div className="date-badge">
                        <span className="day">
                          {new Date(session.date).toLocaleDateString('fr-FR', { day: '2-digit' })}
                        </span>
                        <span className="month">
                          {new Date(session.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                      </div>
                      <div className="date-info">
                        <span className="weekday">
                          {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </span>
                        <span className="full-date">
                          {new Date(session.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>

                    <div className="attendance-details">
                      <div className="session-info">
                        <span className="duration">⏱ {session.duration} min</span>
                        <span className="price">💰 {session.price} DA</span>
                      </div>
                      {session.notes && (
                        <div className="session-notes">
                          <strong>Séance:</strong> {session.notes}
                        </div>
                      )}
                      {session.studentNotes && (
                        <div className="student-notes">
                          <strong>Notes:</strong> {session.studentNotes}
                        </div>
                      )}
                    </div>

                    <div className="attendance-status">
                      <div className={`status-badge ${session.present ? 'present' : 'absent'}`}>
                        <span className="status-icon">
                          {getAttendanceIcon(session.present)}
                        </span>
                        <span className="status-text">
                          {getAttendanceText(session.present)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
