// Web-only stub for react-native-maps. The app ships native (iOS); the web build
// exists only so EAS Hosting can serve the API routes (app/api/*). The map screens
// render nothing on web — nobody uses the web client. Native builds use the real
// library (this stub is aliased in metro.config.js for platform 'web' only).
const Noop = () => null;

module.exports = {
  __esModule: true,
  default: Noop, // MapView
  MapView: Noop,
  Marker: Noop,
  Polyline: Noop,
  Callout: Noop,
  Circle: Noop,
  Polygon: Noop,
  Overlay: Noop,
  PROVIDER_GOOGLE: 'google',
  PROVIDER_DEFAULT: undefined,
};
