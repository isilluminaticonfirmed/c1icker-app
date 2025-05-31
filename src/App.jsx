// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './index.css'; // Keep this for global styles and layout

// --- Custom Hook for Animated Numbers ---
// Animates a number smoothly from its previous value to its new value.
const useAnimatedNumber = (value, duration = 200) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value); // Stores the value from the last render

  React.useEffect(() => {
    // If the new value is the same as the previous, no animation needed.
    if (value === previousValue.current) {
      setDisplayValue(value);
      return;
    }

    const start = previousValue.current;
    const end = value;
    const startTime = performance.now(); // Get current time for animation timing

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Calculate progress (0 to 1)
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Apply ease-in-out curve for smoothness
      const current = Math.floor(start + (end - start) * easedProgress); // Interpolate value

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue animation if not finished
      } else {
        setDisplayValue(end); // Ensure the final value is exact after animation
      }
    };

    requestAnimationFrame(animate); // Start the animation loop

    previousValue.current = value; // Update previous value for the next animation cycle
  }, [value, duration]); // Re-run effect if 'value' or 'duration' changes

  return displayValue;
};

function App() {
  // State for current cube currency, loaded from localStorage
  const [cubes, setCubes] = useState(() => {
    const savedCubes = localStorage.getItem('c1icker_cubes');
    return savedCubes ? parseInt(savedCubes, 10) : 0;
  });

  // State for total cubes ever earned, used for cube growth animation and future leaderboard score
  const [totalCubesEarned, setTotalCubesEarned] = useState(() => {
    const savedTotal = localStorage.getItem('c1icker_total_cubes');
    return savedTotal ? parseInt(savedTotal, 10) : 0;
  });

  // State for the currently displayed funny quip
  const [currentQuip, setCurrentQuip] = useState('');
  const quipIntervalRef = useRef(null); // Ref to store the interval ID for quips

  // State for the current theme, loaded from localStorage
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('c1icker_theme') || 'default-theme'; // 'default-theme' as fallback
  });

  // State to manage the floating '+Number' click responses
  const [floatingClicks, setFloatingClicks] = useState([]);
  const nextFloatingClickId = useRef(0); // Counter for unique keys for floating numbers

  // Animated version of 'cubes' state for smooth display
  const animatedCubes = useAnimatedNumber(cubes);

  // Array of funny quips for random display
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
    const clickAmount = 1; // Base amount gained per click
    setCubes(prevCubes => prevCubes + clickAmount);
    setTotalCubesEarned(prevTotal => prevTotal + clickAmount); // Update total earned

    // Create a new floating click number object
    const newFloatingClick = {
      id: nextFloatingClickId.current++, // Assign unique ID
      value: `+${clickAmount}`,
      x: Math.random() * 70 + 15, // Random X position (15% to 85% of clicker area)
      y: Math.random() * 70 + 15, // Random Y position (15% to 85% of clicker area)
    };
    setFloatingClicks(prevClicks => [...prevClicks, newFloatingClick]);

    // Remove the floating click element after its animation duration (1 second)
    setTimeout(() => {
      setFloatingClicks(prevClicks => prevClicks.filter(fc => fc.id !== newFloatingClick.id));
    }, 1000);
  };

  // --- Automatic Saving to Local Storage ---
  // Saves game state whenever cubes, totalCubesEarned, or currentTheme changes.
  // Uses a debounce to prevent excessive writes to localStorage.
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      localStorage.setItem('c1icker_cubes', cubes.toString());
      localStorage.setItem('c1icker_total_cubes', totalCubesEarned.toString());
      localStorage.setItem('c1icker_theme', currentTheme);
    }, 500); // Saves after 500ms of inactivity

    // Cleanup function to clear the timer if state changes again before 500ms
    return () => clearTimeout(saveTimer);
  }, [cubes, totalCubesEarned, currentTheme]); // Dependencies that trigger this effect

  // --- Funny Quips Effect ---
  // Displays a random quip every 10-20 seconds for 5 seconds.
  useEffect(() => {
    // Clear any existing interval to prevent multiple intervals running
    if (quipIntervalRef.current) {
      clearInterval(quipIntervalRef.current);
    }

    quipIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * funnyQuips.length);
      setCurrentQuip(funnyQuips[randomIndex]); // Set a new random quip

      // Schedule clearing the quip after 5 seconds
      setTimeout(() => {
        setCurrentQuip('');
      }, 5000);
    }, 10000 + Math.random() * 10000); // Interval between 10 and 20 seconds

    // Cleanup function to clear the interval when component unmounts
    return () => {
      if (quipIntervalRef.current) {
        clearInterval(quipIntervalRef.current);
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    // Apply the current theme as a class to the main app container
    <div className={`app-container ${currentTheme}`}>
      {/* --- Left Sidebar: Cube Growth & Community --- */}
      <div className="sidebar left-sidebar">
        <h2>Cube Growth</h2>
        {/* Growing Animated Cube */}
        <div
          className="growing-cube-container"
          style={{
            // Scale cube based on totalCubesEarned using a logarithmic function
            // Caps at 3x original size to prevent excessively large cubes
            '--cube-scale': Math.min(1 + Math.log10(totalCubesEarned + 1) * 0.1, 3),
            // Rotation speed slows down as the cube grows larger
            '--cube-rotation-speed': `${Math.max(10 - Math.log10(totalCubesEarned + 1) * 0.5, 2)}s`,
          }}
        >
          <div className="growing-cube">
            {/* Faces of the 3D cube */}
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>

        {/* Placeholder for "C1icker Community" (Playing Now) */}
        <div className="community-section">
          <h3>C1icker Community</h3>
          <div className="community-cubes">
            <div className="community-cube-icon"></div>
          </div>
          <p>~1 Player Online</p> {/* Hardcoded for now, will be dynamic */}
        </div>
        {/* Placeholder for Playtime */}
        <div className="playtime-section">
          <h3>Playtime: <span className="playtime-display">0h 0m</span></h3> {/* Will be dynamic */}
        </div>
      </div>

      {/* --- Main Clicker Area --- */}
      <div className="clicker-area" onClick={handleClick}>
        <h1>C1icker</h1>
        <div className="cube-counter">
          <span className="cube-count-number">{animatedCubes.toLocaleString()}</span> Cubes
        </div>
        <p className="gain-per-click">+1 Click per action</p>

        {/* Floating Click Numbers rendered dynamically */}
        {floatingClicks.map(click => (
          <div
            key={click.id} // Unique key for React list rendering
            className="floating-click"
            style={{
              left: `${click.x}%`,
              top: `${click.y}%`,
            }}
          >
            {click.value}
          </div>
        ))}

        {/* Funny Quip Display - only visible when currentQuip has content */}
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

      {/* --- Right Sidebar: Leaderboard & Dev Options --- */}
      <div className="sidebar right-sidebar">
        <h2>Leaderboard</h2>
        <div className="leaderboard-placeholder"></div>

        {/* Temporary Theme Selection (for development/testing) */}
        <div className="theme-selection">
          <h3>Choose Theme (Dev Only)</h3>
          <button onClick={() => setCurrentTheme('default-theme')}>Default Theme</button>
          <button onClick={() => setCurrentTheme('lava-theme')}>Lava Theme</button>
        </div>

        {/* Another Placeholder for Adsense Ad */}
        <div className="ad-placeholder-right">
          <p>Your Google AdSense Ad Here</p>
        </div>
      </div>
    </div>
  );
}

export default App;