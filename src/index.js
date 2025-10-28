const express = require('express');
const {
  getAllStations, getAllStationsWithType, getStationByCode, getStationTimetable,
  getHaconTrains, getAllTrains, getTrainsByType,
  getTrainMovements, getTrainByCode
} = require('./util/irish_rail');
const { generateTrainDate } = require('./util/parse');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const server = express();
const PORT = process.env.PORT || 3000;

server.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toLocaleString();
  const { method, url } = req;

  console.log(`[WATCHDOG]: TX [${timestamp}] ${method} ${url}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const resCode = res.statusCode;
    const emoji = resCode >= 500 ? '❌' : resCode >= 400 ? '⚠️' : resCode >= 300 ? '↩️' : '✅';
    console.log(`[WATCHDOG]: RX ${emoji} ${method} ${url} - ${resCode} (${duration}ms)`);
  });

  next();
});

const swaggerSpec = YAML.load('./swagger/swagger.yaml');

server.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, { explorer: true, customSiteTitle: "IÉ REST API v1 Documentation - Powered by Swagger & Express" })
)

const sendError = (res, message, errorCode = 500) => {
  res.status(errorCode).json({ success: false, errorCode, errorMessage: message });
};

server.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "You've reached the root path for this server."
  });
});

server.get('/stations', async (req, res) => {
  try {
    const { type } = req.query;
    const stations = type
      ? await getAllStationsWithType(type)
      : await getAllStations();

    res.status(200).json({ success: true, stations });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching stations.');
  }
});

server.get('/stations/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const station = await getStationByCode(code);
    res.status(200).json({ success: true, station });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching the station.');
  }
});

server.get('/stations/:code/timetable', async (req, res) => {
  try {
    const { code } = req.params;
    const timetable = await getStationTimetable(code);
    res.status(200).json({ success: true, timetable }); 
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching the station timetable.');
  }
})

server.get('/hacon-trains', async (req, res) => {
  try {
    const trains = await getHaconTrains();
    res.status(200).json({ success: true, trains });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching HACON trains.');
  }
});

server.get('/trains', async (req, res) => {
  try {
    const { type } = req.query;
    const trains = type ? await getTrainsByType(type) : await getAllTrains();
    res.status(200).json({ success: true, trains });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching trains.');
  }
});

server.get('/trains/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { movements } = req.query;

    const train = await getTrainByCode(code);
    if (movements === 'true') {
      train.movements = await getTrainMovements(code, generateTrainDate());
    }

    res.status(200).json({ success: true, train });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching train details.');
  }
});

server.get('/trains/:code/movements', async (req, res) => {
  try {
    const { code } = req.params;
    const movements = await getTrainMovements(code, generateTrainDate());
    res.status(200).json({ success: true, movements });
  } catch (error) {
    console.error(error);
    sendError(res, 'An error occurred while fetching train movements.');
  }
});

server.use((req, res) => sendError(res, 'Route not found.', 404));

// Vercel doesn't like this for some reason
// server.listen(PORT, () => console.log(`[SERVER]: Listening on port ${PORT}`));
module.exports = server;
