import type { TFunction } from 'i18next';

export function getLocalizedColumnName(t: TFunction, columnId: string): string {
  switch (columnId) {
    case 'name':
      return t('Name');
    case 'email':
      return t('Email');
    case 'role':
      return t('Role');
    case 'active':
      return t('Active');
    case 'createdAt':
      return t('Created at');
    case 'id':
      return 'Id';
    case 'url':
      return 'Url';
    case 'from':
      return t('From');
    case 'to':
      return t('To');
    case 'reportStatus':
      return t('Report Status');
    case 'referenceCode':
      return 'Id';
    case 'description':
      return t('Description');
    case 'goalAmount':
      return t('Goal Amount');
    case 'universityId':
      return t('University');
    case 'status':
      return t('Status');
    case 'pledgeType':
      return t('Pledge Type');
    default:
      return t('Unknown column');
  }
}
