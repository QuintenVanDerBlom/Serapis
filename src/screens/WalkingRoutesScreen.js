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
      name: 'Het Park Serenity Loop',
      destination: 'Euromast viewpoint',
      distanceKm: 2.0,
      durationMin: 28,
      difficulty: 'Easy',
      start: 'Het Park, Westzeedijk',
      instructions: [
        'Enter Het Park from the Westzeedijk gate',
        'Follow the gravel path south past the pond',
        'Bear right toward the Euromast lawn',
        'Continue along the waterfront promenade',
        'Loop back north through the tree-lined avenue',
      ],
    },
    {
      id: 'm2',
      name: 'Kralingse Plas Waterside',
      destination: 'Kralingse Bos café',
      distanceKm: 3.1,
      durationMin: 40,
      difficulty: 'Easy',
      start: 'Kralingse Bos parking',
      instructions: [
        'Head south from the parking toward the lake shore',
        'Follow the waterside path along the western bank',
        'Continue past the rowing club and picnic meadow',
        'Turn north at the south-east corner of the lake',
        'Return along the eastern tree-lined path to the start',
      ],
    },
  ],
  energy: [
    {
      id: 'e1',
      name: 'Erasmusbrug Waterfront',
      destination: 'Leuvehaven marina',
      distanceKm: 3.5,
      durationMin: 35,
      difficulty: 'Moderate',
      start: 'Wilhelminaplein',
      instructions: [
        'Cross the Erasmusbrug heading north',
        'Turn left along the Boompjes waterfront',
        'Continue west past Willemsplein',
        'Turn south at Leuvehaven along the marina',
        'Cross back via the Erasmusbrug to Wilhelminaplein',
      ],
    },
    {
      id: 'e2',
      name: 'Zuiderpark Tempo Loop',
      destination: 'Zuiderpark sports fields',
      distanceKm: 3.0,
      durationMin: 30,
      difficulty: 'Moderate',
      start: 'Zuiderpark north entrance',
      instructions: [
        'Enter through the north gate and warm up on the straight path',
        'Pick up pace heading south past the central pond',
        'Turn east along the sports field perimeter',
        'Push through the northern loop at brisk tempo',
        'Cool down on the return path to the north entrance',
      ],
    },
  ],
  focus: [
    {
      id: 'f1',
      name: 'Oude Haven Heritage Walk',
      destination: 'Maritime Museum',
      distanceKm: 2.0,
      durationMin: 26,
      difficulty: 'Easy',
      start: 'Blaak Station',
      instructions: [
        'Walk south from Blaak past the Cube Houses',
        'Follow the Oude Haven quay along the old harbour',
        'Continue west along Wijnhaven toward Leuvehaven',
        'Turn south to the Maritime Museum entrance',
        'Return east via Wijnstraat back to Blaak',
      ],
    },
    {
      id: 'f2',
      name: 'Museumpark Cultural Circuit',
      destination: 'Coolsingel / Stadhuis',
      distanceKm: 2.5,
      durationMin: 32,
      difficulty: 'Easy',
      start: 'Museumpark entrance',
      instructions: [
        'Walk north through Museumpark past the Kunsthal',
        'Turn right onto Witte de Withstraat',
        'Continue north toward Coolsingel',
        'Walk along Coolsingel past the Stadhuis',
        'Return south through the side streets to Museumpark',
      ],
    },
  ],
};

const ROUTE_PATHS = {
  m1: [
    { latitude: 51.90555, longitude: 4.46620 },
    { latitude: 51.90500, longitude: 4.46650 },
    { latitude: 51.90440, longitude: 4.46630 },
    { latitude: 51.90380, longitude: 4.46680 },
    { latitude: 51.90340, longitude: 4.46750 },
    { latitude: 51.90300, longitude: 4.46830 },
    { latitude: 51.90280, longitude: 4.46920 },
    { latitude: 51.90310, longitude: 4.47000 },
    { latitude: 51.90370, longitude: 4.47050 },
    { latitude: 51.90430, longitude: 4.47020 },
    { latitude: 51.90480, longitude: 4.46950 },
    { latitude: 51.90520, longitude: 4.46870 },
    { latitude: 51.90540, longitude: 4.46780 },
    { latitude: 51.90555, longitude: 4.46700 },
    { latitude: 51.90555, longitude: 4.46620 },
  ],
  m2: [
    { latitude: 51.92300, longitude: 4.50800 },
    { latitude: 51.92250, longitude: 4.50850 },
    { latitude: 51.92180, longitude: 4.50900 },
    { latitude: 51.92100, longitude: 4.50950 },
    { latitude: 51.92020, longitude: 4.51000 },
    { latitude: 51.91950, longitude: 4.51050 },
    { latitude: 51.91900, longitude: 4.51120 },
    { latitude: 51.91880, longitude: 4.51220 },
    { latitude: 51.91900, longitude: 4.51320 },
    { latitude: 51.91950, longitude: 4.51380 },
    { latitude: 51.92020, longitude: 4.51350 },
    { latitude: 51.92100, longitude: 4.51280 },
    { latitude: 51.92180, longitude: 4.51200 },
    { latitude: 51.92250, longitude: 4.51100 },
    { latitude: 51.92280, longitude: 4.51000 },
    { latitude: 51.92300, longitude: 4.50900 },
    { latitude: 51.92300, longitude: 4.50800 },
  ],
  e1: [
    { latitude: 51.90700, longitude: 4.48800 },
    { latitude: 51.90750, longitude: 4.48850 },
    { latitude: 51.90850, longitude: 4.48870 },
    { latitude: 51.90950, longitude: 4.48880 },
    { latitude: 51.91050, longitude: 4.48870 },
    { latitude: 51.91120, longitude: 4.48820 },
    { latitude: 51.91180, longitude: 4.48750 },
    { latitude: 51.91220, longitude: 4.48650 },
    { latitude: 51.91260, longitude: 4.48550 },
    { latitude: 51.91280, longitude: 4.48450 },
    { latitude: 51.91250, longitude: 4.48350 },
    { latitude: 51.91180, longitude: 4.48300 },
    { latitude: 51.91100, longitude: 4.48350 },
    { latitude: 51.91020, longitude: 4.48420 },
    { latitude: 51.90950, longitude: 4.48500 },
    { latitude: 51.90880, longitude: 4.48580 },
    { latitude: 51.90820, longitude: 4.48660 },
    { latitude: 51.90760, longitude: 4.48730 },
    { latitude: 51.90700, longitude: 4.48800 },
  ],
  e2: [
    { latitude: 51.89200, longitude: 4.48400 },
    { latitude: 51.89150, longitude: 4.48450 },
    { latitude: 51.89080, longitude: 4.48500 },
    { latitude: 51.89000, longitude: 4.48550 },
    { latitude: 51.88920, longitude: 4.48600 },
    { latitude: 51.88850, longitude: 4.48650 },
    { latitude: 51.88800, longitude: 4.48720 },
    { latitude: 51.88780, longitude: 4.48820 },
    { latitude: 51.88800, longitude: 4.48920 },
    { latitude: 51.88870, longitude: 4.48980 },
    { latitude: 51.88950, longitude: 4.49020 },
    { latitude: 51.89030, longitude: 4.48980 },
    { latitude: 51.89100, longitude: 4.48920 },
    { latitude: 51.89150, longitude: 4.48850 },
    { latitude: 51.89180, longitude: 4.48750 },
    { latitude: 51.89200, longitude: 4.48650 },
    { latitude: 51.89200, longitude: 4.48500 },
    { latitude: 51.89200, longitude: 4.48400 },
  ],
  f1: [
    { latitude: 51.92000, longitude: 4.49000 },
    { latitude: 51.91950, longitude: 4.48950 },
    { latitude: 51.91900, longitude: 4.48900 },
    { latitude: 51.91850, longitude: 4.48850 },
    { latitude: 51.91800, longitude: 4.48800 },
    { latitude: 51.91750, longitude: 4.48750 },
    { latitude: 51.91700, longitude: 4.48700 },
    { latitude: 51.91680, longitude: 4.48600 },
    { latitude: 51.91720, longitude: 4.48520 },
    { latitude: 51.91780, longitude: 4.48480 },
    { latitude: 51.91840, longitude: 4.48520 },
    { latitude: 51.91880, longitude: 4.48600 },
    { latitude: 51.91920, longitude: 4.48700 },
    { latitude: 51.91950, longitude: 4.48800 },
    { latitude: 51.91980, longitude: 4.48900 },
    { latitude: 51.92000, longitude: 4.49000 },
  ],
  f2: [
    { latitude: 51.91450, longitude: 4.47400 },
    { latitude: 51.91500, longitude: 4.47500 },
    { latitude: 51.91550, longitude: 4.47600 },
    { latitude: 51.91620, longitude: 4.47700 },
    { latitude: 51.91700, longitude: 4.47800 },
    { latitude: 51.91780, longitude: 4.47850 },
    { latitude: 51.91860, longitude: 4.47900 },
    { latitude: 51.91940, longitude: 4.47950 },
    { latitude: 51.92020, longitude: 4.47920 },
    { latitude: 51.92080, longitude: 4.47850 },
    { latitude: 51.92060, longitude: 4.47750 },
    { latitude: 51.91980, longitude: 4.47680 },
    { latitude: 51.91900, longitude: 4.47620 },
    { latitude: 51.91800, longitude: 4.47560 },
    { latitude: 51.91700, longitude: 4.47500 },
    { latitude: 51.91600, longitude: 4.47450 },
    { latitude: 51.91500, longitude: 4.47420 },
    { latitude: 51.91450, longitude: 4.47400 },
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
    setStep('gps');
  };

  const currentMusicTrack = NAV_MUSIC_TRACKS[0];

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
                accessibilityLabel="Route map"
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
                <Text style={styles.routeSummaryTitle}>Walking to: {selectedRoute.destination}</Text>
                <Text style={styles.routeSummaryMeta}>{selectedRoute.distanceKm} km · ~{selectedRoute.durationMin} min</Text>
              </View>

              <View style={styles.instructionCard}>
                <Ionicons name="navigate" size={18} color="#2d6a4f" />
                <View style={styles.instructionTextWrap}>
                  <Text style={styles.gpsInstructionLabel}>Route directions</Text>
                  {selectedRoute.instructions.map((instr, idx) => (
                    <Text key={idx} style={styles.gpsInstruction}>
                      {idx + 1}. {instr}
                    </Text>
                  ))}
                </View>
              </View>
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
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    lineHeight: 20,
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
