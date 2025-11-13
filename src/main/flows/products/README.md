# Products Directory

This directory contains product-specific implementations for insurance automation flows.

## Structure

Each product should be in its own subdirectory:

```
products/
├── product-name/
│   ├── ProductNameProduct.ts       # Main product class (extends BaseProduct)
│   ├── ProductNameTransformer.ts   # Transformer (extends BaseTransformer)
│   ├── ProductNameTypes.ts         # Product-specific types
│   ├── steps/                      # Step implementations
│   │   ├── LoginStep.ts
│   │   ├── FormFillStep.ts
│   │   └── QuoteStep.ts
│   └── [optional folders]
│       ├── mappers/                # Data mappers
│       ├── calibrators/            # Quote calibrators
│       └── validators/             # Custom validators
```

## Adding a New Product

1. Create product directory: `products/your-product-name/`
2. Implement product class extending `BaseProduct`
3. Implement transformer extending `BaseTransformer`
4. Create step classes extending `BaseStep`
5. Define product-specific types
6. Register product in `ProductRegistry`

## Example

See `test-forms/` directory for POC implementations that can be adapted.
