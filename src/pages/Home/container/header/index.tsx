import { FC, memo } from 'react';
import Chip from '../../../../components/Chip';
import { PageHeader } from '../../../../components/Layout/components/Header';

// Utils
import { useTranslation } from 'react-i18next';

// Redux
import { homeActions } from '../../../../store/slices/home';
import { useAppDispatch, useAppSelector } from '../../../../store/store';

interface HomeHeaderProps {
  color: string;
  container: React.RefObject<HTMLDivElement | null>;
  sectionContainer: React.RefObject<HTMLDivElement | null>;
}

const ChipsSection = memo(() => {
  const dispatch = useAppDispatch();
  const [t] = useTranslation(['home']);
  const section = useAppSelector((state) => state.home.section);
  const following = useAppSelector((state) => state.home.following);

  return (
    <div className='home-filter-chips'>
      <Chip
        text={t('ALL')}
        active={!following && section === 'ALL'}
        onClick={() => dispatch(homeActions.setSection('ALL'))}
      />

      {section === 'MUSIC' ? (
        <div className={`home-filter-chip-group ${following ? 'is-following' : ''}`}>
          <Chip
            className='home-filter-chip-group__primary'
            text={t('MUSIC')}
            active
            onClick={() => dispatch(homeActions.setSection('MUSIC'))}
          />
          <Chip
            className='home-filter-chip-group__secondary'
            text={t('FOLLOWING')}
            active={following}
            onClick={() => dispatch(homeActions.setFollowing())}
          />
        </div>
      ) : (
        <Chip text={t('MUSIC')} active={false} onClick={() => dispatch(homeActions.setSection('MUSIC'))} />
      )}

      {section === 'PODCASTS' ? (
        <div className={`home-filter-chip-group ${following ? 'is-following' : ''}`}>
          <Chip
            className='home-filter-chip-group__primary'
            text={t('PODCASTS')}
            active
            onClick={() => dispatch(homeActions.setSection('PODCASTS'))}
          />
          <Chip
            className='home-filter-chip-group__secondary'
            text={t('FOLLOWING')}
            active={following}
            onClick={() => dispatch(homeActions.setFollowing())}
          />
        </div>
      ) : (
        <Chip
          text={t('PODCASTS')}
          active={false}
          onClick={() => dispatch(homeActions.setSection('PODCASTS'))}
        />
      )}
    </div>
  );
});

export const HomeHeader: FC<HomeHeaderProps> = (props) => {
  const { container, sectionContainer, color } = props;

  return (
    <PageHeader
      color={color}
      activeHeider={20}
      container={container}
      sectionContainer={sectionContainer}
    >
      <ChipsSection />
    </PageHeader>
  );
};
