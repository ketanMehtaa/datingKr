"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
})(Gender || (Gender = {}));
function getRandomCoordinates(centerLat, centerLng, radiusKm) {
    // Radius of the Earth in kilometers
    var R = 6371;
    // Random distance and angle
    // const d = radiusKm * Math.random();
    var d = 25;
    var theta = Math.random() * 2 * Math.PI;
    // Latitude and longitude in radians
    var lat1 = centerLat * (Math.PI / 180);
    var lng1 = centerLng * (Math.PI / 180);
    // Offset latitude and longitude
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) +
        Math.cos(lat1) * Math.sin(d / R) * Math.cos(theta));
    var lng2 = lng1 + Math.atan2(Math.sin(theta) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
    // Convert radians back to degrees
    return {
        latitude: lat2 * (180 / Math.PI),
        longitude: lng2 * (180 / Math.PI)
    };
}
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var prisma = new client_1.PrismaClient();
// Coordinates of Bengaluru, India
var BENGALURU_LAT = 12.9716;
var BENGALURU_LNG = 77.5946;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var i, user, locationData, location_1, locationResult, locationError_1, userError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < 100000)) return [3 /*break*/, 10];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: faker_1.faker.internet.email(),
                                password: faker_1.faker.internet.password(),
                                firstName: faker_1.faker.person.firstName(),
                                lastName: faker_1.faker.person.lastName(),
                                dateOfBirth: faker_1.faker.date.past({ years: 30 }).toISOString(),
                                gender: faker_1.faker.helpers.arrayElement(Object.values(Gender)),
                                bio: faker_1.faker.lorem.sentence(),
                                profilePicture: faker_1.faker.image.avatar(),
                                profileCompleted: faker_1.faker.datatype.boolean(),
                            }
                        })];
                case 3:
                    user = _a.sent();
                    console.log("Created user with ID: ".concat(user.id));
                    locationData = getRandomCoordinates(BENGALURU_LAT, BENGALURU_LNG, 10);
                    location_1 = {
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                        localAddress: faker_1.faker.location.streetAddress(),
                        city: faker_1.faker.location.city(),
                        state: faker_1.faker.location.state(),
                        country: faker_1.faker.location.country(),
                    };
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          INSERT INTO \"Location\" (\n            id, latitude, longitude, coordinates, \"localAddress\", city, state, country, \"userId\", \"createdAt\", \"updatedAt\"\n          )\n          VALUES (\n            gen_random_uuid(),\n            ", ",\n            ", ",\n            ST_SetSRID(ST_MakePoint(", ", ", "), 4326),\n            ", ",\n            ", ",\n            ", ",\n            ", ",\n            ", ",\n            CURRENT_TIMESTAMP,\n            CURRENT_TIMESTAMP\n          )\n          ON CONFLICT (\"userId\")\n          DO UPDATE SET\n            latitude = EXCLUDED.latitude,\n            longitude = EXCLUDED.longitude,\n            coordinates = EXCLUDED.coordinates,\n            \"localAddress\" = EXCLUDED.\"localAddress\",\n            city = EXCLUDED.city, \n            state = EXCLUDED.state,\n            country = EXCLUDED.country,\n            \"updatedAt\" = CURRENT_TIMESTAMP\n          RETURNING id, latitude, longitude, \"localAddress\", city, state, country, \"updatedAt\"\n        "], ["\n          INSERT INTO \"Location\" (\n            id, latitude, longitude, coordinates, \"localAddress\", city, state, country, \"userId\", \"createdAt\", \"updatedAt\"\n          )\n          VALUES (\n            gen_random_uuid(),\n            ", ",\n            ", ",\n            ST_SetSRID(ST_MakePoint(", ", ", "), 4326),\n            ", ",\n            ", ",\n            ", ",\n            ", ",\n            ", ",\n            CURRENT_TIMESTAMP,\n            CURRENT_TIMESTAMP\n          )\n          ON CONFLICT (\"userId\")\n          DO UPDATE SET\n            latitude = EXCLUDED.latitude,\n            longitude = EXCLUDED.longitude,\n            coordinates = EXCLUDED.coordinates,\n            \"localAddress\" = EXCLUDED.\"localAddress\",\n            city = EXCLUDED.city, \n            state = EXCLUDED.state,\n            country = EXCLUDED.country,\n            \"updatedAt\" = CURRENT_TIMESTAMP\n          RETURNING id, latitude, longitude, \"localAddress\", city, state, country, \"updatedAt\"\n        "])), location_1.latitude, location_1.longitude, location_1.longitude, location_1.latitude, location_1.localAddress, location_1.city, location_1.state, location_1.country, user.id)];
                case 5:
                    locationResult = _a.sent();
                    console.log("Created or updated location with ID: ".concat(locationResult));
                    return [3 /*break*/, 7];
                case 6:
                    locationError_1 = _a.sent();
                    console.error("Error creating or updating location for user with ID: ".concat(user.id));
                    console.error(locationError_1);
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    userError_1 = _a.sent();
                    console.error('Error creating user:');
                    console.error(userError_1);
                    return [3 /*break*/, 9];
                case 9:
                    i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Unexpected error in main function:');
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var templateObject_1;
