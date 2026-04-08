import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const ROUTE_TYPES = [
  {
    key: 'mindful',
    title: 'Mindful Reset',
    subtitle: 'Calm breathing + light pace',
    icon: 'leaf-outline',
  },
  {
    key: 'energy',
    title: 'Energy Boost',
    subtitle: 'Brisk tempo + uplifting prompts',
    icon: 'flash-outline',
  },
  {
    key: 'focus',
    title: 'Focus Walk',
    subtitle: 'Steady rhythm for clear thinking',
    icon: 'compass-outline',
  },
];

const ROUTES_BY_TYPE = {
  mindful: [
    {
      id: 'm1',
      name: 'Park Breathing Loop',
      distanceKm: 2.4,
      durationMin: 32,
      difficulty: 'Easy',
      start: 'Central Park Gate',
      waypoints: [
        'Head north towards the tree line',
        'Turn right at the fountain path',
        'Continue straight to the lake loop',
      ],
    },
    {
      id: 'm2',
      name: 'Riverside Slow Walk',
      distanceKm: 3.1,
      durationMin: 40,
      difficulty: 'Easy',
      start: 'Riverside Promenade',
      waypoints: [
        'Follow the river south',
        'Keep left at the bridge split',
        'Return via the shaded boardwalk',
      ],
    },
  ],
  energy: [
    {
      id: 'e1',
      name: 'Uptown Tempo Route',
      distanceKm: 4.2,
      durationMin: 38,
      difficulty: 'Moderate',
      start: 'City Plaza',
      waypoints: [
        'Warm up for 5 minutes',
        'Push pace through Main Street incline',
        'Recover on the downhill boulevard',
      ],
    },
    {
      id: 'e2',
      name: 'Hill Sprint Circuit',
      distanceKm: 3.7,
      durationMin: 34,
      difficulty: 'Moderate',
      start: 'Hill Park Entrance',
      waypoints: [
        'Climb the first hill segment',
        'Jog recovery at the lookout',
        'Repeat one final incline push',
      ],
    },
  ],
  focus: [
    {
      id: 'f1',
      name: 'Quiet Grid Route',
      distanceKm: 2.9,
      durationMin: 30,
      difficulty: 'Easy',
      start: 'Library Corner',
      waypoints: [
        'Follow the low-traffic side streets',
        'Turn left at the old clock tower',
        'Finish at the square garden path',
      ],
    },
    {
      id: 'f2',
      name: 'Canal Focus Track',
      distanceKm: 5,
      durationMin: 52,
      difficulty: 'Moderate',
      start: 'Canal South Dock',
      waypoints: [
        'Walk straight along the canal edge',
        'Cross at the second footbridge',
        'Return on the west-side path',
      ],
    },
  ],
};

const ROUTE_PATHS = {
  m1: [
    { latitude: 52.0908, longitude: 5.1214 },
    { latitude: 52.0916, longitude: 5.1231 },
    { latitude: 52.093, longitude: 5.1242 },
    { latitude: 52.094, longitude: 5.1224 },
  ],
  m2: [
    { latitude: 52.0897, longitude: 5.1168 },
    { latitude: 52.0907, longitude: 5.1184 },
    { latitude: 52.0919, longitude: 5.1198 },
    { latitude: 52.0932, longitude: 5.1189 },
  ],
  e1: [
    { latitude: 52.0845, longitude: 5.1241 },
    { latitude: 52.0857, longitude: 5.1264 },
    { latitude: 52.0879, longitude: 5.1273 },
    { latitude: 52.0894, longitude: 5.1255 },
  ],
  e2: [
    { latitude: 52.0952, longitude: 5.1102 },
    { latitude: 52.0963, longitude: 5.1119 },
    { latitude: 52.0978, longitude: 5.1133 },
    { latitude: 52.0991, longitude: 5.1116 },
  ],
  f1: [
    { latitude: 52.0811, longitude: 5.1195 },
    { latitude: 52.0826, longitude: 5.1204 },
    { latitude: 52.0837, longitude: 5.1222 },
    { latitude: 52.0849, longitude: 5.1211 },
  ],
  f2: [
    { latitude: 52.0789, longitude: 5.1141 },
    { latitude: 52.0803, longitude: 5.1168 },
    { latitude: 52.0824, longitude: 5.1179 },
    { latitude: 52.0843, longitude: 5.1159 },
  ],
};

const NAV_MUSIC_TRACKS = [
  { title: 'Quiet Steps', artist: 'Serapis Lab' },
  { title: 'Open Air Focus', artist: 'Nora Vale' },
  { title: 'Pace and Breathe', artist: 'Milo Rey' },
];

const WalkingRoutesScreen = ({ navigation }) => {
  const [step, setStep] = useState('types');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [gpsStep, setGpsStep] = useState(0);

  const routeOptions = useMemo(() => {
    if (!selectedType) {
      return [];
    }
    return ROUTES_BY_TYPE[selectedType] || [];
  }, [selectedType]);

  const selectedRoutePath = useMemo(() => {
    if (!selectedRoute) {
      return [];
    }
    return ROUTE_PATHS[selectedRoute.id] || [];
  }, [selectedRoute]);

  const leafletHtml = useMemo(() => {
    if (!selectedRoutePath.length) return null;
    const center = selectedRoutePath[0];
    const coords = JSON.stringify(selectedRoutePath.map(p => [p.latitude, p.longitude]));
    const startLabel = selectedRoute?.start || 'Start';
    const endLabel = selectedRoute?.name || 'Finish';
    return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false}).setView([${center.latitude},${center.longitude}],15);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:''}).addTo(map);
var coords=${coords};
L.polyline(coords,{color:'#2d6a4f',weight:5}).addTo(map);
L.marker(coords[0]).addTo(map).bindPopup('Start: ${startLabel}');
L.marker(coords[coords.length-1]).addTo(map).bindPopup('Finish: ${endLabel}');
map.fitBounds(coords,{padding:[30,30]});
<\/script>
</body></html>`;
  }, [selectedRoutePath, selectedRoute]);

  const startRoute = route => {
    setSelectedRoute(route);
    setGpsStep(0);
    setStep('gps');
  };

  const nextDirection = () => {
    if (!selectedRoute) {
      return;
    }
    const maxStep = selectedRoute.waypoints.length - 1;
    setGpsStep(prev => (prev >= maxStep ? prev : prev + 1));
  };

  const currentMusicTrack = NAV_MUSIC_TRACKS[gpsStep % NAV_MUSIC_TRACKS.length] || NAV_MUSIC_TRACKS[0];

  const openMusicPlayerFromWalk = () => {
    navigation?.navigate('MusicPlayer', {
      playlistId: 'p2',
      isWalkingSession: true,
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1b5e3f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Walking Routes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {step === 'gps' && selectedRoute ? (
        <View style={styles.gpsScreen}>
          <View style={styles.mapStage}>
            {leafletHtml ? (
              <WebView
                testID="walking-route-map"
                accessibilityLabel="Prototype route map"
                originWhitelist={['*']}
                source={{ html: leafletHtml }}
                style={styles.mapCanvas}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
              />
            ) : null}

            <View style={styles.gpsOverlayTopCard}>
              <Text style={styles.gpsModeLabel}>GPS Navigation Active</Text>
              <Text style={styles.gpsModeSubtitle}>{selectedRoute.name}</Text>

              <View style={styles.routeSummaryRow}>
                <Text style={styles.routeSummaryTitle}>Walking to: Kooistee</Text>
                <Text style={styles.routeSummaryMeta}>0.8km / {selectedRoute.distanceKm}km</Text>
              </View>

              <View style={styles.instructionCard}>
                <Ionicons name="arrow-back" size={18} color="#1f2937" />
                <View style={styles.instructionTextWrap}>
                  <Text style={styles.gpsInstructionLabel}>Next instruction</Text>
                  <Text style={styles.gpsInstruction}>In 200 meters - Go Left</Text>
                </View>
              </View>

              <Text style={styles.gpsProgress}>
                Step {gpsStep + 1} of {selectedRoute.waypoints.length}
              </Text>

              <TouchableOpacity
                style={styles.advanceButton}
                accessibilityRole="button"
                onPress={nextDirection}
              >
                <Text style={styles.startButtonText}>Advance to next waypoint</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.musicWidgetCard}
              accessibilityRole="button"
              accessibilityLabel="Open music player from walking widget"
              onPress={openMusicPlayerFromWalk}
            >
              <View style={styles.musicWidgetHeader}>
                <Text style={styles.musicWidgetTitle}>{currentMusicTrack.title}</Text>
                <Text style={styles.musicWidgetHint}>Tap to open</Text>
              </View>

              <Text style={styles.musicWidgetTrack}>{currentMusicTrack.artist}</Text>

              <View style={styles.musicProgressTrack}>
                <View style={styles.musicProgressFill} />
                <View style={styles.musicProgressThumb} />
              </View>

              <View style={styles.musicWidgetFooter}>
                <Text style={styles.musicWidgetStatus}>0:00</Text>
                <Text style={styles.musicWidgetStatus}>5:00</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.gpsMetaRow}>
            <Text style={styles.mapMeta}>Steps: 1200 / 5000</Text>
            <Text style={styles.mapMeta}>Time Active: 12m</Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryAction}
            accessibilityRole="button"
            onPress={() => setStep('routes')}
          >
            <Text style={styles.secondaryActionText}>Back to route list</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'types' ? (
          <>
            <Text style={styles.stepTitle}>Pick your route style</Text>
            <Text style={styles.stepSubtitle}>Choose what feels right for this walk.</Text>
            {ROUTE_TYPES.map(type => (
              <TouchableOpacity
                key={type.key}
                style={styles.typeCard}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedType(type.key);
                  setStep('routes');
                }}
              >
                <Ionicons name={type.icon} size={20} color="#2d6a4f" />
                <View style={styles.typeTextWrap}>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#52b788" />
              </TouchableOpacity>
            ))}
          </>
        ) : null}

          {step === 'routes' ? (
            <>
              <Text style={styles.stepTitle}>Suggested routes</Text>
              <Text style={styles.stepSubtitle}>Based on your selected route style.</Text>

              {routeOptions.map(route => (
                <View key={route.id} style={styles.routeCard}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeMeta}>
                    {route.distanceKm} km • {route.durationMin} min • {route.difficulty}
                  </Text>
                  <Text style={styles.routeStart}>Start: {route.start}</Text>

                  <TouchableOpacity
                    style={styles.startButton}
                    accessibilityRole="button"
                    onPress={() => startRoute(route)}
                  >
                    <Ionicons name="navigate" size={15} color="#fff" />
                    <Text style={styles.startButtonText}>Start route with GPS</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.secondaryAction}
                accessibilityRole="button"
                onPress={() => setStep('types')}
              >
                <Text style={styles.secondaryActionText}>Change route type</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d8f3dc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e3f',
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  gpsScreen: {
    flex: 1,
    padding: 16,
    paddingTop: 10,
    paddingBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#40916c',
    marginBottom: 10,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#edf7f0',
    borderWidth: 1,
    borderColor: '#d8f3dc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  typeTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b4332',
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#40916c',
    marginTop: 2,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8f3dc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
  },
  routeMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#40916c',
  },
  routeStart: {
    marginTop: 4,
    fontSize: 12,
    color: '#52b788',
  },
  startButton: {
    marginTop: 12,
    backgroundColor: '#2d6a4f',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  advanceButton: {
    marginTop: 10,
    backgroundColor: '#2d6a4f',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: '#2d6a4f',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  mapStage: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#dff3e6',
    marginBottom: 4,
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#dff3e6',
  },
  gpsOverlayTopCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  gpsModeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b4332',
    marginLeft: 4,
  },
  gpsModeSubtitle: {
    fontSize: 12,
    color: '#40916c',
    marginLeft: 4,
    marginBottom: 2,
  },
  routeSummaryRow: {
    backgroundColor: 'rgba(248, 250, 249, 0.95)',
    borderWidth: 1,
    borderColor: '#95d5b2',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1b4332',
  },
  routeSummaryMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1f2937',
  },
  instructionCard: {
    backgroundColor: 'rgba(248, 250, 249, 0.95)',
    borderWidth: 1,
    borderColor: '#95d5b2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  instructionTextWrap: {
    flex: 1,
  },
  gpsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gpsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2d6a4f',
    backgroundColor: '#d8f3dc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  gpsEta: {
    fontSize: 12,
    color: '#40916c',
    fontWeight: '600',
  },
  gpsInstructionLabel: {
    fontSize: 11,
    color: '#52b788',
    marginBottom: 4,
  },
  gpsInstruction: {
    fontSize: 20,
    color: '#1f2937',
    fontWeight: '700',
  },
  gpsProgress: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 2,
    marginLeft: 4,
  },
  musicWidgetCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#d8f3dc',
    borderRadius: 14,
    padding: 12,
  },
  musicWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  musicWidgetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b4332',
  },
  musicWidgetHint: {
    fontSize: 11,
    color: '#2d6a4f',
    backgroundColor: '#d8f3dc',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontWeight: '700',
  },
  musicWidgetPlaylist: {
    fontSize: 13,
    color: '#2d6a4f',
    fontWeight: '600',
  },
  musicWidgetTrack: {
    marginTop: 2,
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  musicProgressTrack: {
    marginTop: 10,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#b4c4bd',
    justifyContent: 'center',
  },
  musicProgressFill: {
    width: '33%',
    height: 4,
    borderRadius: 3,
    backgroundColor: '#1f2937',
  },
  musicProgressThumb: {
    position: 'absolute',
    left: '33%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1f2937',
  },
  musicWidgetFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  musicWidgetStatus: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  gpsMetaRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapMeta: {
    fontSize: 12,
    color: '#40916c',
    fontWeight: '600',
  },
});

export default WalkingRoutesScreen;
