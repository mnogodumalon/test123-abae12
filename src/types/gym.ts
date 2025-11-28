// Living Apps Fitness & Ernährungs-Tracker Types

export interface Uebung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    name: string;
    muskelgruppe: 'brust' | 'ruecken' | 'beine' | 'schultern' | 'bizeps' | 'trizeps' | 'bauch' | 'ganzkoerper';
    equipment: 'langhantel' | 'kurzhantel' | 'maschine' | 'kabelzug' | 'bodyweight' | 'kettlebell' | 'resistance_band' | 'sonstiges';
    schwierigkeitsgrad: 'anfaenger' | 'fortgeschritten' | 'experte';
  };
}

export interface Workout {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum: string; // YYYY-MM-DD
    typ: 'push' | 'pull' | 'beine' | 'ganzkoerper' | 'oberkoerper' | 'unterkoerper' | 'cardio' | 'sonstiges';
    dauer_minuten: number;
    stimmung: 'schlecht' | 'okay' | 'gut' | 'brutal';
    rest_day: boolean;
  };
}

export interface Ernaehrung {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum: string; // YYYY-MM-DD
    mahlzeit_typ: 'fruehstueck' | 'snack' | 'mittagessen' | 'abendessen' | 'pre_workout' | 'post_workout' | 'sonstiges';
    beschreibung?: string;
    kalorien: number;
    protein: number;
    carbs: number;
    fett: number;
  };
}

export interface WorkoutLog {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    workout: string; // applookup → URL zu Workout
    uebung: string; // applookup → URL zu Uebung
    satz_nummer: number;
    gewicht: number;
    wiederholungen: number;
    rpe: 'rpe_1' | 'rpe_2' | 'rpe_3' | 'rpe_4' | 'rpe_5' | 'rpe_6' | 'rpe_7' | 'rpe_8' | 'rpe_9' | 'rpe_10';
  };
}

export interface Ziel {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    taeglich_kalorien?: number;
    taeglich_protein?: number;
    trainingstage_pro_woche?: number;
    schlaf_ziel_stunden?: number;
    status: 'aktiv' | 'erreicht' | 'verworfen';
    notizen?: string;
  };
}

export interface Koerperdaten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    datum: string; // YYYY-MM-DD
    gewicht_kg?: number;
    kfa_geschaetzt?: number;
    brustumfang?: number;
    taillenumfang?: number;
    hueftumfang?: number;
    armumfang?: number;
    beinumfang?: number;
    notizen?: string;
  };
}

// App IDs from Living Apps
export const APP_IDS = {
  UEBUNGEN: '6914a7e259d98c952771c809',
  WORKOUTS: '6914a7e7b773d677cf3838c1',
  ERNAEHRUNG: '6914a7e8078cdd936a7fe8bf',
  WORKOUT_LOGS: '6914a7e8154ee0268140a731',
  ZIELE: '6914a7ead630b6a1488ff831',
  KOERPERDATEN: '6914a7e9764e7bbbd63bbd93',
} as const;

// Helper types for creating new records (without record_id and timestamps)
export type CreateUebung = Omit<Uebung['fields'], never>;
export type CreateWorkout = Omit<Workout['fields'], never>;
export type CreateErnaehrung = Omit<Ernaehrung['fields'], never>;
export type CreateWorkoutLog = Omit<WorkoutLog['fields'], never>;
export type CreateZiel = Omit<Ziel['fields'], never>;
export type CreateKoerperdaten = Omit<Koerperdaten['fields'], never>;

