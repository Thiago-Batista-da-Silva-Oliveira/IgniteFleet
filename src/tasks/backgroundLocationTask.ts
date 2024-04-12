import {
  Accuracy,
  startLocationUpdatesAsync,
  hasStartedLocationUpdatesAsync,
  stopLocationUpdatesAsync,
} from "expo-location";
import * as TaskManager from "expo-task-manager";

export const BACKGROUND_TASK_NAME = "location-tracking";

TaskManager.defineTask(BACKGROUND_TASK_NAME, ({ data, error }: any) => {
  try {
    if (error) {
      throw error;
    }
    const { coords, timestamp } = data.locations[0];
    const currentLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp,
    };
    console.log(currentLocation);
  } catch (error) {
    console.log(error);
  }
});

export async function startLocationTask() {
  try {
    const hasStarted = await hasStartedLocationUpdatesAsync(
        BACKGROUND_TASK_NAME
      );
    if (hasStarted) {
      await stopLocationTask();
    }; 
    await startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
      accuracy: Accuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 1,
      showsBackgroundLocationIndicator: true,
    });
  } catch (err) {
    console.log(err);
  }
}

export async function stopLocationTask() {
  try {
    const hasStarted = await hasStartedLocationUpdatesAsync(
      BACKGROUND_TASK_NAME
    );
    if (hasStarted) {
      await stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
    }
  } catch (err) {
    console.log(err);
  }
}
