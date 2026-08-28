# Anatomia de um módulo

Receita para um CRUD completo, baseada no módulo **Product** (`src/modules/product/`).

## 1. Estrutura de pastas

```
src/modules/product/
├── product.module.ts
├── controllers/
│   ├── create-product.controller.ts
│   ├── get-product.controller.ts
│   ├── fetch-products.controller.ts
│   ├── update-product.controller.ts
│   └── delete-product.controller.ts
├── services/
│   ├── create-product.service.ts
│   └── ...
├── repositories/
│   ├── product.repository.ts
│   ├── prisma-product.repository.ts
│   └── @types.ts
└── dtos/
    ├── entity/product.entity.ts
    ├── request/
    └── response/
```

## 2. Module

```typescript
@Module({
  imports: [PrismaModule, UnitOfMeasurementModule], // se precisa de outro repo
  controllers: [CreateProductController, /* ... */],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    CreateProductService,
    // ...
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
```

Registrar o módulo em `app.module.ts`.

## 3. Repository

**Interface + token** (`product.repository.ts`):

```typescript
export interface ProductRepository {
  create(data: CreateProductData): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  // ...
}
export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';
```

**Types** (`@types.ts`): `CreateProductData`, `UpdateProductData`, `SearchManyQuery`.

**Implementação** (`prisma-product.repository.ts`): injeta `PrismaService`, implementa a interface.

## 4. Service

```typescript
@Injectable()
export class CreateProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(data: CreateProductData) {
    // validações de negócio
    const product = await this.productRepository.create(data);
    return { product };
  }
}
```

- Um método público: `execute`.
- Exceções Nest aqui (`NotFoundException`, `ConflictException`).
- Retorno: objeto com entidade(s) — controller monta envelope HTTP.

## 5. Controller

```typescript
const createBodySchema = z.object({
  name: z.string().min(5).max(150),
  unitOfMeasurementId: z.uuid(),
});

@ApiTags('Product')
@Controller('/products')
export class CreateProductController {
  @Post()
  @UsePipes(new ZodValidationPipe(createBodySchema))
  async create(@Body() data: CreateProductBodyDto) {
    const { product } = await this.createProductService.execute(data);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Product created successfully',
      result: product,
    };
  }
}
```

- Schema Zod no topo do arquivo.
- `CreateProductBodyDto` em `dtos/request/` — só `@ApiProperty` para Swagger.
- `@ApiOperation`, `@ApiCreatedResponse`, `@ApiBadRequestResponse`, etc.
- **Sem** try/catch + `console.error` em código novo.

## 6. DTOs

| Pasta | Uso |
|-------|-----|
| `dtos/entity/` | Shape da entidade no OpenAPI |
| `dtos/request/` | Body, query, params — Swagger only |
| `dtos/response/` | Envelope HTTP documentado |

Response DTO deve refletir `{ statusCode, message, result }` para comando/get.

## 7. Listagem (fetch)

- Query validada com Zod (`page`, `perPage`, `orderBy`, `orderDirection`, filtros).
- Service retorna `{ results, total, page, perPage, orderBy, orderDirection }`.
- Controller retorna flat — sem envelope `statusCode`/`message`. Ver [03-http.md](./03-http.md).

## 8. Dependência entre módulos

Ex.: `CreateProductService` valida `unitOfMeasurementId`:

1. `ProductModule` importa `UnitOfMeasurementModule`.
2. `UnitOfMeasurementModule` exporta `UNIT_OF_MEASUREMENT_REPOSITORY`.
3. Service injeta `@Inject(UNIT_OF_MEASUREMENT_REPOSITORY)`.

Não importar `PrismaUnitOfMeasurementRepository` diretamente.

## Checklist — novo módulo

- [ ] `{entity}.module.ts` + registro em `AppModule`
- [ ] Interface + token + `PrismaXRepository` + `@types`
- [ ] 5 controllers (create, get, fetch, update, delete) ou subset necessário
- [ ] 5 services com `execute()`
- [ ] DTOs entity/request/response
- [ ] Schemas Zod 4 nos controllers
- [ ] Swagger tags e responses com DTOs de erro comuns
