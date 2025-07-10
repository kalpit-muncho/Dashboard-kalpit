import React, { useState, useEffect } from 'react';

const MinimumScreenSize = ({ children, minWidth = 900, minHeight = 500 }) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setScreenSize(newSize);
      setIsScreenTooSmall(newSize.width < minWidth || newSize.height < minHeight);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [minWidth, minHeight]);

  if (isScreenTooSmall) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            color: '#e74c3c'
          }}>
            📱
          </div>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Screen Size Too Small
          </h2>
          <p style={{
            color: '#7f8c8d',
            marginBottom: '24px',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Muncho Dashboard requires a minimum screen size of{' '}
            <strong>{minWidth}px × {minHeight}px</strong> to function properly.
          </p>
          <p style={{
            color: '#95a5a6',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            Current size: {screenSize.width}px × {screenSize.height}px
          </p>
          <div style={{
            padding: '16px',
            backgroundColor: '#ecf0f1',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#34495e'
          }}>
            <strong>Suggestions:</strong>
            <ul style={{
              textAlign: 'left',
              marginTop: '8px',
              paddingLeft: '20px'
            }}>
              <li>Use a larger screen or monitor</li>
              <li>Maximize your browser window</li>
              <li>Zoom out in your browser (Ctrl + -)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default MinimumScreenSize;
