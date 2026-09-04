import type { MessageResponseMap, RuntimeMessage } from "../types/messages";

/**
 * Centralized, typed wrapper around chrome.runtime / chrome.tabs messaging.
 * No other module should call chrome.runtime.sendMessage or
 * chrome.tabs.sendMessage directly — route everything through here so the
 * message contract stays in one place.
 */

export async function sendToBackground<T extends RuntimeMessage>(
  message: T
): Promise<MessageResponseMap[T["type"]]> {
  const response = await chrome.runtime.sendMessage(message);
  return response as MessageResponseMap[T["type"]];
}

export async function sendToTab<T extends RuntimeMessage>(
  tabId: number,
  message: T
): Promise<MessageResponseMap[T["type"]]> {
  const response = await chrome.tabs.sendMessage(tabId, message);
  return response as MessageResponseMap[T["type"]];
}

type MessageHandler<T extends RuntimeMessage = RuntimeMessage> = (
  message: T,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponseMap[T["type"]]> | MessageResponseMap[T["type"]];

/**
 * Registers a single onMessage listener that dispatches to typed handlers
 * keyed by message type. Handlers may be async; the listener automatically
 * returns `true` to keep the response channel open.
 */
export function registerMessageHandlers(
  handlers: Partial<{ [K in RuntimeMessage["type"]]: MessageHandler<Extract<RuntimeMessage, { type: K }>> }>
): void {
  chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
    const handler = handlers[message.type] as MessageHandler | undefined;
    if (!handler) return false;

    Promise.resolve(handler(message, sender))
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error(`[AI Copilot] Handler for "${message.type}" failed:`, error);
        sendResponse(undefined);
      });

    return true;
  });
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}
