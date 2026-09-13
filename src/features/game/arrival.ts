import { haversine, type LatLng } from "@/src/utils/geo/haversine";

export type ArrivalTarget = LatLng & {
  radiusMeters: number;
};

export type ArrivalResult = {
  distanceMeters: number;
  arrived: boolean;
};

export function checkArrival(
  origin: LatLng,
  target: ArrivalTarget,
): ArrivalResult {
  const distanceMeters = haversine(origin, target);

  return {
    distanceMeters,
    arrived: distanceMeters <= target.radiusMeters,
  };
}
