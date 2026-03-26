export function useGeolocation() {
  const getLocation = async () => {
    return new Promise((resolve) => {
      const fallback = { lat: 12.9716, lng: 77.5946 };
      if (!navigator.geolocation) {
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  return { getLocation };
}
