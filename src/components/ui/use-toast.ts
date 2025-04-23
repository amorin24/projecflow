import { useState } from 'react';

export type ToastProps = {
  title: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning';
  variant?: 'default' | 'destructive';
  duration?: number;
};

export type Toast = ToastProps & {
  id: string;
  visible: boolean;
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      visible: true,
      duration: 5000,
      type: 'default',
      ...props,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id ? { ...toast, visible: false } : toast
          )
        );

        setTimeout(() => {
          setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== id)
          );
        }, 300);
      }, props.duration || 5000);
    }

    return id;
  };

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts((prevToasts) =>
        prevToasts.map((toast) =>
          toast.id === id ? { ...toast, visible: false } : toast
        )
      );

      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, 300);
    },
  };
}
