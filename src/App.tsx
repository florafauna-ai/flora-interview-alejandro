import React, { useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import "./App.css";

type AspectRatio = {
  label: string;
  value: any;
};

const aspectRatios: AspectRatio[] = [
  { label: "1:1 (Square)", value: "1" }, //1
  { label: "16:9 (Widescreen)", value: 1.77 },
  { label: "4:3 (Standard)", value: "4:3" }, //1.33
  { label: "3:2 (Photo)", value: "3/2" }, //1,5
  { label: "21:9 (Ultrawide)", value: 2.33 },
];

const maintainDimensions: string[] = [
  "width",
  "height"
]

const getSanitizedAspectRatio = (aspectRatio: string | number) => {
  if (typeof aspectRatio === "number")
    return aspectRatio
  if (typeof aspectRatio === "string") {
    if (aspectRatio.includes(":")) {
      const [width, height] = aspectRatio.split(":").map(Number)
      return width / height
    }
    else if (aspectRatio.includes("/")) {
      const [width, height] = aspectRatio.split("/").map(Number)
      return width / height
    }
    else if(aspectRatio == "1")
      return 1
  }
  throw new Error("Value not string or number")
}

const getAspectRatioCoefficient = (original: AspectRatio, newAspectRatio: AspectRatio) => {
  const sanitizedOriginalRatio = getSanitizedAspectRatio(original.value)
  const sanitizedNewAspectRatio = getSanitizedAspectRatio(newAspectRatio.value)
  return sanitizedOriginalRatio / sanitizedNewAspectRatio
}

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
  const [originalDimensions, setOriginalDimensions] = useState({ width: 300, height: 300})

  const [selectedDimension, setSelectedDimension] = useState<string>("width")

  const handleDimensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(`selected dimension: ${event.currentTarget.value}`)
    setSelectedDimension(event.currentTarget.value)
  }

  const handleRatioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // handle drag - no override with shift
    // get value and search on the aspecratios enum
    const selectedAspectRatio = event.currentTarget.value
    console.log(`Selected aspect ratio ${selectedAspectRatio}`)
    aspectRatios.forEach((aspectRatio) => {
      if (aspectRatio.value == selectedAspectRatio) {
        setSelectedRatio(aspectRatio)
        const coefficient = getAspectRatioCoefficient(aspectRatios[0], aspectRatio)
        switch(selectedDimension) {
          case "width":
            setDimensions({ width: originalDimensions.width, height: originalDimensions.height * coefficient})
            break
          
          case "height":
            setDimensions({ width: originalDimensions.width * coefficient, height: originalDimensions.height})
            break

          default:
            throw new Error("No valid dimension selected")
        }
      }
    })
  };

  const handleDrag = useCallback(
    (e: React.MouseEvent) => { },
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
        <label htmlFor="maintain"> Maintain dimension</label>
        <select 
          id="maintain"
          value={selectedDimension}
          onChange={handleDimensionChange}>
          {maintainDimensions.map((dimensions) => (
            <option key={dimensions} value={dimensions}>
              {dimensions}
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
