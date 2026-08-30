import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentForm } from '@prisma/client';
import {
  PRODUCT_REPOSITORY,
  ProductRepository,
} from 'src/modules/product/repositories/product.repository';
import {
  SUPPLIER_REPOSITORY,
  SupplierRepository,
} from 'src/modules/supplier/repositories/supplier.repository';
import {
  UNIT_OF_MEASUREMENT_REPOSITORY,
  UnitOfMeasurementRepository,
} from 'src/modules/unit-of-measurement/repositories/unit-of-measurement.repository';
import { sumLineTotalsInCents } from '../domain/line-total';
import { toCreatePurchaseResponse } from '../mappers/purchase.mapper';
import {
  PURCHASE_REPOSITORY,
  PurchaseRepository,
} from '../repositories/purchase.repository';

type CreatePurchaseItemInput = {
  productId: string;
  quantity: string;
  priceInCents: number;
};

type CreatePurchaseInstallmentInput = {
  valueInCents: number;
  dueDate: Date;
  paymentDate?: Date | null;
  paymentForm: PaymentForm;
};

type CreatePurchaseInput = {
  farmId: string;
  organizationId: string;
  date: Date;
  documentRef?: string | null;
  note?: string | null;
  supplierId: string;
  items: CreatePurchaseItemInput[];
  installments: CreatePurchaseInstallmentInput[];
};

@Injectable()
export class CreatePurchaseService {
  constructor(
    @Inject(PURCHASE_REPOSITORY)
    private readonly purchaseRepository: PurchaseRepository,
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_MEASUREMENT_REPOSITORY)
    private readonly unitOfMeasurementRepository: UnitOfMeasurementRepository,
  ) {}

  async execute(input: CreatePurchaseInput) {
    if (input.items.length === 0) {
      throw new BadRequestException('Purchase must have at least one item');
    }

    if (input.installments.length === 0) {
      throw new BadRequestException(
        'Purchase must have at least one installment',
      );
    }

    const supplier = await this.supplierRepository.findById(
      input.supplierId,
      input.organizationId,
      input.farmId,
    );
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const productMeta: Record<string, { name: string; uomAcronym: string }> =
      {};

    for (const item of input.items) {
      const quantity = Number(item.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        throw new BadRequestException(
          'Item quantity must be greater than zero',
        );
      }

      const product = await this.productRepository.findById(
        item.productId,
        input.organizationId,
        input.farmId,
      );
      if (!product) {
        throw new NotFoundException(`Product not found: ${item.productId}`);
      }

      if (!product.unitOfMeasurementId) {
        throw new BadRequestException(
          `Product ${product.name} has no unit of measurement`,
        );
      }

      const uom = await this.unitOfMeasurementRepository.findById(
        product.unitOfMeasurementId,
        input.organizationId,
      );
      if (!uom) {
        throw new BadRequestException(
          `Unit of measurement not found for product ${product.name}`,
        );
      }

      productMeta[item.productId] = {
        name: product.name,
        uomAcronym: uom.acronym,
      };
    }

    const itemsTotalInCents = sumLineTotalsInCents(input.items);
    const installmentsTotalInCents = input.installments.reduce(
      (sum, inst) => sum + BigInt(inst.valueInCents),
      0n,
    );

    if (itemsTotalInCents !== installmentsTotalInCents) {
      throw new BadRequestException(
        'Sum of installments must equal sum of item totals',
      );
    }

    const { purchase, stockEffects } = await this.purchaseRepository.create({
      farmId: input.farmId,
      date: input.date,
      documentRef: input.documentRef,
      note: input.note,
      supplierId: input.supplierId,
      items: input.items,
      installments: input.installments,
      productMeta,
    });

    return {
      purchase: toCreatePurchaseResponse(purchase, stockEffects),
    };
  }
}
