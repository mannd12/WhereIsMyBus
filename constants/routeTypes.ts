import { Colors } from './colors';

export const ROUTE_TYPE_TRAM = 0;
export const ROUTE_TYPE_SUBWAY = 1;
export const ROUTE_TYPE_RAIL = 2;
export const ROUTE_TYPE_BUS = 3;
export const ROUTE_TYPE_FERRY = 4;

export function getRouteColor(routeType: number, routeColor?: string): string {
  if (routeColor && routeColor.length >= 6) return `#${routeColor}`;
  switch (routeType) {
    case ROUTE_TYPE_SUBWAY: return Colors.skytrainExpo;
    case ROUTE_TYPE_RAIL: return Colors.westCoastExpress;
    case ROUTE_TYPE_FERRY: return Colors.seaBus;
    default: return Colors.bus;
  }
}

export function getRouteTypeLabel(routeType: number): string {
  switch (routeType) {
    case ROUTE_TYPE_SUBWAY: return 'SkyTrain';
    case ROUTE_TYPE_RAIL: return 'WCE';
    case ROUTE_TYPE_FERRY: return 'SeaBus';
    default: return 'Bus';
  }
}

export function getRouteTypeIcon(routeType: number): 'subway' | 'train' | 'boat' | 'bus' {
  switch (routeType) {
    case ROUTE_TYPE_SUBWAY: return 'subway';
    case ROUTE_TYPE_RAIL: return 'train';
    case ROUTE_TYPE_FERRY: return 'boat';
    default: return 'bus';
  }
}
