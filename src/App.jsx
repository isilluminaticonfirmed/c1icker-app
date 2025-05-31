import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import './App.css'; // We'll use this for animations
import './index.css'; // For basic global styles like font

function App() {
  // Initialize cubes from localStorage or start at 0
  const [cubes, setCubes] = useState(() => {
    const savedCubes = localStorage.getItem('c1icker_cubes');
    return savedCubes ? parseInt(savedCubes, 10) : 0;
  });

  // State to manage the floating click numbers
  const [floatingClicks, setFloatingClicks] = useState([]);
  // Counter for unique keys for floating numbers to prevent React warnings
  const nextFloatingClickId = useRef(0);

  // --- Core Click Handler ---
  const handleClick = () => {
    const clickAmount = 1; // Base click amount
    setCubes(prevCubes => prevCubes + clickAmount);

    // Add a new floating click number
    const newFloatingClick = {
      id: nextFloatingClickId.current++, // Unique ID for each floating number
      value: `+${clickAmount}`,
      // Random X/Y position within the clicker area for a dynamic feel
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10, // 10% to 90%
    };
    setFloatingClicks(prevClicks => [...prevClicks, newFloatingClick]);

    // Remove the floating click after its animation duration to prevent array bloat
    setTimeout(() => {
      setFloatingClicks(prevClicks => prevClicks.filter(fc => fc.id !== newFloatingClick.id));
    }, 1000); // This duration should match your CSS animation duration
  };

  // --- Automatic Saving to Local Storage ---
  useEffect(() => {
    // Debounce saving to avoid excessive writes. Saves 500ms after last change.
    const saveTimer = setTimeout(() => {
      localStorage.setItem('c1icker_cubes', cubes.toString());
    }, 500);

    // Cleanup function to clear the timer if 'cubes' changes again before 500ms
    return () => clearTimeout(saveTimer);
  }, [cubes]); // Re-run this effect whenever the 'cubes' state changes

  return (
    <div className="app-container">
      {/* Left Sidebar Placeholder */}
      <div className="sidebar left-sidebar">
        <h2>Cube Growth</h2>
        <div className="growing-cube-placeholder"></div> {/* Will become the animated cube */}
      </div>

      {/* Main Clicker Area */}
      <div className="clicker-area" onClick={handleClick}>
        <h1>C1icker</h1>
        <div className="cube-counter">
          <span className="cube-count-number">{cubes.toLocaleString()}</span> Cubes
        </div>
        <p className="gain-per-click">+1 Click per action</p>

        {/* Floating Click Numbers rendered dynamically */}
        {floatingClicks.map(click => (
          <div
            key={click.id} // Important for React list rendering performance and avoiding warnings
            className="floating-click"
            style={{
              left: `${click.x}%`,
              top: `${click.y}%`,
            }}
          >
            {click.value}
          </div>
        ))}
      </div>

      {/* Right Sidebar Placeholder */}
      <div className="sidebar right-sidebar">
        <h2>Leaderboard</h2>
        <div className="leaderboard-placeholder"></div> {/* Will become the leaderboard */}
      </div>
    </div>
  );
}

export default App;
