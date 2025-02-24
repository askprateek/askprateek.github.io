/**
 * HeartbeatOverlay - A customizable heartbeat animation component
 * 
 * Usage:
 * 1. Include the CSS and JS files in your HTML
 * 2. Call HeartbeatOverlay.init() with your configuration
 */

// heartbeat-overlay.css - Save this as a separate CSS file
/* 
.heartbeat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heartbeat-overlay.with-controls {
  pointer-events: auto;
}

.heartbeat-heart {
  position: relative;
  width: 100px;
  height: 100px;
  transform-origin: center;
}

.heartbeat-heart:before, 
.heartbeat-heart:after {
  content: "";
  position: absolute;
  width: 52px;
  height: 80px;
  background: #ff5e5e;
  border-radius: 50px 50px 0 0;
  opacity: 0.8;
}

.heartbeat-heart:before {
  left: 50px;
  transform: rotate(-45deg);
  transform-origin: 0 100%;
}

.heartbeat-heart:after {
  left: 0;
  transform: rotate(45deg);
  transform-origin: 100% 100%;
}

.heartbeat-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
}

.heartbeat-btn {
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.heartbeat-btn:hover {
  background-color: #3367d6;
}

.heartbeat-bpm {
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-family: Arial, sans-serif;
  font-size: 14px;
} 
*/

// heartbeat-overlay.js - Save this as a separate JS file
const HeartbeatOverlay = (function () {
    // Default configuration
    const defaults = {
        targetSelector: 'body',
        initialBpm: 60,
        initialColor: '#ff5e5e',
        size: 100,
        showControls: true,
        position: 'center',
        zIndex: 1000,
        opacity: 0.8
    };

    let config = {};
    let heartEl = null;
    let bpmDisplay = null;
    let bpm = 60;
    let isInitialized = false;

    // Initialize the component
    function init(userConfig = {}) {
        if (isInitialized) {
            console.warn('HeartbeatOverlay is already initialized');
            return;
        }

        // Merge user config with defaults
        config = { ...defaults, ...userConfig };
        bpm = config.initialBpm;

        // Inject CSS if not already loaded
        injectStyles();

        // Create DOM elements
        createElements();

        // Apply initial settings
        updateAnimation();

        isInitialized = true;

        return {
            setBpm,
            setColor,
            setSize,
            show,
            hide,
            remove
        };
    }

    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('heartbeat-overlay-styles')) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'heartbeat-overlay-styles';
        styleEl.textContent = `
      .heartbeat-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${config.zIndex};
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .heartbeat-overlay.with-controls {
        pointer-events: auto;
      }
      
      .heartbeat-heart {
        position: relative;
        width: ${config.size}px;
        height: ${config.size}px;
        transform-origin: center;
        opacity: ${config.opacity};
      }
      
      .heartbeat-heart:before, 
      .heartbeat-heart:after {
        content: "";
        position: absolute;
        width: ${config.size * 0.52}px;
        height: ${config.size * 0.8}px;
        background: ${config.initialColor};
        border-radius: ${config.size * 0.5}px ${config.size * 0.5}px 0 0;        
      }
      
      .heartbeat-heart:before {
        left: ${config.size * 0.5}px;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      }
      
      .heartbeat-heart:after {
        left: 0;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      }
      
      @keyframes heartbeat {
        0% { transform: scale(1); }
        15% { transform: scale(1.3); }
        30% { transform: scale(1); }
        45% { transform: scale(1.15); }
        60% { transform: scale(1); }
      }
      
      .heartbeat-controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        background: rgba(255, 255, 255, 0.8);
        padding: 10px;
        border-radius: 8px;
      }
      
      .heartbeat-btn {
        padding: 8px 16px;
        background-color: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .heartbeat-btn:hover {
        background-color: #3367d6;
      }
      
      .heartbeat-bpm {
        display: flex;
        align-items: center;
        margin-right: 10px;
        font-family: Arial, sans-serif;
        font-size: 14px;
      }
    `;
        document.head.appendChild(styleEl);
    }

    // Create DOM elements
    function createElements() {
        const targetElement = document.querySelector(config.targetSelector);
        if (!targetElement) {
            console.error(`Target element "${config.targetSelector}" not found`);
            return;
        }

        // Make sure the target has position relative or absolute
        const targetPosition = window.getComputedStyle(targetElement).position;
        if (targetPosition !== 'relative' && targetPosition !== 'absolute' && targetPosition !== 'fixed') {
            targetElement.style.position = 'relative';
        }

        // Create overlay container
        const overlayEl = document.createElement('div');
        overlayEl.className = `heartbeat-overlay ${config.showControls ? 'with-controls' : ''}`;

        // Create heart element
        heartEl = document.createElement('div');
        heartEl.className = 'heartbeat-heart';
        overlayEl.appendChild(heartEl);

        // Add controls if enabled
        if (config.showControls) {
            const controlsEl = document.createElement('div');
            controlsEl.className = 'heartbeat-controls';

            // BPM display
            const bpmEl = document.createElement('div');
            bpmEl.className = 'heartbeat-bpm';
            bpmEl.innerHTML = 'Heart Rate: <span id="heartbeat-bpm-value">' + bpm + '</span> BPM';
            bpmDisplay = bpmEl.querySelector('#heartbeat-bpm-value');
            controlsEl.appendChild(bpmEl);

            // Slower button
            const slowerBtn = document.createElement('button');
            slowerBtn.className = 'heartbeat-btn';
            slowerBtn.textContent = 'Slower';
            slowerBtn.addEventListener('click', () => {
                if (bpm > 30) {
                    setBpm(bpm - 10);
                }
            });
            controlsEl.appendChild(slowerBtn);

            // Faster button
            const fasterBtn = document.createElement('button');
            fasterBtn.className = 'heartbeat-btn';
            fasterBtn.textContent = 'Faster';
            fasterBtn.addEventListener('click', () => {
                if (bpm < 180) {
                    setBpm(bpm + 10);
                }
            });
            controlsEl.appendChild(fasterBtn);

            // Change color button
            const colorBtn = document.createElement('button');
            colorBtn.className = 'heartbeat-btn';
            colorBtn.textContent = 'Change Color';
            colorBtn.addEventListener('click', () => {
                setColor(getRandomColor());
            });
            controlsEl.appendChild(colorBtn);

            overlayEl.appendChild(controlsEl);
        }

        targetElement.appendChild(overlayEl);
    }

    // Update animation based on current BPM
    function updateAnimation() {
        if (!heartEl) return;

        const animationDuration = 60 / bpm;
        heartEl.style.animation = `heartbeat ${animationDuration}s ease-in-out infinite`;

        if (bpmDisplay) {
            bpmDisplay.textContent = bpm;
        }
    }

    // Set BPM rate
    function setBpm(newBpm) {
        bpm = newBpm;
        updateAnimation();
    }

    // Set heart color
    function setColor(color) {
        if (!heartEl) return;

        const style = document.createElement('style');
        style.textContent = `
      .heartbeat-heart:before, 
      .heartbeat-heart:after {
        background-color: ${color} !important;
      }
    `;
        document.head.appendChild(style);
    }

    // Set heart size
    function setSize(size) {
        if (!heartEl) return;

        heartEl.style.width = `${size}px`;
        heartEl.style.height = `${size}px`;

        const pseudoWidth = size * 0.52;
        const pseudoHeight = size * 0.8;
        const borderRadius = size * 0.5;

        const style = document.createElement('style');
        style.textContent = `
      .heartbeat-heart:before, 
      .heartbeat-heart:after {
        width: ${pseudoWidth}px;
        height: ${pseudoHeight}px;
        border-radius: ${borderRadius}px ${borderRadius}px 0 0;
      }
      
      .heartbeat-heart:before {
        left: ${size * 0.5}px;
      }
    `;
        document.head.appendChild(style);
    }

    // Show the overlay
    function show() {
        const overlay = document.querySelector('.heartbeat-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    // Hide the overlay
    function hide() {
        const overlay = document.querySelector('.heartbeat-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Remove the overlay completely
    function remove() {
        const overlay = document.querySelector('.heartbeat-overlay');
        if (overlay) {
            overlay.remove();
        }
        isInitialized = false;
    }

    // Generate random color
    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Public API
    return {
        init
    };
})();