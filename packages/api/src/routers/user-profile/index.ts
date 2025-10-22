import type {
  GivingInspirationEnum,
  GivingTypesEnum,
  ImportantCausesEnum,
  RacialEthnicBackgroundEnum,
  RecognitionPreferencesEnum,
} from '@meltstudio/types';

import { ctx } from '@/api/context';
import { db } from '@/api/db';

import { userProfileApiDef } from './def';

export const userProfileRouter = ctx.router(userProfileApiDef);

userProfileRouter.post('/', async (req, res) => {
  if (!req.body.universityId) {
    return res.status(400).json({ error: 'universityId is required' });
  }

  const university = await db.university.findUniqueByPkAdmin(
    req.body.universityId,
    false
  );

  if (!university) {
    return res.status(400).json({ error: 'University not found' });
  }

  const userCount = await db.user.count({ isSuperAdmin: false });

  const numericId = String(userCount + 1).padStart(3, '0');

  const legacyLinkId = `${university.referenceCode}-A${numericId}`;

  const {
    givingInspiration,
    importantCauses,
    givingTypes,
    racialEthnicBackground,
    recognitionPreferences,
    universityId,
    lifetimeGiving,
    ...restBody
  } = req.body;

  await db.userProfile.create({
    data: {
      ...restBody,
      legacyLinkId,
      lifetimeGiving: lifetimeGiving != null ? String(lifetimeGiving) : null,
      givingInspiration: givingInspiration as GivingInspirationEnum[] | null,
      importantCauses: importantCauses as ImportantCausesEnum[] | null,
      givingTypes: givingTypes as GivingTypesEnum[] | null,
      racialEthnicBackground: racialEthnicBackground as
        | RacialEthnicBackgroundEnum[]
        | null,
      recognitionPreferences: recognitionPreferences as
        | RecognitionPreferencesEnum[]
        | null,
    },
  });

  return res.status(201).json({ status: true });
});

userProfileRouter.get('/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await db.userProfile.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({
      error: 'An unexpected error occurred while retrieving the user profile',
    });
  }
});

userProfileRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const existingProfile = await db.userProfile.findByUserId(userId);

    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const updateData = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No data provided to update' });
    }

    const {
      givingInspiration,
      importantCauses,
      givingTypes,
      racialEthnicBackground,
      recognitionPreferences,
      lifetimeGiving,
      ...restData
    } = updateData;

    const processedData = {
      ...restData,
      ...(givingInspiration !== undefined && {
        givingInspiration:
          Array.isArray(givingInspiration) && givingInspiration.length > 0
            ? (givingInspiration as GivingInspirationEnum[])
            : null,
      }),
      ...(importantCauses !== undefined && {
        importantCauses:
          Array.isArray(importantCauses) && importantCauses.length > 0
            ? (importantCauses as ImportantCausesEnum[])
            : null,
      }),
      ...(givingTypes !== undefined && {
        givingTypes:
          Array.isArray(givingTypes) && givingTypes.length > 0
            ? (givingTypes as GivingTypesEnum[])
            : null,
      }),
      ...(racialEthnicBackground !== undefined && {
        racialEthnicBackground:
          Array.isArray(racialEthnicBackground) &&
          racialEthnicBackground.length > 0
            ? (racialEthnicBackground as RacialEthnicBackgroundEnum[])
            : null,
      }),
      ...(recognitionPreferences !== undefined && {
        recognitionPreferences:
          Array.isArray(recognitionPreferences) &&
          recognitionPreferences.length > 0
            ? (recognitionPreferences as RecognitionPreferencesEnum[])
            : null,
      }),
      ...(lifetimeGiving !== undefined && {
        lifetimeGiving: lifetimeGiving != null ? String(lifetimeGiving) : null,
      }),
    };

    const updatedProfile = await db.userProfile.update({
      pk: existingProfile.id,
      data: processedData,
    });

    return res.status(200).json({
      status: true,
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'An unexpected error occurred while updating the profile',
    });
  }
});
