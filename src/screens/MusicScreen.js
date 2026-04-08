import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PLAYLISTS } from '../data/musicData';

const MusicScreen = ({ navigation }) => {
  const openPlayer = playlistId => {
    navigation?.navigate('MusicPlayer', { playlistId });
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
        <Text style={styles.headerTitle}>Music</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Prototype Playlists</Text>
          <Text style={styles.heroTitle}>Choose a playlist</Text>
          <Text style={styles.heroSubtitle}>Selecting one opens the music player screen.</Text>
        </View>

        <Text style={styles.sectionTitle}>Playlists</Text>
        {PLAYLISTS.map(playlist => (
          <TouchableOpacity
            key={playlist.id}
            style={styles.playlistCard}
            accessibilityRole="button"
            accessibilityLabel={`Select playlist ${playlist.title}`}
            onPress={() => openPlayer(playlist.id)}
          >
            <View style={styles.playlistTopRow}>
              <Text style={styles.playlistTitle}>{playlist.title}</Text>
              <Text style={styles.playlistDuration}>{playlist.duration}</Text>
            </View>
            <Text style={styles.playlistMeta}>{playlist.mood} • {playlist.tracks.length} tracks</Text>
            <View style={styles.openPlayerRow}>
              <Text style={styles.openPlayerText}>Open music player</Text>
              <Ionicons name="chevron-forward" size={16} color="#2d6a4f" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingBottom: 22,
  },
  heroCard: {
    backgroundColor: '#2d6a4f',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#b7e4c7',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#d8f3dc',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 10,
  },
  playlistCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d8f3dc',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  playlistTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b4332',
  },
  playlistDuration: {
    fontSize: 12,
    color: '#40916c',
    fontWeight: '600',
  },
  playlistMeta: {
    fontSize: 12,
    color: '#40916c',
  },
  openPlayerRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openPlayerText: {
    fontSize: 12,
    color: '#2d6a4f',
    fontWeight: '600',
  },
});

export default MusicScreen;
