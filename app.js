const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertStateDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictDbObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_is,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};
// API 1

app.get("/states/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      state;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachState) =>
      convertStateDbObjectToResponseObject(eachState)
    )
  );
});

// API 2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
      *
    FROM 
      state 
    WHERE 
      state_id = ${stateId};`;
  const state = await database.get(getStateQuery);
  response.send(convertStateDbObjectToResponseObject(state));
});

// API 3

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictsQuery = `
  INSERT INTO
    district (district_name,state_id,cases,cured,active,deaths)
  VALUES
    ('${districtName}', ${stateId}, ${cases},${cured},${active},${deaths});`;
  await database.run(postDistrictsQuery);
  response.send("Districts Successfully Added");
});

// API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictsQuery = `
    SELECT 
      *
    FROM 
      district 
    WHERE 
      district_id = ${districtId};`;
  const district = await database.get(getDistrictsQuery);
  response.send(convertDistrictDbObjectToResponseObject(district));
});

// API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId};`;
  await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

// API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;
  const updateDistrictQuery = `
            UPDATE
              district
            SET
              district_name = ${districtName},
              status_id = ${statusId},
              cases = ${cases},
              cured = ${cured},
              active = ${active},
              deaths = ${deaths},
            WHERE
              district_id = ${districtId};`;

  await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

// API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT 
      *
    FROM 
      state 
    WHERE 
      state_id = ${stateId};`;
  const state = await database.get(getStateQuery);
  response.send(convertStateDbObjectToResponseObject(state));
});

// API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT 
      state_name
    FROM 
      state
    WHERE 
      district_id = ${districtId};`;
  const district = await database.get(getDistrictQuery);
  response.send(convertDistrictDbObjectToResponseObject(district));
});

module.exports = app;
