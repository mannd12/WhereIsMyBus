/**
 * English strings — the master dictionary. Every user-facing string in the app
 * lives here; `locales/pa.ts` must define the same keys (typed against this).
 *
 * Interpolation: `{name}` placeholders are replaced by t()'s params.
 * Plurals: when params.count !== 1 and a `<key>_plural` entry exists, it wins.
 */
export const en = {
  // Tab bar
  'tabs.nearby': 'Nearby',
  'tabs.search': 'Search',
  'tabs.favourites': 'Favourites',
  'tabs.alerts': 'Alerts',

  // Screen titles (root stack)
  'title.stopArrivals': 'Arrivals',
  'title.route': 'Route',
  'title.routeN': 'Route {route}',
  'title.settings': 'Settings',

  // Common
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.clear': 'Clear',
  'common.due': 'Due',
  'common.nMin': '{n} min',
  'common.stopHash': 'Stop #{code}',
  'common.destination': 'destination',
  'common.thisStop': 'this stop',
  'common.route': 'Route',
  'common.loadingArrivals': 'Loading arrivals',

  // Error boundary
  'error.somethingWrong': 'Something went wrong',
  'error.unexpected': 'BusPulse hit an unexpected error. Try again — your favourites are safe.',
  'error.tryAgain': 'Try again',

  // Time ago / distance
  'time.justNow': 'just now',
  'time.minAgo': '{n}m ago',
  'time.hoursAgo': '{n}h ago',
  'time.daysAgo': '{n}d ago',
  'dist.m': '{n} m',
  'dist.km': '{n} km',
  'dist.minWalk': '~{n} min walk',

  // Nearby (map) screen
  'nearby.locating': 'Locating…',
  'nearby.stopsNearby': '{count} stop nearby',
  'nearby.stopsNearby_plural': '{count} stops nearby',
  'nearby.noStops':
    'No bus stops within 500 m of you. Try the map or search for a stop by name or number.',
  'nearby.noFilterStops': 'No {filter} stops in view. Try another filter or zoom out.',
  'nearby.noStopsInView': 'No stops in view. Try another filter or zoom out.',
  'nearby.tapToShowStops': 'Tap to show nearby stops',
  'nearby.nextBus': 'Next bus',
  'nearby.arrivalsCta': 'Arrivals →',
  'nearby.liveBusBlinking': '{count} live bus · blinking on map',
  'nearby.liveBusBlinking_plural': '{count} live buses · blinking on map',
  'nearby.noLiveBuses': 'No live buses right now',
  'nearby.openSettings': 'Open settings',
  'nearby.centerOnMe': 'Center the map on my location',
  'nearby.showStopsOnMap': 'Show nearby stops on the map',
  'nearby.locationDenied': 'Location permission denied — showing Vancouver centre.',

  // Route filter chips
  'filter.all': 'All',
  'filter.bus': 'Bus',
  'filter.bline': 'B-Line',
  'filter.rapidbus': 'RapidBus',
  'filter.night': 'Night',
  'filter.a11y': 'Filter: {label}',

  // Map stop callout
  'marker.trackBuses': 'Track buses →',

  // Search screen
  'search.placeholderStops': 'Stop name or number (e.g. 57123)',
  'search.placeholderRoutes': 'Route number or name (e.g. 99)',
  'search.stops': 'Stops',
  'search.routes': 'Routes',
  'search.recent': 'Recent',
  'search.noStopsFound': 'No stops found for "{query}"',
  'search.noRoutesFound': 'No routes found for "{query}"',
  'search.hintStops': 'Search by stop name or 5-digit stop number.\nTap any result to see live arrivals.',
  'search.hintRoutes': 'Search by route number (99, 49) or name (B-Line, RapidBus).',
  'search.routeTapHint': 'Route · tap to see all stops',
  'search.stopA11y': '{name}, stop {code}, open arrivals',
  'search.routeA11y': 'Route {short}, {long}, view stops',

  // Favourites
  'fav.add': 'Add to favourites',
  'fav.remove': 'Remove from favourites',
  'fav.emptyTitle': 'No favourites yet',
  'fav.emptyBody': "Star a stop and it'll show up here with live arrivals at a glance.",
  'fav.findAStop': 'Find a stop',
  'fav.findAStopA11y': 'Find a stop to add',
  'fav.noUpcoming': 'No upcoming arrivals',
  'fav.moveUp': 'Move favourite up',
  'fav.moveDown': 'Move favourite down',
  'fav.openArrivalsA11y': '{name} {code}, open arrivals',

  // Alerts screen
  'alerts.loading': 'Loading alerts…',
  'alerts.serviceAlertFallback': 'Service Alert',
  'alerts.busy': 'Live data is busy',
  'alerts.loadFailed': 'Could not load alerts',
  'alerts.feedLimit': 'The real-time feed has hit its limit. Try again shortly.',
  'alerts.checkConnection': 'Check your connection and try again.',
  'alerts.active': '{count} active alert',
  'alerts.active_plural': '{count} active alerts',
  'alerts.clearAll': 'Clear all',
  'alerts.clearAllA11y': 'Clear all alerts',
  'alerts.noMajor': 'No major disruptions right now.',
  'alerts.allClear': 'All clear — no service disruptions.',
  'alerts.showMinor': 'Show {count} minor notice · stop moves, accessibility',
  'alerts.showMinor_plural': 'Show {count} minor notices · stop moves, accessibility',
  'alerts.hideMinor': 'Hide {count} minor notice · stop moves, accessibility',
  'alerts.hideMinor_plural': 'Hide {count} minor notices · stop moves, accessibility',
  'alerts.affectedRoutes': 'Affected routes: {routes}',
  'alerts.posted': 'Posted {time}',
  'alerts.readMore': 'Read more',
  'alerts.showLess': 'Show less',

  // Stop detail
  'stop.share': 'Share this stop',
  'stop.shareMessage': '{name} — Stop #{code}. Check live bus arrivals on BusPulse.',
  'stop.walkSummary': '~{walk} min walk · next bus in {next} min',
  'stop.makeIt': ' — you can make it',
  'stop.hurry': ' — better hurry',
  'stop.missIt': ' — you might miss it',
  'stop.walkA11y': '{walk} minute walk, next bus in {next} minutes. {verdict}',
  'stop.makeItFull': 'You can make it.',
  'stop.hurryFull': 'Better hurry.',
  'stop.missItFull': 'You might miss it.',
  'stop.stale': "Couldn't refresh — showing last known times",
  'stop.updatedAgo': 'Updated {s}s ago · auto-refreshes every 60s',
  'stop.busyNow': 'Live data is busy right now',
  'stop.loadFailed': 'Could not load arrivals.',
  'stop.feedLimitBit': 'The real-time feed has hit its limit — try again in a bit.',
  'stop.noRealtime': 'No real-time arrivals',
  'stop.noLivePull': 'No live bus arrivals for this stop right now. Pull down to refresh.',

  // Scheduled (timetable) fallback
  'sched.header': 'Scheduled departures',
  'sched.note': 'Timetable — no live tracking for this stop right now.',
  'sched.scheduled': 'Scheduled',
  'sched.rowA11y': 'Route {route} to {dest}, scheduled {time}',

  // Arrival rows / reminders
  'arrival.inService': 'In service',
  'arrival.rowA11y': 'Route {route} to {dest}. Tap to track the bus.',
  'arrival.reminderSet': 'Reminder set',
  'arrival.reminderSetRoute': 'Reminder set for route {route}',
  'arrival.remindBefore': 'Remind me {lead} minutes before this bus',
  'arrival.remindBeforeRoute': 'Remind me {lead} minutes before route {route}',

  // Trip tracking
  'trip.noVehicle': 'No live vehicle data for this trip',
  'trip.findBus': 'Find bus',
  'trip.yourStop': 'Your stop',
  'trip.arrivingAt': 'Arriving at {stop}',
  'trip.vehicleUpdated': 'Vehicle updated {time}',

  // Route detail + route map
  'route.stopsServe': '{count} stop serves this route',
  'route.stopsServe_plural': '{count} stops serve this route',
  'route.showLiveOnMap': 'Show live buses on map',
  'route.showLiveOnMapA11y': 'Show live buses on this route on the map',
  'route.stopsCount': '{count} stop',
  'route.stopsCount_plural': '{count} stops',
  'route.noStopData': 'No stop data found. Run node scripts/fetchGtfsStatic.js to refresh.',
  'route.liveOnRoute': '{count} live bus on this route',
  'route.liveOnRoute_plural': '{count} live buses on this route',
  'route.closeMap': 'Close route map',

  // Onboarding
  'onboard.title': 'Welcome to BusPulse',
  'onboard.body':
    'Real-time bus tracking for Metro Vancouver. See live arrivals, tap a bus to follow it on the map, and get a reminder before it comes.',
  'onboard.note':
    "Live data covers buses. SkyTrain, SeaBus and West Coast Express aren't tracked in TransLink's public feed.",
  'onboard.cta': 'Get started',

  // Settings
  'settings.notifications': 'Notifications',
  'settings.remindBefore': 'Remind me before the bus',
  'settings.leadTimeSub': 'Default lead time for departure reminders.',
  'settings.minutesBefore': '{m} minutes before',
  'settings.minShort': '{m} min',
  'settings.language': 'Language',
  'settings.languageSub': "Choose the app's language.",
  'settings.langSystem': 'System',
  'settings.dataPrivacy': 'Data & privacy',
  'settings.privacyPolicy': 'Privacy Policy',
  'settings.support': 'Support',
  'settings.clearRecent': 'Clear recent searches',
  'settings.clearRecentTitle': 'Clear recent searches?',
  'settings.clearRecentBody': 'This removes your recently viewed stops.',
  'settings.about': 'About',
  'settings.version': 'Version {v}',
  'settings.aboutBody':
    "Real-time bus arrivals and live tracking for Metro Vancouver, powered by TransLink's public GTFS real-time feed. Arrivals update every 60 seconds.",
  'settings.attribution':
    'Transit data © TransLink. BusPulse is an independent app and is not affiliated with or endorsed by TransLink.',
  'settings.close': 'Close settings',

  // Notifications (system)
  'notif.disabledTitle': 'Notifications disabled',
  'notif.disabledBody': 'Enable notifications in Settings to get a heads-up before your bus arrives.',
  'notif.arrivingNow': 'Bus arriving now',
  'notif.arrivingSoon': 'Bus arriving soon',
  'notif.bodyNow': 'Route {route} is arriving at {stop}',
  'notif.bodySoon': 'Route {route} arrives in {lead} min at {stop}',
} as const;

export type TranslationKey = keyof typeof en;
