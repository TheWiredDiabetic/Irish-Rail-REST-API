const { determineServiceType } = require("./service_type");
const { XMLParser } = require("fast-xml-parser");
const stations = require("../lib/stations.json");
const { parse } = require("./parse");
const axios = require("axios");

// Re-usable Variables Go Here //
const baseUrl = "https://api.irishrail.ie/realtime/realtime.asmx";

const getAllStations = async () => {
  try {
    const response = await axios.get(`${baseUrl}/getAllStationsXML`);
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);
    const stations = [];

    result.ArrayOfObjStation.objStation.forEach((station) => {
      stations.push({
        name: station.StationDesc,
        code: station.StationCode,
        alias: station.StationAlias || "",
        latitude: station.StationLatitude,
        longitude: station.StationLongitude,
      });
    });

    stations.sort((a, b) => a.name.localeCompare(b.name));
    return stations;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getAllStationsWithType = async (type) => {
  try {
    const response = await axios.get(
      `${baseUrl}/getAllStationsXML_WithStationType?StationType=${type}`
    );
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);

    console.log(result);
    const stations = [];

    result.ArrayOfObjStation.objStation.forEach((station) => {
      stations.push({
        name: station.StationDesc,
        code: station.StationCode,
        alias: station.StationAlias || "",
        latitude: station.StationLatitude,
        longitude: station.StationLongitude,
      });
    });
    stations.sort((a, b) => a.name.localeCompare(b.name));

    return stations;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getStationByCode = async (code) => {
  try {
    const stations = await getAllStations();
    const station = stations.find((s) => s.code === code);
    const services = await axios.get(
      `${baseUrl}/getStationDataByCodeXML?StationCode=${code}`
    );

    if (!services.data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(services.data);
    const timetable = [];

    result.ArrayOfObjStationData.objStationData.forEach((service) => {
      timetable.push({
        code: service.Traincode,
        origin: service.Origin,
        origin_time: service.Origintime,
        destination: service.Destination,
        destination_time: service.Destinationtime,
        type: service.Traintype,
        service: determineServiceType(service.Origin, service.Destination),
        station_fullname: service.Stationfullname,
        station_code: service.Stationcode,
        due_in: service.Duein,
        late: service.Late,
        exp_arrival: service.Exparrival,
        exp_depart: service.Expdepart,
        sch_arrival: service.Scharrival,
        sch_depart: service.Schdepart,
        direction: service.Direction,
      });
    });

    return {
      ...station,
      services: timetable,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getStationTimetable = async (code) => {
  try {
    const services = await axios.get(
      `${baseUrl}/getStationDataByCodeXML?StationCode=${code}`
    );

    if (!services.data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(services.data);
    const timetable = [];

    result.ArrayOfObjStationData.objStationData.forEach((service) => {
      timetable.push({
        code: service.Traincode,
        origin: service.Origin,
        origin_time: service.Origintime,
        destination: service.Destination,
        destination_time: service.Destinationtime,
        type: service.Traintype,
        service: determineServiceType(service.Origin, service.Destination),
        station_fullname: service.Stationfullname,
        station_code: service.Stationcode,
        due_in: service.Duein,
        late: service.Late,
        exp_arrival: service.Exparrival,
        exp_depart: service.Expdepart,
        sch_arrival: service.Scharrival,
        sch_depart: service.Schdepart,
        direction: service.Direction,
      });
    });

    return timetable;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getHaconTrains = async () => {
  try {
    const response = await axios.post(`${baseUrl}/getHaconTrainsXML`);
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);
    const trains = [];

    const getStnName = async (code) => {
      if (!code) return null;
      try {
        const station = stations.find((s) => s.code === code);
        return station ? station.name : null;
      } catch (error) {
        console.error(`Error fetching station for ${code}:`, error);
        return null;
      }
    };

    for (const train of result.ArrayOfObjHaconPositions.objHaconPositions) {
      const originName = await getStnName(train.TrainOrigin);
      const destName = await getStnName(train.TrainDestination);
      const nextName = await getStnName(train.NextLocation);
      const prevName = await getStnName(train.LastLocation);

      trains.push({
        code: train.TrainCode,
        origin: {
          name: originName,
          code: train.TrainOrigin,
          time: train.TrainOriginTime,
        },
        destination: {
          name: destName,
          code: train.TrainDestination,
          time: train.TrainDestinationTime,
        },
        next_location: {
          name: nextName,
          code: train.NextLocation,
          time: train.NextLocationTime,
        },
        prev_location: {
          name: prevName,
          code: train.LastLocation,
          type: train.LastLocationType,
        },
        date: train.TrainDate,
        status: train.TrainStatus,
        sch_arrival: train.SchArrival,
        sch_depart: train.SchDepart,
        difference: train.Difference,
        direction: train.TrainDirection,
        latitude: train.TrainLatitude,
        longitude: train.TrainLongitude,
      });
    }

    return trains;
  } catch (error) {
    console.error("Error in getHaconTrains:", error);
    return [];
  }
};

const getAllTrains = async () => {
  try {
    const response = await axios.get(`${baseUrl}/getCurrentTrainsXML`);
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);
    const trains = [];

    result.ArrayOfObjTrainPositions.objTrainPositions.forEach((train) => {
      trains.push({
        status: train.TrainStatus,
        code: train.TrainCode,
        date: train.TrainDate,
        public_message: train.PublicMessage,
        direction: train.TrainDirection,
        latitude: train.TrainLatitude,
        longitude: train.TrainLongitude,
      });
    });

    return trains;
  } catch (error) {
    console.error("Error in getAllTrains:", error);
    return [];
  }
};

const getTrainsByType = async (type) => {
  try {
    const response = await axios.get(
      `${baseUrl}/getCurrentTrainsXML_WithTrainType?TrainType=${type}`
    );
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);
    const trains = [];

    result.ArrayOfObjTrainPositions.objTrainPositions.forEach((train) => {
      trains.push({
        status: train.TrainStatus,
        code: train.TrainCode,
        date: train.TrainDate,
        public_message: train.PublicMessage,
        direction: train.TrainDirection,
        latitude: train.TrainLatitude,
        longitude: train.TrainLongitude,
      });
    });

    return trains;
  } catch (error) {
    console.error("Error in getTrainsByType:", error);
    return [];
  }
};

const getTrainByCode = async (code) => {
  try {
    const trains = await getAllTrains();
    const train = trains.find((t) => t.code === code);

    return train;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getTrainMovements = async (code, date) => {
  try {
    const response = await axios.get(
      `${baseUrl}/getTrainMovementsXML?TrainId=${code}&TrainDate=${date.toString()}`
    );
    const data = response.data;

    if (!data) {
      throw new Error("No data received");
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const result = parser.parse(data);
    const movements = [];

    result.ArrayOfObjTrainMovements.objTrainMovements.forEach((movement) => {
      movements.push({
        code: movement.TrainCode,
        date: movement.TrainDate,
        location_code: movement.LocationCode,
        location_full_name: movement.LocationFullName,
        location_order: movement.LocationOrder,
        location_type: movement.LocationType,
        train_origin: movement.TrainOrigin,
        train_destination: movement.TrainDestination,
        scheduled_arrival: movement.ScheduledArrival,
        scheduled_departure: movement.ScheduledDeparture,
        expected_arrival: movement.ExpectedArrival,
        expected_departure: movement.ExpectedDeparture,
        arrival: movement.Arrival,
        departure: movement.Departure,
        auto_arrival: movement.AutoArrival,
        auto_depart: movement.AutoDepart,
        stop_type: movement.StopType,
      });
    });

    return movements;
  } catch (error) {
    console.error("Error in getTrainMovements:", error);
    return [];
  }
};

module.exports = {
  getAllStations,
  getAllStationsWithType,
  getStationByCode,
  getStationTimetable,
  getHaconTrains,
  getAllTrains,
  getTrainsByType,
  getTrainMovements,
  getTrainByCode,
};
