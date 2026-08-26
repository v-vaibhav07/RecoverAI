import { prisma } from "../../config/database.js";

export async function createProduct(
    userId: string,
    name: string,
    price: number,
    description?: string,
    currency?: string,
    metadata?: any
) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile || !profile.merchant_id) {
        throw new Error("Merchant profile not found");
    }

    const product = await prisma.products.create({
        data: {
            merchant_id: profile.merchant_id,
            name,
            description,
            price,
            currency: currency || "INR",
            metadata: metadata || {},
        },
    });

    return product;
}

export async function getProducts(userId: string) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile || !profile.merchant_id) {
        throw new Error("Merchant profile not found");
    }

    const products = await prisma.products.findMany({
        where: {
            merchant_id: profile.merchant_id,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return products;
}

export async function getProductById(
    userId: string,
    productId: string
) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile || !profile.merchant_id) {
        throw new Error("Merchant profile not found");
    }

    const product = await prisma.products.findFirst({
        where: {
            id: productId,
            merchant_id: profile.merchant_id,
        },
    });

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
}

export async function updateProduct(
    userId: string,
    productId: string,
    data: {
        name?: string;
        description?: string;
        price?: number;
        currency?: string;
        metadata?: any;
    }
) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile || !profile.merchant_id) {
        throw new Error("Merchant profile not found");
    }

    const existingProduct = await prisma.products.findFirst({
        where: {
            id: productId,
            merchant_id: profile.merchant_id,
        },
    });

    if (!existingProduct) {
        throw new Error("Product not found");
    }

    const product = await prisma.products.update({
        where: {
            id: productId,
        },
        data,
    });

    return product;
}

export async function deleteProduct(
    userId: string,
    productId: string
) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
    });

    if (!profile || !profile.merchant_id) {
        throw new Error("Merchant profile not found");
    }

    const existingProduct = await prisma.products.findFirst({
        where: {
            id: productId,
            merchant_id: profile.merchant_id,
        },
    });

    if (!existingProduct) {
        throw new Error("Product not found");
    }

    await prisma.products.delete({
        where: {
            id: productId,
        },
    });
}