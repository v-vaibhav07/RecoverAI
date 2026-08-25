import { prisma } from "../../config/database.js";

type PredictionResult = {
    recoveryScore: number;
    recoveryProbability: number;
    expectedRecoveryAmount: number;
    confidence: "LOW" | "MEDIUM" | "HIGH";
    predictionReasons: string[];
};

export async function predictRecovery(
    userId: string,
    recoveryCaseId: string
) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
        select: {
            merchant_id: true,
        },
    });

    if (!profile) {
        throw new Error("Merchant profile not found");
    }

    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: profile.merchant_id,
        },
        include: {
            payments: true,
            customers: true,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    const amount = Number(recoveryCase.original_amount);
    const recoverableAmount = Number(recoveryCase.recoverable_amount);

    const paymentStatus = recoveryCase.payments?.status ?? "UNKNOWN";
    const priority = recoveryCase.priority ?? "MEDIUM";

    const inputSnapshot = {
        recoveryCaseId: recoveryCase.id,
        originalAmount: amount,
        recoverableAmount,
        recoveredAmount: Number(recoveryCase.recovered_amount),
        paymentStatus,
        priority,
        customerId: recoveryCase.customer_id,
    };

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model:
                    process.env.OPENROUTER_MODEL ||
                    "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "system",
                        content: `
You are a payment recovery prediction AI.

Analyze the failed payment recovery case and estimate
how likely the payment is to be recovered.

Return ONLY valid JSON in this exact format:

{
  "recoveryScore": number,
  "recoveryProbability": number,
  "expectedRecoveryAmount": number,
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "predictionReasons": ["string"]
}

Rules:

recoveryScore:
0 to 100.

recoveryProbability:
0 to 1.

expectedRecoveryAmount:
must not be greater than recoverableAmount.

confidence:
LOW, MEDIUM, or HIGH.

predictionReasons:
array of short reasons explaining the prediction.
                        `.trim(),
                    },
                    {
                        role: "user",
                        content: JSON.stringify(inputSnapshot),
                    },
                ],
                temperature: 0.2,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `AI prediction request failed: ${response.status} ${errorText}`
        );
    }

    const result = await response.json();

    const content =
        result?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("AI returned an empty prediction");
    }

    let prediction: PredictionResult;

    try {
        prediction = JSON.parse(content);
    } catch {
        throw new Error("AI returned invalid JSON");
    }

    if (
        typeof prediction.recoveryScore !== "number" ||
        typeof prediction.recoveryProbability !== "number" ||
        typeof prediction.expectedRecoveryAmount !== "number" ||
        !["LOW", "MEDIUM", "HIGH"].includes(
            prediction.confidence
        ) ||
        !Array.isArray(prediction.predictionReasons)
    ) {
        throw new Error("AI returned an invalid prediction structure");
    }

    prediction.recoveryScore = Math.max(
        0,
        Math.min(100, prediction.recoveryScore)
    );

    prediction.recoveryProbability = Math.max(
        0,
        Math.min(1, prediction.recoveryProbability)
    );

    prediction.expectedRecoveryAmount = Math.max(
        0,
        Math.min(
            recoverableAmount,
            prediction.expectedRecoveryAmount
        )
    );

    const savedPrediction = await prisma.ai_predictions.create({
        data: {
            merchant_id: profile.merchant_id,
            recovery_case_id: recoveryCase.id,

            model_provider: "openrouter",

            model_name:
                process.env.OPENROUTER_MODEL ||
                "openai/gpt-4o-mini",

            model_version: null,

            recovery_score: prediction.recoveryScore,

            recovery_probability:
                prediction.recoveryProbability,

            expected_recovery_amount:
                prediction.expectedRecoveryAmount,

            confidence: prediction.confidence,

            prediction_reasons:
                prediction.predictionReasons,

            input_snapshot: inputSnapshot,
        },
    });

    return savedPrediction;
}