// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './index.css';

// --- Custom Hook for Animated Numbers ---
const useAnimatedNumber = (value, duration = 200) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  React.useEffect(() => {
    if (value === previousValue.current) {
      setDisplayValue(value);
      return;
    }

    const start = previousValue.current;
    const end = value;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      const current = Math.floor(start + (end - start) * easedProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);

    previousValue.current = value;
  }, [value, duration]);

  return displayValue;
};

// --- Upgrade Data ---
const upgradeData = [
  {
    id: 'upgrade1_cpc',
    name: 'Better Clicker',
    description: 'Increases Cubes per Click by 1.',
    type: 'cpc', // 'cpc' for Cubes Per Click
    effect: 1, // Adds 1 CPC
    baseCost: 10,
    costMultiplier: 1.2, // Cost increases by 20% for each purchase
    maxLevel: 50 // Cap this upgrade at 50 purchases for now
  },
  {
    id: 'upgrade2_cpc',
    name: 'Advanced Ergonomics',
    description: 'Increases Cubes per Click by 5.',
    type: 'cpc',
    effect: 5,
    baseCost: 100,
    costMultiplier: 1.25,
    maxLevel: 25
  },
  {
    id: 'upgrade1_cps',
    name: 'Tiny Robot Miner',
    description: 'Generates 1 Cube per Second automatically.',
    type: 'cps', // 'cps' for Cubes Per Second
    effect: 1, // Adds 1 CPS
    baseCost: 200,
    costMultiplier: 1.3,
    maxLevel: 10
  },
  {
    id: 'upgrade2_cps',
    name: 'Automated Factory',
    description: 'Generates 10 Cubes per Second automatically.',
    type: 'cps',
    effect: 10,
    baseCost: 1500,
    costMultiplier: 1.4,
    maxLevel: 5
  }
];

// Floating image types for the clicker area (These will need corresponding images in the /public folder)
const floatingImageTypes = [
    { src: 'cube-icon.png', value: 1, name: 'Basic Cube' },
    { src: 'star.png', value: 5, name: 'Star Fragment' },
    { src: 'diamond.png', value: 20, name: 'Rare Diamond' },
    { src: 'coin.png', value: 50, name: 'Golden Coin' }
];


function App() {
  const [cubes, setCubes] = useState(() => {
    const savedCubes = localStorage.getItem('c1icker_cubes');
    return savedCubes ? parseInt(savedCubes, 10) : 0;
  });

  const [totalCubesEarned, setTotalCubesEarned] = useState(() => {
    const savedTotal = localStorage.getItem('c1icker_total_cubes');
    return savedTotal ? parseInt(savedTotal, 10) : 0;
  });

  const [upgrades, setUpgrades] = useState(() => {
    const savedUpgrades = localStorage.getItem('c1icker_upgrades');
    return savedUpgrades ? JSON.parse(savedUpgrades) : {};
  });

  const [cpc, setCpc] = useState(1);
  const [cps, setCps] = useState(0);

  const [currentQuip, setCurrentQuip] = useState('');
  const quipIntervalRef = useRef(null);

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('c1icker_theme') || 'default-theme';
  });

  const [floatingClicks, setFloatingClicks] = useState([]);
  const nextFloatingClickId = useRef(0);

  // NEW: State for playtime in seconds
  const [playtimeSeconds, setPlaytimeSeconds] = useState(() => {
    const savedPlaytime = localStorage.getItem('c1icker_playtime');
    return savedPlaytime ? parseInt(savedPlaytime, 10) : 0;
  });
  const playtimeIntervalRef = useRef(null); // Ref to store interval ID for playtime

  // NEW: State for clickable floating images
  const [floatingImages, setFloatingImages] = useState([]);
  const nextFloatingImageId = useRef(0);
  const floatingImageIntervalRef = useRef(null);


  const animatedCubes = useAnimatedNumber(cubes);

  const funnyQuips = [
    "Woah, cubes are people too ya know!",
    "Don't click too hard, it tickles!",
    "Powered by pure cube energy!",
    "Cubes: the future is blocky!",
    "Warning: may cause extreme clicking.",
    "My favorite cube is you!",
    "C1icker: accept no substitutes.",
    "Feeling cube-tastic today!",
    "It's not hoarding if they're cubes.",
    "Clicking for a cause: more cubes!",
    "I'm not addicted, I'm just committed.",
    "Every click counts... literally."
  ];

  // --- Core Click Handler ---
  const handleClick = () => {
    const clickAmount = cpc;
    setCubes(prevCubes => prevCubes + clickAmount);
    setTotalCubesEarned(prevTotal => prevTotal + clickAmount);

    const newFloatingClick = {
      id: nextFloatingClickId.current++,
      value: `+${clickAmount}`,
      x: Math.random() * 70 + 15,
      y: Math.random() * 70 + 15,
    };
    setFloatingClicks(prevClicks => [...prevClicks, newFloatingClick]);

    setTimeout(() => {
      setFloatingClicks(prevClicks => prevClicks.filter(fc => fc.id !== newFloatingClick.id));
    }, 1000);
  };

  // --- Auto-Clickable Floating Image Click Handler ---
  const handleFloatingImageClick = (id, value) => {
    setCubes(prevCubes => prevCubes + value);
    setTotalCubesEarned(prevTotal => prevTotal + value);

    // Create a new floating click number object for the image gain
    const newFloatingClick = {
        id: nextFloatingClickId.current++,
        value: `+${value}`,
        x: Math.random() * 70 + 15, // Random X position in main area
        y: Math.random() * 70 + 15, // Random Y position in main area
    };
    setFloatingClicks(prevClicks => [...prevClicks, newFloatingClick]);
    setTimeout(() => {
        setFloatingClicks(prevClicks => prevClicks.filter(fc => fc.id !== newFloatingClick.id));
    }, 1000);

    // Remove the clicked image
    setFloatingImages(prevImages => prevImages.filter(img => img.id !== id));
  };


  // --- Automatic Saving to Local Storage ---
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('c1icker_cubes', cubes.toString());
      localStorage.setItem('c1icker_total_cubes', totalCubesEarned.toString());
      localStorage.setItem('c1icker_theme', currentTheme);
      localStorage.setItem('c1icker_upgrades', JSON.stringify(upgrades));
      localStorage.setItem('c1icker_playtime', playtimeSeconds.toString()); // NEW: Save playtime
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [cubes, totalCubesEarned, currentTheme, upgrades, playtimeSeconds]); // NEW: Add playtimeSeconds dependency

  // --- Effect to calculate CPC and CPS whenever upgrades change ---
  useEffect(() => {
    let currentCpc = 1; // Base CPC
    let currentCps = 0; // Base CPS

    for (const upgradeId in upgrades) {
      const level = upgrades[upgradeId];
      const upgradeDef = upgradeData.find(u => u.id === upgradeId);

      if (upgradeDef) {
        if (upgradeDef.type === 'cpc') {
          currentCpc += upgradeDef.effect * level;
        } else if (upgradeDef.type === 'cps') {
          currentCps += upgradeDef.effect * level;
        }
      }
    }
    setCpc(currentCpc);
    setCps(currentCps);
  }, [upgrades]);

  // --- Effect for Cubes Per Second (CPS) auto-generation ---
  useEffect(() => {
    let cpsInterval;
    if (cps > 0) {
      cpsInterval = setInterval(() => {
        setCubes(prevCubes => prevCubes + cps);
        setTotalCubesEarned(prevTotal => prevTotal + cps);
      }, 1000); // Add cubes every 1 second
    }

    return () => {
      if (cpsInterval) {
        clearInterval(cpsInterval);
      }
    };
  }, [cps]);

  // --- Funny Quips Effect ---
  useEffect(() => {
    if (quipIntervalRef.current) {
      clearInterval(quipIntervalRef.current);
    }

    quipIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * funnyQuips.length);
      setCurrentQuip(funnyQuips[randomIndex]);

      setTimeout(() => {
        setCurrentQuip('');
      }, 5000);
    }, 10000 + Math.random() * 10000); // Interval between 10 and 20 seconds

    return () => {
      if (quipIntervalRef.current) {
        clearInterval(quipIntervalRef.current);
      }
    };
  }, []);

  // NEW: Playtime Tracking Effect
  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (playtimeIntervalRef.current) {
      clearInterval(playtimeIntervalRef.current);
    }

    playtimeIntervalRef.current = setInterval(() => {
      setPlaytimeSeconds(prevSeconds => prevSeconds + 1);
    }, 1000); // Increment every second

    // Cleanup function: clear the interval when component unmounts
    return () => {
      if (playtimeIntervalRef.current) {
        clearInterval(playtimeIntervalRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount


  // NEW: Floating Image Generation Effect
  useEffect(() => {
    if (floatingImageIntervalRef.current) {
        clearInterval(floatingImageIntervalRef.current);
    }

    floatingImageIntervalRef.current = setInterval(() => {
        const randomType = floatingImageTypes[Math.floor(Math.random() * floatingImageTypes.length)];
        const newImage = {
            id: nextFloatingImageId.current++,
            src: randomType.src,
            value: randomType.value,
            x: Math.random() * 80, // 0-80% left
            y: Math.random() * 80, // 0-80% top
            rotation: Math.random() * 360, // Random initial rotation
            size: Math.random() * (70 - 40) + 40 // Size between 40px and 70px
        };
        setFloatingImages(prevImages => [...prevImages, newImage]);

        // Remove image after 10 seconds (animation duration)
        setTimeout(() => {
            setFloatingImages(prevImages => prevImages.filter(img => img.id !== newImage.id));
        }, 10000);
    }, 5000 + Math.random() * 5000); // Generate every 5-10 seconds

    return () => {
        if (floatingImageIntervalRef.current) {
            clearInterval(floatingImageIntervalRef.current);
        }
    };
  }, []); // Run once on mount


  // Function to format playtime for display
  const formatPlaytime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // --- Function to handle buying an upgrade ---
  const handleBuyUpgrade = (upgradeId) => {
    const upgradeDef = upgradeData.find(u => u.id === upgradeId);
    if (!upgradeDef) return;

    const currentLevel = upgrades[upgradeId] || 0;
    if (currentLevel >= upgradeDef.maxLevel) {
        alert(`Max level reached for ${upgradeDef.name}!`);
        return;
    }

    const cost = Math.floor(upgradeDef.baseCost * (upgradeDef.costMultiplier ** currentLevel));

    if (cubes >= cost) {
      setCubes(prevCubes => prevCubes - cost);
      setUpgrades(prevUpgrades => ({
        ...prevUpgrades,
        [upgradeId]: currentLevel + 1
      }));
    } else {
      alert(`Not enough cubes! You need ${cost.toLocaleString()} cubes for ${upgradeDef.name}.`);
    }
  };

  // NEW: Reset Game function
  const handleResetGame = () => {
    if (window.confirm("Are you sure you want to reset all game data? This cannot be undone.")) {
      localStorage.clear(); // Clears all localStorage data
      // Reset all state to initial values
      setCubes(0);
      setTotalCubesEarned(0);
      setUpgrades({});
      setCpc(1);
      setCps(0);
      setCurrentQuip('');
      setCurrentTheme('default-theme');
      setFloatingClicks([]);
      setPlaytimeSeconds(0);
      setFloatingImages([]); // Clear any active floating images
      nextFloatingClickId.current = 0; // Reset ref counter
      nextFloatingImageId.current = 0; // Reset ref counter
      alert("Game data has been reset!");
    }
  };


  return (
    <div className={`app-container ${currentTheme}`}>
      {/* --- Left Sidebar: Cube Growth & Community --- */}
      <div className="sidebar left-sidebar">
        <h2>Cube Growth</h2>
        <div
          className="growing-cube-container"
          style={{
            '--cube-scale': Math.min(1 + Math.log10(totalCubesEarned + 1) * 0.1, 3),
            '--cube-rotation-speed': `${Math.max(10 - Math.log10(totalCubesEarned + 1) * 0.5, 2)}s`,
          }}
        >
          <div className="growing-cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>

        <div className="community-section">
          <h3>C1icker Community</h3>
          <div className="community-cubes">
            <div className="community-cube-icon"></div>
          </div>
          <p>~1 Player Online</p>
        </div>

        {/* Playtime Display */}
        <div className="playtime-section">
          <h3>Playtime: <span className="playtime-display">{formatPlaytime(playtimeSeconds)}</span></h3>
        </div>

        {/* Reset Game Button */}
        <button className="reset-button" onClick={handleResetGame}>Reset Game</button>
      </div>

      {/* --- Main Clicker Area --- */}
      <div className="clicker-area" onClick={handleClick}>
        <h1>C1icker</h1>
        <div className="cube-counter">
          <span className="cube-count-number">{animatedCubes.toLocaleString()}</span> Cubes
        </div>
        <p className="gain-per-click">
          +{cpc.toLocaleString()} Cubes per Click
          {cps > 0 && <span> | +{cps.toLocaleString()} Cubes per Second</span>}
        </p>

        {/* Floating Click Numbers */}
        {floatingClicks.map(click => (
          <div
            key={click.id}
            className="floating-click"
            style={{ left: `${click.x}%`, top: `${click.y}%` }}
          >
            {click.value}
          </div>
        ))}

        {/* Clickable Floating Images */}
        {floatingImages.map(image => (
            <img
                key={image.id}
                src={image.src}
                alt={image.name}
                className="floating-image"
                style={{
                    left: `${image.x}%`,
                    top: `${image.y}%`,
                    width: `${image.size}px`,
                    height: `${image.size}px`,
                    transform: `translate(-50%, -50%) rotate(${image.rotation}deg)` // Center image and apply rotation
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent main clicker area from getting click
                    handleFloatingImageClick(image.id, image.value);
                }}
            />
        ))}

        {/* Funny Quip Display */}
        {currentQuip && (
          <div className="funny-quip">
            {currentQuip}
          </div>
        )}

        {/* Placeholder for Adsense Ad */}
        <div className="ad-placeholder">
          <p>Your Google AdSense Ad Here</p>
        </div>
      </div>

      {/* --- Right Sidebar: Shop & Dev Options --- */}
      <div className="sidebar right-sidebar">
        <h2>Shop</h2>
        <div className="shop-upgrades">
          {upgradeData.map(upgrade => {
            const currentLevel = upgrades[upgrade.id] || 0;
            const cost = Math.floor(upgrade.baseCost * (upgrade.costMultiplier ** currentLevel));
            const isMaxLevel = currentLevel >= upgrade.maxLevel;
            const canAfford = cubes >= cost;

            return (
              <button
                key={upgrade.id}
                className={`upgrade-card ${canAfford ? 'can-afford' : 'cannot-afford'} ${isMaxLevel ? 'max-level' : ''}`}
                onClick={() => handleBuyUpgrade(upgrade.id)}
                disabled={!canAfford || isMaxLevel}
              >
                <div className="upgrade-info">
                  <h3>{upgrade.name}</h3>
                  <p>{upgrade.description}</p>
                  <p className="upgrade-effect">
                      {upgrade.type === 'cpc' ? `+${upgrade.effect} CPC` : `+${upgrade.effect} CPS`}
                  </p>
                </div>
                <div className="upgrade-cost">
                  {isMaxLevel ? (
                      <span className="max-level-text">MAX LEVEL</span>
                  ) : (
                      <>
                          <span>Cost: {cost.toLocaleString()} Cubes</span>
                          <span className="upgrade-level">Level: {currentLevel}/{upgrade.maxLevel}</span>
                      </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <hr style={{width: '80%', border: '1px solid rgba(255,255,255,0.1)', margin: '20px 0'}} />

        <h2>Leaderboard</h2>
        <div className="leaderboard-placeholder"></div>

        {/* Theme Selection (dev only for now) */}
        <div className="theme-selection">
          <h3>Choose Theme (Dev Only)</h3>
          <div className="theme-buttons">
            <button className={currentTheme === 'default-theme' ? 'active' : ''} onClick={() => setCurrentTheme('default-theme')}>Default</button>
            <button className={currentTheme === 'lava-theme' ? 'active' : ''} onClick={() => setCurrentTheme('lava-theme')}>Lava</button>
          </div>
        </div>

        <div className="ad-placeholder-right">
          <p>Your Google AdSense Ad Here</p>
        </div>
      </div>
    </div>
  );
}

export default App;