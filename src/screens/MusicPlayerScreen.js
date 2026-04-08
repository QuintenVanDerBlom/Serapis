import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPlaylistById } from '../data/musicData';

const ARTWORK_SIZE = Math.min(Dimensions.get('window').width - 32, 380);

const MusicPlayerScreen = ({ navigation, route }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playlistId = route?.params?.playlistId;
  const isWalkingSession = Boolean(route?.params?.isWalkingSession);

  const selectedPlaylist = useMemo(() => getPlaylistById(playlistId), [playlistId]);
  const currentTrack = selectedPlaylist.tracks[trackIndex] || selectedPlaylist.tracks[0];

  const nextTrack = () => {
    setTrackIndex(prev => (prev + 1 >= selectedPlaylist.tracks.length ? 0 : prev + 1));
  };

  const previousTrack = () => {
    setTrackIndex(prev => (prev - 1 < 0 ? selectedPlaylist.tracks.length - 1 : prev - 1));
  };

  const backToWalkingRoute = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation?.navigate('WalkingRoutes');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Music Player</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {isWalkingSession ? (
          <TouchableOpacity
            style={styles.walkingRouteCard}
            accessibilityRole="button"
            accessibilityLabel="Back to active walking route"
            onPress={backToWalkingRoute}
          >
            <View style={styles.walkingRouteTopRow}>
              <Text style={styles.walkingRouteTitle}>Park Walk</Text>
              <Text style={styles.walkingRouteDistance}>0.8km / 5.0km</Text>
            </View>
            <View style={styles.walkingRouteBottomRow}>
              <Text style={styles.walkingRouteInstruction}>In 200 meters - Go Left</Text>
              <Ionicons name="chevron-forward" size={16} color="#4b5563" />
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.playerMain}>
          <View style={[styles.albumCard, { width: ARTWORK_SIZE, height: ARTWORK_SIZE }]}>
            <Ionicons name="image-outline" size={58} color="#9ca3af" />
            <Text style={styles.placeholderLabel}>Placeholder Cover</Text>
          </View>

          <View style={styles.trackHeaderRow}>
            <View style={styles.trackTextWrap}>
              <Text style={styles.playlistLabel}>{selectedPlaylist.title}</Text>
              <Text style={styles.trackTitle}>{currentTrack.title}</Text>
              <Text style={styles.trackMeta}>{currentTrack.artist}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Like track" style={styles.favoriteButton}>
              <Ionicons name="heart" size={22} color="#1db954" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
              <View style={styles.progressThumb} />
            </View>
            <View style={styles.progressTimeRow}>
              <Text style={styles.progressTime}>1:12</Text>
              <Text style={styles.progressTime}>3:01</Text>
            </View>
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Seek backward 10 seconds">
              <Ionicons name="play-back" size={18} color="#4b5563" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Previous track"
              onPress={previousTrack}
            >
              <Ionicons name="play-skip-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playButton}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause track' : 'Play track'}
              onPress={() => setIsPlaying(prev => !prev)}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#f8fafc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Next track"
              onPress={nextTrack}
            >
              <Ionicons name="play-skip-forward" size={24} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Seek forward 10 seconds">
              <Ionicons name="play-forward" size={18} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <Text style={styles.playerStatus}>{isPlaying ? 'Playing now' : 'Paused'} • Serapis</Text>
        </View>
      </View>
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
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  walkingRouteCard: {
    backgroundColor: '#edf7f0',
    borderWidth: 1,
    borderColor: '#cce3d5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  walkingRouteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  walkingRouteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
  },
  walkingRouteDistance: {
    fontSize: 13,
    color: '#40916c',
    fontWeight: '600',
  },
  walkingRouteBottomRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walkingRouteInstruction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  playerMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumCard: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLabel: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
  },
  trackHeaderRow: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  playlistLabel: {
    fontSize: 12,
    color: '#2d6a4f',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trackTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937',
  },
  trackMeta: {
    marginTop: 3,
    fontSize: 19,
    color: '#4b5563',
    fontWeight: '500',
  },
  favoriteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    marginTop: 18,
    width: '100%',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
  },
  progressFill: {
    width: '38%',
    height: 5,
    borderRadius: 3,
    backgroundColor: '#1f2937',
  },
  progressThumb: {
    position: 'absolute',
    left: '38%',
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1f2937',
  },
  progressTimeRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTime: {
    fontSize: 12,
    color: '#4b5563',
  },
  controlsRow: {
    marginTop: 18,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerStatus: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#40916c',
    fontWeight: '600',
  },
});

export default MusicPlayerScreen;
