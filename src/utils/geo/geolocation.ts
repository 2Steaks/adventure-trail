const GEOLOCATION_ERROR_MESSAGES: Record<number, string> = {
  1: "Location permission was denied.",
  2: "Your location couldn't be determined.",
  3: "Getting your location timed out.",
};

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) =>
        reject(
          new Error(
            GEOLOCATION_ERROR_MESSAGES[error.code] ??
              "Couldn't get your location. Try again.",
          ),
        ),
      { timeout: 10_000 },
    );
  });
}
