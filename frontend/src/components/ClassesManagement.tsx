import React, { useState } from 'react';
import { classesService } from '../services/api';
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
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

interface ClassesManagementProps {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  students: Student[];
}

const ClassesManagement: React.FC<ClassesManagementProps> = ({ classes, setClasses, students }) => {
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '', studentIds: [] as string[], hourlyRate: '', description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

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
        setSearchQuery('');
        setLevelFilter('');
        setShowAddClass(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du groupe:', error);
    }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le groupe ${className} ?`)) {
      try {
        const response = await classesService.delete(classId);
        if (response.success) {
          setClasses(classes.filter(c => c.id !== classId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleStudentSelection = (studentId: string) => {
    setNewClass(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const filteredStudents = students.filter(student => {
    // Filtre par statut actif
    if (!student.active) return false;
    
    // Filtre par recherche nom/prénom
    const searchMatch = searchQuery === '' || 
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par niveau
    const levelMatch = levelFilter === '' || student.level === levelFilter;
    
    return searchMatch && levelMatch;
  });

  return (
    <div className="classes-tab">
      <div className="tab-header">
        <h2>Gestion des Groupes d'Élèves</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddClass(true)}
        >
          ➕ Créer un groupe
        </button>
      </div>

      {showAddClass && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Créer un nouveau groupe</h3>
            <form onSubmit={handleAddClass}>
              <input
                type="text"
                placeholder="Nom du groupe"
                value={newClass.name}
                onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description du groupe"
                value={newClass.description}
                onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Tarif horaire (DA)"
                value={newClass.hourlyRate}
                onChange={(e) => setNewClass({...newClass, hourlyRate: e.target.value})}
                required
              />
              
              <div className="students-selection">
                <h4>Sélectionner les élèves :</h4>
                
                <div className="students-filters">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou prénom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="level-filter"
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="1cem">1CEM</option>
                    <option value="2cem">2CEM</option>
                    <option value="3cem">3CEM</option>
                    <option value="4cem">4CEM</option>
                    <option value="1l">1L</option>
                    <option value="2l">2L</option>
                    <option value="3l">3L</option>
                  </select>
                </div>
                
                <div className="students-count">
                  {filteredStudents.length} élève{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
                  {newClass.studentIds.length > 0 && (
                    <span className="selected-count"> • {newClass.studentIds.length} sélectionné{newClass.studentIds.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                
                <div className="students-checkboxes">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <label key={student.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newClass.studentIds.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                        />
                        <span className="student-info">
                          {student.firstName} {student.lastName}
                          <span className="student-level">({student.level ? student.level.toUpperCase() : 'Niveau non défini'})</span>
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="no-students">Aucun élève ne correspond aux critères de recherche.</p>
                  )}
                </div>
              </div>
              
              <div className="modal-buttons">
                <button type="button" onClick={() => {
                  setShowAddClass(false);
                  setSearchQuery('');
                  setLevelFilter('');
                  setNewClass({ name: '', studentIds: [], hourlyRate: '', description: '' });
                }}>Annuler</button>
                <button type="submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="classes-container">
        {classes.map(classItem => (
          <div key={classItem.id} className="class-box">
            <div className="class-box-header">
              <div className="class-icon">
                👥
              </div>
              <div className="class-info">
                <h3>{classItem.name}</h3>
                <p className="class-description">{classItem.description}</p>
                <div className={`class-status ${classItem.active ? 'active' : 'inactive'}`}>
                  {classItem.active ? 'Actif' : 'Inactif'}
                </div>
              </div>
            </div>
            
            <div className="class-details">
              <div className="detail-item">
                <span className="detail-label">👥 Élèves</span>
                <span className="detail-value">{classItem.studentIds.length} élève(s)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">💰 Tarif</span>
                <span className="detail-value">{classItem.hourlyRate} DA/h</span>
              </div>
            </div>

            {classItem.students && classItem.students.length > 0 && (
              <div className="class-students">
                <h4>Élèves du groupe :</h4>
                <ul>
                  {classItem.students.map(student => (
                    <li key={student.id}>
                      {student.firstName} {student.lastName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="class-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => {
                  // TODO: Implémenter la modification
                  console.log('Modifier groupe:', classItem.id);
                }}
                title="Modifier ce groupe"
              >
                ✏️ Modifier
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                title="Supprimer ce groupe"
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

export default ClassesManagement;
