/* eslint-disable class-methods-use-this */
import type { IntegrationsKeys } from '@meltstudio/types';
import { DbError, DbErrorCode } from '@meltstudio/types';
import { and, eq, sql } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

import type {
  DbIntegration,
  DbIntegrationExtended,
  DbIntegrationKey,
} from '@/db/schema';
import { integration as integrationTable, integrationKey } from '@/db/schema';

import type { ManyRelations } from './base';
import { DbModel } from './base';
import type { DbModelKeys } from './db';

export type DbIntegrationWhere = {
  universityId?: string;
};

export type ListIntegrationParams = {
  universityId: string;
  platform: IntegrationsKeys;
};

export type SaveIntegrationParams = {
  enabled: boolean;
  universityId: string;
  platform: IntegrationsKeys;
  keys: {
    name: string;
    value: string;
  }[];
};

export class DbIntegrationModel extends DbModel<
  typeof integrationTable,
  DbIntegrationWhere,
  'integration'
> {
  // eslint-disable-next-line class-methods-use-this
  public override get schemaTsName(): 'integration' {
    return 'integration';
  }

  // eslint-disable-next-line class-methods-use-this
  protected get manyRelationsMap(): Map<string, ManyRelations> {
    const dynamic = new Map<string, ManyRelations>();
    return dynamic;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get dbTable(): typeof integrationTable {
    return integrationTable;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get activityStream(): boolean {
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get adminFieldChoiceName(): string {
    return 'platform';
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get isExportable(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected get modelName(): DbModelKeys {
    return 'integration';
  }

  public override get saveEmbedding(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  protected override get sendWebhooks(): boolean {
    return false;
  }

  protected override filterQuery<Query extends PgSelect>(
    query: Query,
    where: DbIntegrationWhere
  ): Query {
    let filtered = query;

    if (where.universityId != null) {
      filtered = filtered.where(
        eq(this.dbTable.universityId, where.universityId)
      );
    }

    return filtered;
  }

  public async findByUniversityId(
    universityId: string
  ): Promise<DbIntegration | null> {
    const [data] = await this.client
      .select()
      .from(this.dbTable)
      .where(eq(this.dbTable.universityId, universityId))
      .execute();

    return data || null;
  }

  public async findByUniversityAndPlatformWithKeys({
    platform,
    universityId,
  }: ListIntegrationParams): Promise<DbIntegrationExtended | undefined> {
    return this.client.query.integration.findFirst({
      where: and(
        eq(this.dbTable.platform, platform),
        eq(this.dbTable.universityId, universityId)
      ),
      with: {
        integrationKeys: true,
      },
    });
  }

  public async saveIntegrationData({
    platform,
    universityId,
    enabled,
    keys,
  }: SaveIntegrationParams): Promise<void> {
    await this.client.transaction(async (tx) => {
      const [insertedIntegration] = await tx
        .insert(this.dbTable)
        .values({ universityId, platform, enabled })
        .onConflictDoUpdate({
          target: [this.dbTable.platform, this.dbTable.universityId],
          set: { enabled: sql.raw(`excluded.${this.dbTable.enabled.name}`) },
        })
        .returning();
      if (!insertedIntegration) {
        throw new DbError(DbErrorCode.FailedDataInsertion);
      }
      await tx
        .insert(integrationKey)
        .values(
          keys.map(({ name, value }) => ({
            keyName: name,
            value,
            integrationId: insertedIntegration.id,
            name,
          }))
        )
        .onConflictDoUpdate({
          target: [integrationKey.keyName, integrationKey.integrationId],
          set: { value: sql.raw(`excluded.${integrationKey.value.name}`) },
        });
    });
  }

  public async findEnabledZapierIntegration(universityId: string): Promise<
    | {
        integration: DbIntegration;
        integration_key: DbIntegrationKey | null;
      }
    | undefined
    | null
  > {
    const [integration] = await this.client
      .select()
      .from(this.dbTable)
      .leftJoin(
        integrationKey,
        eq(this.dbTable.id, integrationKey.integrationId)
      )
      .where(
        and(
          eq(this.dbTable.platform, 'zapier'),
          eq(this.dbTable.enabled, true),
          eq(this.dbTable.universityId, universityId)
        )
      );

    return integration || null;
  }
}
