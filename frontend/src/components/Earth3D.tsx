import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    THREE: any;
  }
}

const Earth3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const loadThreeJS = async () => {
      try {
        // Charger Three.js avec fallback
        if (!window.THREE) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r156/three.min.js');
        }
        
        // Charger OrbitControls avec fallback
        if (!window.THREE?.OrbitControls) {
          // await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r156/controls/OrbitControls.js');
          await loadScript('https://cdn.jsdelivr.net/npm/three@0.156.1/examples/jsm/math/Capsule.js');
        }

        await initializeScene();
      } catch (err) {
        console.error('Erreur lors du chargement de Three.js:', err);
        setError('Impossible de charger la visualisation 3D');
        setLoading(false);
      }
    };

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Vérifier si le script existe déjà
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          console.log(`Script chargé: ${src}`);
          resolve();
        };
        script.onerror = (err) => {
          console.error(`Erreur de chargement: ${src}`, err);
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
      });
    };

    const initializeScene = async () => {
      const THREE = window.THREE;
      const container = mountRef.current;
      
      if (!container || !THREE) {
        throw new Error('Container ou Three.js non disponible');
      }

      // Attendre que Three.js soit complètement chargé
      await new Promise(resolve => setTimeout(resolve, 100));

      // Dimensions du conteneur
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) {
        throw new Error('Dimensions du conteneur invalides');
      }

      // Scène et caméra
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 3;

      // Rendu
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0); // Fond transparent
      container.appendChild(renderer.domElement);

      // Lumière
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 3, 5);
      scene.add(pointLight);

      // Créer une terre simple sans texture d'abord
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x4a90e2,
        shininess: 100
      });
      const earth = new THREE.Mesh(geometry, material);
      scene.add(earth);

      // Contrôles (souris & tactile) - vérifier si OrbitControls existe
      let controls: any = null;
      if (THREE.OrbitControls) {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
      }

      // Fond d'étoiles simple
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
      
      const starVertices = [];
      for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // Animation
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        earth.rotation.y += 0.002; // Terre qui tourne
        if (controls) {
          controls.update();
        }
        renderer.render(scene, camera);
      };
      animate();

      // Stocker les références
      sceneRef.current = scene;
      rendererRef.current = renderer;
      
      setLoading(false);
      console.log('Scène 3D initialisée avec succès');

      // Responsive
      const handleResize = () => {
        if (!container) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    };

    loadThreeJS();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  if (error) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px'
        }}
      >
        Visualisation 3D non disponible
      </div>
    );
  }

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        opacity: loading ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out'
      }} 
    />
  );
};

export default Earth3D;
