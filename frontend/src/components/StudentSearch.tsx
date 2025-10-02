import React, { useState, useEffect, useRef } from 'react';
import type { Student } from '../types';
import './StudentSearch.css';

interface StudentSearchProps {
  students: Student[];
  onStudentSelect: (student: Student) => void;
}

const StudentSearch: React.FC<StudentSearchProps> = ({ students, onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents([]);
      setIsOpen(false);
      return;
    }

    const filtered = students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) || 
             student.level?.toLowerCase().includes(searchLower) ||
             student.email?.toLowerCase().includes(searchLower);
    });

    setFilteredStudents(filtered);
    setIsOpen(filtered.length > 0);
  }, [searchTerm, students]);

  // Fermer la liste quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStudentClick = (student: Student) => {
    setSearchTerm('');
    setIsOpen(false);
    onStudentSelect(student);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className="student-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Rechercher un élève..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <div className="search-icon">🔍</div>
      </div>

      {isOpen && filteredStudents.length > 0 && (
        <div className="search-results">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="search-result-item"
              onClick={() => handleStudentClick(student)}
            >
              <div className="student-avatar-small">
                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
              </div>
              <div className="student-info-search">
                <div className="student-name-search">
                  {student.firstName} {student.lastName}
                </div>
                <div className="student-details-search">
                  {student.level?.toUpperCase()} • {student.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredStudents.length === 0 && searchTerm.trim() !== '' && (
        <div className="search-results">
          <div className="no-results">
            Aucun élève trouvé pour "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearch;
