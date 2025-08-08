# Sample Data for Beauty Brands and Products

## Brands

1. **The Ordinary**
   - Minimum Order Value: $200.00
   - Known for: Affordable, science-backed skincare
   - Products focus: Single-ingredient solutions

2. **Summer Fridays**
   - Minimum Order Value: $300.00
   - Known for: Clean beauty, Instagram-famous masks
   - Products focus: Hydrating treatments

3. **Drunk Elephant**
   - Minimum Order Value: $500.00
   - Known for: Clean clinical skincare
   - Products focus: Biocompatible ingredients

4. **Glow Recipe**
   - Minimum Order Value: $400.00
   - Known for: Fruit-powered Korean beauty
   - Products focus: Gentle, effective formulations

5. **Youth To The People**
   - Minimum Order Value: $350.00
   - Known for: Superfood skincare
   - Products focus: Vegan, sustainable formulas

## Products

### The Ordinary

1. **Niacinamide 10% + Zinc 1%**
   - SKU: TO-NZ-001
   - Price per unit: $5.99
   - Units per case: 12
   - MSRP: $7.99
   - Weight: 0.2 kg
   - Dimensions: 3x3x10 cm

2. **Hyaluronic Acid 2% + B5**
   - SKU: TO-HA-001
   - Price per unit: $6.99
   - Units per case: 12
   - MSRP: $8.99
   - Weight: 0.2 kg
   - Dimensions: 3x3x10 cm

### Summer Fridays

1. **Jet Lag Mask**
   - SKU: SF-JLM-001
   - Price per unit: $39.99
   - Units per case: 6
   - MSRP: $49.99
   - Weight: 0.3 kg
   - Dimensions: 4x4x15 cm

2. **Cloud Dew Oil-Free Gel Cream**
   - SKU: SF-CD-001
   - Price per unit: $35.99
   - Units per case: 6
   - MSRP: $44.99
   - Weight: 0.25 kg
   - Dimensions: 5x5x5 cm

### Drunk Elephant

1. **Protini Polypeptide Cream**
   - SKU: DE-PP-001
   - Price per unit: $55.99
   - Units per case: 4
   - MSRP: $68.99
   - Weight: 0.15 kg
   - Dimensions: 6x6x6 cm

2. **C-Firma Fresh Day Serum**
   - SKU: DE-CF-001
   - Price per unit: $65.99
   - Units per case: 4
   - MSRP: $78.99
   - Weight: 0.12 kg
   - Dimensions: 4x4x12 cm

### Glow Recipe

1. **Watermelon Glow PHA+BHA Pore-Tight Toner**
   - SKU: GR-WT-001
   - Price per unit: $28.99
   - Units per case: 8
   - MSRP: $34.99
   - Weight: 0.25 kg
   - Dimensions: 4x4x14 cm

2. **Plum Plump Hyaluronic Serum**
   - SKU: GR-PH-001
   - Price per unit: $32.99
   - Units per case: 8
   - MSRP: $42.99
   - Weight: 0.2 kg
   - Dimensions: 4x4x12 cm

### Youth To The People

1. **Superfood Cleanser**
   - SKU: YP-SC-001
   - Price per unit: $29.99
   - Units per case: 6
   - MSRP: $36.99
   - Weight: 0.24 kg
   - Dimensions: 5x5x15 cm

2. **Adaptogen Deep Moisture Cream**
   - SKU: YP-AD-001
   - Price per unit: $45.99
   - Units per case: 6
   - MSRP: $58.99
   - Weight: 0.2 kg
   - Dimensions: 6x6x6 cm

## Example Cart Scenarios

### Scenario 1: Mixed Brand Order
- 2 cases of Niacinamide 10% + Zinc 1% (24 units)
- 1 case of Jet Lag Mask (6 units)
- 1 case of Protini Polypeptide Cream (4 units)

Expected calculations:
```
The Ordinary:
- Base: 24 × $5.99 = $143.76
- Return Fee (20%): $28.75
- Subtotal: $172.51

Summer Fridays:
- Base: 6 × $39.99 = $239.94
- Return Fee (20%): $47.99
- Subtotal: $287.93

Drunk Elephant:
- Base: 4 × $55.99 = $223.96
- Return Fee (20%): $44.79
- Subtotal: $268.75

Total Order:
- Base: $607.66
- Return Fees: $121.53
- Grand Total: $729.19
```

### Scenario 2: Single Brand Large Order
- 10 cases of Superfood Cleanser (60 units)
- 8 cases of Adaptogen Deep Moisture Cream (48 units)

Expected calculations:
```
Youth To The People:
- Base: (60 × $29.99) + (48 × $45.99) = $4,007.52
- Return Fee (20%): $801.50
- Subtotal: $4,809.02

Total Order:
- Base: $4,007.52
- Return Fees: $801.50
- Grand Total: $4,809.02
```

## Testing Notes

1. **Case Quantity Validation**
   - Try ordering 5 units of Jet Lag Mask (case size is 6)
   - Expected: Error about invalid quantity

2. **Minimum Order Values**
   - Try checking out Drunk Elephant products worth $400 (minimum is $500)
   - Expected: Error about minimum order value not met

3. **Platform Minimum**
   - Create cart with total value $1,800
   - Expected: Error about platform minimum ($2,000) not met

4. **Risk-Free Returns**
   - Add items with and without risk-free return option
   - Verify 20% premium is only applied to items with risk-free return 