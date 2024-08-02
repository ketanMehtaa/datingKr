"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = exports.prisma = void 0;
var client_1 = require("@prisma/client");
var db = process.env.DATABASE_URL;
if (!globalThis.prisma) {
    // console.log('db in prisma index.ts', db);
    globalThis.prisma = new client_1.PrismaClient({ datasourceUrl: db });
}
exports.prisma = globalThis.prisma ||
    new client_1.PrismaClient({
        datasourceUrl: db,
    });
var getPrismaClient = function () { return exports.prisma; };
exports.getPrismaClient = getPrismaClient;
