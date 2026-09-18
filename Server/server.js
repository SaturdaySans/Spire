const express = require("express");
const cors = require("cors"); //middleware
const { DatabaseSync } = require("node:sqlite"); //sqlite

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
// app.use()

const db = new DatabaseSync("spire.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

function getTask(id) {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
}

app.get("/api/tasks/:type", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM tasks WHERE type = ? ORDER BY id ASC").all(req.params.type);
    res.json(rows);
  } catch (err) {
    console.error("failed to load tasks:", err);
    res.status(500).json({ error: "could not load tasks D:" });
  }
});

app.post("/api/tasks", (req, res) => {
  const { type, text } = req.body;
  if (!type || !text?.trim()) {
    return res.status(400).json({ error: "type & text are required" });
  }

  try {
    const result = db.prepare("INSERT INTO tasks (type, text, done) VALUES (?, ?, 0)").run(type, text);
    res.json(getTask(result.lastInsertRowid));
  } catch (err) {
    console.error("failed to add task:", err);
    res.status(500).json({ error: "could not add task" });
  }
});

app.patch("/api/tasks/:id/toggle", (req, res) => {
  try {
    const task = getTask(req.params.id);
    if (!task) return res.status(404).json({ error: "task not found" });

    db.prepare("UPDATE tasks SET done = ? WHERE id = ?").run(task.done ? 0 : 1, req.params.id);
    res.json(getTask(req.params.id));
  } catch (err) {
    console.error("failed to update task:", err);
    res.status(500).json({ error: "could not update task" });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("failed to delete task:", err);
    res.status(500).json({ error: "could not delete task" });
  }
});

// timetable stuff

db.exec(`
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject_id INTEGER NOT NULL,
    location_id INTEGER,
    type TEXT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
  )
`);

function getOrCreateId(table, name) {
  const existing = db.prepare(`SELECT id FROM ${table} WHERE name = ?`).get(name);
  if (existing) return existing.id;
  return db.prepare(`INSERT INTO ${table} (name) VALUES (?)`).run(name).lastInsertRowid;
}

function seedTimetable() {
  const alreadySeeded = db.prepare("SELECT COUNT(*) AS count FROM timetable").get().count > 0;
  if (alreadySeeded) return;


  // timetable data for our class
  // day, start time, end time, lesson, venue, type
  const rows = [
    ["monday", "08:00", "09:00", "PE", "Depends", "Outdoors"],
    ["monday", "09:00", "09:30", "Break", "", "Break"],
    ["monday", "09:30", "10:00", "PMT", "Homeroom", "Class"],
    ["monday", "10:00", "11:30", "Mother Tongue", "LLab2", "Class"],
    ["monday", "11:30", "12:30", "PW", "Unknown", "Unknown"],
    ["monday", "12:30", "13:00", "Break", "", "Break"],
    ["monday", "13:00", "14:00", "Econs", "LLab1", "Class"],
    ["monday", "14:00", "16:00", "Computing", "LLab1", "Class"],
    ["tuesday", "09:00", "10:30", "Econs", "LLab1", "Class"],
    ["tuesday", "10:30", "11:30", "Break", "", "Break"],
    ["tuesday", "11:30", "12:30", "Physics", "LLab1", "Class"],
    ["tuesday", "12:30", "13:30", "Physics", "LT5", "Lecture"],
    ["tuesday", "13:30", "14:00", "Break", "", "Break"],
    ["tuesday", "14:00", "15:30", "Math", "LLab1", "Class"],
    ["tuesday", "15:30", "16:30", "GP", "LLab1", "Class"],
    ["wednesday", "08:00", "09:30", "Physics", "PH34", "Practical"],
    ["wednesday", "09:30", "10:00", "Break", "", "Break"],
    ["wednesday", "10:00", "11:30", "Econs", "LT1", "Lecture"],
    ["wednesday", "11:30", "12:30", "Mother Tongue", "LLab2", "Class"],
    ["wednesday", "12:30", "13:30", "PW", "Homeroom", "Class"],
    ["wednesday", "13:30", "14:30", "Break", "", "Break"],
    ["wednesday", "14:30", "15:30", "CCE", "Depends", "Depends"],
    ["thursday", "09:00", "10:30", "Math", "LLab1", "Class"],
    ["thursday", "10:30", "12:00", "GP", "LLab1", "Class"],
    ["thursday", "12:00", "13:30", "Break", "", "Break"],
    ["thursday", "13:30", "14:30", "Mother Tongue", "LLab2", "Class"],
    ["thursday", "14:30", "16:30", "Computing", "LLab1", "Class"],
    ["friday", "08:00", "09:00", "Computing", "LLab1", "Class"],
    ["friday", "09:00", "09:30", "PMT", "Homeroom", "Class"],
    ["friday", "09:30", "10:00", "Break", "", "Break"],
    ["friday", "10:00", "11:00", "Math", "LT1/LT5", "Lecture"],
    ["friday", "11:00", "12:30", "Physics", "LLab1", "Class"],
    ["friday", "12:30", "14:00", "Break", "", "Break"],
    ["friday", "14:00", "15:30", "GP", "LLab1", "Class"],
    ["friday", "15:30", "16:30", "PE", "Depends", "Outdoors"],
  ];

  const insert = db.prepare(
    "INSERT INTO timetable (day, start_time, end_time, subject_id, location_id, type) VALUES (?, ?, ?, ?, ?, ?)"
  );

  for (const [day, start, end, subject, location, type] of rows) {
    const subjectId = getOrCreateId("subjects", subject);
    const locationId = location ? getOrCreateId("locations", location) : null;
    insert.run(day, start, end, subjectId, locationId, type);
  }
}

try { seedTimetable(); } catch (err) {
  console.error("timetable seed failed, table might be in a weird state:", err);
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

function getPeriodsForDay(day) {
  return db
    .prepare(
      `SELECT t.start_time, t.end_time, s.name AS subject, l.name AS location
       FROM timetable t
       JOIN subjects s ON t.subject_id = s.id
       LEFT JOIN locations l ON t.location_id = l.id
       WHERE t.day = ?
       ORDER BY t.start_time ASC`
    )
    .all(day);
}

app.get("/api/timetable/now", (req, res) => {
  try {
    const now = new Date();
    const nowTime = now.toTimeString().slice(0, 5);
    const todayName = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const dayIndex = DAYS.indexOf(todayName);

    let current = null;
    let next = null;

    if (dayIndex !== -1) {
      const periods = getPeriodsForDay(todayName);
      current = periods.find((p) => nowTime >= p.start_time && nowTime < p.end_time) || null;
      next = periods.find((p) => p.start_time > nowTime) || null;
    }

    if (!next) {
      const start = dayIndex === -1 ? 0 : dayIndex + 1;
      for (let i = 0; i < DAYS.length; i++) {
        const periods = getPeriodsForDay(DAYS[(start + i) % DAYS.length]);
        if (periods.length > 0) {
          next = periods[0];
          break;
        }
      }
    }

    res.json({
      current: current
        ? { subject: current.subject, location: current.location, start: current.start_time, end: current.end_time }
        : null,
      next: next
        ? { subject: next.subject, location: next.location, start: next.start_time, end: next.end_time }
        : null,
    });
  } catch (err) {
    console.error("failed to work out current period D::", err);
    res.status(500).json({ error: "could not load timetable" });
  }
});

// catches 
app.use((err, req, res, next) => {
  console.error("unhandled error:", err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(PORT, () =>
  console.log(`server running at http://localhost:${PORT}`)
);