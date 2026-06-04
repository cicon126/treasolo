import { useEffect, useCallback } from 'react';
import { useTemperatureStore } from '../store/temperatureStore';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { alarmSound } from '../utils/alarmSound';

export const useTemperatureMonitor = () => {
  const { status, voiceEnabled, alarmEnabled, autoSimulate, setCurrentTemp } = useTemperatureStore();
  const { speak, reset } = useSpeechSynthesis();

  useEffect(() => {
    speak(status, voiceEnabled);
  }, [status, voiceEnabled, speak]);

  useEffect(() => {
    if (!voiceEnabled) {
      reset();
    }
  }, [voiceEnabled, reset]);

  useEffect(() => {
    if (alarmEnabled && status !== 'normal') {
      alarmSound.startAlarm();
    } else {
      alarmSound.stopAlarm();
    }
  }, [status, alarmEnabled]);

  useEffect(() => {
    if (!alarmEnabled) {
      alarmSound.stopAlarm();
    }
  }, [alarmEnabled]);

  const startAutoSimulation = useCallback(() => {
    const interval = setInterval(() => {
      setCurrentTemp(
        useTemperatureStore.getState().currentTemp + (Math.random() - 0.5) * 2
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [setCurrentTemp]);

  useEffect(() => {
    if (autoSimulate) {
      return startAutoSimulation();
    }
  }, [autoSimulate, startAutoSimulation]);

  return null;
};
