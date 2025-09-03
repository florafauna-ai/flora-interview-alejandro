import React, { useState, useCallback, useEffect } from "react";
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

// I added this small functionality to be able to select which of the dimensions to keep on the coefficient
const maintainDimensions: string[] = [
  "width",
  "height"
]

// This is why I wanted to get ahold of the type, my reasoning was to discriminate based on string vs number and just do calculations if string had to be parsed
// Also coefficient is 'standardized' so it could also maintain better proportions on other more complex aspext ratios

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
    else if (aspectRatio == "1")
      return 1
  }
  throw new Error("Value not string or number")
}

// Helper function to modify old vs new aspect ratios i.e. 1:1 -> 4:3
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
  const [originalDimensions, setOriginalDimensions] = useState({ width: 300, height: 300 })
  const [selectedFixedDimension, setSelectedFixedDimension] = useState<string>("width")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [startPosX, setStartPosX] = useState<number>(0)
  const [startPosY, setStartPosY] = useState<number>(0)

  // Adhering to the handleRatioChange function I also created handleDimensionChange to switch values based on the dropdown I added
  const handleDimensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log(`selected dimension: ${event.currentTarget.value}`)
    setSelectedFixedDimension(event.currentTarget.value)
  }

  const handleRatioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAspectRatio = event.currentTarget.value
    console.log(`Selected aspect ratio ${selectedAspectRatio}`)
    aspectRatios.forEach((aspectRatio) => {
      if (aspectRatio.value == selectedAspectRatio) {
        setSelectedRatio(aspectRatio)
        const coefficient = getAspectRatioCoefficient(aspectRatios[0], selectedRatio)
        //There is probably a better way using useReducer to avoid the switch 
        switch (selectedFixedDimension) {
          case "width":
            setDimensions({ width: originalDimensions.width, height: originalDimensions.height * coefficient })
            break

          case "height":
            setDimensions({ width: originalDimensions.width * coefficient, height: originalDimensions.height })
            break

          default:
            throw new Error("No valid dimension selected")
        }
      }
    })
  };

  //I tried using only onDrag but I was not able to extract start and end positions reliably so I defaulted to normal mouse events vs reacts
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartPosX(e.clientX)
    setStartPosY(e.clientY)
  }, [dimensions])

  const handleMouseUp = useCallback(() => { setIsDragging(false) }, [dimensions])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDrag)
      window.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseDown, setDimensions])

  const handleDrag = useCallback(
    (e: MouseEvent) => {
      setOriginalDimensions({ width: dimensions.width, height: dimensions.height })
      const deltaX = e.clientX - startPosX
      const deltaY = e.clientY - startPosY
      console.log(`Dragging x:${e.clientX}, y: ${e.clientY}`)

      const minimumXValue = 30
      const minimumYValue = 30

      //I was going to go with the normal key events but mouse event has a modifier listener I could use
      if (e.shiftKey) {
        console.log("Shift key pressed!")
        const coefficient = getAspectRatioCoefficient(aspectRatios[0], selectedRatio)
        let newWidth = 0
        let newHeight = 0
        // I know probably a switch statement for 2 cases is overkill, but I wanted to add the posibility later to also account for keeping both dimensions constrained, or none
        switch (selectedFixedDimension) {
          case "width":
            newWidth = Math.max(minimumXValue, dimensions.width + deltaX)
            setDimensions({
              width: newWidth,
              height: newWidth / coefficient
            })
            break

          case "height":
            newHeight = Math.max(minimumYValue, dimensions.height + deltaY)
            setDimensions({
              width: newHeight / coefficient,
              height: newHeight
            })
            break
        }
      } else {
        const maxWidth = Math.max(minimumXValue, dimensions.width + deltaX)
        const maxHeight = Math.max(minimumYValue, dimensions.height + deltaY)
        setDimensions({ width: maxWidth, height: maxHeight })
      }
    },
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
          value={selectedFixedDimension}
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
          <ResizableDiv dimensions={dimensions} onDrag={handleMouseDown} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
