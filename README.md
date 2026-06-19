# Exam #N: "Exam Title"

## Student: s353434 Jinghao Mei

## React Client Application Routes

- Route `/`: public instructions page. Anonymous visitors can only read the game instructions; logged-in users can move to the setup page.
- Route `/login`: login form with username and password fields.
- Route `/setup`: protected page showing the full underground network map with stations, segments, and lines; includes controls to start a new game, open the ranking, and log out.
- Route `/games/:gameId/planning`: protected planning page showing the stations-only map, assigned start and destination stations, the list of available segments, the selected route, and the 90-second countdown.
- Route `/games/:gameId/execution`: protected page showing the submitted route execution one segment at a time, with the random event and updated coin total for each step.
- Route `/games/:gameId/result`: protected page showing the final score and a control to start another game.
- Route `/ranking`: protected page showing the best score obtained by each registered user.
- ...

## API Server

- POST `/api/sessions`
  - Request body: `{ username, password }`.
  - Response: authenticated user object. Creates a Passport session cookie.
- GET `/api/sessions/current`
  - Request body: none.
  - Response: current authenticated user, or `401` if not logged in.
- DELETE `/api/sessions/current`
  - Request body: none.
  - Response: empty response after logout.
- GET `/api/network`
  - Request body: none. Protected endpoint.
  - Response: full network data for the setup page: stations, lines, and segments.
- POST `/api/games`
  - Request body: none. Protected endpoint.
  - Response: a new game with `gameId`, randomly assigned `startStation`, `destinationStation`, planning deadline, stations, and selectable segments. The destination is at least 3 segments away from the start.
- POST `/api/games/:gameId/submit`
  - Request body: `{ route: [{ segmentId, fromStationId, toStationId }] }`. Protected endpoint.
  - Response: route validity, execution steps with random events and coin totals, and final score. Invalid or incomplete routes return score `0`.
- GET `/api/games/:gameId/result`
  - Request body: none. Protected endpoint.
  - Response: final result of one game owned by the logged-in user.
- GET `/api/ranking`
  - Request body: none. Protected endpoint.
  - Response: users ordered by their best score.
- ...

## Database Tables

- Table `users` - contains id, username, name, salt, password_hash.
- Table `stations` - contains id, name, is_interchange, x, y.
- Table `lines` - contains id, name.
- Table `segments` - contains id, line_id, station_a_id, station_b_id.
- Table `events` - contains id, description, effect.
- Table `games` - contains id, user_id, start_station_id, destination_station_id, score, play_at.
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools

Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
