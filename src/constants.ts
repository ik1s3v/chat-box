import type { IChatBoxSettings } from './types';

export const DEFAULT_CHATBOX_SETTINGS: IChatBoxSettings = {
  is_show_badges: true,
  is_show_sender_color: true,
  is_show_platform_color: true,
  is_show_timestamp: true,
  is_show_bot_messages: true,
  is_remove_message_after_delay: false,
  remove_message_after_delay_seconds: 30,
};
