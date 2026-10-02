import { useWidgetQuery, useWidgetSubscription } from '@widy/react';
import {
  type IChatFragment,
  type IUnifiedBannedUser,
  type IUnifiedChatMessage,
  type IUnifiedChatMessageDelete,
  Platform,
} from '@widy/sdk';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { DEFAULT_CHATBOX_SETTINGS } from '../constants';
import type { IChatBoxSettings } from '../types';

const MAX_MESSAGES = 50;

type SenderColorStyle = CSSProperties & {
  '--sender-color': string;
  '--platform-color': string;
};

const platformColors: Partial<Record<Platform, string>> = {
  [Platform.Twitch]: '#9146ff',
  [Platform.Kick]: '#53fc18',
};

const getPlatformColor = (platform: Platform) =>
  platformColors[platform] ?? '#38bdf8';

const parseChatSettings = (data: string): IChatBoxSettings => {
  try {
    return {
      ...DEFAULT_CHATBOX_SETTINGS,
      ...(JSON.parse(data) as Partial<IChatBoxSettings>),
    };
  } catch {
    return DEFAULT_CHATBOX_SETTINGS;
  }
};

const formatTimestamp = (createdAt: string) => {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(date);
};

const getEmoteUrl = (platform: Platform, emoteId: string) => {
  switch (platform) {
    case Platform.Twitch:
      return `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/3.0`;
    case Platform.Kick:
      return `https://files.kick.com/emotes/${emoteId}/fullsize`;
    default:
      return null;
  }
};

type MessageContentProps = {
  fallbackText: string;
  fragments: IChatFragment[];
  platform: Platform;
};

const MessageContent = ({
  fallbackText,
  fragments,
  platform,
}: MessageContentProps) => {
  if (fragments.length === 0) {
    return <>{fallbackText || '\u00a0'}</>;
  }

  return (
    <>
      {fragments.map((fragment, index) => {
        if (fragment.kind.kind !== 'Emote') {
          return <span key={fragment.text}>{fragment.text}</span>;
        }

        const emoteUrl = getEmoteUrl(platform, fragment.kind.id);

        if (!emoteUrl) {
          return (
            <span key={['emote-text', fragment.kind.id, index].join('-')}>
              {fragment.text}
            </span>
          );
        }

        return (
          <img
            className="chat-emote"
            key={['emote', fragment.kind.id, index].join('-')}
            src={emoteUrl}
            alt={fragment.text}
            title={fragment.text}
            onError={(event) => {
              event.currentTarget.replaceWith(fragment.text);
            }}
          />
        );
      })}
    </>
  );
};

const App = () => {
  const [messages, setMessages] = useState<IUnifiedChatMessage[]>([]);

  const [chatSettings, setChatSettings] = useState<IChatBoxSettings>(
    DEFAULT_CHATBOX_SETTINGS,
  );
  const messageTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const { data: storedChatSettings } = useWidgetQuery<unknown, string>({
    scope: 'widgets:control:storage.read',
  });

  useEffect(() => {
    if (storedChatSettings) {
      setChatSettings(parseChatSettings(storedChatSettings));
    }
  }, [storedChatSettings]);

  useEffect(() => {
    const currentIds = new Set(messages.map((message) => message.id));

    for (const [messageId, timer] of messageTimers.current) {
      if (!currentIds.has(messageId)) {
        clearTimeout(timer);
        messageTimers.current.delete(messageId);
      }
    }

    if (chatSettings.is_remove_message_after_delay) {
      const delay = Math.max(1, chatSettings.remove_message_after_delay_seconds) * 1000;
      for (const message of messages) {
        if (!messageTimers.current.has(message.id)) {
          messageTimers.current.set(
            message.id,
            setTimeout(() => {
              setMessages((currentMessages) =>
                currentMessages.filter((currentMessage) => currentMessage.id !== message.id),
              );
              messageTimers.current.delete(message.id);
            }, delay),
          );
        }
      }
    } else {
      for (const timer of messageTimers.current.values()) {
        clearTimeout(timer);
      }
      messageTimers.current.clear();
    }
  }, [chatSettings.is_remove_message_after_delay, chatSettings.remove_message_after_delay_seconds, messages]);

  useEffect(
    () => () => {
      for (const timer of messageTimers.current.values()) {
        clearTimeout(timer);
      }
    },
    [],
  );

  useWidgetSubscription<IUnifiedChatMessage>(
    'widgets:chat-message.subscription',
    (message) => {
      setMessages((currentMessages) => {
        const withoutDuplicate = currentMessages.filter(
          (currentMessage) => currentMessage.id !== message.id,
        );

        return [...withoutDuplicate, message].slice(-MAX_MESSAGES);
      });
    },
  );

  useWidgetSubscription<IUnifiedChatMessageDelete>(
    'widgets:chat-message-delete.subscription',
    (deletedMessage) => {
      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== deletedMessage.message_id,
        ),
      );
    },
  );

  useWidgetSubscription<IUnifiedBannedUser>(
    'widgets:channel-user-banned.subscription',
    (bannedUser) => {
      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) =>
            message.platform !== bannedUser.platform ||
            message.sender.id !== bannedUser.target_user.id,
        ),
      );
    },
  );

  useWidgetSubscription<string>(
    'widgets:control:storage.subscription',
    (data) => {
      setChatSettings(parseChatSettings(data));
    },
  );
  const visibleMessages = useMemo(() => {
    const filteredMessages = chatSettings.is_show_bot_messages
      ? messages
      : messages.filter((message) => !message.sender.roles.is_bot);

    return filteredMessages;
  }, [chatSettings.is_show_bot_messages, messages]);

  return (
    <main className="chat-overlay" aria-label="Chat overlay">
      <ol className="message-list">
        {visibleMessages.map((message) => {
          const senderColor = message.sender.color ?? '#6ee7b7';
          const senderColorStyle: SenderColorStyle = {
            '--sender-color': chatSettings.is_show_sender_color
              ? senderColor
              : 'transparent',
            '--platform-color': chatSettings.is_show_platform_color
              ? getPlatformColor(message.platform)
              : 'transparent',
          };
          const badges = message.sender.badges;
          const timestamp = formatTimestamp(message.created_at);
          const text = message.content.text.trim();
          const fragments = message.content.fragments ?? [];

          return (
            <li className="message" key={message.id} style={senderColorStyle}>
              <div className="message-body">
                <div className="message-meta">
                  {chatSettings.is_show_badges && badges.length > 0 && (
                    <span className="badges">
                      {badges.map((badge) => (
                        <img
                          className="badge-image"
                          key={badge.id}
                          src={badge.image_url}
                          alt={badge.id}
                          title={badge.id}
                          onError={(event) => {
                            event.currentTarget.replaceWith('');
                          }}
                        />
                      ))}
                    </span>
                  )}
                  <span
                    className="sender"
                    style={{
                      color: chatSettings.is_show_sender_color
                        ? senderColor
                        : undefined,
                    }}
                  >
                    {message.sender.username}
                  </span>
                  {chatSettings.is_show_timestamp && timestamp && (
                    <time className="timestamp" dateTime={message.created_at}>
                      {timestamp}
                    </time>
                  )}
                </div>
                <p className="message-text">
                  <MessageContent
                    fallbackText={text}
                    fragments={fragments}
                    platform={message.platform}
                  />
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
};

export default App;
