import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Configuration axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Services pour les élèves
export const studentsService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (studentData: any) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  update: async (id: string, studentData: any) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  }
};

// Services pour les séances
export const sessionsService = {
  getAll: async () => {
    const response = await api.get('/sessions');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/sessions/student/${studentId}`);
    return response.data;
  },

  create: async (sessionData: any) => {
    const response = await api.post('/sessions', sessionData);
    return response.data;
  },

  update: async (id: string, sessionData: any) => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  }
};

// Services pour les paiements
export const paymentsService = {
  getAll: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  getByStudent: async (studentId: string) => {
    const response = await api.get(`/payments/student/${studentId}`);
    return response.data;
  },

  create: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id: string, paymentData: any) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  markAsPaid: async (id: string, paymentMethod: string) => {
    const response = await api.post(`/payments/${id}/mark-paid`, { paymentMethod });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
};

// Services pour les classes
export const classesService = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (classData: any) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  update: async (id: string, classData: any) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  }
};

// Services pour les séances fixes (localStorage en attendant l'API backend)
export const fixedSessionsService = {
  getAll: async () => {
    try {
      // CORRECTION TEMPORAIRE : Forcer la réinitialisation pour corriger le problème des jours
      console.log('🔧 Correction des données de séances fixes...');
      localStorage.removeItem('fixedSessions');
      
      const stored = localStorage.getItem('fixedSessions');
      let fixedSessions = stored ? JSON.parse(stored) : [];
      
      console.log('📅 Données avant initialisation:', fixedSessions);
      
      // Initialiser avec des données par défaut si vide
      if (fixedSessions.length === 0) {
        fixedSessions = [
          {
            id: '1',
            type: 'individual',
            studentId: '1',
            dayOfWeek: 'sunday', 
            startTime: '14:00',
            duration: 60,
            price: 2500,
            notes: 'Cours de physique individuel',
            active: true
          },
          {
            id: '2',
            type: 'group',
            classId: '1',
            dayOfWeek: 'wednesday',
            startTime: '16:00', 
            duration: 90,
            price: 3000,
            notes: 'Cours de physique en groupe',
            active: true
          }
        ];
        localStorage.setItem('fixedSessions', JSON.stringify(fixedSessions));
        console.log('✅ Données après initialisation:', fixedSessions);
      }
      
      // Migration : corriger les anciennes données qui pourraient avoir des dayOfWeek numériques
      const needsMigration = fixedSessions.some((session: any) => 
        session.dayOfWeek && ['1', '2', '3', '4', '5', '6', '7'].includes(session.dayOfWeek)
      );
      
      if (needsMigration) {
        const dayMapping: { [key: string]: string } = {
          '1': 'monday',
          '2': 'tuesday', 
          '3': 'wednesday',
          '4': 'thursday',
          '5': 'friday',
          '6': 'saturday',
          '7': 'sunday'
        };
        
        fixedSessions = fixedSessions.map((session: any) => ({
          ...session,
          dayOfWeek: dayMapping[session.dayOfWeek] || session.dayOfWeek
        }));
        
        localStorage.setItem('fixedSessions', JSON.stringify(fixedSessions));
      }
      
      // Enrichir avec les données des groupes et des étudiants
      const [classesResponse, studentsResponse] = await Promise.all([
        classesService.getAll(),
        studentsService.getAll()
      ]);
      
      const enrichedSessions = fixedSessions.map((session: any) => {
        const enrichedSession = { ...session };
        
        // Ajouter les données du groupe si c'est une séance de groupe
        if (session.classId && classesResponse.success) {
          enrichedSession.class = classesResponse.classes.find((c: any) => c.id === session.classId);
        }
        
        // Ajouter les données de l'étudiant si c'est une séance individuelle
        if (session.studentId && studentsResponse.success) {
          enrichedSession.student = studentsResponse.students.find((s: any) => s.id === session.studentId);
        }
        
        return enrichedSession;
      });
      
      return { success: true, fixedSessions: enrichedSessions };
    } catch (error) {
      console.error('Erreur lors du chargement des séances fixes:', error);
      return { success: false, message: 'Erreur lors du chargement' };
    }
  },

  create: async (sessionData: any) => {
    try {
      const stored = localStorage.getItem('fixedSessions');
      const fixedSessions = stored ? JSON.parse(stored) : [];
      
      const newSession = {
        id: Date.now().toString(),
        ...sessionData,
        active: true
      };
      
      // Enrichir avec les données du groupe
      const classesResponse = await classesService.getAll();
      if (classesResponse.success) {
        const classData = classesResponse.classes.find((c: any) => c.id === sessionData.classId);
        if (classData) {
          newSession.class = classData;
        }
      }
      
      fixedSessions.push(newSession);
      localStorage.setItem('fixedSessions', JSON.stringify(fixedSessions));
      
      return { success: true, fixedSession: newSession };
    } catch (error) {
      console.error('Erreur lors de la création de la séance fixe:', error);
      return { success: false, message: 'Erreur lors de la création' };
    }
  },

  delete: async (id: string) => {
    try {
      const stored = localStorage.getItem('fixedSessions');
      const fixedSessions = stored ? JSON.parse(stored) : [];
      
      const filteredSessions = fixedSessions.filter((session: any) => session.id !== id);
      localStorage.setItem('fixedSessions', JSON.stringify(filteredSessions));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la séance fixe:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  },

  update: async (id: string, sessionData: any) => {
    try {
      const stored = localStorage.getItem('fixedSessions');
      const fixedSessions = stored ? JSON.parse(stored) : [];
      
      const sessionIndex = fixedSessions.findIndex((session: any) => session.id === id);
      if (sessionIndex === -1) {
        return { success: false, message: 'Séance fixe non trouvée' };
      }
      
      fixedSessions[sessionIndex] = { ...fixedSessions[sessionIndex], ...sessionData };
      
      // Enrichir avec les données du groupe
      const classesResponse = await classesService.getAll();
      if (classesResponse.success) {
        const classData = classesResponse.classes.find((c: any) => c.id === sessionData.classId);
        if (classData) {
          fixedSessions[sessionIndex].class = classData;
        }
      }
      
      localStorage.setItem('fixedSessions', JSON.stringify(fixedSessions));
      
      return { success: true, fixedSession: fixedSessions[sessionIndex] };
    } catch (error) {
      console.error('Erreur lors de la modification de la séance fixe:', error);
      return { success: false, message: 'Erreur lors de la modification' };
    }
  }
};

// Service pour les séances réalisées (historique des séances fixes)
export const realizedSessionsService = {
  getAll: async () => {
    try {
      const stored = localStorage.getItem('realizedSessions');
      if (stored) {
        return { success: true, realizedSessions: JSON.parse(stored) };
      }
      
      // Données par défaut
      const defaultSessions = [
        {
          id: "fs-session-1",
          fixedSessionId: "1",
          date: "2024-09-02T14:00:00.000Z",
          duration: 60,
          price: 2500,
          notes: "Première séance de l'année. Introduction aux concepts de base.",
          students: [
            {
              studentId: "1",
              firstName: "Ahmed",
              lastName: "Benali",
              present: true,
              notes: "Très motivé pour commencer l'année"
            }
          ],
          createdAt: "2024-09-02T16:00:00.000Z"
        },
        {
          id: "fs-session-2",
          fixedSessionId: "1",
          date: "2024-09-09T14:00:00.000Z",
          duration: 60,
          price: 2500,
          notes: "Séance sur les équations du mouvement",
          students: [
            {
              studentId: "1",
              firstName: "Ahmed",
              lastName: "Benali",
              present: true,
              notes: "Très bonne compréhension des concepts"
            }
          ],
          createdAt: "2024-09-09T16:00:00.000Z"
        },
        {
          id: "fs-session-3",
          fixedSessionId: "1", 
          date: "2024-09-16T14:00:00.000Z",
          duration: 60,
          price: 2500,
          notes: "Applications numériques et résolution de problèmes",
          students: [
            {
              studentId: "1",
              firstName: "Ahmed",
              lastName: "Benali",
              present: false,
              notes: "Absent - rendez-vous médical"
            }
          ],
          createdAt: "2024-09-16T16:00:00.000Z"
        }
      ];
      
      localStorage.setItem('realizedSessions', JSON.stringify(defaultSessions));
      return { success: true, realizedSessions: defaultSessions };
    } catch (error) {
      console.error('Erreur lors du chargement des séances réalisées:', error);
      return { success: false, message: 'Erreur lors du chargement' };
    }
  },

  getByFixedSessionId: async (fixedSessionId: string) => {
    try {
      const response = await realizedSessionsService.getAll();
      if (response.success) {
        const sessions = response.realizedSessions.filter((s: any) => s.fixedSessionId === fixedSessionId);
        return { success: true, realizedSessions: sessions };
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des séances:', error);
      return { success: false, message: 'Erreur lors de la récupération' };
    }
  },

  create: async (sessionData: any) => {
    try {
      const response = await realizedSessionsService.getAll();
      if (!response.success) return response;
      
      const sessions = response.realizedSessions;
      const newSession = {
        id: `fs-session-${Date.now()}`,
        ...sessionData,
        createdAt: new Date().toISOString()
      };
      
      sessions.push(newSession);
      localStorage.setItem('realizedSessions', JSON.stringify(sessions));
      
      return { success: true, realizedSession: newSession };
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error);
      return { success: false, message: 'Erreur lors de la création' };
    }
  },

  update: async (sessionId: string, sessionData: any) => {
    try {
      const response = await realizedSessionsService.getAll();
      if (!response.success) return response;
      
      const sessions = response.realizedSessions;
      const sessionIndex = sessions.findIndex((s: any) => s.id === sessionId);
      
      if (sessionIndex === -1) {
        return { success: false, message: 'Séance non trouvée' };
      }
      
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...sessionData };
      localStorage.setItem('realizedSessions', JSON.stringify(sessions));
      
      return { success: true, realizedSession: sessions[sessionIndex] };
    } catch (error) {
      console.error('Erreur lors de la modification de la séance:', error);
      return { success: false, message: 'Erreur lors de la modification' };
    }
  },

  delete: async (sessionId: string) => {
    try {
      const response = await realizedSessionsService.getAll();
      if (!response.success) return response;
      
      const sessions = response.realizedSessions;
      const filteredSessions = sessions.filter((s: any) => s.id !== sessionId);
      
      localStorage.setItem('realizedSessions', JSON.stringify(filteredSessions));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la séance:', error);
      return { success: false, message: 'Erreur lors de la suppression' };
    }
  }
};

// Service pour les présences des étudiants
export const studentAttendanceService = {
  getStudentAttendance: async (studentId: string) => {
    try {
      const response = await realizedSessionsService.getAll();
      if (!response.success) return response;
      
      // Filtrer toutes les séances où cet étudiant était présent/absent
      const studentAttendance = response.realizedSessions
        .filter((session: any) => 
          session.students.some((student: any) => student.studentId === studentId)
        )
        .map((session: any) => {
          const studentData = session.students.find((student: any) => student.studentId === studentId);
          return {
            sessionId: session.id,
            fixedSessionId: session.fixedSessionId,
            date: session.date,
            duration: session.duration,
            price: session.price,
            notes: session.notes,
            present: studentData.present,
            studentNotes: studentData.notes
          };
        })
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return { success: true, attendance: studentAttendance };
    } catch (error) {
      console.error('Erreur lors de la récupération des présences:', error);
      return { success: false, message: 'Erreur lors de la récupération' };
    }
  },

  getStudentStats: async (studentId: string) => {
    try {
      const response = await studentAttendanceService.getStudentAttendance(studentId);
      if (!response.success || !('attendance' in response)) return response;

      const attendance = response.attendance;
      const totalSessions = attendance.length;
      const presentSessions = attendance.filter((session: any) => session.present).length;
      const absentSessions = totalSessions - presentSessions;
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

      return {
        success: true,
        stats: {
          totalSessions,
          presentSessions,
          absentSessions,
          attendanceRate: Math.round(attendanceRate * 100) / 100
        }
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return { success: false, message: 'Erreur lors du calcul' };
    }
  }
};

export default api;
