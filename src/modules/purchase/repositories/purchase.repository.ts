import {
  CreatePurchaseData,
  CreatePurchaseResult,
  PurchaseWithRelations,
  SearchManyPurchasesQuery,
} from './@types';

export interface PurchaseRepository {
  create(data: CreatePurchaseData): Promise<CreatePurchaseResult>;
  findById(id: string, farmId: string): Promise<PurchaseWithRelations | null>;
  searchMany(query: SearchManyPurchasesQuery): Promise<PurchaseWithRelations[]>;
  count(query: SearchManyPurchasesQuery): Promise<number>;
}

export const PURCHASE_REPOSITORY = 'PURCHASE_REPOSITORY';
