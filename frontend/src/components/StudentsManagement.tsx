import React, { useState } from 'react';
import { studentsService } from '../services/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hourlyRate: number;
  active: boolean;
}

interface StudentsManagementProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
}

const StudentsManagement: React.FC<StudentsManagementProps> = ({ students, setStudents }) => {
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    firstName: '', lastName: '', email: '', phone: '', hourlyRate: ''
  });
  const [editStudent, setEditStudent] = useState({
    firstName: '', lastName: '', email: '', phone: '', hourlyRate: ''
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hourlyRate = parseFloat(newStudent.hourlyRate);
      if (isNaN(hourlyRate)) {
        alert('Le tarif doit être un nombre valide');
        return;
      }

      const studentData = {
        ...newStudent,
        hourlyRate: hourlyRate,
        active: true
      };
      
      const response = await studentsService.create(studentData);
      if (response.success) {
        setStudents([...students, response.student]);
        setNewStudent({ firstName: '', lastName: '', email: '', phone: '', hourlyRate: '' });
        setShowAddStudent(false);
      } else {
        alert('Erreur lors de l\'ajout de l\'élève: ' + (response.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élève:', error);
      alert('Erreur lors de l\'ajout de l\'élève. Vérifiez la console pour plus de détails.');
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudent({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      hourlyRate: (student.hourlyRate || 0).toString()
    });
    setShowEditStudent(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    try {
      const hourlyRate = parseFloat(editStudent.hourlyRate);
      if (isNaN(hourlyRate)) {
        alert('Le tarif doit être un nombre valide');
        return;
      }

      const studentData = {
        ...editStudent,
        hourlyRate: hourlyRate,
        active: editingStudent.active
      };
      
      const response = await studentsService.update(editingStudent.id, studentData);
      if (response.success) {
        setStudents(students.map(s => 
          s.id === editingStudent.id ? response.student : s
        ));
        setEditStudent({ firstName: '', lastName: '', email: '', phone: '', hourlyRate: '' });
        setEditingStudent(null);
        setShowEditStudent(false);
      } else {
        alert('Erreur lors de la modification de l\'élève: ' + (response.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'élève:', error);
      alert('Erreur lors de la modification de l\'élève. Vérifiez la console pour plus de détails.');
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'élève ${studentName} ?`)) {
      try {
        const response = await studentsService.delete(studentId);
        if (response.success) {
          setStudents(students.filter(s => s.id !== studentId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
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
                type="number"
                placeholder="Tarif par séance (DA)"
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

      {showEditStudent && editingStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Modifier l'élève</h3>
            <form onSubmit={handleUpdateStudent}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Prénom"
                  value={editStudent.firstName}
                  onChange={(e) => setEditStudent({...editStudent, firstName: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={editStudent.lastName}
                  onChange={(e) => setEditStudent({...editStudent, lastName: e.target.value})}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={editStudent.email}
                onChange={(e) => setEditStudent({...editStudent, email: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={editStudent.phone}
                onChange={(e) => setEditStudent({...editStudent, phone: e.target.value})}
              />
              <input
                type="number"
                placeholder="Tarif par séance (DA)"
                value={editStudent.hourlyRate}
                onChange={(e) => setEditStudent({...editStudent, hourlyRate: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => {
                  setShowEditStudent(false);
                  setEditingStudent(null);
                }}>Annuler</button>
                <button type="submit">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="students-container">
        {students.map(student => (
          <div key={student.id} className="student-box">
            <div className="student-box-header">
              <div className="student-avatar">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </div>
              <div className="student-name">
                <h3>{student.firstName} {student.lastName}</h3>
                <div className={`student-status ${student.active ? 'active' : 'inactive'}`}>
                  {student.active ? 'Actif' : 'Inactif'}
                </div>
              </div>
            </div>
            
            <div className="student-details">
              <div className="detail-item">
                <span className="detail-label"> Email</span>
                <span className="detail-value">{student.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"> Téléphone</span>
                <span className="detail-value">{student.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"> Tarif</span>
                <span className="detail-value">{student.hourlyRate} DA/séance</span>
              </div>
            </div>
            
            <div className="student-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEditStudent(student)}
                title="Modifier cet élève"
              >
                Modifier
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDeleteStudent(student.id, `${student.firstName} ${student.lastName}`)}
                title="Supprimer cet élève"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentsManagement;
