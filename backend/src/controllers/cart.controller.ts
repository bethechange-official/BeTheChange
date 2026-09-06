import { Response } from "express";
import { prisma } from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { errorResponse, successResponse } from "../utils/apiResponse";
import { cartInclude, formatCart, getExistingCart, getOrCreateCart } from "../utils/storefront";

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await getOrCreateCart(req, res);
  successResponse(res, "Cart retrieved", { cart: formatCart(cart) });
};

export const addCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const productId = String(req.body.productId);
    const quantity = Number(req.body.quantity);
    const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
    if (!product) throw new AppError("Product not found", 404);
    if (product.stock < 1) throw new AppError("Product is out of stock", 409);
    const cart = await getOrCreateCart(req, res);
    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });
    const nextQuantity = Math.min(99, (existing?.quantity || 0) + quantity);
    if (nextQuantity > product.stock) throw new AppError(`Only ${product.stock} item(s) are available`, 409);
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: nextQuantity, price: product.price },
      create: { cartId: cart.id, productId, quantity, price: product.price },
    });
    const updated = await prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
    successResponse(res, "Product added to cart", { cart: formatCart(updated) }, 201);
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const productId = String(req.params.productId);
    const quantity = Number(req.body.quantity);
    const cart = await getExistingCart(req);
    if (!cart) throw new AppError("Cart not found", 404);
    const item = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } }, include: { product: true } });
    if (!item) throw new AppError("Cart item not found", 404);
    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      if (!item.product.isActive || quantity > item.product.stock) throw new AppError(`Only ${item.product.stock} item(s) are available`, 409);
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity, price: item.product.price } });
    }
    const updated = await prisma.cart.findUniqueOrThrow({ where: { id: cart.id }, include: cartInclude });
    successResponse(res, "Cart updated", { cart: formatCart(updated) });
  } catch (error) {
    if (error instanceof AppError) return void errorResponse(res, error.message, error.statusCode);
    throw error;
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await getExistingCart(req);
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId: String(req.params.productId) } });
  successResponse(res, "Product removed from cart");
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const cart = await getExistingCart(req);
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  successResponse(res, "Cart cleared");
};
