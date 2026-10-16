/**
 * Spanish strings — neutral Spanish that reads naturally in both Latin America
 * and Spain (tú form, "bus", "parada", no regionalisms). Typed against the
 * English master so a missing or extra key is a compile error.
 *
 * Kept in English on purpose: route/stop names (GTFS data), brand names
 * (BusPulse Vancouver, TransLink, SkyTrain, SeaBus, B-Line, RapidBus).
 */
import type { TranslationKey } from './en';

export const es: Record<TranslationKey, string> = {
  // Tab bar
  'tabs.nearby': 'Cerca',
  'tabs.search': 'Buscar',
  'tabs.favourites': 'Favoritos',
  'tabs.alerts': 'Alertas',

  // Screen titles (root stack)
  'title.stopArrivals': 'Llegadas',
  'title.route': 'Ruta',
  'title.routeN': 'Ruta {route}',
  'title.settings': 'Ajustes',

  // Common
  'common.retry': 'Reintentar',
  'common.cancel': 'Cancelar',
  'common.clear': 'Borrar',
  'common.due': 'Ahora',
  'common.nMin': '{n} min',
  'common.stopHash': 'Parada #{code}',
  'common.destination': 'destino',
  'common.thisStop': 'esta parada',
  'common.route': 'Ruta',
  'common.loadingArrivals': 'Cargando llegadas',

  // Error boundary
  'error.somethingWrong': 'Algo salió mal',
  'error.unexpected':
    'BusPulse Vancouver tuvo un error inesperado. Inténtalo de nuevo; tus favoritos están a salvo.',
  'error.tryAgain': 'Intentar de nuevo',

  // Time ago / distance
  'time.justNow': 'ahora mismo',
  'time.minAgo': 'hace {n} min',
  'time.hoursAgo': 'hace {n} h',
  'time.daysAgo': 'hace {n} d',
  'dist.m': '{n} m',
  'dist.km': '{n} km',
  'dist.minWalk': '~{n} min a pie',

  // Nearby (map) screen
  'nearby.locating': 'Ubicando…',
  'nearby.stopsNearby': '{count} parada cerca',
  'nearby.stopsNearby_plural': '{count} paradas cerca',
  'nearby.outOfCoverage':
    'Estás fuera del área de cobertura. BusPulse Vancouver solo muestra buses en vivo del área metropolitana de Vancouver (TransLink).',
  'nearby.noStops':
    'No hay paradas a menos de 500 m. Prueba con el mapa o busca una parada por nombre o número.',
  'nearby.noFilterStops': 'No hay paradas de tipo {filter} a la vista. Prueba otro filtro o aleja el mapa.',
  'nearby.noStopsInView': 'No hay paradas a la vista. Prueba otro filtro o aleja el mapa.',
  'nearby.tapToShowStops': 'Toca para ver paradas cercanas',
  'nearby.nextBus': 'Próximo bus',
  'nearby.arrivalsCta': 'Llegadas →',
  'nearby.liveBusBlinking': '{count} bus en vivo · parpadeando en el mapa',
  'nearby.liveBusBlinking_plural': '{count} buses en vivo · parpadeando en el mapa',
  'nearby.noLiveBuses': 'No hay buses en vivo ahora',
  'nearby.openSettings': 'Abrir ajustes',
  'nearby.centerOnMe': 'Centrar el mapa en mi ubicación',
  'nearby.showStopsOnMap': 'Mostrar paradas cercanas en el mapa',
  'nearby.locationDenied': 'Permiso de ubicación denegado; se muestra el centro de Vancouver.',

  // Route filter chips
  'filter.all': 'Todos',
  'filter.bus': 'Bus',
  'filter.bline': 'B-Line',
  'filter.rapidbus': 'RapidBus',
  'filter.night': 'Nocturno',
  'filter.a11y': 'Filtro: {label}',

  // Map stop callout
  'marker.trackBuses': 'Seguir buses →',

  // Search screen
  'search.placeholderStops': 'Nombre o número de parada (p. ej. 57123)',
  'search.placeholderRoutes': 'Número o nombre de ruta (p. ej. 99)',
  'search.stops': 'Paradas',
  'search.routes': 'Rutas',
  'search.recent': 'Recientes',
  'search.noStopsFound': 'No se encontraron paradas para "{query}"',
  'search.noRoutesFound': 'No se encontraron rutas para "{query}"',
  'search.hintStops':
    'Busca por nombre de parada o por el número de 5 dígitos.\nToca un resultado para ver llegadas en vivo.',
  'search.hintRoutes': 'Busca por número de ruta (99, 49) o nombre (B-Line, RapidBus).',
  'search.routeTapHint': 'Ruta · toca para ver todas las paradas',
  'search.stopA11y': '{name}, parada {code}, abrir llegadas',
  'search.routeA11y': 'Ruta {short}, {long}, ver paradas',

  // Favourites
  'fav.add': 'Añadir a favoritos',
  'fav.remove': 'Quitar de favoritos',
  'fav.emptyTitle': 'Aún no tienes favoritos',
  'fav.emptyBody': 'Marca una parada con la estrella y aparecerá aquí con sus llegadas en vivo.',
  'fav.findAStop': 'Buscar una parada',
  'fav.findAStopA11y': 'Buscar una parada para añadir',
  'fav.noUpcoming': 'No hay próximas llegadas',
  'fav.moveUp': 'Subir favorito',
  'fav.moveDown': 'Bajar favorito',
  'fav.openArrivalsA11y': '{name} {code}, abrir llegadas',

  // Alerts screen
  'alerts.loading': 'Cargando alertas…',
  'alerts.serviceAlertFallback': 'Alerta de servicio',
  'alerts.busy': 'Datos en vivo saturados',
  'alerts.loadFailed': 'No se pudieron cargar las alertas',
  'alerts.feedLimit': 'El feed en tiempo real alcanzó su límite. Inténtalo de nuevo en un momento.',
  'alerts.checkConnection': 'Revisa tu conexión e inténtalo de nuevo.',
  'alerts.active': '{count} alerta activa',
  'alerts.active_plural': '{count} alertas activas',
  'alerts.clearAll': 'Borrar todo',
  'alerts.clearAllA11y': 'Borrar todas las alertas',
  'alerts.noMajor': 'No hay interrupciones importantes ahora.',
  'alerts.allClear': 'Todo en orden: no hay interrupciones del servicio.',
  'alerts.showMinor': 'Mostrar {count} aviso menor · cambios de parada, accesibilidad',
  'alerts.showMinor_plural': 'Mostrar {count} avisos menores · cambios de parada, accesibilidad',
  'alerts.hideMinor': 'Ocultar {count} aviso menor · cambios de parada, accesibilidad',
  'alerts.hideMinor_plural': 'Ocultar {count} avisos menores · cambios de parada, accesibilidad',
  'alerts.affectedRoutes': 'Rutas afectadas: {routes}',
  'alerts.posted': 'Publicado {time}',
  'alerts.readMore': 'Leer más',
  'alerts.showLess': 'Mostrar menos',

  // Stop detail
  'stop.share': 'Compartir esta parada',
  'stop.shareMessage': '{name} — Parada #{code}. Mira las llegadas en vivo en BusPulse Vancouver.',
  'stop.walkSummary': '~{walk} min a pie · próximo bus en {next} min',
  'stop.makeIt': ' — llegas a tiempo',
  'stop.hurry': ' — mejor apúrate',
  'stop.missIt': ' — puede que lo pierdas',
  'stop.walkA11y': '{walk} minutos a pie, próximo bus en {next} minutos. {verdict}',
  'stop.makeItFull': 'Llegas a tiempo.',
  'stop.hurryFull': 'Mejor apúrate.',
  'stop.missItFull': 'Puede que lo pierdas.',
  'stop.stale': 'No se pudo actualizar; se muestran los últimos horarios conocidos',
  'stop.updatedAgo': 'Actualizado hace {s} s · se actualiza cada 60 s',
  'stop.busyNow': 'Datos en vivo saturados ahora',
  'stop.loadFailed': 'No se pudieron cargar las llegadas.',
  'stop.feedLimitBit': 'El feed en tiempo real alcanzó su límite; inténtalo de nuevo en un momento.',
  'stop.noRealtime': 'Sin llegadas en tiempo real',
  'stop.noLivePull': 'No hay llegadas en vivo para esta parada ahora. Desliza hacia abajo para actualizar.',

  // Scheduled (timetable) fallback
  'sched.header': 'Salidas programadas',
  'sched.note': 'Horario — sin seguimiento en vivo para esta parada ahora.',
  'sched.scheduled': 'Programado',
  'sched.rowA11y': 'Ruta {route} a {dest}, programado {time}',

  // Arrival rows / reminders
  'arrival.inService': 'En servicio',
  'arrival.rowA11y': 'Ruta {route} a {dest}. Toca para seguir el bus.',
  'arrival.reminderSet': 'Recordatorio activado',
  'arrival.reminderSetRoute': 'Recordatorio activado para la ruta {route}',
  'arrival.remindBefore': 'Avisarme {lead} minutos antes de este bus',
  'arrival.remindBeforeRoute': 'Avisarme {lead} minutos antes de la ruta {route}',

  // Trip tracking
  'trip.noVehicle': 'Sin datos en vivo del vehículo para este viaje',
  'trip.findBus': 'Buscar bus',
  'trip.yourStop': 'Tu parada',
  'trip.arrivingAt': 'Llegando a {stop}',
  'trip.vehicleUpdated': 'Vehículo actualizado {time}',

  // Route detail + route map
  'route.stopsServe': '{count} parada en esta ruta',
  'route.stopsServe_plural': '{count} paradas en esta ruta',
  'route.showLiveOnMap': 'Mostrar buses en vivo en el mapa',
  'route.showLiveOnMapA11y': 'Mostrar en el mapa los buses en vivo de esta ruta',
  'route.stopsCount': '{count} parada',
  'route.stopsCount_plural': '{count} paradas',
  'route.noStopData': 'No se encontraron datos de paradas. Ejecuta node scripts/fetchGtfsStatic.js para actualizar.',
  'route.liveOnRoute': '{count} bus en vivo en esta ruta',
  'route.liveOnRoute_plural': '{count} buses en vivo en esta ruta',
  'route.closeMap': 'Cerrar el mapa de la ruta',

  // Onboarding
  'onboard.title': 'Te damos la bienvenida a BusPulse Vancouver',
  'onboard.body':
    'Seguimiento de buses en tiempo real para el área metropolitana de Vancouver. Mira las llegadas en vivo, toca un bus para seguirlo en el mapa y recibe un recordatorio antes de que llegue.',
  'onboard.note':
    'Los datos en vivo cubren los buses. SkyTrain, SeaBus y West Coast Express no aparecen en el feed público de TransLink.',
  'onboard.cta': 'Empezar',

  // Settings
  'settings.notifications': 'Notificaciones',
  'settings.remindBefore': 'Avisarme antes del bus',
  'settings.leadTimeSub': 'Tiempo de aviso predeterminado para los recordatorios de salida.',
  'settings.minutesBefore': '{m} minutos antes',
  'settings.minShort': '{m} min',
  'settings.language': 'Idioma',
  'settings.languageSub': 'Elige el idioma de la app.',
  'settings.langSystem': 'Sistema',
  'settings.dataPrivacy': 'Datos y privacidad',
  'settings.privacyPolicy': 'Política de privacidad',
  'settings.support': 'Soporte',
  'settings.clearRecent': 'Borrar búsquedas recientes',
  'settings.clearRecentTitle': '¿Borrar las búsquedas recientes?',
  'settings.clearRecentBody': 'Esto elimina las paradas que viste recientemente.',
  'settings.about': 'Acerca de',
  'settings.version': 'Versión {v}',
  'settings.aboutBody':
    'Llegadas de buses en tiempo real y seguimiento en vivo para el área metropolitana de Vancouver, con el feed público GTFS en tiempo real de TransLink. Las llegadas se actualizan cada 60 segundos.',
  'settings.attribution':
    'Datos de transporte © TransLink. BusPulse Vancouver es una app independiente y no está afiliada a TransLink ni respaldada por ella.',
  'settings.close': 'Cerrar ajustes',

  // Notifications (system)
  'notif.disabledTitle': 'Notificaciones desactivadas',
  'notif.disabledBody': 'Activa las notificaciones en Ajustes para recibir un aviso antes de que llegue tu bus.',
  'notif.arrivingNow': 'Bus llegando ahora',
  'notif.arrivingSoon': 'Bus llegando pronto',
  'notif.bodyNow': 'La ruta {route} está llegando a {stop}',
  'notif.bodySoon': 'La ruta {route} llega en {lead} min a {stop}',
};
