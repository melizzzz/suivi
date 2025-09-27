import React, { useEffect, useRef } from 'react';
import './PhysicsBackground.css';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'electron' | 'proton' | 'neutron' | 'photon';
  color: string;
  charge: number;
}

const PhysicsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuration du canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialisation des particules
    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 10000);

      for (let i = 0; i < particleCount; i++) {
        const types: Array<Particle['type']> = ['electron', 'proton', 'neutron', 'photon'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let color: string;
        let charge: number;
        let size: number;

        switch (type) {
          case 'electron':
            color = '#3b82f6'; // Bleu électrique
            charge = -1;
            size = 2;
            break;
          case 'proton':
            color = '#ef4444'; // Rouge magnétique
            charge = 1;
            size = 3;
            break;
          case 'neutron':
            color = '#10b981'; // Vert neutre
            charge = 0;
            size = 2.5;
            break;
          case 'photon':
            color = '#f59e0b'; // Jaune lumineux
            charge = 0;
            size = 1.5;
            break;
          default:
            color = '#6b7280';
            charge = 0;
            size = 2;
        }

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size,
          type,
          color,
          charge
        });
      }

      particlesRef.current = particles;
    };

    // Animation des particules
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fond dégradé subtil
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.02)');
      gradient.addColorStop(0.5, 'rgba(107, 70, 193, 0.01)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Mise à jour et rendu des particules
      particles.forEach((particle, i) => {
        // Forces électromagnétiques simplifiées
        particles.forEach((other, j) => {
          if (i !== j) {
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100 && distance > 0) {
              // Force coulombienne simplifiée
              const force = (particle.charge * other.charge) / (distance * distance);
              const fx = (dx / distance) * force * 0.01;
              const fy = (dy / distance) * force * 0.01;
              
              particle.vx -= fx;
              particle.vy -= fy;
            }
          }
        });

        // Mise à jour de la position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Rebond sur les bords
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -0.8;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -0.8;

        // Maintenir dans les limites
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Friction
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Rendu de la particule
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Effet de lueur
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        glowGradient.addColorStop(0, particle.color);
        glowGradient.addColorStop(0.5, particle.color + '40');
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Noyau de la particule
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Connexions quantiques entre particules proches
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(other => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            
            const opacity = Math.max(0, (80 - distance) / 80 * 0.1);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="physics-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.6
      }}
    />
  );
};

export default PhysicsBackground;
