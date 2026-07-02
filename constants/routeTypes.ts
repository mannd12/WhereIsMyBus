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
