import { Box, Button, TextField } from '@mui/material';
import type { SerializedError } from '@reduxjs/toolkit';
import { showSnackBar, useWidgetMutation, useWidgetQuery } from '@widy/react';
import { AlertSeverity, type ISettings } from '@widy/sdk';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { DEFAULT_CHATBOX_SETTINGS } from '../constants';
import type { IChatBoxSettings } from '../types';
import styles from './App.module.css';
import { AppSnackBar } from './components/AppSnackBar';
import OnOffSwitch from './components/OnOffSwitch';

const App = () => {
  const [chatSettings, setChatSettings] = useState<IChatBoxSettings>(
    DEFAULT_CHATBOX_SETTINGS,
  );
  const dispatch = useDispatch();

  const { data: settings } = useWidgetQuery<unknown, ISettings>({
    scope: 'widgets:settings.read',
  });

  const { data } = useWidgetQuery<unknown, string>({
    scope: 'widgets:control:storage.read',
  });

  const { trigger } = useWidgetMutation<IChatBoxSettings, unknown>({
    scope: 'widgets:control:storage.write',
  });

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (data) {
      setChatSettings(JSON.parse(data));
    }
  }, [data]);

  useEffect(() => {
    if (settings) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings, i18n]);

  return (
    <Box
      sx={{
        display: 'grid',
        padding: 2,
        placeItems: 'center',
        gap: 2,
      }}
    >
      <h1>{t('title')}</h1>

      <div className={styles.settingsContainer}>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_show_badges')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_show_badges}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_show_badges: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_show_bot_messages')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_show_bot_messages}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_show_bot_messages: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_show_platform_color')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_show_platform_color}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_show_platform_color: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_show_sender_color')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_show_sender_color}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_show_sender_color: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_show_timestamp')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_show_timestamp}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_show_timestamp: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('is_remove_message_after_delay')}:</span>
          </div>
          <OnOffSwitch
            checked={chatSettings.is_remove_message_after_delay}
            onChange={(_, checked) => {
              setChatSettings((prev) => ({
                ...prev,
                is_remove_message_after_delay: checked,
              }));
            }}
          />
        </div>
        <div className={styles.settings}>
          <div className={styles.label}>
            <span>{t('remove_message_after_delay_seconds')}:</span>
          </div>
          <TextField
            type="number"
            size="small"
            value={chatSettings.remove_message_after_delay_seconds}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            disabled={!chatSettings.is_remove_message_after_delay}
            onChange={(event) => {
              const delay = Number(event.target.value);
              setChatSettings((prev) => ({
                ...prev,
                remove_message_after_delay_seconds: Number.isFinite(delay)
                  ? Math.max(1, delay)
                  : 1,
              }));
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', placeContent: 'center' }}>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              await trigger(chatSettings);
              dispatch(
                showSnackBar({
                  message: t('success'),
                  alertSeverity: AlertSeverity.success,
                }),
              );
            } catch (error) {
              const err = error as SerializedError;
              dispatch(
                showSnackBar({
                  message: err.message as string,
                  alertSeverity: AlertSeverity.error,
                }),
              );
            }
          }}
        >
          {t('save')}
        </Button>
      </div>
      <AppSnackBar />
    </Box>
  );
};

export default App;
