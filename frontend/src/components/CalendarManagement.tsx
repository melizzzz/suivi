import React, { useState, useEffect } from 'react';
import './ManagementComponents.css';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hourlyRate: number;
  level: string;
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

interface CalendarEvent {
  id: string;
  date: string;
  type: 'session' | 'meeting' | 'deadline' | 'vacation';
  title: string;
  duration?: number;
  studentName?: string;
  description?: string;
  status?: string;
}

interface CalendarManagementProps {
  sessions: Session[];
  students: Student[];
  classes: Class[];
}

const CalendarManagement: React.FC<CalendarManagementProps> = ({ 
  sessions, 
  students, 
  classes 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    // Convertir les séances en événements du calendrier
    const sessionEvents: CalendarEvent[] = sessions.map(session => ({
      id: session.id,
      date: session.date,
      type: 'session' as const,
      title: session.type === 'individual' 
        ? `Cours - ${session.student?.firstName} ${session.student?.lastName}`
        : `Groupe - ${session.class?.name}`,
      duration: session.duration,
      studentName: session.type === 'individual' 
        ? `${session.student?.firstName} ${session.student?.lastName}`
        : undefined,
      description: session.notes,
      status: session.status
    }));
    
    setCalendarEvents(sessionEvents);
  }, [sessions]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate)
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: getEventsForDate(currentDate)
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const totalCells = 42; // 6 semaines * 7 jours
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => 
      event.date.startsWith(dateStr)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'session': return '📚';
      case 'meeting': return '👥';
      case 'deadline': return '⏰';
      case 'vacation': return '🏖️';
      default: return '📅';
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-tab">
      <div className="tab-header">
        <h2>Calendrier</h2>
        <div className="calendar-controls">
          <div className="view-mode-buttons">
            <button 
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              Mois
            </button>
            <button 
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              Semaine
            </button>
            <button 
              className={viewMode === 'day' ? 'active' : ''}
              onClick={() => setViewMode('day')}
            >
              Jour
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => navigateMonth('prev')} className="nav-btn">
              ← Précédent
            </button>
            <h3>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={() => navigateMonth('next')} className="nav-btn">
              Suivant →
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-day-names">
              {dayNames.map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div className="day-number">{day.date.getDate()}</div>
                  <div className="day-events">
                    {day.events.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`event-indicator ${event.type} ${event.status}`}
                        title={`${event.title} - ${new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        <span className="event-icon">{getEventIcon(event.type)}</span>
                        <span className="event-title">{event.title.substring(0, 15)}...</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="more-events">
                        +{day.events.length - 3} autres
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="selected-date-details">
          <h3>
            Événements du {selectedDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          
          <div className="events-list">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="no-events">Aucun événement ce jour-là</p>
            ) : (
              getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className={`event-detail ${event.type}`}>
                  <div className="event-time">
                    {new Date(event.date).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="event-content">
                    <h4>{getEventIcon(event.type)} {event.title}</h4>
                    {event.duration && (
                      <p>⏱️ Durée: {event.duration} minutes</p>
                    )}
                    {event.description && (
                      <p>📝 {event.description}</p>
                    )}
                    {event.status && (
                      <span className={`status-badge ${event.status}`}>
                        {event.status === 'completed' ? 'Terminé' :
                         event.status === 'planned' ? 'Planifié' : 'Annulé'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            className="close-details"
            onClick={() => setSelectedDate(null)}
          >
            ✕ Fermer
          </button>
        </div>
      )}

      <div className="calendar-summary">
        <h3>Résumé de la semaine</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-icon">📚</span>
            <div className="stat-content">
              <span className="stat-number">
                {calendarEvents.filter(e => e.type === 'session').length}
              </span>
              <span className="stat-label">Séances programmées</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div className="stat-content">
              <span className="stat-number">
                {new Set(calendarEvents.filter(e => e.studentName).map(e => e.studentName)).size}
              </span>
              <span className="stat-label">Élèves différents</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏰</span>
            <div className="stat-content">
              <span className="stat-number">
                {calendarEvents.reduce((total, e) => total + (e.duration || 0), 0)}
              </span>
              <span className="stat-label">Minutes au total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarManagement;
