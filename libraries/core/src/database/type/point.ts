export const EARTH_RADIUS = 6371; // KM

export type Point = { lat: string; long: string };

export class PointTransformer {
  to(value) {
    if (value) {
      return `${value.lat}, ${value.long}`;
    }

    return null;
  }

  from(value) {
    if (value) {
      return {
        lat: value?.x,
        long: value?.y,
      };
    }

    return null;
  }

  static distanceBetween2Points(point1: Point, point2: Point, unit: 'km' | 'm' = 'km') {
    const φ1 = (+point1.lat * Math.PI) / 180; // φ, λ in radians
    const φ2 = (+point2.lat * Math.PI) / 180;
    const Δφ = ((+point2.lat - +point1.lat) * Math.PI) / 180;
    const Δλ = ((+point2.long - +point1.long) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = EARTH_RADIUS * c;

    switch (unit) {
      case 'm': {
        return d * 1000;
      }
      case 'km':
      default: {
        return d;
      }
    }
  }
}
