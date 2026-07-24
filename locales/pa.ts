import type { TranslationKey } from './en';

/**
 * Punjabi (ਪੰਜਾਬੀ, Gurmukhi) translations. Same keys as `en.ts` — the type
 * makes a missing or extra key a compile error.
 *
 * Kept in English on purpose: route/stop names (GTFS data has no Punjabi
 * forms), brand names (BusPulse, TransLink, SkyTrain, B-Line, RapidBus), and
 * route numbers.
 */
export const pa: Record<TranslationKey, string> = {
  // Tab bar
  'tabs.nearby': 'ਨੇੜੇ',
  'tabs.search': 'ਖੋਜ',
  'tabs.favourites': 'ਮਨਪਸੰਦ',
  'tabs.alerts': 'ਸੂਚਨਾਵਾਂ',

  // Screen titles
  'title.stopArrivals': 'ਆਮਦਾਂ',
  'title.route': 'ਰੂਟ',
  'title.routeN': 'ਰੂਟ {route}',
  'title.settings': 'ਸੈਟਿੰਗਾਂ',

  // Common
  'common.retry': 'ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
  'common.cancel': 'ਰੱਦ ਕਰੋ',
  'common.clear': 'ਮਿਟਾਓ',
  'common.due': 'ਹੁਣੇ',
  'common.nMin': '{n} ਮਿੰਟ',
  'common.stopHash': 'ਸਟਾਪ #{code}',
  'common.destination': 'ਮੰਜ਼ਿਲ',
  'common.thisStop': 'ਇਸ ਸਟਾਪ',
  'common.route': 'ਰੂਟ',
  'common.loadingArrivals': 'ਆਮਦਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ',

  // Error boundary
  'error.somethingWrong': 'ਕੁਝ ਗੜਬੜ ਹੋ ਗਈ',
  'error.unexpected': 'BusPulse ਵਿੱਚ ਅਚਾਨਕ ਖਰਾਬੀ ਆ ਗਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ — ਤੁਹਾਡੇ ਮਨਪਸੰਦ ਸੁਰੱਖਿਅਤ ਹਨ।',
  'error.tryAgain': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',

  // Time ago / distance
  'time.justNow': 'ਹੁਣੇ-ਹੁਣੇ',
  'time.minAgo': '{n} ਮਿੰਟ ਪਹਿਲਾਂ',
  'time.hoursAgo': '{n} ਘੰਟੇ ਪਹਿਲਾਂ',
  'time.daysAgo': '{n} ਦਿਨ ਪਹਿਲਾਂ',
  'dist.m': '{n} ਮੀ',
  'dist.km': '{n} ਕਿ.ਮੀ.',
  'dist.minWalk': '~{n} ਮਿੰਟ ਪੈਦਲ',

  // Nearby (map) screen
  'nearby.locating': 'ਟਿਕਾਣਾ ਲੱਭਿਆ ਜਾ ਰਿਹਾ ਹੈ…',
  'nearby.stopsNearby': '{count} ਸਟਾਪ ਨੇੜੇ',
  'nearby.stopsNearby_plural': '{count} ਸਟਾਪ ਨੇੜੇ',
  'nearby.outOfCoverage':
    'ਤੁਸੀਂ ਸੇਵਾ ਖੇਤਰ ਤੋਂ ਬਾਹਰ ਹੋ। BusPulse ਸਿਰਫ਼ ਮੈਟਰੋ ਵੈਨਕੂਵਰ (TransLink) ਲਈ ਲਾਈਵ ਬੱਸਾਂ ਵਿਖਾਉਂਦਾ ਹੈ।',
  'nearby.noStops': 'ਤੁਹਾਡੇ 500 ਮੀਟਰ ਦੇ ਘੇਰੇ ਵਿੱਚ ਕੋਈ ਬੱਸ ਸਟਾਪ ਨਹੀਂ। ਨਕਸ਼ਾ ਵਰਤੋ ਜਾਂ ਨਾਂ ਜਾਂ ਨੰਬਰ ਨਾਲ ਸਟਾਪ ਖੋਜੋ।',
  'nearby.noFilterStops': 'ਨਜ਼ਰ ਵਿੱਚ ਕੋਈ {filter} ਸਟਾਪ ਨਹੀਂ। ਹੋਰ ਫਿਲਟਰ ਅਜ਼ਮਾਓ ਜਾਂ ਜ਼ੂਮ ਆਊਟ ਕਰੋ।',
  'nearby.noStopsInView': 'ਨਜ਼ਰ ਵਿੱਚ ਕੋਈ ਸਟਾਪ ਨਹੀਂ। ਹੋਰ ਫਿਲਟਰ ਅਜ਼ਮਾਓ ਜਾਂ ਜ਼ੂਮ ਆਊਟ ਕਰੋ।',
  'nearby.tapToShowStops': 'ਨੇੜਲੇ ਸਟਾਪ ਵੇਖਣ ਲਈ ਛੂਹੋ',
  'nearby.nextBus': 'ਅਗਲੀ ਬੱਸ',
  'nearby.arrivalsCta': 'ਆਮਦਾਂ →',
  'nearby.liveBusBlinking': '{count} ਲਾਈਵ ਬੱਸ · ਨਕਸ਼ੇ ਉੱਤੇ ਝਪਕ ਰਹੀ ਹੈ',
  'nearby.liveBusBlinking_plural': '{count} ਲਾਈਵ ਬੱਸਾਂ · ਨਕਸ਼ੇ ਉੱਤੇ ਝਪਕ ਰਹੀਆਂ ਹਨ',
  'nearby.noLiveBuses': 'ਇਸ ਵੇਲੇ ਕੋਈ ਲਾਈਵ ਬੱਸ ਨਹੀਂ',
  'nearby.openSettings': 'ਸੈਟਿੰਗਾਂ ਖੋਲ੍ਹੋ',
  'nearby.centerOnMe': 'ਨਕਸ਼ਾ ਮੇਰੇ ਟਿਕਾਣੇ ਉੱਤੇ ਕੇਂਦਰਿਤ ਕਰੋ',
  'nearby.showStopsOnMap': 'ਨਕਸ਼ੇ ਉੱਤੇ ਨੇੜਲੇ ਸਟਾਪ ਵਿਖਾਓ',
  'nearby.locationDenied': 'ਟਿਕਾਣੇ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ — ਵੈਨਕੂਵਰ ਸੈਂਟਰ ਵਿਖਾਇਆ ਜਾ ਰਿਹਾ ਹੈ।',

  // Route filter chips (B-Line / RapidBus are brand names)
  'filter.all': 'ਸਾਰੇ',
  'filter.bus': 'ਬੱਸ',
  'filter.bline': 'B-Line',
  'filter.rapidbus': 'RapidBus',
  'filter.night': 'ਨਾਈਟ',
  'filter.a11y': 'ਫਿਲਟਰ: {label}',

  // Map stop callout
  'marker.trackBuses': 'ਬੱਸਾਂ ਟਰੈਕ ਕਰੋ →',

  // Search screen
  'search.placeholderStops': 'ਸਟਾਪ ਦਾ ਨਾਂ ਜਾਂ ਨੰਬਰ (ਜਿਵੇਂ 57123)',
  'search.placeholderRoutes': 'ਰੂਟ ਨੰਬਰ ਜਾਂ ਨਾਂ (ਜਿਵੇਂ 99)',
  'search.stops': 'ਸਟਾਪ',
  'search.routes': 'ਰੂਟ',
  'search.recent': 'ਹਾਲੀਆ',
  'search.noStopsFound': '"{query}" ਲਈ ਕੋਈ ਸਟਾਪ ਨਹੀਂ ਮਿਲਿਆ',
  'search.noRoutesFound': '"{query}" ਲਈ ਕੋਈ ਰੂਟ ਨਹੀਂ ਮਿਲਿਆ',
  'search.hintStops': 'ਸਟਾਪ ਦੇ ਨਾਂ ਜਾਂ 5 ਅੰਕਾਂ ਵਾਲੇ ਸਟਾਪ ਨੰਬਰ ਨਾਲ ਖੋਜੋ।\nਲਾਈਵ ਆਮਦਾਂ ਵੇਖਣ ਲਈ ਕਿਸੇ ਵੀ ਨਤੀਜੇ ਨੂੰ ਛੂਹੋ।',
  'search.hintRoutes': 'ਰੂਟ ਨੰਬਰ (99, 49) ਜਾਂ ਨਾਂ (B-Line, RapidBus) ਨਾਲ ਖੋਜੋ।',
  'search.routeTapHint': 'ਰੂਟ · ਸਾਰੇ ਸਟਾਪ ਵੇਖਣ ਲਈ ਛੂਹੋ',
  'search.stopA11y': '{name}, ਸਟਾਪ {code}, ਆਮਦਾਂ ਖੋਲ੍ਹੋ',
  'search.routeA11y': 'ਰੂਟ {short}, {long}, ਸਟਾਪ ਵੇਖੋ',

  // Favourites
  'fav.add': 'ਮਨਪਸੰਦ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ',
  'fav.remove': 'ਮਨਪਸੰਦ ਵਿੱਚੋਂ ਹਟਾਓ',
  'fav.emptyTitle': 'ਹਾਲੇ ਕੋਈ ਮਨਪਸੰਦ ਨਹੀਂ',
  'fav.emptyBody': 'ਕਿਸੇ ਸਟਾਪ ਉੱਤੇ ਤਾਰਾ ਲਗਾਓ — ਉਹ ਇੱਥੇ ਲਾਈਵ ਆਮਦਾਂ ਸਮੇਤ ਇੱਕ ਨਜ਼ਰੇ ਦਿਸੇਗਾ।',
  'fav.findAStop': 'ਸਟਾਪ ਲੱਭੋ',
  'fav.findAStopA11y': 'ਸ਼ਾਮਲ ਕਰਨ ਲਈ ਸਟਾਪ ਲੱਭੋ',
  'fav.noUpcoming': 'ਕੋਈ ਆਉਣ ਵਾਲੀ ਬੱਸ ਨਹੀਂ',
  'fav.moveUp': 'ਮਨਪਸੰਦ ਉੱਪਰ ਲਿਜਾਓ',
  'fav.moveDown': 'ਮਨਪਸੰਦ ਹੇਠਾਂ ਲਿਜਾਓ',
  'fav.openArrivalsA11y': '{name} {code}, ਆਮਦਾਂ ਖੋਲ੍ਹੋ',

  // Alerts screen
  'alerts.loading': 'ਸੂਚਨਾਵਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ…',
  'alerts.serviceAlertFallback': 'ਸੇਵਾ ਸੂਚਨਾ',
  'alerts.busy': 'ਲਾਈਵ ਡਾਟਾ ਰੁੱਝਿਆ ਹੋਇਆ ਹੈ',
  'alerts.loadFailed': 'ਸੂਚਨਾਵਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ',
  'alerts.feedLimit': 'ਰੀਅਲ-ਟਾਈਮ ਫੀਡ ਆਪਣੀ ਹੱਦ ਉੱਤੇ ਪਹੁੰਚ ਗਈ ਹੈ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  'alerts.checkConnection': 'ਆਪਣਾ ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਚੈੱਕ ਕਰ ਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  'alerts.active': '{count} ਸਰਗਰਮ ਸੂਚਨਾ',
  'alerts.active_plural': '{count} ਸਰਗਰਮ ਸੂਚਨਾਵਾਂ',
  'alerts.clearAll': 'ਸਭ ਹਟਾਓ',
  'alerts.clearAllA11y': 'ਸਾਰੀਆਂ ਸੂਚਨਾਵਾਂ ਹਟਾਓ',
  'alerts.noMajor': 'ਇਸ ਵੇਲੇ ਕੋਈ ਵੱਡੀ ਰੁਕਾਵਟ ਨਹੀਂ।',
  'alerts.allClear': 'ਸਭ ਠੀਕ — ਸੇਵਾ ਵਿੱਚ ਕੋਈ ਰੁਕਾਵਟ ਨਹੀਂ।',
  'alerts.showMinor': '{count} ਛੋਟੀ ਸੂਚਨਾ ਵਿਖਾਓ · ਸਟਾਪ ਬਦਲੀਆਂ, ਪਹੁੰਚਯੋਗਤਾ',
  'alerts.showMinor_plural': '{count} ਛੋਟੀਆਂ ਸੂਚਨਾਵਾਂ ਵਿਖਾਓ · ਸਟਾਪ ਬਦਲੀਆਂ, ਪਹੁੰਚਯੋਗਤਾ',
  'alerts.hideMinor': '{count} ਛੋਟੀ ਸੂਚਨਾ ਲੁਕਾਓ · ਸਟਾਪ ਬਦਲੀਆਂ, ਪਹੁੰਚਯੋਗਤਾ',
  'alerts.hideMinor_plural': '{count} ਛੋਟੀਆਂ ਸੂਚਨਾਵਾਂ ਲੁਕਾਓ · ਸਟਾਪ ਬਦਲੀਆਂ, ਪਹੁੰਚਯੋਗਤਾ',
  'alerts.affectedRoutes': 'ਪ੍ਰਭਾਵਿਤ ਰੂਟ: {routes}',
  'alerts.posted': '{time} ਪੋਸਟ ਕੀਤਾ',
  'alerts.readMore': 'ਹੋਰ ਪੜ੍ਹੋ',
  'alerts.showLess': 'ਘੱਟ ਵਿਖਾਓ',

  // Stop detail
  'stop.share': 'ਇਹ ਸਟਾਪ ਸਾਂਝਾ ਕਰੋ',
  'stop.shareMessage': '{name} — ਸਟਾਪ #{code}। BusPulse ਉੱਤੇ ਲਾਈਵ ਬੱਸ ਆਮਦਾਂ ਵੇਖੋ।',
  'stop.walkSummary': '~{walk} ਮਿੰਟ ਪੈਦਲ · ਅਗਲੀ ਬੱਸ {next} ਮਿੰਟ ਵਿੱਚ',
  'stop.makeIt': ' — ਤੁਸੀਂ ਪਹੁੰਚ ਜਾਓਗੇ',
  'stop.hurry': ' — ਛੇਤੀ ਕਰੋ',
  'stop.missIt': ' — ਸ਼ਾਇਦ ਬੱਸ ਨਿਕਲ ਜਾਵੇ',
  'stop.walkA11y': '{walk} ਮਿੰਟ ਪੈਦਲ, ਅਗਲੀ ਬੱਸ {next} ਮਿੰਟ ਵਿੱਚ। {verdict}',
  'stop.makeItFull': 'ਤੁਸੀਂ ਪਹੁੰਚ ਜਾਓਗੇ।',
  'stop.hurryFull': 'ਛੇਤੀ ਕਰੋ।',
  'stop.missItFull': 'ਸ਼ਾਇਦ ਬੱਸ ਨਿਕਲ ਜਾਵੇ।',
  'stop.stale': 'ਤਾਜ਼ਾ ਨਹੀਂ ਹੋ ਸਕਿਆ — ਆਖਰੀ ਜਾਣੇ ਸਮੇਂ ਵਿਖਾਏ ਜਾ ਰਹੇ ਹਨ',
  'stop.updatedAgo': '{s} ਸਕਿੰਟ ਪਹਿਲਾਂ ਅੱਪਡੇਟ ਹੋਇਆ · ਹਰ 60 ਸਕਿੰਟ ਵਿੱਚ ਆਪੇ ਤਾਜ਼ਾ ਹੁੰਦਾ ਹੈ',
  'stop.busyNow': 'ਲਾਈਵ ਡਾਟਾ ਇਸ ਵੇਲੇ ਰੁੱਝਿਆ ਹੋਇਆ ਹੈ',
  'stop.loadFailed': 'ਆਮਦਾਂ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀਆਂ।',
  'stop.feedLimitBit': 'ਰੀਅਲ-ਟਾਈਮ ਫੀਡ ਆਪਣੀ ਹੱਦ ਉੱਤੇ ਪਹੁੰਚ ਗਈ ਹੈ — ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
  'stop.noRealtime': 'ਕੋਈ ਰੀਅਲ-ਟਾਈਮ ਆਮਦ ਨਹੀਂ',
  'stop.noLivePull': 'ਇਸ ਸਟਾਪ ਲਈ ਇਸ ਵੇਲੇ ਕੋਈ ਲਾਈਵ ਬੱਸ ਆਮਦ ਨਹੀਂ। ਤਾਜ਼ਾ ਕਰਨ ਲਈ ਹੇਠਾਂ ਖਿੱਚੋ।',

  // Scheduled (timetable) fallback
  'sched.header': 'ਨਿਰਧਾਰਤ ਰਵਾਨਗੀਆਂ',
  'sched.note': 'ਸਮਾਂ-ਸਾਰਣੀ — ਇਸ ਸਟਾਪ ਲਈ ਇਸ ਵੇਲੇ ਕੋਈ ਲਾਈਵ ਟਰੈਕਿੰਗ ਨਹੀਂ।',
  'sched.scheduled': 'ਨਿਰਧਾਰਤ',
  'sched.rowA11y': 'ਰੂਟ {route}, {dest} ਵੱਲ, ਨਿਰਧਾਰਤ ਸਮਾਂ {time}',

  // Arrival rows / reminders
  'arrival.inService': 'ਸੇਵਾ ਵਿੱਚ',
  'arrival.rowA11y': 'ਰੂਟ {route}, {dest} ਵੱਲ। ਬੱਸ ਟਰੈਕ ਕਰਨ ਲਈ ਛੂਹੋ।',
  'arrival.reminderSet': 'ਰਿਮਾਈਂਡਰ ਲੱਗ ਗਿਆ',
  'arrival.reminderSetRoute': 'ਰੂਟ {route} ਲਈ ਰਿਮਾਈਂਡਰ ਲੱਗ ਗਿਆ',
  'arrival.remindBefore': 'ਇਸ ਬੱਸ ਤੋਂ {lead} ਮਿੰਟ ਪਹਿਲਾਂ ਯਾਦ ਕਰਵਾਓ',
  'arrival.remindBeforeRoute': 'ਰੂਟ {route} ਤੋਂ {lead} ਮਿੰਟ ਪਹਿਲਾਂ ਯਾਦ ਕਰਵਾਓ',

  // Trip tracking
  'trip.noVehicle': 'ਇਸ ਸਫ਼ਰ ਲਈ ਕੋਈ ਲਾਈਵ ਬੱਸ ਡਾਟਾ ਨਹੀਂ',
  'trip.findBus': 'ਬੱਸ ਲੱਭੋ',
  'trip.yourStop': 'ਤੁਹਾਡਾ ਸਟਾਪ',
  'trip.arrivingAt': '{stop} ਉੱਤੇ ਪਹੁੰਚ ਰਹੀ ਹੈ',
  'trip.vehicleUpdated': 'ਬੱਸ ਦੀ ਸਥਿਤੀ {time} ਅੱਪਡੇਟ ਹੋਈ',

  // Route detail + route map
  'route.stopsServe': 'ਇਸ ਰੂਟ ਉੱਤੇ {count} ਸਟਾਪ ਹੈ',
  'route.stopsServe_plural': 'ਇਸ ਰੂਟ ਉੱਤੇ {count} ਸਟਾਪ ਹਨ',
  'route.showLiveOnMap': 'ਨਕਸ਼ੇ ਉੱਤੇ ਲਾਈਵ ਬੱਸਾਂ ਵਿਖਾਓ',
  'route.showLiveOnMapA11y': 'ਇਸ ਰੂਟ ਦੀਆਂ ਲਾਈਵ ਬੱਸਾਂ ਨਕਸ਼ੇ ਉੱਤੇ ਵਿਖਾਓ',
  'route.stopsCount': '{count} ਸਟਾਪ',
  'route.stopsCount_plural': '{count} ਸਟਾਪ',
  'route.noStopData': 'ਕੋਈ ਸਟਾਪ ਡਾਟਾ ਨਹੀਂ ਮਿਲਿਆ। ਤਾਜ਼ਾ ਕਰਨ ਲਈ node scripts/fetchGtfsStatic.js ਚਲਾਓ।',
  'route.liveOnRoute': 'ਇਸ ਰੂਟ ਉੱਤੇ {count} ਲਾਈਵ ਬੱਸ',
  'route.liveOnRoute_plural': 'ਇਸ ਰੂਟ ਉੱਤੇ {count} ਲਾਈਵ ਬੱਸਾਂ',
  'route.closeMap': 'ਰੂਟ ਨਕਸ਼ਾ ਬੰਦ ਕਰੋ',

  // Onboarding
  'onboard.title': 'BusPulse ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
  'onboard.body':
    'ਮੈਟਰੋ ਵੈਨਕੂਵਰ ਲਈ ਰੀਅਲ-ਟਾਈਮ ਬੱਸ ਟਰੈਕਿੰਗ। ਲਾਈਵ ਆਮਦਾਂ ਵੇਖੋ, ਨਕਸ਼ੇ ਉੱਤੇ ਬੱਸ ਨੂੰ ਛੂਹ ਕੇ ਉਸ ਦਾ ਪਿੱਛਾ ਕਰੋ, ਅਤੇ ਬੱਸ ਆਉਣ ਤੋਂ ਪਹਿਲਾਂ ਰਿਮਾਈਂਡਰ ਪਾਓ।',
  'onboard.note':
    'ਲਾਈਵ ਡਾਟਾ ਸਿਰਫ਼ ਬੱਸਾਂ ਲਈ ਹੈ। SkyTrain, SeaBus ਅਤੇ West Coast Express TransLink ਦੀ ਜਨਤਕ ਫੀਡ ਵਿੱਚ ਟਰੈਕ ਨਹੀਂ ਹੁੰਦੇ।',
  'onboard.cta': 'ਸ਼ੁਰੂ ਕਰੋ',

  // Settings
  'settings.notifications': 'ਨੋਟੀਫਿਕੇਸ਼ਨ',
  'settings.remindBefore': 'ਬੱਸ ਤੋਂ ਪਹਿਲਾਂ ਯਾਦ ਕਰਵਾਓ',
  'settings.leadTimeSub': 'ਰਵਾਨਗੀ ਰਿਮਾਈਂਡਰਾਂ ਲਈ ਮੂਲ ਸਮਾਂ।',
  'settings.minutesBefore': '{m} ਮਿੰਟ ਪਹਿਲਾਂ',
  'settings.minShort': '{m} ਮਿੰਟ',
  'settings.language': 'ਭਾਸ਼ਾ / Language',
  'settings.languageSub': 'ਐਪ ਦੀ ਭਾਸ਼ਾ ਚੁਣੋ।',
  'settings.langSystem': 'ਸਿਸਟਮ',
  'settings.dataPrivacy': 'ਡਾਟਾ ਅਤੇ ਪਰਦੇਦਾਰੀ',
  'settings.privacyPolicy': 'ਪਰਦੇਦਾਰੀ ਨੀਤੀ',
  'settings.support': 'ਸਹਾਇਤਾ',
  'settings.clearRecent': 'ਹਾਲੀਆ ਖੋਜਾਂ ਮਿਟਾਓ',
  'settings.clearRecentTitle': 'ਹਾਲੀਆ ਖੋਜਾਂ ਮਿਟਾਉਣੀਆਂ?',
  'settings.clearRecentBody': 'ਇਸ ਨਾਲ ਤੁਹਾਡੇ ਹਾਲ ਹੀ ਵਿੱਚ ਵੇਖੇ ਸਟਾਪ ਹਟ ਜਾਣਗੇ।',
  'settings.about': 'ਬਾਰੇ',
  'settings.version': 'ਵਰਜਨ {v}',
  'settings.aboutBody':
    'ਮੈਟਰੋ ਵੈਨਕੂਵਰ ਲਈ ਰੀਅਲ-ਟਾਈਮ ਬੱਸ ਆਮਦਾਂ ਅਤੇ ਲਾਈਵ ਟਰੈਕਿੰਗ, TransLink ਦੀ ਜਨਤਕ GTFS ਰੀਅਲ-ਟਾਈਮ ਫੀਡ ਨਾਲ। ਆਮਦਾਂ ਹਰ 60 ਸਕਿੰਟ ਵਿੱਚ ਅੱਪਡੇਟ ਹੁੰਦੀਆਂ ਹਨ।',
  'settings.attribution':
    'ਟ੍ਰਾਂਜ਼ਿਟ ਡਾਟਾ © TransLink। BusPulse ਇੱਕ ਸੁਤੰਤਰ ਐਪ ਹੈ ਅਤੇ TransLink ਨਾਲ ਸੰਬੰਧਿਤ ਜਾਂ ਉਸ ਵੱਲੋਂ ਪ੍ਰਮਾਣਿਤ ਨਹੀਂ ਹੈ।',
  'settings.close': 'ਸੈਟਿੰਗਾਂ ਬੰਦ ਕਰੋ',

  // Notifications (system)
  'notif.disabledTitle': 'ਨੋਟੀਫਿਕੇਸ਼ਨ ਬੰਦ ਹਨ',
  'notif.disabledBody': 'ਬੱਸ ਆਉਣ ਤੋਂ ਪਹਿਲਾਂ ਸੂਚਨਾ ਪਾਉਣ ਲਈ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਨੋਟੀਫਿਕੇਸ਼ਨ ਚਾਲੂ ਕਰੋ।',
  'notif.arrivingNow': 'ਬੱਸ ਹੁਣੇ ਆ ਰਹੀ ਹੈ',
  'notif.arrivingSoon': 'ਬੱਸ ਛੇਤੀ ਆ ਰਹੀ ਹੈ',
  'notif.bodyNow': 'ਰੂਟ {route} {stop} ਉੱਤੇ ਪਹੁੰਚ ਰਹੀ ਹੈ',
  'notif.bodySoon': 'ਰੂਟ {route} {lead} ਮਿੰਟ ਵਿੱਚ {stop} ਉੱਤੇ ਪਹੁੰਚੇਗੀ',
};
