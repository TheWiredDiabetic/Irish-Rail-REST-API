const serviceTypes = require("../lib/service_types.json");

const determineServiceType = (origin, destination) => {
    for (const serviceType of serviceTypes) {
        for (const route of serviceType.routes) {
            if (route.bidirectional) {
                if (route.from === origin && route.to === destination) {
                    return serviceType.name;
                }
                if (route.from === destination && route.to === origin) {
                    return serviceType.name;
                }
            }
        }
    }
    return "Unknown";
}

module.exports = {determineServiceType};