
import React, { useState } from 'react';
import { classesService } from '../services/api';
import './ManagementComponents.css';
import type { Student, Class } from '../types';

interface ClassesManagementProps {
  classes: Class[];
  setClasses: (classes: Class[]) => void;
  students: Student[];
}

const ClassesManagement: React.FC<ClassesManagementProps> = ({ classes, setClasses, students }) => {
  const [showAddClass, setShowAddClass] = useState(false);
  const [showEditClass, setShowEditClass] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [newClass, setNewClass] = useState({
    name: '', studentIds: [] as string[], hourlyRate: '', description: ''
  });
  const [editClass, setEditClass] = useState({
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

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem);
    setEditClass({
      name: classItem.name || '',
      studentIds: classItem.studentIds || [],
      hourlyRate: (classItem.hourlyRate || 0).toString(),
      description: classItem.description || ''
    });
    setShowEditClass(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    try {
      const classData = {
        ...editClass,
        hourlyRate: parseFloat(editClass.hourlyRate),
        active: editingClass.active
      };
      
      const response = await classesService.update(editingClass.id, classData);
      if (response.success) {
        setClasses(classes.map(c => 
          c.id === editingClass.id ? response.class : c
        ));
        setEditClass({ name: '', studentIds: [], hourlyRate: '', description: '' });
        setEditingClass(null);
        setSearchQuery('');
        setLevelFilter('');
        setShowEditClass(false);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du groupe:', error);
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

  const handleEditStudentSelection = (studentId: string) => {
    setEditClass(prev => ({
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

      {/* Modal de modification d'un groupe */}
      {showEditClass && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Modifier le groupe</h3>
            <form onSubmit={handleUpdateClass}>
              <input
                type="text"
                placeholder="Nom du groupe"
                value={editClass.name}
                onChange={(e) => setEditClass({...editClass, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description du groupe"
                value={editClass.description}
                onChange={(e) => setEditClass({...editClass, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Tarif par séance (DA)"
                value={editClass.hourlyRate}
                onChange={(e) => setEditClass({...editClass, hourlyRate: e.target.value})}
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
                  {editClass.studentIds.length > 0 && (
                    <span className="selected-count"> • {editClass.studentIds.length} sélectionné{editClass.studentIds.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                
                <div className="students-checkboxes">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <label key={student.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editClass.studentIds.includes(student.id)}
                          onChange={() => handleEditStudentSelection(student.id)}
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
                  setShowEditClass(false);
                  setEditingClass(null);
                  setSearchQuery('');
                  setLevelFilter('');
                  setEditClass({ name: '', studentIds: [], hourlyRate: '', description: '' });
                }}>Annuler</button>
                <button type="submit">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="students-container">
        {classes.map(classItem => (
          <div key={classItem.id} className="student-box">
            <div className="student-box-header">
              <div className="student-avatar">
                {classItem.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="student-name">
                <h3>{classItem.name}</h3>
                
              </div>
            </div>
            
            <div className="student-details">
              <div className="detail-item">
                <span className="detail-label"> Description</span>
                <span className="detail-value">{classItem.description || 'Aucune description'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"> Élèves</span>
                <span className="detail-value">{classItem.studentIds.length} élève{classItem.studentIds.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label"> Tarif</span>
                <span className="detail-value">{classItem.hourlyRate} DA/séance</span>
              </div>
              {classItem.students && classItem.students.length > 0 && (
                <div className="detail-item group-members">
                  <span className="detail-label"> Membres</span>
                  <div className="detail-value">
                    <div className="members-list">
                      {classItem.students.map((student, index) => (
                        <span key={student.id} className="member-tag">
                          {student.firstName} {student.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="student-actions">
              <button 
                className="action-btn edit-btn"
                onClick={() => handleEditClass(classItem)}
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
