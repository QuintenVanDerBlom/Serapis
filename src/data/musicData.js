export const PLAYLISTS = [
  {
    id: 'p1',
    title: 'Mindful Morning',
    mood: 'Calm',
    duration: '42 min',
    tracks: [
      { id: 't1', title: 'Quiet Start', artist: 'Serapis Lab', length: '3:12' },
      { id: 't2', title: 'Soft Breathing', artist: 'Nora Vale', length: '4:06' },
      { id: 't3', title: 'Sunrise Focus', artist: 'A. Rowan', length: '3:45' },
    ],
  },
  {
    id: 'p2',
    title: 'Urban Flow Walk',
    mood: 'Energetic',
    duration: '36 min',
    tracks: [
      { id: 't4', title: 'Stride One', artist: 'Pulse Harbor', length: '2:58' },
      { id: 't5', title: 'City Rhythm', artist: 'Milo Rey', length: '3:21' },
      { id: 't6', title: 'Momentum Lane', artist: 'Sana K', length: '4:13' },
    ],
  },
  {
    id: 'p3',
    title: 'Evening Reset',
    mood: 'Wind-down',
    duration: '48 min',
    tracks: [
      { id: 't7', title: 'Slow Horizon', artist: 'Lumen Day', length: '4:32' },
      { id: 't8', title: 'Grounded', artist: 'Hale & North', length: '3:50' },
      { id: 't9', title: 'Quiet Close', artist: 'Serapis Lab', length: '4:01' },
    ],
  },
];

export const getPlaylistById = playlistId => {
  return PLAYLISTS.find(item => item.id === playlistId) || PLAYLISTS[0];
};
