import React, { useEffect, useRef } from "react";

import { disposeGame, gameLoop, init } from "../game/game";

const CanvasContainer = () => {
  const canvasRef = useRef();

  useEffect(() => {
    init(canvasRef);
    gameLoop();

    return () => {
      disposeGame(canvasRef);
    };
  }, []);

  return <div id="canvasContainer" ref={canvasRef}></div>;
};

export default CanvasContainer;
