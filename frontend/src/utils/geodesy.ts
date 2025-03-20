export class GeoCalculator {
  private static readonly EARTH_RADIUS = 6371e3; // metres

  static doCirclesIntersect(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radius: number
  ): boolean {
    const distance = this.distanceBetween(lat1, lon1, lat2, lon2);
    return distance < (radius * 5);
  }

  static distanceBetween(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS * c;
  }
}