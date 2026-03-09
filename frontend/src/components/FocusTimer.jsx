import { useState, useEffect } from "react";

function FocusTimer() {

  const [time, setTime] = useState(1500);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let timer;

    if (running && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [running, time]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const progress = (time / 1500) * 100;

  return (
    <div className="flex flex-col items-center">

      <div className="relative w-36 h-36">

        <svg className="w-full h-full rotate-[-90deg]">

          <circle
            cx="72"
            cy="72"
            r="60"
            stroke="#1f2937"
            strokeWidth="10"
            fill="none"
          />

          <circle
            cx="72"
            cy="72"
            r="60"
            stroke="#f97316"
            strokeWidth="10"
            fill="none"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * progress) / 100}
            strokeLinecap="round"
          />

        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">
          {minutes}:{seconds.toString().padStart(2,"0")}
        </div>

      </div>

      <button
        onClick={() => setRunning(!running)}
        className="mt-4 px-4 py-2 bg-orange-500 rounded-lg hover:bg-orange-400 transition"
      >
        {running ? "Pause" : "Start"}
      </button>

    </div>
  );
}

export default FocusTimer;