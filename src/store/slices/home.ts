import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Services
import { userService } from '../../services/users';
import { albumsService } from '../../services/albums';
import { artistService } from '../../services/artist';
import { playerService } from '../../services/player';
import { playlistService } from '../../services/playlists';

// Interfaces
import type { Track } from '../../interfaces/track';
import type { Album } from '../../interfaces/albums';
import type { Artist } from '../../interfaces/artist';
import type { Playlist } from '../../interfaces/playlists';
import { querySearch, type Show } from '../../services/search';
import type { Episode } from '../../interfaces/episode';

// Utils
import { groupBy, uniq, uniqBy } from 'lodash';

const initialState: {
  topTracks: Track[];
  newReleases: Album[];
  followedArtistReleases: Album[];
  madeForYou: Playlist[];
  recommendedForToday: (Album | Playlist)[];
  featurePlaylists: Playlist[];
  followedArtists: Artist[];
  followedShows: Show[];
  podcastEpisodes: Episode[];
  podcastShows: Show[];
  recentlyPlayed: (Track | Artist | Album)[];
  section: 'ALL' | 'MUSIC' | 'PODCASTS';
  following: boolean;
} = {
  topTracks: [],
  section: 'ALL',
  following: false,
  madeForYou: [],
  recommendedForToday: [],
  newReleases: [],
  followedArtistReleases: [],
  recentlyPlayed: [],
  followedArtists: [],
  followedShows: [],
  podcastEpisodes: [],
  podcastShows: [],
  featurePlaylists: [],
};

const isPlaylist = (playlist: Playlist | null | undefined): playlist is Playlist =>
  Boolean(playlist?.id && playlist?.name);

const fetchPlaylistSearchFallback = async (queries: string[], limit = 12) => {
  const responses = await Promise.all(
    queries.map((query) =>
      querySearch({
        q: query,
        type: 'playlist',
        limit: 10,
        market: 'from_token',
      }).catch(() => null)
    )
  );

  return uniqBy(
    responses.flatMap((response) => response?.data.playlists?.items ?? []).filter(isPlaylist),
    'id'
  ).slice(0, limit);
};

export const fetchMadeForYou = createAsyncThunk('home/fetchMadeForYou', async () => {
  const personalizedNames = [
    'daily mix',
    'discover weekly',
    'release radar',
    'on repeat',
    'repeat rewind',
    'daylist',
    'your top songs',
  ];

  const getPersonalizedPlaylists = (playlists: (Playlist | null | undefined)[]) =>
    playlists.filter(isPlaylist).filter((playlist) => {
      const name = playlist.name.toLowerCase();
      return personalizedNames.some((keyword) => name.includes(keyword));
    });

  try {
    const response = await playlistService.getMyPlaylists({ limit: 50 });
    const playlists = getPersonalizedPlaylists(response.data.items);

    if (playlists.length) {
      return playlists;
    }
  } catch (error) {
    console.log(error);
  }

  return fetchPlaylistSearchFallback([
    'daily mix',
    'discover weekly',
    'release radar',
    'on repeat',
    'made for you',
  ]);
});

export const fetchNewReleases = createAsyncThunk('home/fetchNewReleases', async () => {
  const response = await albumsService.fetchNewRelases({ limit: 10 });
  return response.data.albums.items;
});

export const fetchTopTracks = createAsyncThunk('home/fetchTopTracks', async () => {
  const response = await userService.fetchTopTracks({ limit: 8, timeRange: 'short_term' });
  return response.data.items;
});

export const fetchRecentlyPlayed = createAsyncThunk('home/fetchRecentlyPlayed', async () => {
  try {
    const response = await playerService.getRecentlyPlayed({ limit: 50 });

    const items = response.items;

    const groupedItems = groupBy(
      items.filter((item) => ['artist', 'playlist', 'album'].includes(item.context?.type)),
      (item) => item.context.type
    );

    const artistsTracks = groupedItems['artist'] || [];
    const albumsTracks = groupedItems['album'] || [];

    const artistsIds = uniq(artistsTracks.map((item) => item.context.uri.split(':')[2]));
    const albumsIds = uniq(albumsTracks.map((item) => item.context.uri.split(':')[2]));

    const promises = [
      artistsIds.length
        ? artistService.fetchArtists(artistsIds)
        : Promise.resolve({ data: { artists: [] } }),
      albumsIds.length
        ? albumsService.fetchAlbums(albumsIds)
        : Promise.resolve({ data: { albums: [] } }),
    ];

    const [artistsResponse, albumsResponse] = await Promise.all(promises);

    // @ts-ignore
    const artists: Artist[] = artistsResponse.data.artists;

    // @ts-ignore
    const albums: Album[] = albumsResponse.data.albums;

    const tracks = items.map((item) => {
      if (item.context?.type === 'artist') {
        return artists.find((artist) => artist.id === item.context.uri.split(':')[2])!;
      }

      if (item.context?.type === 'album') {
        return albums.find((album) => album.id === item.context.uri.split(':')[2])!;
      }

      return item.track;
    });

    return uniqBy(tracks, 'id');
  } catch (error) {
    console.log(error);
    return [];
  }
});

export const fetchRecommendedForToday = createAsyncThunk(
  'home/fetchRecommendedForToday',
  async () => {
    try {
      const [
        recentlyPlayedResponse,
        savedAlbumsResponse,
        myPlaylistsResponse,
        searchPlaylists,
      ] = await Promise.all([
        playerService.getRecentlyPlayed({ limit: 50 }).catch(() => ({ items: [] })),
        albumsService.fetchSavedAlbums({ limit: 20 }).catch(() => ({
          data: { items: [] },
        })),
        playlistService.getMyPlaylists({ limit: 50 }).catch(() => ({ data: { items: [] } })),
        fetchPlaylistSearchFallback(['today top hits', 'popular playlists', 'fresh finds']),
      ]);

      const recentItems = recentlyPlayedResponse.items;
      const recentAlbums = recentItems.map((item) => item.track.album);
      const recentPlaylistIds = uniq(
        recentItems
          .filter((item) => item.context?.type === 'playlist')
          .map((item) => item.context.uri.split(':')[2])
          .filter(Boolean)
      );

      const recentPlaylistResponses = await Promise.all(
        recentPlaylistIds
          .slice(0, 8)
          .map((playlistId) => playlistService.getPlaylist(playlistId).catch(() => null))
      );

      const contextPlaylists = recentPlaylistResponses
        .map((response) => response?.data)
        .filter(Boolean) as Playlist[];

      const savedAlbums = savedAlbumsResponse.data.items.map((item) => item.album);
      const libraryPlaylists = myPlaylistsResponse.data.items.filter(isPlaylist).filter((playlist) => {
        const name = playlist.name.toLowerCase();
        return !['daily mix', 'discover weekly', 'release radar', 'on repeat'].some((keyword) =>
          name.includes(keyword)
        );
      });
      return uniqBy(
        [
          ...recentAlbums,
          ...contextPlaylists,
          ...savedAlbums,
          ...libraryPlaylists,
          ...searchPlaylists,
        ],
        'id'
      ).slice(0, 12);
    } catch (error) {
      console.log(error);
      return [];
    }
  }
);

export const fetchFollowedArtists = createAsyncThunk('home/fetchFollowedArtists', async () => {
  const response = await userService.fetchFollowedArtists({ limit: 20 });
  return response.data.artists.items;
});

export const fetchFollowedArtistReleases = createAsyncThunk(
  'home/fetchFollowedArtistReleases',
  async () => {
    try {
      const artistsResponse = await userService.fetchFollowedArtists({ limit: 10 });
      const artists = artistsResponse.data.artists.items;
      const releaseResponses = await Promise.all(
        artists.map((artist) =>
          artistService
            .fetchArtistAlbums(artist.id, {
              include_groups: 'album,single',
              limit: 3,
              market: 'from_token',
            })
            .catch(() => ({ data: { items: [] } }))
        )
      );

      return uniqBy(
        releaseResponses
          .flatMap((response) => response.data.items as Album[])
          .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()),
        'id'
      ).slice(0, 12);
    } catch (error) {
      console.log(error);
      return [];
    }
  }
);

export const fetchFollowedShows = createAsyncThunk('home/fetchFollowedShows', async () => {
  try {
    const response = await userService.fetchSavedShows({ limit: 20 });
    return response.data.items.map((item) => item.show);
  } catch (error) {
    console.log(error);
    return [];
  }
});

export const fetchPodcasts = createAsyncThunk('home/fetchPodcasts', async () => {
  try {
    const response = await querySearch({
      q: 'podcast',
      type: 'episode,show',
      limit: 10,
      market: 'from_token',
    });

    return {
      episodes: response.data.episodes?.items ?? [],
      shows: response.data.shows?.items ?? [],
    };
  } catch (error) {
    console.log(error);
    return {
      episodes: [],
      shows: [],
    };
  }
});

export const fecthFeaturedPlaylists = createAsyncThunk(
  'home/fecthFeaturedPlaylists',
  async () => {
    return fetchPlaylistSearchFallback([
      'today top hits',
      'popular playlists',
      'viral hits',
      'fresh finds',
    ]);
  }
);

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setSection(state, action: PayloadAction<'ALL' | 'MUSIC' | 'PODCASTS'>) {
      state.section = action.payload;
      state.following = false;
    },
    setFollowing(state) {
      if (state.section === 'ALL') {
        state.section = 'MUSIC';
      }
      state.following = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNewReleases.fulfilled, (state, action) => {
      state.newReleases = action.payload as any as any[];
    });
    builder.addCase(fetchTopTracks.fulfilled, (state, action) => {
      state.topTracks = action.payload;
    });
    builder.addCase(fecthFeaturedPlaylists.fulfilled, (state, action) => {
      state.featurePlaylists = action.payload;
    });
    builder.addCase(fetchMadeForYou.fulfilled, (state, action) => {
      state.madeForYou = action.payload;
    });
    builder.addCase(fetchRecommendedForToday.fulfilled, (state, action) => {
      state.recommendedForToday = action.payload;
    });
    builder.addCase(fetchRecentlyPlayed.fulfilled, (state, action) => {
      state.recentlyPlayed = action.payload;
    });
    builder.addCase(fetchFollowedArtists.fulfilled, (state, action) => {
      state.followedArtists = action.payload;
    });
    builder.addCase(fetchFollowedArtistReleases.fulfilled, (state, action) => {
      state.followedArtistReleases = action.payload;
    });
    builder.addCase(fetchFollowedShows.fulfilled, (state, action) => {
      state.followedShows = action.payload;
    });
    builder.addCase(fetchPodcasts.fulfilled, (state, action) => {
      state.podcastEpisodes = action.payload.episodes;
      state.podcastShows = action.payload.shows;
    });
  },
});

export const homeActions = {
  ...homeSlice.actions,
  fetchTopTracks,
  fetchMadeForYou,
  fetchRecommendedForToday,
  fetchNewReleases,
  fetchPodcasts,
  fetchRecentlyPlayed,
  fetchFollowedShows,
  fetchFollowedArtists,
  fetchFollowedArtistReleases,
  fecthFeaturedPlaylists,
};

export default homeSlice.reducer;
