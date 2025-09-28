import React from 'react';

const SimpleEarth: React.FC = () => {
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Étoiles animées */}
      <div className="stars">
        {Array.from({ length: 100 }, (_, i) => (
          <div
            key={i}
            className="star"
            style={{
              position: 'absolute',
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: 'white',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite alternate`,
              opacity: Math.random()
            }}
          />
        ))}
      </div>
      
      {/* Planète Terre CSS */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #4a90e2 0%, #357abd 50%, #1e5f99 100%)',
          boxShadow: `
            inset -20px -20px 40px rgba(0,0,0,0.3),
            0 0 40px rgba(74, 144, 226, 0.4)
          `,
          animation: 'rotate 20s linear infinite',
          overflow: 'hidden'
        }}
      >
        {/* Continents simplifiés */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '40px',
            height: '30px',
            background: '#2d5016',
            borderRadius: '50%',
            opacity: 0.8
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '60%',
            width: '30px',
            height: '25px',
            background: '#2d5016',
            borderRadius: '40%',
            opacity: 0.8
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '70%',
            left: '30%',
            width: '50px',
            height: '20px',
            background: '#2d5016',
            borderRadius: '60%',
            opacity: 0.8
          }}
        />
      </div>
      
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SimpleEarth;
