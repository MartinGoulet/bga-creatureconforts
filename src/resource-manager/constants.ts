const GOODS = ['wood', 'stone', 'fruit', 'mushroom', 'yarn', 'grain'] as const;
const ICONS = [...GOODS, 'lesson', 'story', 'coin', 'card'] as const;

type GoodsType = 'wood' | 'stone' | 'fruit' | 'mushroom' | 'yarn' | 'grain';
type IconsType = GoodsType | 'lesson' | 'story' | 'coin' | 'card';
