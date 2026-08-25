import "dotenv/config";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
}

export async function callOpenRouter(
    messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
    }>
) {
    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages,
                temperature: 0.2,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            `OpenRouter API error: ${response.status} ${errorText}`
        );
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content;
}