'use client';

import React from 'react';
import { ToastMessage } from '@/types/collage';
import styles from './Toast.module.css';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        let Icon = Info;
        if (toast.type === 'success') Icon = CheckCircle;
        if (toast.type === 'warning') Icon = AlertTriangle;
        if (toast.type === 'error') Icon = AlertCircle;

        return (
          <div key={toast.id} className={`${styles.toastItem} ${styles[toast.type]}`}>
            <Icon className={styles.icon} size={18} />
            <span className={styles.text}>{toast.text}</span>
            <button
              onClick={() => onDismiss(toast.id)}
              className={styles.closeBtn}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
