# Spire

A minimal idle browser screen with widgets like homework list,
revision planner, and a live timetable.

## Project layout

```
Spire/
├── Client/     React & TypeScript frontend
├── Server/     Express backend with SQLite
└── docker-compose.yml
```

## Option 1: Run it with Docker (easierrr)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   (Windows, Mac, or Linux) and open it once so it's running in the background (Important)
2. Open a terminal in this folder (the one with `docker-compose.yml` in it)
   and run:

   ```
   docker compose up
   ```

   The first run takes a minute or two while it builds everything. After that
   it starts in seconds.
3. Open **http://localhost:3000** in your browser.

To stop it, use `Ctrl+C` or run `docker compose down` from another terminal :D

## Option 2: Run w/o Docker

You'll need [Node.js](https://nodejs.org/) installed (version 22 or newer)

**Start the backend:**

```
cd Server
npm install
npm start
```

This starts the server at `http://localhost:4000` and creates a `spire.db`
file the first time it runs 

**Start the frontend** (in a second terminal):

```
cd Client
npm install
npm run dev
```

This starts the app at whatever URL Vite prints in the terminal (usually
`http://localhost:5173`)

**Both need to be running at the same time** — the frontend yaps to the
backend over `http://localhost:4000`.

## Database schema
 
`tasks` is a flat table:
 
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0
)
```
 
The timetable is normalised into 3nf:
 
```sql
CREATE TABLE subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)
 
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
)
 
CREATE TABLE timetable (
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
```
 
`timetable` references `subjects` and `locations`


## Notes

- The wallpaper and timetable images live in `Client/public/Assets`. Swap
  them out for your own by replacing the files there and update the paths in `Client/src/App.tsx`.
- Task and timetable data is stored in `Server/spire.db`. Delete that file
  to reset everything if needs be
- Timezone can be changed in docker-compose.yml
