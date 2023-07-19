import { useEffect, useRef } from "react";

import { disposeGame, gameLoop, init } from "../game/game";
import { zero } from "../game/stack";

import Message from "./Message";

const CanvasContainer = () => {
  const canvasRef = useRef();

  useEffect(() => {
    init(canvasRef);
    gameLoop();

    return () => {
      disposeGame(canvasRef);
      zero();
    };
  }, []);

  return (
    <div id="canvasContainer" className="Container" ref={canvasRef}>
      <Message />
    </div>
  );
};

export default CanvasContainer;
