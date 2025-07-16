import React, { useState, useCallback, useEffect } from 'react';
import './App.css';

type AspectRatio = {
  label: string;
  value: string;
  ratio: number;
};

const aspectRatios: AspectRatio[] = [
  { label: '1:1 (Square)', value: '1:1', ratio: 1 },
  { label: '16:9 (Widescreen)', value: '16:9', ratio: 16/9 },
  { label: '4:3 (Standard)', value: '4:3', ratio: 4/3 },
  { label: '3:2 (Photo)', value: '3:2', ratio: 3/2 },
  { label: '21:9 (Ultrawide)', value: '21:9', ratio: 21/9 },
];

function App() {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(aspectRatios[0]);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(false);

  const handleRatioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = aspectRatios.find(r => r.value === event.target.value);
    if (ratio) {
      setSelectedRatio(ratio);
      setDimensions(prev => ({
        width: prev.width,
        height: prev.width / ratio.ratio
      }));
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ ...dimensions });
    
    e.preventDefault();
  }, [dimensions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    let newWidth = Math.max(50, startDimensions.width + deltaX);
    let newHeight = Math.max(50, startDimensions.height + deltaY);

    if (maintainAspectRatio) {
      const aspectRatio = selectedRatio.ratio;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }

    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, startPos, startDimensions, maintainAspectRatio, selectedRatio]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setMaintainAspectRatio(e.shiftKey);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setMaintainAspectRatio(false);
    }
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <div className="App">
      <div className="controls">
        <label htmlFor="aspectRatio">Aspect Ratio:</label>
        <select 
          id="aspectRatio"
          value={selectedRatio.value} 
          onChange={handleRatioChange}
        >
          {aspectRatios.map(ratio => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="container">
        <div 
          className="blue-div"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
          }}
        >
          <div 
            className="resize-handle"
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
