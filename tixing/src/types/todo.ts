export interface TodoItem {
  id: string;
  content: string;
  remindTime: string;
  isCompleted: boolean;
  isReminded: boolean;
  createdAt: string;
}

export interface AppSettings {
  enableReminder: boolean;
  enableVoice: boolean;
  remindAdvanceMinutes: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  enableReminder: true,
  enableVoice: true,
  remindAdvanceMinutes: 5
};
