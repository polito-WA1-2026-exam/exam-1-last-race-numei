# Exam #N: "Exam Title"

## Student: s353434 Jinghao Mei

## React Client Application Routes

- Route `/setup`: for registered user: network map with all stations, their connections, and the lines, planning button, log out button, for visitor: only game instructions
- Route `/login`: user id and password input,verify selection area(prevent bulk registeration),login button, register link.
- Route `/register`: last_name,first_name,id,password,confirm_password input,register button.
- Route `/ranking`: previous finished execution grades/rank,return button.
- Route `/planning`: network map(only the stations with their names),a starting station and a destination station,the list of all segments, timeout area(realtime rendering),execution button.
- Route `/execution`: shows the steps one at a time, in sequence, displaying the unexpected event that occurred and the updated coin total.
- Route `/result`: final score and restart button.
- ...

## API Server

- POST `/api/login`
  - id,password
  - 1/error message,0/success
- POST `/api/logout`
  - id
  - 1/error message,0/success
- GET `/api/lines`
  - user_session
  - line_list
- GET `/api/stations`
  - user_session
  - station_list
- GET `/api/random_station`
  - user_session
  - start_station,end_station
- GET `/api/segments`
  - user_session
  - segment_list
- GET `/api/events`
  - user_session
  - event_list
- GET `api/ranking`
  - user_session
  - event_list
- POST `api/execute`
  - segment_list and user_session
  - 0/start_station,end_station,event_id,coins,1/error message(invalid or incomplete),is_final
- ...

## Database Tables

- Table `user` - contains id,username,salt,hash_password
- Table `station` - contains is_interchange,name,id,x,y
- Table `line` - contains name,id
- Table `segment` - contains line_id,station_a_id,station_b_id
- Table `games` - contains id,user_id,start_station_id,destination_station_id,score,play_at
- Table `event` - contains id,description,effect
- Table `static_data` - contains init_coins,select_time_out //if support configuration
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
