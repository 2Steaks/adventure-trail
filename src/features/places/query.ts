import { NearbyPlacesQuery } from "./places.schema";

export function createOverpassQuery({
  radiusMeters,
  lat,
  lng,
}: NearbyPlacesQuery) {
  return `
    [out:json][timeout:25];
    (
      // Things to discover
      nwr["tourism"~"attraction|museum|gallery|artwork|viewpoint"]
        (around:${radiusMeters},${lat},${lng});

      // Historic things
      nwr["historic"]
        (around:${radiusMeters},${lat},${lng});

      // Interesting natural features
      nwr["natural"~"peak|waterfall|cave_entrance|spring|cliff"]
        (around:${radiusMeters},${lat},${lng});

      // Fun / useful places
      nwr["amenity"~"cafe|playground|bench"]
        (around:${radiusMeters},${lat},${lng});

      // Interesting outdoor places
      nwr["leisure"~"garden|nature_reserve"]
        (around:${radiusMeters},${lat},${lng});

      // Archaeology
      nwr["site_type"="archaeological"]
        (around:${radiusMeters},${lat},${lng});
    );

    out center;
  `;
}
