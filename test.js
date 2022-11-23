const moment = require('moment-timezone');
const orderBy = require('lodash/orderBy');
const groupBy = require('lodash/groupBy');
const keyBy = require('lodash/keyBy');
const findLastIndex = require('lodash/findLastIndex');
const findIndex = require('lodash/findIndex');
const uniqBy = require('lodash/uniqBy');
const round = require('lodash/round');

const find = require('lodash/find');
const findLast = require('lodash/findLast');
const slice = require('lodash/slice');

// const Promise = require('bluebird');
// const geohash = require('ngeohash');

const TripsRepository = require('../repositories/trips.repository');
const ExceptionsRepository = require('../repositories/exceptions.repository');
const DevicesRepository = require('../repositories/devices.repository');
const ReportsRepository = require('../repositories/reports.repository');

const GeotabService = require('../services/geotab.service');

const { formatTime, pgTimeToSeconds } = require('../utils/time.util');
const getClusterArray = require('../utils/clusterArray.util');
const { pointInPolygon, pointInPolygon2 } = require('../utils/geofence.util');
const timeZone = 'America/Mexico_City';

const { config } = require('../config');
const { goUsername, goPassword, goDatabase, goServer } = config;

const CUSTOMER_ZONETYPE_ID = 'ZoneTypeCustomerId';
const CEDIS_ZONETYPE_ID = 'b6';

class MainService {
  constructor() {
    this.tripsRepository = new TripsRepository();
    this.exceptionsRepository = new ExceptionsRepository();
    this.devicesRepository = new DevicesRepository();
    this.reportsRepository = new ReportsRepository();
    this.geotabService = new GeotabService(
      goUsername,
      goPassword,
      goDatabase,
      goServer
    );
  }

  async getGeotabTrips(fromDate, toDate) {
    try {
      const geotabTrips = await this.tripsRepository.getFromBigquery({
        fromDate,
        toDate,
      });

      return geotabTrips;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getGeotabDevices() {
    try {
      const devices = await this.devicesRepository.get();
      return devices;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getGeotabZones(fromDate) {
    try {
      const geotabZones = await this.geotabService.getZones(fromDate);
      return geotabZones;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getGeotabAddresses(stopPoints) {
    try {
      const geotabAddresses = await this.geotabService.getAddresses(stopPoints);
      return geotabAddresses;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getStopPointsByTrips(trips) {
    try {
      const stopPoints = trips.map((trip) => ({
        x: trip.stop_point_x,
        y: trip.stop_point_y,
      }));
      return stopPoints;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getTripsWithAddresses(trips) {
    try {
      const stopPoints = await this.getStopPointsByTrips(trips);
      const addresses = await this.getGeotabAddresses(stopPoints);

      const tripsWithAddresses = trips.map((trip, index) => {
        return {
          ...trip,
          stopAddress: addresses[index],
        };
      });

      return tripsWithAddresses;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  isCEDISZone(zone) {
    const isCedis = zone.zoneTypes.some((zoneType) =>
      zoneType.id && zoneType.id === CEDIS_ZONETYPE_ID ? true : false
    );

    return isCedis;
  }

  isCustomerZone(zone) {
    const isCustomer = zone.zoneTypes.some((zoneType) =>
      zoneType === CUSTOMER_ZONETYPE_ID ? true : false
    );

    return isCustomer;
  }

  getCleanStopZones(stopZones) {
    const cleanStopZones = stopZones.map((zone) => {
      const zoneTypes =
        this.isCEDISZone(zone) && this.isCustomerZone(zone)
          ? zone.zoneTypes.filter(
              (zoneType) => zoneType !== CUSTOMER_ZONETYPE_ID
            )
          : zone.zoneTypes;
      return {
        ...zone,
        zoneTypes,
      };
    });

    return cleanStopZones;
  }

  async getTripsWithStopZones(tripsWithAddresses, zonesDictionary) {
    try {
      const pernoteIndex = !tripsWithAddresses
        ? 0
        : tripsWithAddresses.length - 1;
      const tripsWithStopZones = tripsWithAddresses.map((trip, index) => {
        let stopZones =
          trip.stopAddress &&
          trip.stopAddress.zones &&
          trip.stopAddress.zones.length > 0
            ? trip.stopAddress.zones
                .map((addressZone) => {
                  return zonesDictionary[addressZone.id];
                })
                .filter((zone) => zone)
                .filter((zone) =>
                  pointInPolygon(
                    {
                      x: round(trip.stop_point_x, 13),
                      y: round(trip.stop_point_y, 13),
                    },
                    zone.points.map((point) => ({
                      x: round(point.x, 13),
                      y: round(point.y, 13),
                    }))
                  )
                )
                .filter((zone) =>
                  pointInPolygon2(
                    [
                      round(trip.stop_point_x, 13),
                      round(trip.stop_point_y, 13),
                    ],
                    zone.points.map((point) => [point.x, point.y])
                  )
                )
            : [];

        // stopZones = this.getCleanStopZones(stopZones);

        const isGeofenceStop = stopZones.length > 0 ? true : false;
        let isCustomerStop = isGeofenceStop
          ? stopZones.some((zone) => this.isCustomerZone(zone))
          : false;
        const isCedisStop = isGeofenceStop
          ? stopZones.some((zone) => this.isCEDISZone(zone))
          : false;

        const customerZones = isGeofenceStop
          ? stopZones.filter((zone) => this.isCustomerZone(zone))
          : [];

        const cedisZones = isGeofenceStop
          ? stopZones.filter((zone) => this.isCEDISZone(zone))
          : [];

        const otherZones = isGeofenceStop
          ? stopZones.filter(
              (zone) =>
                this.isCustomerZone(zone) === false &&
                this.isCEDISZone(zone) === false
            )
          : [];

        // if (isCustomerStop && isCedisStop) {
        //   isCustomerStop = false;
        // }
        const isCedisNewCase = isCustomerStop && isCedisStop ? true : false;
        const isCustomerNewCase =
          isCustomerStop && isCedisNewCase !== true ? true : false;

        const isOtherZonesNewCase =
          isGeofenceStop &&
          isCustomerStop === false &&
          isCedisNewCase === false;

        const isWithoutZoneNewCase =
          isGeofenceStop === false &&
          isCustomerStop === false &&
          isCedisNewCase === false;

        let pernote = false;
        if (index === pernoteIndex) {
          pernote = true;
        }

        return {
          ...trip,
          stopZones,
          isGeofenceStop,
          isCustomerStop,
          isCedisStop,
          isCedisNewCase,
          isCustomerNewCase,
          customerZones,
          cedisZones,
          otherZones,
          isOtherZonesNewCase,
          isWithoutZoneNewCase,
          pernote,
        };
      });
      return tripsWithStopZones;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getStemInitTrips(tripsWithStopZones) {
    try {
      let firstCedisStop = tripsWithStopZones.find(
        (trip) => trip.isCedisNewCase
      );

      let firstCustomerStop = find(
        tripsWithStopZones,
        (trip) => trip.isCustomerNewCase,
        firstCedisStop ? firstCedisStop.index : 0 // fromIndex
      );

      if (!firstCustomerStop) {
        return [];
      }

      // posible solucion a casos feos
      // if (firstCedisStop && !firstCustomerStop) {
      //   firstCustomerStop = find(
      //     tripsWithStopZones,
      //     (trip) => trip.isCustomerNewCase
      //   );

      //   if (
      //     firstCustomerStop &&
      //     firstCustomerStop.index < firstCedisStop.index
      //   ) {
      //     firstCedisStop = tripsWithStopZones[0];
      //   }
      // }

      if (
        firstCustomerStop &&
        firstCustomerStop.index &&
        firstCedisStop &&
        firstCedisStop.index < firstCustomerStop.index
      ) {
        // CASO A
        const stemInitTrips = tripsWithStopZones.slice(
          firstCedisStop.index + 1,
          firstCustomerStop.index + 1
        );

        return stemInitTrips;
      } else {
        // CASO C

        const stemInitTrips = tripsWithStopZones.slice(
          0,
          firstCustomerStop ? firstCustomerStop.index + 1 : 1
        );

        return stemInitTrips;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getStemFinalTrips(stemInitTrips, tripsWithStopZones) {
    try {
      const lastStemInitTrips =
        stemInitTrips.length === 0
          ? undefined
          : stemInitTrips[stemInitTrips.length - 1];

      const lastCustomerStop = tripsWithStopZones.findLast(
        (trip) => trip.isCustomerNewCase,
        lastStemInitTrips ? lastStemInitTrips.index : 0 // fromIndex
      );

      const lastCedisStop = find(
        tripsWithStopZones,
        (trip) => trip.isCedisNewCase,
        lastCustomerStop
          ? lastCustomerStop.index
          : lastStemInitTrips
          ? lastStemInitTrips.index
          : 0 // fromIndex
      );

      if (!lastCedisStop) {
        return [];
      }
      if (tripsWithStopZones.length === 1 && lastCedisStop) {
        return [];
      }
      if (
        lastCustomerStop &&
        lastCustomerStop.index &&
        lastCedisStop &&
        lastCedisStop.index > lastCustomerStop.index
      ) {
        // CASO B

        const stemLastTrips = tripsWithStopZones.slice(
          lastCustomerStop.index + 1,
          lastCedisStop.index + 1
        );

        return stemLastTrips;
      } else {
        // CASO D
        const stemLastTrips = tripsWithStopZones.slice(
          lastCustomerStop.index + 1,
          tripsWithStopZones.length
        );

        return stemLastTrips;
      }
      //console.log(lastCedisStop);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* getTripsWithoutStems2({ tripsByDevice, lastStemInit, firstStemFinal }) {
    try {
      const tripsWithoutStems = tripsByDevice.slice(
        lastStemInit.index + 1,
        firstStemFinal.index
      );
      return tripsWithoutStems;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }*/

  getTripsWithoutStems({
    tripsByDevice,
    lastStemInit,
    firstStemFinal,
    stemFinalTrips,
  }) {
    try {
      if (!lastStemInit && !firstStemFinal) {
        return tripsByDevice;
      } else if (!lastStemInit && firstStemFinal && firstStemFinal.length > 0) {
        const trip = tripsByDevice.slice(
          0,
          tripsByDevice.length - stemFinalTrips.length
        );
        return trip;
      } else if (lastStemInit && lastStemInit.length > 0 && !firstStemFinal) {
        const trip = tripsByDevice.slice(
          lastStemInit.index + 1,
          tripsByDevice.length - 1
        );
        return trip;
      } else {
        const trip = tripsByDevice.slice(
          lastStemInit.index + 1,
          tripsByDevice.length - stemFinalTrips.length
        );

        let tripsWithoutStems = trip;

        if (stemFinalTrips.length === 1) {
          tripsWithoutStems = tripsByDevice.slice(
            lastStemInit.index + 1,
            firstStemFinal.index
          );
        }
        return tripsWithoutStems;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTripsWithoutStemsFinal({ tripsByDevice, stemFinalTrips }) {
    try {
      if (tripsByDevice.length === 1) {
        return tripsByDevice.slice(0, 1);
      }
      if (!stemFinalTrips) {
        const tripsWithoutStems = tripsByDevice.slice(
          0,
          tripsByDevice.length - 1
        );
        return tripsWithoutStems;
      } else {
        const tripsWithoutStems = tripsByDevice.slice(
          0,
          stemFinalTrips[0].index
        );
        return tripsWithoutStems;
      }
    } catch (error) {
      console.error(error);
      console.log(JSON.stringify(tripsByDevice));
      console.log(JSON.stringify(stemFinalTrips));
      throw error;
    }
  }

  getStopsCustomers(tripsByDevice) {
    try {
      const customerTrips = tripsByDevice.filter(
        (trip) => trip.isCustomerNewCase === true && trip.pernote === false
      );

      return customerTrips;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getStopsCedis(tripsByDevice) {
    try {
      const cedisTrips = tripsByDevice.filter(
        (trip) => trip.isCedisStop === true
      );

      return cedisTrips;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getCustomersInStops(tripsByDevice) {
    try {
      const customersInStops = tripsByDevice.flatMap(
        (trip) => trip.customerZones
      );

      return customersInStops;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTripsWithoutGeofences(tripsWithoutStems) {
    try {
      const otherGeocerca = tripsWithoutStems.filter(
        (x) => x.isWithoutZoneNewCase === true
      );

      return otherGeocerca;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getStopsWithOtherGeofences(tripsWithoutStems) {
    try {
      const otherGeocerca = tripsWithoutStems.filter(
        (other) => other.isOtherZonesNewCase === true
      );

      return otherGeocerca;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTripsWithoutLastRecord(tripsByDevice) {
    try {
      const TripsWithoutLastRecord = tripsByDevice.slice(
        0,
        tripsByDevice.length - 1
      );
      return TripsWithoutLastRecord;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTripsWithoutGeofencesAndOthers(tripsByDevice) {
    try {
      const tripsWithoutGeofencesAndOthers = tripsByDevice.filter(
        (trip) =>
          (trip.isWithoutZoneNewCase === true ||
            trip.isOtherZonesNewCase === true) &&
          trip.isCedisStop === false
      );

      return tripsWithoutGeofencesAndOthers;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getTimeBetweenCedis(stopsCedisTrips, stemFinalTrips) {
    try {
      const drivingDuration = stopsCedisTrips
        .map((trip) => trip.driving_duration)
        .reduce((a, b) => a + b, 0);
      let timeBetweenCedis = drivingDuration;
      if (stemFinalTrips.length > 0 && stemFinalTrips[0].isCedisStop === true) {
        timeBetweenCedis = drivingDuration - stemFinalTrips[0].driving_duration;
      }
      return timeBetweenCedis;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getDrivinTripsToCedis(tripsByDevice) {
    try {
      const cedisTrips = tripsByDevice.filter(
        (trip) => trip.isCedisStop === true
      );

      return cedisTrips;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  geStoppedTimeOfCedisTrips(tripsWithoutStemsFinal) {
    try {
      const cedisTrips = tripsWithoutStemsFinal.filter(
        (trip) => trip.isCedisStop === true && trip.pernote === false
      );

      return cedisTrips;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async calcFromBigquery({ fromDate, toDate }) {
    try {
      const trips = await this.getGeotabTrips(fromDate, toDate);
      const devices = await this.getGeotabDevices();
      const devicesDictionary = keyBy(devices, 'deviceId');
      const zones = await this.getGeotabZones(fromDate);
      const zonesDictionary = keyBy(zones, 'id');

      const tripsWithAddresses = await this.getTripsWithAddresses(trips);

      /*********************************** **********************************/
      const tripsWithStopZones = await this.getTripsWithStopZones(
        tripsWithAddresses,
        zonesDictionary
      );

      const tripsWithStopZonesGroupedByDevice = groupBy(
        tripsWithStopZones,
        'device_id'
      );

      const dbData = Object.keys(tripsWithStopZonesGroupedByDevice)
        .map((deviceId) => {
          let tripsByDevice = tripsWithStopZonesGroupedByDevice[deviceId]
            ? orderBy(tripsWithStopZonesGroupedByDevice[deviceId], 'start')
            : [];

          if (tripsByDevice <= 0) {
            return;
          }

          tripsByDevice = tripsByDevice.map((trip, index) => {
            return {
              ...trip,
              index,
            };
          });
          /*****************************END DATA****************************/
          const stemInitTrips = this.getStemInitTrips(tripsByDevice);
          const stemFinalTrips = this.getStemFinalTrips(
            stemInitTrips,
            tripsByDevice
          );

          const timeOfStemInitTrips = stemInitTrips
            .map((trip) => trip.driving_duration)
            .reduce((a, b) => a + b, 0);

          const timeOfStemFinalTrips = stemFinalTrips
            .map((trip) => trip.driving_duration)
            .reduce((a, b) => a + b, 0);

          const lastStemInit =
            stemInitTrips.length === 0
              ? undefined
              : stemInitTrips[stemInitTrips.length - 1];
          const firstStemFinal =
            stemFinalTrips.length === 0
              ? undefined
              : stemFinalTrips[stemFinalTrips.length - 1];

          /*const positionOfStemInit = stemInitTrips.length - 1;
        const positionOfStemFinal = stemFinalTrips.length - 1;*/

          const tripsWithoutStems = this.getTripsWithoutStems({
            tripsByDevice,
            lastStemInit,
            firstStemFinal,
            stemFinalTrips,
          });

          /* const tripsWithoutStems2 = this.getTripsWithoutStems({
          tripsByDevice,
          lastStemInit,
          positionOfStemInit,
          stemFinalTrips,
        });*/

          const tripsWithoutStemsFinal = this.getTripsWithoutStemsFinal({
            tripsByDevice,
            stemFinalTrips,
          });

          const tripsWithoutLastRecord =
            this.getTripsWithoutLastRecord(tripsByDevice);
          /*****************************END DATA****************************/

          /*****************************driving calculate ****************************/

          const drivingCustomersTrips =
            this.getStopsCustomers(tripsWithoutStems);
          const timeDrivingBetweenCustomers = drivingCustomersTrips
            .map((trip) => trip.driving_duration)
            .reduce((a, b) => a + b, 0);
          /*const ttripStopsWithoudGeocerca = this.getTripsWithoutGeofences(
          tripsWithoutLastRecord
        );*/

          const tripDrivingPoints =
            this.getTripsWithoutGeofencesAndOthers(tripsWithoutStems);
          const timeOfWithoudGeocerca = tripDrivingPoints
            .map((trip) => trip.driving_duration)
            .reduce((a, b) => a + b, 0);

          const drivinTripsToCEDIS = this.getDrivinTripsToCedis(tripsByDevice);
          const timeDrivingBetweenCEDIS = drivinTripsToCEDIS
            .map((trip) => trip.driving_duration)
            .reduce((a, b) => a + b, 0);
          /*****************************END driving calculate ****************************/

          /*****************************calculation of stops****************************/
          const stopsCustomersTrips = this.getStopsCustomers(tripsByDevice);
          const timeOfCustumerService = stopsCustomersTrips
            .map((trip) => trip.stop_duration)
            .reduce((a, b) => a + b, 0);

          const customersInStops =
            this.getCustomersInStops(stopsCustomersTrips);
          /*const tripStopsWithoudGeocerca = this.getTripsWithoutGeofences(
          tripsWithoutStemsFinal
        );*/

          const tripStopPoints = this.getTripsWithoutGeofencesAndOthers(
            tripsWithoutLastRecord
          );
          const timeOfstopsWithoudGeocerca = tripStopPoints
            .map((trip) => trip.stop_duration)
            .reduce((a, b) => a + b, 0);

          const stopsWithOtherGeofences =
            this.getStopsWithOtherGeofences(tripsByDevice);

          const timeStopsCedisTrips = this.geStoppedTimeOfCedisTrips(
            tripsWithoutStemsFinal
          );
          const timeOfStopCedis = timeStopsCedisTrips
            .map((trip) => trip.stop_duration)
            .reduce((a, b) => a + b, 0);

          /*****************************END calculation of stops****************************/
          /*****************************totals of stops****************************/
          const tripsWithoudGeocerca =
            this.getTripsWithoutGeofences(tripsByDevice);

          const stopsCedisTrips = this.getStopsCedis(tripsByDevice);
          const countOfStopsInCEDIS = getClusterArray(stopsCedisTrips, 'index');
          /*****************************END totals of stops****************************/
          //const tripsInfo = tripsWithStopZonesGroupedByDevice[deviceId];

          /*const timeOfTotalStopped = tripsWithoutStemsFinal
            .map((trip) => trip.stop_duration)
            .reduce((a, b) => a + b, 0);*/

          //Device
          const device_id = deviceId;
          const device_name = devicesDictionary[deviceId].deviceName;
          const driver = 'No Info';
          const vehicle_zone = devicesDictionary[deviceId].vehicleZone;
          const vehicle_location = devicesDictionary[deviceId].vehicleLocation;
          const vehicle_uo = devicesDictionary[deviceId].vehicleUo;

          // tripsByDevice
          const startTime = moment.utc(tripsByDevice[0].start);
          const endTime = moment.utc(
            tripsByDevice[tripsByDevice.length - 1].stop
          );

          const start_date = startTime.tz(timeZone).format('YYYY-MM-DD');

          const end_date = endTime.tz(timeZone).format('YYYY-MM-DD');

          const days_operated = 1;

          const days_rute = 1;

          const start_time = startTime.tz(timeZone).format('HH:mm:ss');

          const end_time = endTime.tz(timeZone).format('HH:mm:ss');

          const total_time = formatTime(endTime.diff(startTime, 'seconds') + 1);
          const time_total = formatTime(
            timeOfStemInitTrips +
              timeOfStemFinalTrips +
              timeDrivingBetweenCustomers +
              timeOfWithoudGeocerca +
              timeOfCustumerService +
              timeOfstopsWithoudGeocerca +
              timeOfStopCedis +
              timeDrivingBetweenCEDIS
          );
          let tiemeQuality = total_time === time_total ? true : false;

          const transfer_time = formatTime(
            timeOfStemInitTrips +
              timeOfStemFinalTrips +
              timeDrivingBetweenCustomers +
              timeOfWithoudGeocerca
          );

          const start_time_stem = formatTime(timeOfStemInitTrips);

          const end_time_stem = formatTime(timeOfStemFinalTrips);
          const time_between_clientes = formatTime(timeDrivingBetweenCustomers);

          const transfer_other_points = formatTime(timeOfWithoudGeocerca);

          const total_stopped = formatTime(
            timeOfCustumerService + timeOfstopsWithoudGeocerca + timeOfStopCedis
          );

          const customer_service_time = formatTime(timeOfCustumerService);
          const stopped_other_points_time = formatTime(
            timeOfstopsWithoudGeocerca
          );
          const stopped_cedis_time = formatTime(timeOfStopCedis);

          const stops_without_geocerca = tripsWithoudGeocerca.length;
          const stops_cedis = countOfStopsInCEDIS.length;

          // stopsCustomersTrips
          const stops_customers = stopsCustomersTrips.length;

          const total_stops =
            stops_customers + stops_without_geocerca + stops_cedis;
          // Nuevas
          const customers_in_stops = customersInStops.length;
          const stops_with_other_geocerca = stopsWithOtherGeofences.length;
          const time_between_cedis = formatTime(timeDrivingBetweenCEDIS);

          return {
            device_id,
            device_name,
            driver,
            vehicle_zone,
            vehicle_location,
            vehicle_uo,
            start_date,
            end_date,
            days_operated,
            days_rute,
            start_time,
            end_time,
            total_time,
            transfer_time,
            start_time_stem,
            end_time_stem,
            time_between_clientes,
            transfer_other_points,
            total_stopped,
            customer_service_time,
            stopped_other_points_time,
            stopped_cedis_time,
            total_stops,
            stops_without_geocerca,
            stops_cedis,
            stops_customers,
            customers_in_stops,
            stops_with_other_geocerca,
            time_between_cedis,
          };
        })
        .filter((x) => x);

      console.time('Insert Data');
      console.log(dbData);
      //const result = await this.reportsRepository.add(dbData);
      console.timeEnd('Insert Data');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = MainService;
