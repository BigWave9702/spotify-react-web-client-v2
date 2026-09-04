import { memo, type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { GridItemList } from '../../../../components/Lists/list';
import { useAppSelector } from '../../../../store/store';
import { getItemDescription } from '../../../../utils/getDescription';

interface RecommendedForTodayProps {}

export const RecommendedForToday: FC<RecommendedForTodayProps> = memo(() => {
  const { t } = useTranslation(['home']);
  const recommendedForToday = useAppSelector((state) => state.home.recommendedForToday);

  if (!recommendedForToday.length) return null;

  return (
    <div className='home'>
      <GridItemList
        title={t('Recommended for today')}
        subtitle={t('Inspired by your recent activity')}
        items={recommendedForToday}
        getDescription={getItemDescription}
      />
    </div>
  );
});

RecommendedForToday.displayName = 'RecommendedForToday';
