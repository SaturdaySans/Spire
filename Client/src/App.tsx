import { useState, useEffect } from "react";
import { X } from "lucide-react"; // this is for icons

const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);
// sends it straight to head

// css is stolenn
const styles = document.createElement("style");
styles.innerHTML = `
  html, body { margin: 0; padding: 0; }

  .app {
    min-height: 100vh;
    width: 100%;
    padding: 24px 16px;
    box-sizing: border-box;
    background-color: #eef2f8;
    background-size: cover;
    background-position: center;
    font-family: 'Poppins', 'Trebuchet MS', sans-serif;
  }

  .heading {
    text-align: center;
    font-size: 40px;
    color: #1c2430;
    margin: 0 0 4px 0;
  }

  .today {
    text-align: center;
    font-size: 16px;
    color: #1c2430;
    margin: 0 0 24px 0;
  }

  .layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    width: 100%;
  }

  @media (max-width: 700px) {
    .layout {
      flex-direction: column;
      align-items: stretch;
    }

    .side-panel {
      width: 100%;
      box-sizing: border-box;
    }
  }

  .panel {
    background-color: rgba(235, 242, 252, 0.75);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
  }

  .side-panel { width: 256px; }

  .middle-column { flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px; }

  .middle-panel {
    min-height: 300px;
    text-align: center;
  }

  .period-bar { display: flex; justify-content: space-around; text-align: center; }
  .period-label { font-size: 12px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px; }
  .period-subject { font-size: 16px; font-weight: 500; margin-top: 2px; }
  .period-location { font-size: 13px; color: #555; }
  .period-time { font-size: 12px; color: #777; margin-top: 2px; }

  .panel h2 {
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 12px 0;
  }

  .new-task-row { display: flex; gap: 8px; margin-bottom: 12px; }

  .text-input {
    flex: 1;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
    outline: none;
    font-size: 14px;
    font-family: inherit;
  }

  .text-input:focus { border-color: #888; }

  .add-btn {
    padding: 6px 12px;
    border-radius: 6px;
    border: none;
    background-color: #33507a;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .add-btn:hover { background-color: #3f628f; }

  .task-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; max-height: 340px; overflow-y: auto; padding-right: 4px; }

  @keyframes taskIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .task-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; animation: taskIn 0.15s ease; transition: background-color 0.15s ease; }
  .task-row:hover { background-color: rgba(0, 0, 0, 0.05); }

  .task-label { flex: 1; font-size: 14px; color: #1a1a1a; }
  .task-label.done { text-decoration: line-through; color: #999; }

  .remove-btn { background: none; border: none; color: #aaa; cursor: pointer; display: flex; align-items: center; transition: color 0.15s ease; }
  .remove-btn:hover { color: #e53935; }

  .timetable-img { max-width: 100%; border-radius: 8px; }

  .error-msg { text-align: center; color: #b91c1c; font-size: 13px; margin: 0 0 16px 0; }
`;



document.head.appendChild(styles);

const API_URL = "http://localhost:4000/api";
// the other backend

type Task = { id: number; type: string; text: string; done: number };
type Period = { subject: string; location: string | null; start: string; end: string } | null;

// Oused for both homework and revision with its own input and items
function TaskPanel({ title, tasks, onAdd, onToggle, onRemove, }: {
  title: string;
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const [text, setText] = useState("");
  function submit() {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  }






  return (
    <div className="panel side-panel">
      <h2>{title}</h2>

      <div className="new-task-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={`Add to ${title.toLowerCase()}...`}
          className="text-input"
        />
        <button onClick={submit} className="add-btn">Add</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-row">
            <input
              type="checkbox"
              checked={task.done === 1}
              onChange={() => onToggle(task.id)}
            />
            <span className={`task-label ${task.done ? "done" : ""}`}>
              {task.text}
            </span>
            <button onClick={() => onRemove(task.id)} className="remove-btn" aria-label="Remove">
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const [homework, setHomework] = useState<Task[]>([]);
  const [revvy, setRevvy] = useState<Task[]>([]);
  const [current, setCurrent] = useState<Period>(null);
  const [next, setNext] = useState<Period>(null);
  const [error, setError] = useState("");

  const timetableImage = "/Assets/timetable.png";
  const wallpaperImage = "/Assets/NDie0Jj.jpeg";

  const today = new Date();
  const todayText = `${today.getDate()} ${today.toLocaleDateString("en-US", {
    month: "long",
  })} ${today.toLocaleDateString("en-US", { weekday: "long" })}`;

  useEffect(() => {
    load("homework", setHomework);
    load("revision", setRevvy);
    loadPeriods();

    // the period only changes once in a while, so re-check every minute
    // instead of only ever checking once when the page first opens
    const interval = setInterval(loadPeriods, 60000);
    return () => clearInterval(interval);
  }, []);


  //debugging
  useEffect(() => {
    console.log("debug:", { homework, revvy, current, next, error });
  }, [homework, revvy, current, next, error]);

  async function loadPeriods() {
    try {
      const res = await fetch(`${API_URL}/timetable/now`); // get data from the database
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setCurrent(data.current);
      setNext(data.next);
    } catch {
      setError("Couldn't load the timetable");
    }
  }

  async function load(type: string, setter: (tasks: Task[]) => void) {
    try {
      const res = await fetch(`${API_URL}/tasks/${type}`);
      if (!res.ok) throw new Error("bad response");
      setter(await res.json());
    } catch {
      setError("Couldn't load ur tasks (Sqlite is not up)");
    }
  }

  async function addTask(type: string, text: string, tasks: Task[], setter: (tasks: Task[]) => void) {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text }),
      });
      if (!res.ok) throw new Error("bad response");
      setter([...tasks, await res.json()]);
    } catch {
      setError("Try again.");
    }
  }

  async function toggleTask(id: number, tasks: Task[], setter: (tasks: Task[]) => void) {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}/toggle`, { method: "PATCH" });
      if (!res.ok) throw new Error("bad response");
      const updated = await res.json();
      setter(tasks.map((t) => (t.id === id ? updated : t))); //rerender
    } catch {
      setError("Try again :D");
    }
  }

  async function removeTask(id: number, tasks: Task[], setter: (tasks: Task[]) => void) {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("bad response");
      setter(tasks.filter((t) => t.id !== id));
    } catch {
      setError("Try again");
    }
  }

  return (
    <div className="app" style={{ backgroundImage: `url(${wallpaperImage})` }}>
      <h1 className="heading">{todayText}</h1>
      <p className="today">Spire</p>
      {error && <p className="error-msg">{error}</p>}

      <div className="layout">
        <TaskPanel
          title="Homework List"
          tasks={homework}
          onAdd={(text) => addTask("homework", text, homework, setHomework)}
          onToggle={(id) => toggleTask(id, homework, setHomework)}
          onRemove={(id) => removeTask(id, homework, setHomework)}
        />

        <div className="middle-column">
          <div className="panel middle-panel">
            <h2>Timetable</h2>
            <img src={timetableImage} alt="Timetable" className="timetable-img" />
          </div>

          <div className="panel period-bar">
            <div>
              <div className="period-label">Now</div>
              <div className="period-subject">{current ? current.subject : "No class"}</div>
              <div className="period-location">{current?.location ?? ""}</div>
              {current && <div className="period-time">{current.start} – {current.end}</div>}
            </div>
            <div>
              <div className="period-label">Next</div>
              <div className="period-subject">{next ? next.subject : "—"}</div>
              <div className="period-location">{next?.location ?? ""}</div>
              {next && <div className="period-time">{next.start} – {next.end}</div>}
            </div>
          </div>
        </div>

        <TaskPanel
          title="Revision Planner"
          tasks={revvy}
          onAdd={(text) => addTask("revision", text, revvy, setRevvy)}
          onToggle={(id) => toggleTask(id, revvy, setRevvy)}
          onRemove={(id) => removeTask(id, revvy, setRevvy)}
        />
      </div>
    </div>
  );
}