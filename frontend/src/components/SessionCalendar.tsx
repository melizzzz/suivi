import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './SessionCalendar.css';

moment.locale('fr');
const localizer = momentLocalizer(moment);

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

interface SessionCalendarProps {
  sessions: Session[];
  onSelectEvent: (event: any) => void;
  onSelectSlot: (slotInfo: any) => void;
}

const SessionCalendar: React.FC<SessionCalendarProps> = ({ sessions, onSelectEvent, onSelectSlot }) => {
  // Convertir les séances en événements du calendrier
  const events = sessions.map(session => {
    const start = new Date(session.date);
    const end = new Date(start.getTime() + session.duration * 60000); // Ajouter la durée en millisecondes

    let title = '';
    if (session.type === 'class' && session.class) {
      title = `🏫 ${session.class.name} (${session.class.students.length} élèves)`;
    } else if (session.student) {
      title = `👤 ${session.student.firstName} ${session.student.lastName}`;
    } else {
      title = 'Séance';
    }

    return {
      id: session.id,
      title,
      start,
      end,
      resource: session,
      className: session.type === 'class' ? 'class-session' : 'individual-session'
    };
  });

  const eventStyleGetter = (event: any) => {
    const isClass = event.resource.type === 'class';
    let backgroundColor = isClass ? '#4caf50' : '#2196f3';
    
    if (event.resource.status === 'scheduled') {
      backgroundColor = isClass ? '#ff9800' : '#ff5722';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: 'Aujourd\'hui',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Séance',
    noEventsInRange: 'Aucune séance dans cette période.',
    showMore: (total: number) => `+ ${total} de plus`
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
        }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        step={30}
        timeslots={2}
      />
    </div>
  );
};

export default SessionCalendar;
