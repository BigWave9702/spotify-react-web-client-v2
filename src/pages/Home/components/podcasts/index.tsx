import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PlayCircle } from '../../../../components/Lists/PlayCircle';
import { useAppSelector } from '../../../../store/store';
import type { Episode } from '../../../../interfaces/episode';
import type { Show } from '../../../../services/search';

const formatEpisodeMeta = (episode: Episode) => {
  const releaseDate = episode.release_date
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
        new Date(episode.release_date)
      )
    : '';
  const minutes = Math.max(1, Math.round(episode.duration_ms / 60000));

  return [releaseDate, `${minutes} min`].filter(Boolean).join(' • ');
};

const PodcastEpisodeCard = ({ episode, accent }: { episode: Episode; accent: string }) => {
  return (
    <article className='podcast-feature-card' style={{ '--podcast-accent': accent } as any}>
      <div className='podcast-feature-card__copy'>
        <h3>{episode.name}</h3>
        <p>
          Episode
          {episode.show?.name ? ` • ${episode.show.name}` : ''}
        </p>
      </div>

      {episode.images[0]?.url ? (
        <img src={episode.images[0].url} alt={episode.name} className='podcast-feature-card__art' />
      ) : null}

      <div className='podcast-feature-card__bottom'>
        <span>{formatEpisodeMeta(episode)}</span>
        <PlayCircle big size={22} context={{ uris: [episode.uri] }} />
      </div>
    </article>
  );
};

const PodcastShowCard = ({ show }: { show: Show }) => {
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

export const PodcastsHome = memo(() => {
  const { t } = useTranslation(['home']);
  const episodes = useAppSelector((state) => state.home.podcastEpisodes);
  const shows = useAppSelector((state) => state.home.podcastShows);

  const primaryEpisode = episodes[0];
  const secondaryEpisode = episodes[1];

  if (!primaryEpisode && !shows.length) {
    return (
      <div className='home-empty-state'>
        <h2>{t('No podcasts found')}</h2>
        <p>{t('Try again later or search for your favorite show.')}</p>
      </div>
    );
  }

  return (
    <div className='podcasts-home'>
      <section>
        <h2>{t('Similar to your interests')}</h2>
        {primaryEpisode ? (
          <PodcastEpisodeCard episode={primaryEpisode} accent='#9b2338' />
        ) : shows[0] ? (
          <PodcastShowCard show={shows[0]} />
        ) : null}
      </section>

      <section>
        <h2>{t('Episodes you might like')}</h2>
        {secondaryEpisode ? (
          <PodcastEpisodeCard episode={secondaryEpisode} accent='#006616' />
        ) : shows[1] ? (
          <PodcastShowCard show={shows[1]} />
        ) : null}
      </section>

      {shows.length ? (
        <section className='podcasts-home__shows'>
          <h2>{t('Shows to follow')}</h2>
          <div>
            {shows.slice(0, 4).map((show) => (
              <PodcastShowCard show={show} key={show.id} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
});

PodcastsHome.displayName = 'PodcastsHome';
