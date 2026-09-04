// Utils
import { FC, useEffect } from 'react';

// Components
import HomePageContainer from './container';

// Interfaces
import { useAppDispatch } from '../../store/store';
import { homeActions } from '../../store/slices/home';

interface HomeProps {
  container: React.RefObject<HTMLDivElement | null>;
}

const Home: FC<HomeProps> = (props) => {
  const { container } = props;

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(homeActions.fetchTopTracks());
    dispatch(homeActions.fetchMadeForYou());
    dispatch(homeActions.fetchRecommendedForToday());
    dispatch(homeActions.fetchNewReleases());
    dispatch(homeActions.fetchPodcasts());
    dispatch(homeActions.fetchRecentlyPlayed());
    dispatch(homeActions.fetchFollowedShows());
    dispatch(homeActions.fetchFollowedArtists());
    dispatch(homeActions.fetchFollowedArtistReleases());
    dispatch(homeActions.fecthFeaturedPlaylists());
  }, [dispatch]);

  return <HomePageContainer container={container} />;
};

export default Home;
