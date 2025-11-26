import {
  CircularProgressbar,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function OccupancyCircle({ value = 0, max = 1, thick = 10, mrg = "0" }) {
  const percentage = (value / max) * 100;

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: "1 / 1",
        margin: mrg,
      }}
    >
      <CircularProgressbar
        value={percentage}
        strokeWidth={thick}
        styles={buildStyles({
          pathColor: "var(--color-main)",
          trailColor: "var(--color-main-low)",
          strokeLinecap: "round",
          textColor: "transparent",
        })}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "var(--text-l)", fontWeight: "600" }}>
          <span style={{ fontSize: "var(--text-l)", color: "var(--text)" }}>
            {Math.round(percentage)}%
          </span>
          <div style={{ fontSize: "var(--text-m)" , color: "var(--text-low)"}}>
            {value}/{max}
          </div>
        </div>
      </div>
    </div>
  );
}
