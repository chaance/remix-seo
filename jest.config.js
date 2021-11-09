const path = require("path");

/**
 * @typedef {import("@jest/types")} Config
 */

/**
 * @type {Config}
 */
const config = {
	rootDir: path.resolve("."),
	collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
	testMatch: ["<rootDir>/test/**/*.test.(js|ts)"],
};

module.exports = config;
