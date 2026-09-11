import { NearbyPlacesQuery } from "../schemas/places";

export function createOverpassQuery({ radiusMeters, lat, lng }: NearbyPlacesQuery) {
    return `
        [out:json][timeout:25];
        (
            node["tourism"~"attraction|museum|artwork|viewpoint"]
                (around:${radiusMeters},${lat},${lng});

            node["historic"]
                (around:${radiusMeters},${lat},${lng});

            way["tourism"~"attraction|museum|artwork|viewpoint"]
                (around:${radiusMeters},${lat},${lng});

            way["historic"]
                (around:${radiusMeters},${lat},${lng});
        );
        out center;
    `;
}