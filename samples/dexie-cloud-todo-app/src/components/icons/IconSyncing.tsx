import { IconSync } from "./IconSync";
import "../../spin-animation.css";

export function IconSyncing () {
  return <div style={{
    animation: "spin 1s linear infinite",
    transformOrigin: "50%",
    width: "24px",
    height: "24px",
    padding: 0,
    margin: 0
  }}>
    <IconSync />
  </div>;
}