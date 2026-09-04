// Components
import { Col, Row } from 'antd';
import { HomeHeader } from './header';
import { TopTracks } from '../components/topTracks';
import { MadeForYou } from '../components/madeForYou';
import { NewReleases } from '../components/newReleases';
import { FeaturePlaylists } from '../components/featurePlaylists';
import { PodcastsHome } from '../components/podcasts';
import { FollowingHome } from '../components/following';
import { RecommendedForToday } from '../components/recommendedForToday';

// Utils
import { FC, memo, useRef, useState } from 'react';
import { RecentlyPlayed } from '../components/recentlyPlayed';
import { useAppSelector } from '../../../store/store';

interface HomePageContainerProps {
  container: React.RefObject<HTMLDivElement | null>;
}

const HomePageContainer: FC<HomePageContainerProps> = memo((props) => {
  const { container } = props;
  const [color, setColor] = useState('rgb(66, 32, 35)');
  const section = useAppSelector((state) => state.home.section);
  const following = useAppSelector((state) => state.home.following);

  const sectionContainerRef = useRef<HTMLDivElement>(null);
  const showMusic = !following && (section === 'ALL' || section === 'MUSIC');

  return (
    <div ref={sectionContainerRef}>
      <HomeHeader color={color} container={container} sectionContainer={sectionContainerRef} />
      <div
        className='Home-seccion'
        style={{
          paddingTop: 50,
          transition: 'background: 5s',
          background: `linear-gradient(180deg, ${color} 2%, rgb(18, 18, 18) 18%)`,
        }}
      >
        <Row gutter={[16, 16]}>
          {showMusic ? (
            <>
              <Col span={24}>
                <TopTracks setColor={setColor} />
              </Col>

              <Col span={24}>
                <RecentlyPlayed />
              </Col>

              <Col span={24}>
                <NewReleases />
              </Col>

              <Col span={24}>
                <FeaturePlaylists />
              </Col>

              <Col span={24}>
                <MadeForYou />
              </Col>

              <Col span={24}>
                <RecommendedForToday />
              </Col>
            </>
          ) : null}

          {section === 'PODCASTS' && !following ? (
            <Col span={24}>
              <PodcastsHome />
            </Col>
          ) : null}

          {following ? (
            <Col span={24}>
              <FollowingHome />
            </Col>
          ) : null}
        </Row>
      </div>
    </div>
  );
});

export default HomePageContainer;
