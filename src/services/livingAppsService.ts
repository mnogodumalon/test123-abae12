import {
  type Uebung,
  type Workout,
  type Ernaehrung,
  type WorkoutLog,
  type Ziel,
  type Koerperdaten,
  APP_IDS,
} from '@/types/gym';

// Living Apps REST API Configuration
// Using Vite proxy to avoid CORS issues: /api/rest -> https://my.living-apps.de/rest
const API_BASE_URL = 'https://corsproxy.io/?https://my.living-apps.de/gateway/apps';
const API_KEY = '6915f82bvjhmjGdAXfmtRdIngjeJzOsrjomInMXbhmTSyNJASDLxVNRneftfuMgeYUuXSAbFSGMQrRnynpHVbJfOUfniYDFFGN';

// Helper function to make API calls to Living Apps REST API
async function callLivingAppsAPI(method: string, endpoint: string, data?: any) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Living Apps API Error (${response.status}): ${errorText}`);
  }

  // DELETE returns 200 with empty/simple response
  if (method === 'DELETE') {
    return response.json();
  }

  return response.json();
}

// Helper function to extract record_id from Living Apps URL
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Helper function to create Living Apps URL
// Note: Living Apps API expects full URLs for applookup fields, not relative paths
export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

// Service class for Living Apps integration via REST API
export class LivingAppsService {
  // ========== ÜBUNGEN ==========
  static async getUebungen(): Promise<Uebung[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.UEBUNGEN}/records`);
    // REST API returns object with record_id as keys, transform to array
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getUebung(id: string): Promise<Uebung | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.UEBUNGEN}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createUebung(fields: Uebung['fields']): Promise<Uebung> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.UEBUNGEN}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateUebung(id: string, fields: Partial<Uebung['fields']>): Promise<Uebung> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.UEBUNGEN}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteUebung(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.UEBUNGEN}/records/${id}`);
  }

  // ========== WORKOUTS ==========
  static async getWorkouts(): Promise<Workout[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.WORKOUTS}/records`);
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getWorkout(id: string): Promise<Workout | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.WORKOUTS}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createWorkout(fields: Workout['fields']): Promise<Workout> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.WORKOUTS}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateWorkout(id: string, fields: Partial<Workout['fields']>): Promise<Workout> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.WORKOUTS}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteWorkout(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.WORKOUTS}/records/${id}`);
  }

  // ========== ERNÄHRUNG ==========
  static async getErnaehrung(): Promise<Ernaehrung[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.ERNAEHRUNG}/records`);
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getErnaehrungEntry(id: string): Promise<Ernaehrung | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.ERNAEHRUNG}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createErnaehrung(fields: Ernaehrung['fields']): Promise<Ernaehrung> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.ERNAEHRUNG}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateErnaehrung(
    id: string,
    fields: Partial<Ernaehrung['fields']>
  ): Promise<Ernaehrung> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.ERNAEHRUNG}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteErnaehrung(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.ERNAEHRUNG}/records/${id}`);
  }

  // ========== WORKOUT-LOGS ==========
  static async getWorkoutLogs(): Promise<WorkoutLog[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.WORKOUT_LOGS}/records`);
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getWorkoutLog(id: string): Promise<WorkoutLog | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.WORKOUT_LOGS}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createWorkoutLog(fields: WorkoutLog['fields']): Promise<WorkoutLog> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.WORKOUT_LOGS}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateWorkoutLog(
    id: string,
    fields: Partial<WorkoutLog['fields']>
  ): Promise<WorkoutLog> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.WORKOUT_LOGS}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteWorkoutLog(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.WORKOUT_LOGS}/records/${id}`);
  }

  // ========== ZIELE ==========
  static async getZiele(): Promise<Ziel[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.ZIELE}/records`);
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getZiel(id: string): Promise<Ziel | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.ZIELE}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createZiel(fields: Ziel['fields']): Promise<Ziel> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.ZIELE}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateZiel(id: string, fields: Partial<Ziel['fields']>): Promise<Ziel> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.ZIELE}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteZiel(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.ZIELE}/records/${id}`);
  }

  // ========== KÖRPERDATEN ==========
  static async getKoerperdaten(): Promise<Koerperdaten[]> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.KOERPERDATEN}/records`);
    return Object.entries(data).map(([record_id, record]: [string, any]) => ({
      record_id,
      createdat: record.createdat,
      updatedat: record.updatedat,
      fields: record.fields,
    }));
  }

  static async getKoerperdatenEntry(id: string): Promise<Koerperdaten | undefined> {
    const data = await callLivingAppsAPI('GET', `/apps/${APP_IDS.KOERPERDATEN}/records/${id}`);
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async createKoerperdaten(fields: Koerperdaten['fields']): Promise<Koerperdaten> {
    const data = await callLivingAppsAPI('POST', `/apps/${APP_IDS.KOERPERDATEN}/records`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async updateKoerperdaten(
    id: string,
    fields: Partial<Koerperdaten['fields']>
  ): Promise<Koerperdaten> {
    const data = await callLivingAppsAPI('PATCH', `/apps/${APP_IDS.KOERPERDATEN}/records/${id}`, {
      fields,
    });
    return {
      record_id: data.id,
      createdat: data.createdat,
      updatedat: data.updatedat,
      fields: data.fields,
    };
  }

  static async deleteKoerperdaten(id: string): Promise<void> {
    await callLivingAppsAPI('DELETE', `/apps/${APP_IDS.KOERPERDATEN}/records/${id}`);
  }
}

export default LivingAppsService;

