const path = require('path');

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.alias = {
  'tailwindcss': path.resolve(projectRoot, 'node_modules/tailwindcss')
};

module.exports = withNativeWind(config, { 
  input: "./global.css",
  inlineRem: 16 
});