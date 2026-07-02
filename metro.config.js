const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// react-native-maps has no web support (uses codegenNativeComponent), which breaks
// the web/SSR build that EAS Hosting needs for the API routes. Alias it to a no-op
// stub on WEB ONLY — native (iOS) builds keep the real library untouched.
const WEB_STUBS = {
  'react-native-maps': path.resolve(__dirname, 'web-stubs/react-native-maps.js'),
};
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && WEB_STUBS[moduleName]) {
    return { type: 'sourceFile', filePath: WEB_STUBS[moduleName] };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
