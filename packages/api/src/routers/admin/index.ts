import type { DbModelMap } from '@meltstudio/db/src/models/db';
import { logger } from '@meltstudio/logger';
import { hashPassword } from '@meltstudio/server-common';
import type { RowEmbeddingData } from '@meltstudio/types';
import { PledgeStatusEnum, UserRoleEnum } from '@meltstudio/types';
import { insertModelSchemas } from '@meltstudio/zod-schemas';
import { z } from 'zod';

import { ctx } from '@/api/context';
import { db } from '@/api/db';
import type { DbGivingOpportunities, DbUniversity } from '@/db/schema';
import { generateDatesFrom28DaysAgo } from '@/db/utils/date-utils';

import { adminApiDef } from './def';

type UserCount = {
  id: string;
  name: string | null;
  count: number;
};

async function getOnboardedUniversityCount(): Promise<number> {
  return db.university.count();
}

async function getAlumniGrowthTrend(): Promise<
  { date: string; count: number }[]
> {
  const recentUsers = await db.user.findMany({
    args: {
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  return generateDatesFrom28DaysAgo().map((date) => ({
    date,
    count: recentUsers.filter(
      (u) => new Date(u.createdAt).toISOString().split('T')[0] === date
    ).length,
  }));
}

async function processTopUniversities(
  universityMap: Record<string, number>
): Promise<UserCount[]> {
  const universityIdsToFetch = Object.keys(universityMap);
  if (universityIdsToFetch.length === 0) return [];

  const fetchedUniversities = await db.university.findMany({
    args: { where: { id: universityIdsToFetch } },
  });

  const fetchedUniversityMap = new Map(
    fetchedUniversities.map((u) => [u.id, u.name])
  );

  const universitiesWithCounts = Object.entries(universityMap).map(
    ([id, count]) => ({
      id,
      name: fetchedUniversityMap.get(id) ?? null,
      count,
    })
  );

  return universitiesWithCounts.sort((a, b) => b.count - a.count).slice(0, 5);
}

async function processTopAlumni(
  userMap: Record<string, number>
): Promise<UserCount[]> {
  const userIdsToFetch = Object.keys(userMap);
  if (userIdsToFetch.length === 0) return [];

  const fetchedUsers = await db.user.findMany({
    args: { where: { id: userIdsToFetch } },
  });

  const fetchedUserMap = new Map(fetchedUsers.map((u) => [u.id, u.name]));

  const usersWithCounts: UserCount[] = Object.entries(userMap).map(
    ([id, count]) => ({
      id,
      name: fetchedUserMap.get(id) ?? null,
      count,
    })
  );

  return usersWithCounts.sort((a, b) => b.count - a.count).slice(0, 5);
}

async function getDashboardPledgeMetrics(): Promise<{
  totalPledges: number;
  monetaryPledges: number;
  nonMonetaryPledges: number;
  pledgeFunnel: Record<string, number>;
  topUniversities: UserCount[];
  topAlumni: UserCount[];
  pendingFollowUps: number;
}> {
  const pledges = await db.pledgeOpportunities.findMany({});

  const universityMap: Record<string, number> = {};
  const userMap: Record<string, number> = {};
  const pledgeFunnel: Record<string, number> = {};
  Object.values(PledgeStatusEnum).forEach((status) => {
    pledgeFunnel[status] = 0;
  });

  let monetaryPledges = 0;
  let nonMonetaryPledges = 0;
  let pendingFollowUps = 0;

  pledges.forEach((pledge) => {
    const status = pledge.status as PledgeStatusEnum;

    if (pledge.pledgeType === 'monetary_support') {
      monetaryPledges += 1;
    } else {
      nonMonetaryPledges += 1;
    }

    if (pledgeFunnel[status] !== undefined) {
      pledgeFunnel[status] += 1;
    }

    if (pledge.universityId) {
      universityMap[pledge.universityId] =
        (universityMap[pledge.universityId] || 0) + 1;
    }

    if (pledge.userId) {
      userMap[pledge.userId] = (userMap[pledge.userId] || 0) + 1;
    }

    if (
      status !== PledgeStatusEnum.COMPLETED &&
      status !== PledgeStatusEnum.IMPACT_RECORDED
    ) {
      pendingFollowUps += 1;
    }
  });

  const [topUniversities, topAlumni] = await Promise.all([
    processTopUniversities(universityMap),
    processTopAlumni(userMap),
  ]);

  return {
    totalPledges: pledges.length,
    monetaryPledges,
    nonMonetaryPledges,
    pledgeFunnel,
    topUniversities,
    topAlumni,
    pendingFollowUps,
  };
}

export const adminRouter = ctx.router(adminApiDef);

adminRouter.get('/dashboard-metrics', async (req, res) => {
  const authUser = req.auth?.user as
    | { id: string; email: string; role?: UserRoleEnum }
    | undefined;

  if (!authUser || authUser.role !== UserRoleEnum.SUPER_ADMIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [onboardedUniversities, alumniGrowthTrend, pledgeMetrics] =
      await Promise.all([
        getOnboardedUniversityCount(),
        getAlumniGrowthTrend(),
        getDashboardPledgeMetrics(),
      ]);

    const dashboardMetrics = {
      onboardedUniversities,
      alumniGrowthTrend,
      ...pledgeMetrics,
    };

    return res.status(200).json(dashboardMetrics);
  } catch (error) {
    logger.error(error, 'Error fetching dashboard metrics:');
    return res
      .status(500)
      .json({ error: 'Error fetching data from PostgreSQL' });
  }
});

adminRouter.get('/:model', async (req, res) => {
  const modelName = req.params.model as keyof DbModelMap;

  if (!(modelName in db.models)) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const model = db.getModel(modelName);

  if (!model) {
    return res.status(404).json({ error: 'Model not found' });
  }

  const { query: queryFilters } = req.query;

  const filters = queryFilters?.filters || {};
  const pagination = queryFilters?.pagination || {};

  const pageIndex = Number(pagination?.pageIndex) || 0;
  const pageSize = Number(pagination?.pageSize) || 10;

  try {
    let items: unknown[] = [];
    let total = 0;

    switch (modelName) {
      case 'users': {
        const usersResult = await db.user.findAllUsers({
          filters: {
            search: filters.search,
            isSuperAdmin: filters.isSuperAdmin,
          },
          pagination: { pageIndex, pageSize },
        });
        items = usersResult.items;
        total = usersResult.total;
        break;
      }

      case 'university': {
        const universityResult = await db.university.findAllUniversities({
          filters: {
            search: filters.search,
          },
          pagination: { pageIndex, pageSize },
        });
        items = universityResult.items;
        total = universityResult.total;
        break;
      }

      case 'givingOpportunities': {
        const givingOppsResult =
          await db.givingOpportunities.findAllGivingOpportunities({
            filters: {
              search: filters.search,
            },
            pagination: { pageIndex, pageSize },
          });
        items = givingOppsResult.items;
        total = givingOppsResult.total;
        break;
      }

      case 'userUniversities': {
        const userUniResult = await db.userUniversities.findAllUserUniversities(
          {
            filters: {
              search: filters.search,
              role: filters.role,
            },
            pagination: { pageIndex, pageSize },
          }
        );
        items = userUniResult.items;
        total = userUniResult.total;
        break;
      }

      case 'pledgeOpportunities': {
        const pledgeResult =
          await db.pledgeOpportunities.findAllPledgeOpportunities({
            filters: {
              search: filters.search,
            },
            pagination: { pageIndex, pageSize },
          });
        items = pledgeResult.items;
        total = pledgeResult.total;
        break;
      }

      default:
        return res.status(400).json({ error: 'Unsupported model' });
    }

    const pageCount = Math.ceil(total / pageSize);

    return res.status(200).json({
      items,
      total,
      limit: pageSize,
      offset: pageIndex * pageSize,
      pageCount,
      currentPage: pageIndex,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    const record = await model.findUniqueByPkAdmin(req.params.id, true);
    if (record) {
      return res.status(200).json(record);
    }
  }
  return res.status(404).json({ error: 'Record not found' });
});

adminRouter.put('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);

  if (model) {
    const schema = insertModelSchemas[modelName].extend({
      password: z.string().min(8).or(z.literal('')).nullable().optional(),
    });

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    try {
      if (
        modelName === 'givingOpportunities' &&
        req.body.data &&
        typeof req.body.data === 'object' &&
        'universityId' in req.body.data
      ) {
        const currentOpp = await model.findUniqueByPkAdmin(
          req.params.id,
          false
        );

        if (
          currentOpp &&
          'referenceCode' in currentOpp &&
          currentOpp.referenceCode
        ) {
          const university = await db.university.findUniqueByPkAdmin(
            (req.body.data as { universityId: string }).universityId,
            false
          );

          if (!university) {
            return res.status(400).json({ error: 'University not found' });
          }

          if ('referenceCode' in university && university.referenceCode) {
            const parts = currentOpp.referenceCode.split('-');
            const numericId = parts[parts.length - 1];
            req.body.data = {
              ...(req.body.data as object),
              referenceCode: `${university.referenceCode}-OPP-${numericId}`,
            };
          }
        }
      }

      // Validate and parse the request body
      const parsedBody = schema.parse(req.body.data);
      if (
        'password' in parsedBody &&
        typeof parsedBody.password === 'string' &&
        parsedBody.password !== ''
      ) {
        parsedBody.password = await hashPassword(parsedBody.password);
      } else if ('password' in parsedBody) {
        delete parsedBody.password;
      }

      const record = await model.updateByAdmin({
        pk: req.params.id,
        data: parsedBody,
        activityStreamData: {
          userId: req.auth.user.id,
          universityId: null,
          recordId: req.params.id,
        },
      });

      if (
        modelName === 'globalFeatureFlags' &&
        'released' in parsedBody &&
        typeof parsedBody.released === 'boolean' &&
        'flag' in record
      ) {
        const matchingFlags = await db.featureFlag.findMany({
          args: {
            where: { flag: record.flag },
          },
        });

        const idsToUpdate = matchingFlags.map((f) => f.id);

        if (idsToUpdate.length > 0) {
          await db.featureFlag.updateMany({
            pk: idsToUpdate,
            data: { released: parsedBody.released },
            activityStreamData: {
              userId: req.auth.user.id,
              universityId: null,
              recordId: record.id,
            },
          });
        }
      }

      const { relations } = req.body;

      if (relations) {
        await Promise.all(
          relations.map(async (relation) => {
            const relationInfo = model.getDynamicManyRelations(
              relation.relationModel as keyof DbModelMap
            );
            if (relationInfo) {
              const relationJoinName = relationInfo.relationModel;
              const joinModel = db.getModel(relationJoinName);
              if (joinModel) {
                const { mainKey } = relationInfo.foreignKeys;
                const { relatedKey } = relationInfo.foreignKeys;

                await joinModel.updateRelations(
                  req.params.id,
                  relation.relatedIds,
                  mainKey,
                  relatedKey
                );
              }
            }
          })
        );

        if (model.algoliaModel?.getDataClass()) {
          await model.algoliaModel
            .getDataClass()
            .updateInAlgolia(req.params.id);
        }
      }

      // Save the embedding to the vector DB
      if (model.saveEmbedding) {
        await model.vectorDbService.embedRowsBatch(
          model.schemaTsName,
          [record as unknown as RowEmbeddingData],
          'universityId' in record ? record.universityId : null
        );
      }

      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            fields: issue.path as string[],
            message: issue.message,
          };
        });
        return res
          .status(400)
          .json({ error: 'Invalid data', validationErrors: errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: '' });
    }
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.delete('/:model/:id', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    await model.delete({
      pk: req.params.id,
      activityStreamData: {
        userId: req.auth.user.id,
        universityId: null,
        recordId: req.params.id,
      },
    });
    return res.status(204).send();
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.post('/updateGTMId', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const { gtmId } = req.body;
  await db.user.update({
    pk: req.auth.user.id,
    data: { gtmId },
    activityStreamData: {
      userId: req.auth.user.id,
      universityId: null,
      recordId: req.auth.user.id,
    },
  });
  return res.status(201).json({ status: true });
});

adminRouter.post('/:model', async (req, res) => {
  if (req.auth == null) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const modelName = req.params.model as keyof DbModelMap;
  const model = db.getModel(modelName);
  if (model) {
    const schema = insertModelSchemas[modelName];

    if (!schema) {
      return res.status(404).json({ error: 'Schema not found' });
    }
    try {
      if (
        modelName === 'university' &&
        req.body.data &&
        typeof req.body.data === 'object'
      ) {
        const data = req.body.data as Record<string, unknown>;

        const universityAbbreviation =
          'universityAbbreviation' in data &&
          typeof data.universityAbbreviation === 'string'
            ? data.universityAbbreviation
            : 'XXX';

        (data as DbUniversity).referenceCode =
          `LL-${universityAbbreviation}-001`;

        const allUniversities = await db.university.findMany({});

        let nextCodeNumber = 1;

        if (allUniversities.length > 0) {
          const codeNumbers = allUniversities
            .map((u) => {
              const match =
                u.legacyLinkFoundationCode.match(/^LL-LEGACY-(\d{3})$/);

              if (!match || !match[1]) {
                return 0;
              }
              return parseInt(match[1], 10);
            })
            .filter((num) => num > 0);

          if (codeNumbers.length > 0) {
            const maxCodeNumber = Math.max(...codeNumbers);
            nextCodeNumber = maxCodeNumber + 1;

            if (nextCodeNumber > 999) {
              return res.status(400).json({
                error:
                  'Legacy Link Foundation Code has reached maximum value (999)',
              });
            }
          }
        }

        const legacyLinkCode = `LL-LEGACY-${String(nextCodeNumber).padStart(3, '0')}`;
        (data as DbUniversity).legacyLinkFoundationCode = legacyLinkCode;

        req.body.data = data;
      }

      if (
        modelName === 'givingOpportunities' &&
        req.body.data &&
        typeof req.body.data === 'object'
      ) {
        const data = req.body.data as Record<string, unknown>;

        if (
          !('universityId' in data) ||
          typeof data.universityId !== 'string'
        ) {
          return res.status(400).json({ error: 'UniversityId is required' });
        }

        const university = await db.university.findUniqueByPkAdmin(
          data.universityId,
          false
        );

        if (!university) {
          return res.status(400).json({ error: 'University not found' });
        }

        const oppCount = await db.givingOpportunities.count({
          universityId: data.universityId,
        });

        const numericId = String(oppCount + 1).padStart(3, '0');
        (data as DbGivingOpportunities).referenceCode =
          `${university.referenceCode}-OPP-${numericId}`;
        req.body.data = data;
      }

      const parsedBody = schema.parse(req.body.data);

      if (
        'password' in parsedBody &&
        typeof parsedBody.password === 'string' &&
        parsedBody.password !== ''
      ) {
        parsedBody.password = await hashPassword(parsedBody.password);
      }

      const record = await model.createByAdmin({
        data: parsedBody,
        activityStreamData: {
          userId: req.auth.user.id,
          universityId: null,
        },
      });

      // Check id of created record to create
      if ('id' in record) {
        // Check many relations to create
        const { relations } = req.body;
        if (relations) {
          await Promise.all(
            relations.map(async (relation) => {
              const relationInfo = model.getDynamicManyRelations(
                relation.relationModel as keyof DbModelMap
              );
              if (relationInfo) {
                const relationJoinName = relationInfo.relationModel;
                const joinModel = db.getModel(relationJoinName);
                if (joinModel) {
                  const { mainKey } = relationInfo.foreignKeys;
                  const { relatedKey } = relationInfo.foreignKeys;
                  const insertData = relation.relatedIds.map((relatedId) => ({
                    [mainKey]: record.id,
                    [relatedKey]: relatedId,
                  }));
                  await joinModel.createManyByAdmin({
                    data: insertData,
                    activityStreamData: {
                      userId: req.auth?.user.id || '',
                      universityId: null,
                    },
                  });
                }
              }
            })
          );
          if (model.algoliaModel?.getDataClass()) {
            await model.algoliaModel.getDataClass().updateInAlgolia(record.id);
          }
        }

        // Save the embedding to the vector DB
        if (model.saveEmbedding) {
          await model.vectorDbService.embedRowsBatch(
            model.schemaTsName,
            [record as unknown as RowEmbeddingData],
            'universityId' in record ? record.universityId : null
          );
        }
      }

      return res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) => {
          return {
            fields: issue.path as string[],
            message: issue.message,
          };
        });
        return res
          .status(400)
          .json({ error: 'Invalid data', validationErrors: errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(400).json({ error: '' });
    }
  }
  return res.status(404).json({ error: 'Model not found' });
});

adminRouter.get('/:model/relations/:relation', async (req, res) => {
  if (!req.auth) {
    return res.status(401).send({ error: 'Unauthorized' });
  }

  const relationName = req.params.relation as keyof DbModelMap;

  // TODO: check if the relation exists in the model
  const model = db.getModel(relationName);
  if (model) {
    const choiceField = model.getAdminFieldChoiceName();
    const relationData = await model.findMany();
    const data: {
      id: string;
      label: string;
    }[] = [];
    relationData.forEach((item) => {
      if ('id' in item && choiceField in item) {
        data.push({
          id: item.id,
          label: (item as Record<string, string>)[choiceField] || '',
        });
      }
    });
    return res.status(200).json(data);
  }

  return res.status(404).json({ error: 'Relation not found' });
});
