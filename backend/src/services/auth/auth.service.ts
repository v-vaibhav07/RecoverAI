import { supabase } from "../../config/supabase.js";
import { prisma } from "../../config/database.js";

export async function registerMerchant(
    email: string,
    password: string,
    fullName: string
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: "merchant",
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("User registration failed");
    }

    const userId = data.user.id;

    try {
        const merchant = await prisma.merchants.create({
            data: {
                business_name: fullName,
                email: email,
            },
        });

        const profile = await prisma.profiles.create({
            data: {
                id: userId,
                merchant_id: merchant.id,
                full_name: fullName,
                email: email,
                role: "MERCHANT",
            },
        });

        return {
            user: data.user,
            session: data.session,
            merchant,
            profile,
        };
    } catch (error: any) {
        throw new Error(
            error.message || "Failed to create merchant profile"
        );
    }
}

export async function loginMerchant(
    email: string,
    password: string
) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function logoutMerchant() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}