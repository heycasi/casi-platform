// Chat client factory
// Creates platform-specific chat clients with a unified interface

import type { IChatClient, Platform } from '@/types/chat'
import { TwitchChatClient } from './twitch'
import { KickChatClient } from './kick'

/**
 * Create a chat client for the specified platform
 * @param platform - The platform to create a client for ('twitch' or 'kick')
 * @param username - The channel/username to connect to
 * @returns IChatClient instance for the specified platform
 */
export function createChatClient(platform: Platform, username: string): IChatClient {
  switch (platform) {
    case 'twitch':
      return new TwitchChatClient(username)

    case 'kick':
      return new KickChatClient(username)

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

/**
 * Create multiple chat clients at once
 * Useful for multi-platform streaming
 * @param configs - Array of platform/username configurations
 * @returns Array of IChatClient instances
 */
export function createMultipleChatClients(
  configs: Array<{ platform: Platform; username: string }>
): IChatClient[] {
  return configs.map(({ platform, username }) => createChatClient(platform, username))
}
