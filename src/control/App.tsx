import { Box, Button } from '@mui/material';
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
