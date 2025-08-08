import { Request, Response, NextFunction } from 'express';
import { Cart, ICart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { Brand } from '../models/brand.model';
import { AppError } from '../middleware/error.middleware';

interface BrandGroup {
  brandId: string;
  brand: any;
  items: any[];
  subtotal: number;
  riskFreePremium: number;
  totalAmount: number;
  reachesMinimumOrder: boolean;
}

const calculateCartTotals = async (cart: ICart) => {
  await cart.populate({
    path: 'items.product',
    populate: {
      path: 'brand'
    }
  });

  // Calculate totals and group by brand
  const itemsByBrand = cart.items.reduce((acc: Record<string, BrandGroup>, item: any) => {
    const brand = item.product.brand;
    const brandId = brand._id.toString();
    if (!acc[brandId]) {
      acc[brandId] = {
        brandId,
        brand,
        items: [],
        subtotal: 0,
        riskFreePremium: 0,
        totalAmount: 0,
        reachesMinimumOrder: false
      };
    }
    
    const itemTotal = item.product.pricePerUnit * item.quantity;
    const riskFreePremium = item.hasRiskFreeReturn ? (itemTotal * brand.riskFreeReturnPremium / 100) : 0;
    
    acc[brandId].items.push({
      ...item.toObject(),
      basePrice: itemTotal,
      riskFreePremium,
      totalPrice: itemTotal + riskFreePremium
    });
    
    acc[brandId].subtotal += itemTotal;
    acc[brandId].riskFreePremium += riskFreePremium;
    acc[brandId].totalAmount = acc[brandId].subtotal + acc[brandId].riskFreePremium;
    acc[brandId].reachesMinimumOrder = acc[brandId].subtotal >= brand.minimumOrderValue;
    
    return acc;
  }, {});

  const totalOrderAmount = Object.values(itemsByBrand).reduce(
    (sum: number, brandGroup: BrandGroup) => sum + brandGroup.totalAmount,
    0
  );

  const totalRiskFreePremium = Object.values(itemsByBrand).reduce(
    (sum: number, brandGroup: BrandGroup) => sum + brandGroup.riskFreePremium,
    0
  );

  return {
    items: cart.items,
    brandGroups: Object.values(itemsByBrand),
    totalOrderAmount,
    riskFreeReturnPremium: totalRiskFreePremium,
    reachesPlatformMinimum: totalOrderAmount >= Number(process.env.PLATFORM_MIN_ORDER_VALUE || 2000)
  };
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, productId, quantity, hasRiskFreeReturn } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Find product and populate brand
    const product = await Product.findById(productId).populate('brand');
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product?.toString() === productId
    );

    // Check SKU limit first
    if (existingItemIndex === -1 && cart.items.length >= 100) {
      return res.status(400).json({
        success: false,
        error: 'Cart cannot contain more than 100 SKUs'
      });
    }

    // Then validate case quantity
    if (quantity % product.unitsPerCase !== 0) {
      return res.status(400).json({
        success: false,
        error: `Quantity must be a multiple of case size (${product.unitsPerCase})`
      });
    }

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].hasRiskFreeReturn = hasRiskFreeReturn;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        hasRiskFreeReturn
      });
    }

    await cart.save();
    const cartData = await calculateCartTotals(cart);
    
    res.status(200).json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          items: [],
          brandGroups: [],
          totalOrderAmount: 0,
          riskFreeReturnPremium: 0,
          reachesPlatformMinimum: false
        }
      });
    }

    const cartData = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product?.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    const cartData = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, productId } = req.params;
    const { quantity, hasRiskFreeReturn } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product?.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in cart'
      });
    }

    // Validate case quantity
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (quantity !== 0 && quantity % product.unitsPerCase !== 0) {
      return res.status(400).json({
        success: false,
        error: `Quantity must be a multiple of case size (${product.unitsPerCase})`
      });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].hasRiskFreeReturn = hasRiskFreeReturn;
    }

    await cart.save();
    const cartData = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      data: cartData
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutByBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, brandId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const brand = await Brand.findById(brandId);
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    await cart.populate({
      path: 'items.product',
      populate: {
        path: 'brand'
      }
    });

    const cartData = await calculateCartTotals(cart);
    const brandGroup = cartData.brandGroups.find((group: BrandGroup) => 
      group.brandId === brandId
    );

    if (!brandGroup || brandGroup.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: `No items found for brand ${brand.name}`
      });
    }

    if (brandGroup.subtotal < brand.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        error: `Order total (${brandGroup.subtotal}) does not meet minimum order value (${brand.minimumOrderValue}) for ${brand.name}`
      });
    }

    // Only remove items after all validations pass
    cart.items = cart.items.filter(item => {
      const itemBrandId = (item.product as any).brand._id.toString();
      return itemBrandId !== brandId;
    });
    await cart.save();

    const updatedCartData = await calculateCartTotals(cart);

    res.status(200).json({
      success: true,
      data: updatedCartData
    });
  } catch (error) {
    next(error);
  }
};
