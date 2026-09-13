export type OverpassElement = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type Place = {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
};
