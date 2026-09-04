import { AIProviderError } from "./AIProvider";

const CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

interface ChatCompletionOptions {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}

async function callChatCompletions(options: ChatCompletionOptions): Promise<string> {
  const { apiKey, model, systemPrompt, userPrompt, jsonMode = false, temperature = 0.4 } = options;

  let response: Response;
  try {
    response = await fetch(CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch {
    throw new AIProviderError("Could not reach OpenAI. Check your network connection.", "network");
  }

  if (response.status === 401) {
    throw new AIProviderError("OpenAI rejected the API key. Please check it in Settings.", "invalid_api_key");
  }
  if (response.status === 429) {
    throw new AIProviderError("OpenAI rate limit reached. Please wait and try again.", "rate_limited");
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AIProviderError(`OpenAI request failed (${response.status}): ${body}`, "unknown");
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new AIProviderError("OpenAI returned an empty response.", "invalid_response");
  }
  return content;
}

export async function requestJson(options: Omit<ChatCompletionOptions, "jsonMode">): Promise<unknown> {
  const content = await callChatCompletions({ ...options, jsonMode: true });
  try {
    return JSON.parse(content);
  } catch {
    throw new AIProviderError("OpenAI returned invalid JSON.", "invalid_response");
  }
}

export async function requestText(options: Omit<ChatCompletionOptions, "jsonMode">): Promise<string> {
  const content = await callChatCompletions({ ...options, jsonMode: false });
  return content.trim();
}
