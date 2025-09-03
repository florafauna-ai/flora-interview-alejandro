import React, { useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import "./App.css";

type AspectRatio = {
  label: string;
  value: any;
};

const aspectRatios: AspectRatio[] = [
  { label: "1:1 (Square)", value: "1" },
  { label: "16:9 (Widescreen)", value: 1.77 },
  { label: "4:3 (Standard)", value: "4:3" },
  { label: "3:2 (Photo)", value: "3/2" },
  { label: "21:9 (Ultrawide)", value: 2.33 },
];

// Component that will be rendered inside the 3D scene
const ResizableDiv = ({
  dimensions,
  onDrag,
}: {
  dimensions: { width: number; height: number };
  onDrag: (e: React.MouseEvent) => void;
}) => {
  return (
    <Html
      center
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        position: "relative",
      }}
    >
      <div
        className="blue-div"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: "url(/town-illustration.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="resize-handle" onMouseDown={onDrag} />
      </div>
    </Html>
  );
};

function App() {
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(
    aspectRatios[0]
  );
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  const handleRatioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {};

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {},
    [dimensions, selectedRatio]
  );

  return (
    <div className="App">
      <div className="controls" style={{ position: "absolute", zIndex: 1000 }}>
        <label htmlFor="aspectRatio">Aspect Ratio:</label>
        <select
          id="aspectRatio"
          value={selectedRatio.value}
          onChange={handleRatioChange}
        >
          {aspectRatios.map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>

      <div className="container" style={{ width: "100%", height: "80vh" }}>
        <Canvas
          orthographic
          camera={{
            zoom: 1,
            position: [0, 0, 1000],
            near: 0.1,
            far: 2000,
          }}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <ResizableDiv dimensions={dimensions} onDrag={handleDrag} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
