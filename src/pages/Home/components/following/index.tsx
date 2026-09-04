import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { GridItemList } from '../../../../components/Lists/list';
import { useAppSelector } from '../../../../store/store';
import type { Show } from '../../../../services/search';

const FollowedShowCard = ({ show }: { show: Show }) => {
  return (
    <a
      className='podcast-show-card'
      href={show.external_urls.spotify}
      target='_blank'
      rel='noreferrer'
    >
      {show.images[0]?.url ? (
        <img src={show.images[0].url} alt={show.name} className='podcast-show-card__art' />
      ) : null}
      <div>
        <h3>{show.name}</h3>
        <p>
          <span>Podcast</span>
          {show.publisher ? ` • ${show.publisher}` : ''}
        </p>
      </div>
    </a>
  );
};

export const FollowingHome = memo(() => {
  const { t } = useTranslation(['home']);
  const section = useAppSelector((state) => state.home.section);
  const releases = useAppSelector((state) => state.home.followedArtistReleases);
  const shows = useAppSelector((state) => state.home.followedShows);

  if (section === 'PODCASTS') {
    if (!shows.length) {
      return (
        <div className='home-empty-state'>
          <h2>{t('No followed podcasts yet')}</h2>
          <p>{t('Podcasts you save will appear here.')}</p>
        </div>
      );
    }

    return (
      <div className='podcasts-home podcasts-home--following'>
        <section className='podcasts-home__shows'>
          <h2>{t('Podcasts you follow')}</h2>
          <div>
            {shows.map((show) => (
              <FollowedShowCard show={show} key={show.id} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!releases.length) {
    return (
      <div className='home-empty-state'>
        <h2>{t('No latest releases yet')}</h2>
        <p>{t('New releases from artists you follow will appear here.')}</p>
      </div>
    );
  }

  return (
    <div className='home'>
      <GridItemList title={t('Latest releases')} items={releases} multipleRows />
    </div>
  );
});

FollowingHome.displayName = 'FollowingHome';
