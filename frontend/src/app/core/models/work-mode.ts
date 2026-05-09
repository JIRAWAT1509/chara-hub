export const WORK_MODES = ['CHARA', 'CHARA_WORK', 'CHARA_RUSHING'] as const;

export type WorkMode = (typeof WORK_MODES)[number];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  CHARA: 'Chara',
  CHARA_WORK: 'Chara-Work',
  CHARA_RUSHING: 'Chara-Rushing'
};

export const WORK_MODE_DESCRIPTIONS: Record<WorkMode, string> = {
  CHARA: 'Casual and general usage',
  CHARA_WORK: 'Serious coding, debugging, architecture, and logical work',
  CHARA_RUSHING: 'Urgent or deadline-sensitive work'
};

