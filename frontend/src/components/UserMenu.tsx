import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

interface UserMenuProps {
  userType?: 'teacher' | 'parent';
}

const UserMenu: React.FC<UserMenuProps> = ({ userType = 'teacher' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowUserInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowUserInfo(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    setShowUserInfo(false);
    logout();
  };

  const handleShowUserInfo = () => {
    setShowUserInfo(true);
  };

  const handleBackToMenu = () => {
    setShowUserInfo(false);
  };

  const getMenuItems = () => {
    if (userType === 'parent') {
      return [
        { icon: '👤', label: 'Mes informations', action: handleShowUserInfo },
        { icon: '👨‍👩‍👧‍👦', label: 'Profil famille', action: () => setIsOpen(false) },
        { icon: '💳', label: 'Paiements', action: () => setIsOpen(false) },
        { icon: '📊', label: 'Rapport de progression', action: () => setIsOpen(false) },
        { icon: '📞', label: 'Contact professeur', action: () => setIsOpen(false) },
        { icon: '⚙️', label: 'Paramètres', action: () => setIsOpen(false) }
      ];
    } else {
      return [
        { icon: '👤', label: 'Mes informations', action: handleShowUserInfo },
        { icon: '⚛️', label: 'Profil', action: () => setIsOpen(false) },
        { icon: '📊', label: 'Statistiques', action: () => setIsOpen(false) },
        { icon: '⚙️', label: 'Paramètres', action: () => setIsOpen(false) }
      ];
    }
  };

  const getUserRole = () => {
    return userType === 'parent' ? 'Parent' : 'Professeur';
  };

  const getGradient = () => {
    return userType === 'parent' 
      ? 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const renderUserInfoView = () => (
    <div className="user-info-view">
      <div className="user-info-header" style={{ background: getGradient() }}>
        <button className="back-btn" onClick={handleBackToMenu}>
          <span>←</span>
        </button>
        <h3>Mes informations</h3>
      </div>
      
      <div className="user-info-content">
        <div className="user-info-section">
          <div className="info-avatar">
            <span className="info-initial">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <h4>{user?.name || 'Nom non défini'}</h4>
          <span className="info-role">{getUserRole()}</span>
        </div>

        <div className="user-details-list">
          <div className="detail-item">
            <span className="detail-icon">📧</span>
            <div className="detail-content">
              <label>Email</label>
              <span>{user?.email || 'Non renseigné'}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <div className="detail-content">
              <label>Téléphone</label>
              <span>+33 6 12 34 56 78</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">🏠</span>
            <div className="detail-content">
              <label>Adresse</label>
              <span>123 Rue de la Science, 75000 Paris</span>
            </div>
          </div>

          {userType === 'teacher' && (
            <>
              <div className="detail-item">
                <span className="detail-icon">⚛️</span>
                <div className="detail-content">
                  <label>Spécialité</label>
                  <span>Sciences Physiques</span>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🎓</span>
                <div className="detail-content">
                  <label>Niveau</label>
                  <span>Lycée & Prépa</span>
                </div>
              </div>
            </>
          )}

          {userType === 'parent' && (
            <div className="detail-item">
              <span className="detail-icon">👨‍👩‍👧‍👦</span>
              <div className="detail-content">
                <label>Enfants</label>
                <span>2 élèves inscrits</span>
              </div>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div className="detail-content">
              <label>Membre depuis</label>
              <span>Septembre 2025</span>
            </div>
          </div>
        </div>

        <div className="info-actions">
          <button className="edit-btn">
            <span>✏️</span>
            Modifier mes informations
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="user-menu" ref={menuRef}>
      {/* Icône utilisateur cliquable */}
      <button className="user-menu-trigger" onClick={toggleMenu}>
        <div className="user-avatar">
          <span className="user-initial">
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>
        <div className="user-info-compact">
          <span className="user-name">{user?.name || 'Utilisateur'}</span>
          <span className="user-role">{getUserRole()}</span>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {showUserInfo ? renderUserInfoView() : (
            <>
              <div className="user-menu-header" style={{ background: getGradient() }}>
                <div className="user-avatar-large">
                  <span className="user-initial-large">
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="user-details">
                  <h3>{user?.name || 'Utilisateur'}</h3>
                  <p>{user?.email || 'email@exemple.com'}</p>
                  <span className="user-badge">{getUserRole()}</span>
                </div>
              </div>
              
              <hr className="menu-divider" />
              
              <div className="user-menu-items">
                {getMenuItems().map((item, index) => (
                  <button key={index} className="menu-item" onClick={item.action}>
                    <span className="menu-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              
              <hr className="menu-divider" />
              
              <div className="user-menu-footer">
                <button className="menu-item logout-item" onClick={handleLogout}>
                  <span className="menu-icon">🚪</span>
                  <span>Déconnexion</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
