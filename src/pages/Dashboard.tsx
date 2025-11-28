import { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Apple,
  Target,
  Scale,
  Calendar,
  PlusCircle,
  Flame,
  Utensils,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type {
  Workout,
  Ernaehrung,
  Ziel,
  Koerperdaten,
  Uebung,
  WorkoutLog,
} from '@/types/gym';

// Farben für Charts
const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

// Muskelgruppen Farben für Pie Chart
const MUSCLE_COLORS = [
  '#ef4444', // rot
  '#f59e0b', // orange
  '#10b981', // grün
  '#3b82f6', // blau
  '#8b5cf6', // lila
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // deep orange
];

export default function Dashboard() {
  // State für Daten
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [ernaehrung, setErnaehrung] = useState<Ernaehrung[]>([]);
  const [ziele, setZiele] = useState<Ziel[]>([]);
  const [koerperdaten, setKoerperdaten] = useState<Koerperdaten[]>([]);
  const [uebungen, setUebungen] = useState<Uebung[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  // Loading & Error State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog State für neues Workout
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    datum: format(new Date(), 'yyyy-MM-dd'),
    typ: 'ganzkoerper' as Workout['fields']['typ'],
    dauer_minuten: 60,
    stimmung: 'gut' as Workout['fields']['stimmung'],
    rest_day: false,
  });

  // Daten laden
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [
        workoutsData,
        ernaehrungData,
        zieleData,
        koerperdatenData,
        uebungenData,
        workoutLogsData,
      ] = await Promise.all([
        LivingAppsService.getWorkouts(),
        LivingAppsService.getErnaehrung(),
        LivingAppsService.getZiele(),
        LivingAppsService.getKoerperdaten(),
        LivingAppsService.getUebungen(),
        LivingAppsService.getWorkoutLogs(),
      ]);

      setWorkouts(workoutsData);
      setErnaehrung(ernaehrungData);
      setZiele(zieleData);
      setKoerperdaten(koerperdatenData);
      setUebungen(uebungenData);
      setWorkoutLogs(workoutLogsData);
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }

  // Neues Workout erstellen
  async function handleCreateWorkout() {
    setSubmitting(true);
    try {
      await LivingAppsService.createWorkout(newWorkout);
      toast.success('Workout erfolgreich erstellt!');
      setDialogOpen(false);
      // Daten neu laden
      await loadData();
      // Form zurücksetzen
      setNewWorkout({
        datum: format(new Date(), 'yyyy-MM-dd'),
        typ: 'ganzkoerper',
        dauer_minuten: 60,
        stimmung: 'gut',
        rest_day: false,
      });
    } catch (err) {
      console.error('Fehler beim Erstellen des Workouts:', err);
      toast.error('Fehler beim Erstellen des Workouts');
    } finally {
      setSubmitting(false);
    }
  }

  // ========== BERECHNUNGEN ==========

  // Aktives Ziel
  const activeGoal = ziele.find((z) => z.fields.status === 'aktiv');

  // Workouts diese Woche
  const startOfThisWeek = startOfWeek(new Date(), { locale: de });
  const endOfThisWeek = endOfWeek(new Date(), { locale: de });
  const workoutsThisWeek = workouts.filter((w) => {
    const workoutDate = parseISO(w.fields.datum);
    return workoutDate >= startOfThisWeek && workoutDate <= endOfThisWeek && !w.fields.rest_day;
  });

  // Ernährung heute
  const today = format(new Date(), 'yyyy-MM-dd');
  const ernaehrungToday = ernaehrung.filter((e) => e.fields.datum === today);
  const kalorienToday = ernaehrungToday.reduce((sum, e) => sum + (e.fields.kalorien || 0), 0);
  const proteinToday = ernaehrungToday.reduce((sum, e) => sum + (e.fields.protein || 0), 0);
  const carbsToday = ernaehrungToday.reduce((sum, e) => sum + (e.fields.carbs || 0), 0);
  const fettToday = ernaehrungToday.reduce((sum, e) => sum + (e.fields.fett || 0), 0);

  // Fortschritt zu Zielen
  const kalorienProgress = activeGoal?.fields.taeglich_kalorien
    ? (kalorienToday / activeGoal.fields.taeglich_kalorien) * 100
    : 0;
  const proteinProgress = activeGoal?.fields.taeglich_protein
    ? (proteinToday / activeGoal.fields.taeglich_protein) * 100
    : 0;
  const workoutProgress = activeGoal?.fields.trainingstage_pro_woche
    ? (workoutsThisWeek.length / activeGoal.fields.trainingstage_pro_woche) * 100
    : 0;

  // Gewichtsverlauf (letzte 8 Wochen)
  const koerperdatenSorted = [...koerperdaten]
    .filter((k) => k.fields.gewicht_kg)
    .sort((a, b) => a.fields.datum.localeCompare(b.fields.datum));
  const gewichtChartData = koerperdatenSorted.slice(-8).map((k) => ({
    datum: format(parseISO(k.fields.datum), 'dd.MM', { locale: de }),
    gewicht: k.fields.gewicht_kg,
  }));

  // Gewichtsänderung
  const currentWeight = koerperdatenSorted[koerperdatenSorted.length - 1]?.fields.gewicht_kg;
  const previousWeight = koerperdatenSorted[koerperdatenSorted.length - 2]?.fields.gewicht_kg;
  const weightChange =
    currentWeight && previousWeight ? currentWeight - previousWeight : null;

  // Trainingstypen Verteilung
  const workoutTypeCount: Record<string, number> = {};
  workouts.forEach((w) => {
    if (!w.fields.rest_day) {
      workoutTypeCount[w.fields.typ] = (workoutTypeCount[w.fields.typ] || 0) + 1;
    }
  });
  const workoutTypeChartData = Object.entries(workoutTypeCount).map(([typ, count]) => ({
    name: typ.charAt(0).toUpperCase() + typ.slice(1),
    value: count,
  }));

  // Top Übungen (nach Anzahl der Logs)
  const uebungLogCount: Record<string, number> = {};
  workoutLogs.forEach((log) => {
    const uebungId = extractRecordId(log.fields.uebung);
    if (uebungId) {
      uebungLogCount[uebungId] = (uebungLogCount[uebungId] || 0) + 1;
    }
  });
  const topUebungen = Object.entries(uebungLogCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([uebungId, count]) => {
      const uebung = uebungen.find((u) => u.record_id === uebungId);
      return {
        name: uebung?.fields.name || 'Unbekannt',
        count,
      };
    });

  // Makronährstoffe Verteilung heute
  const makrosData = [
    { name: 'Protein', value: proteinToday * 4, color: CHART_COLORS.success },
    { name: 'Carbs', value: carbsToday * 4, color: CHART_COLORS.info },
    { name: 'Fett', value: fettToday * 9, color: CHART_COLORS.warning },
  ].filter((m) => m.value > 0);

  // Durchschnittliche Workout-Dauer
  const avgWorkoutDuration =
    workouts.length > 0
      ? workouts.reduce((sum, w) => sum + w.fields.dauer_minuten, 0) / workouts.length
      : 0;

  // Stimmung Verteilung
  const stimmungCount: Record<string, number> = {
    schlecht: 0,
    okay: 0,
    gut: 0,
    brutal: 0,
  };
  workouts.forEach((w) => {
    if (!w.fields.rest_day && w.fields.stimmung) {
      stimmungCount[w.fields.stimmung]++;
    }
  });
  const stimmungChartData = Object.entries(stimmungCount)
    .filter(([, count]) => count > 0)
    .map(([stimmung, count]) => ({
      name: stimmung.charAt(0).toUpperCase() + stimmung.slice(1),
      value: count,
    }));

  // ========== RENDER ==========

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={loadData}>
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Fitness & Ernährungs-Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Dein persönliches Dashboard für Training und Ernährung
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Neues Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Neues Workout erstellen</DialogTitle>
              <DialogDescription>
                Erstelle ein neues Workout für dein Training heute.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="datum">Datum</Label>
                <Input
                  id="datum"
                  type="date"
                  value={newWorkout.datum}
                  onChange={(e) => setNewWorkout({ ...newWorkout, datum: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="typ">Trainingstyp</Label>
                <Select
                  value={newWorkout.typ}
                  onValueChange={(value) =>
                    setNewWorkout({ ...newWorkout, typ: value as Workout['fields']['typ'] })
                  }
                >
                  <SelectTrigger id="typ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="pull">Pull</SelectItem>
                    <SelectItem value="beine">Beine</SelectItem>
                    <SelectItem value="ganzkoerper">Ganzkörper</SelectItem>
                    <SelectItem value="oberkoerper">Oberkörper</SelectItem>
                    <SelectItem value="unterkoerper">Unterkörper</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="sonstiges">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dauer">Dauer (Minuten)</Label>
                <Input
                  id="dauer"
                  type="number"
                  value={newWorkout.dauer_minuten}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, dauer_minuten: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stimmung">Stimmung</Label>
                <Select
                  value={newWorkout.stimmung}
                  onValueChange={(value) =>
                    setNewWorkout({
                      ...newWorkout,
                      stimmung: value as Workout['fields']['stimmung'],
                    })
                  }
                >
                  <SelectTrigger id="stimmung">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schlecht">Schlecht</SelectItem>
                    <SelectItem value="okay">Okay</SelectItem>
                    <SelectItem value="gut">Gut</SelectItem>
                    <SelectItem value="brutal">Brutal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Abbrechen
              </Button>
              <Button onClick={handleCreateWorkout} disabled={submitting}>
                {submitting ? 'Erstelle...' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Workouts diese Woche */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts diese Woche</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutsThisWeek.length}</div>
            {activeGoal?.fields.trainingstage_pro_woche && (
              <div className="mt-2">
                <Progress value={workoutProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Ziel: {activeGoal.fields.trainingstage_pro_woche} / Woche
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kalorien heute */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalorien heute</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kalorienToday)}</div>
            {activeGoal?.fields.taeglich_kalorien && (
              <div className="mt-2">
                <Progress
                  value={Math.min(kalorienProgress, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ziel: {activeGoal.fields.taeglich_kalorien} kcal
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protein heute */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein heute</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(proteinToday)}g</div>
            {activeGoal?.fields.taeglich_protein && (
              <div className="mt-2">
                <Progress
                  value={Math.min(proteinProgress, 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ziel: {activeGoal.fields.taeglich_protein}g
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gewicht */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktuelles Gewicht</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : 'N/A'}
            </div>
            {weightChange !== null && (
              <div className="flex items-center gap-1 mt-2">
                {weightChange > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-red-500">+{weightChange.toFixed(1)} kg</p>
                  </>
                ) : weightChange < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-green-500">{weightChange.toFixed(1)} kg</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Keine Änderung</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs für verschiedene Ansichten */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="nutrition">Ernährung</TabsTrigger>
        </TabsList>

        {/* Übersicht Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gewichtsverlauf */}
            <Card>
              <CardHeader>
                <CardTitle>Gewichtsverlauf</CardTitle>
                <CardDescription>Deine Gewichtsentwicklung der letzten Wochen</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {gewichtChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={gewichtChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="datum" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="gewicht"
                        stroke={CHART_COLORS.primary}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS.primary, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Keine Körperdaten vorhanden
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trainingstypen Verteilung */}
            <Card>
              <CardHeader>
                <CardTitle>Trainingstypen</CardTitle>
                <CardDescription>Verteilung deiner Workouts nach Typ</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {workoutTypeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={workoutTypeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {workoutTypeChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MUSCLE_COLORS[index % MUSCLE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Keine Workout-Daten vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistiken */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamt Workouts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workouts.filter((w) => !w.fields.rest_day).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Alle Trainingseinheiten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ø Trainingsdauer</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(avgWorkoutDuration)} Min</div>
                <p className="text-xs text-muted-foreground mt-1">Durchschnittlich pro Workout</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Erfasste Übungen</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uebungen.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Verschiedene Übungen</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Stimmung Verteilung */}
            <Card>
              <CardHeader>
                <CardTitle>Workout-Stimmung</CardTitle>
                <CardDescription>Wie hast du dich bei deinen Workouts gefühlt?</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {stimmungChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stimmungChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS.info} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Keine Stimmungsdaten vorhanden
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Übungen */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Übungen</CardTitle>
                <CardDescription>Deine am häufigsten trainierten Übungen</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {topUebungen.length > 0 ? (
                  <div className="space-y-3">
                    {topUebungen.map((uebung, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{index + 1}</Badge>
                          <span className="font-medium">{uebung.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{uebung.count}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Keine Workout-Logs vorhanden
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Letzte Workouts */}
          <Card>
            <CardHeader>
              <CardTitle>Letzte Workouts</CardTitle>
              <CardDescription>Deine letzten 5 Trainingseinheiten</CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length > 0 ? (
                <div className="space-y-3">
                  {[...workouts]
                    .sort((a, b) => b.fields.datum.localeCompare(a.fields.datum))
                    .filter((w) => !w.fields.rest_day)
                    .slice(0, 5)
                    .map((workout) => (
                      <div
                        key={workout.record_id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Dumbbell className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {workout.fields.typ.charAt(0).toUpperCase() +
                                workout.fields.typ.slice(1)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(workout.fields.datum), 'dd.MM.yyyy', { locale: de })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{workout.fields.dauer_minuten} Min</Badge>
                          <Badge
                            variant={
                              workout.fields.stimmung === 'brutal'
                                ? 'default'
                                : workout.fields.stimmung === 'gut'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {workout.fields.stimmung.charAt(0).toUpperCase() +
                              workout.fields.stimmung.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <p>Keine Workouts vorhanden</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Erstes Workout erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ernährung Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Makronährstoffe heute */}
            <Card>
              <CardHeader>
                <CardTitle>Makronährstoffe heute</CardTitle>
                <CardDescription>Verteilung deiner Kalorien nach Makros</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {makrosData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={makrosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {makrosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Keine Ernährungsdaten für heute
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Makro Details */}
            <Card>
              <CardHeader>
                <CardTitle>Makro-Übersicht heute</CardTitle>
                <CardDescription>Detaillierte Aufschlüsselung deiner Makronährstoffe</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Protein</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(proteinToday)}g (
                        {Math.round((proteinToday * 4 * 100) / (kalorienToday || 1))}%)
                      </span>
                    </div>
                    <Progress
                      value={(proteinToday * 4 * 100) / (kalorienToday || 1)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Kohlenhydrate</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(carbsToday)}g (
                        {Math.round((carbsToday * 4 * 100) / (kalorienToday || 1))}%)
                      </span>
                    </div>
                    <Progress
                      value={(carbsToday * 4 * 100) / (kalorienToday || 1)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Fett</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(fettToday)}g (
                        {Math.round((fettToday * 9 * 100) / (kalorienToday || 1))}%)
                      </span>
                    </div>
                    <Progress
                      value={(fettToday * 9 * 100) / (kalorienToday || 1)}
                      className="h-2"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Gesamt Kalorien</span>
                      <span className="font-bold">{Math.round(kalorienToday)} kcal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heutige Mahlzeiten */}
          <Card>
            <CardHeader>
              <CardTitle>Heutige Mahlzeiten</CardTitle>
              <CardDescription>Alle Mahlzeiten von heute</CardDescription>
            </CardHeader>
            <CardContent>
              {ernaehrungToday.length > 0 ? (
                <div className="space-y-3">
                  {ernaehrungToday.map((meal) => (
                    <div
                      key={meal.record_id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Utensils className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {meal.fields.mahlzeit_typ.charAt(0).toUpperCase() +
                              meal.fields.mahlzeit_typ.slice(1).replace('_', ' ')}
                          </p>
                          {meal.fields.beschreibung && (
                            <p className="text-sm text-muted-foreground">
                              {meal.fields.beschreibung}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{meal.fields.kalorien} kcal</Badge>
                        <span className="text-xs text-muted-foreground">
                          P: {meal.fields.protein}g | C: {meal.fields.carbs}g | F: {meal.fields.fett}
                          g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Noch keine Mahlzeiten für heute erfasst
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Aktives Ziel */}
      {activeGoal && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Aktives Ziel</CardTitle>
              <Badge>{activeGoal.fields.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {activeGoal.fields.taeglich_kalorien && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tägliche Kalorien</p>
                  <p className="text-2xl font-bold">{activeGoal.fields.taeglich_kalorien} kcal</p>
                </div>
              )}
              {activeGoal.fields.taeglich_protein && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Tägliches Protein</p>
                  <p className="text-2xl font-bold">{activeGoal.fields.taeglich_protein}g</p>
                </div>
              )}
              {activeGoal.fields.trainingstage_pro_woche && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trainingstage / Woche</p>
                  <p className="text-2xl font-bold">
                    {activeGoal.fields.trainingstage_pro_woche}x
                  </p>
                </div>
              )}
              {activeGoal.fields.schlaf_ziel_stunden && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Schlafziel</p>
                  <p className="text-2xl font-bold">{activeGoal.fields.schlaf_ziel_stunden}h</p>
                </div>
              )}
            </div>
            {activeGoal.fields.notizen && (
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">{activeGoal.fields.notizen}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
