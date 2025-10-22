export const DEFAULT_FEATURE_FLAGS = [
  {
    flag: 'REPORTS_MODULE',
    description: 'Module for generating reports.',
    released: false,
  },
  {
    flag: 'HISTORY_MODULE',
    description:
      'Module that displays a chronological history of user actions, updates, and system events.',
    released: false,
  },
  {
    flag: 'CHATS_MODULE',
    description:
      'Interactive chat module that allows users to ask questions about the university and receive automated or real-time assistance through AI.',
    released: false,
  },
  {
    flag: 'MEMBERS_MANAGEMENT',
    description:
      'Module for managing university members, including member information and role assignment.',
    released: false,
  },
  {
    flag: 'WEBHOOKS_MODULE',
    description:
      'Module for configuring webhooks to send selected application events to external services.',
    released: false,
  },
  {
    flag: 'INTEGRATIONS_MODULE',
    description:
      'Module that enables integration of the university with third-party platforms.',
    released: false,
  },
  {
    flag: 'TWO_FACTOR_AUTH',
    description:
      'Security module that allows enabling two-factor authentication (2FA) during login.',
    released: false,
  },
] as const;
