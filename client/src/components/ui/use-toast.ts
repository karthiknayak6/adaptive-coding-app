// Simplified toast implementation for fixing linter errors
import { useState, useCallback } from "react";

type ToastVariant = "default" | "destructive";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    setToasts((prev) => [...prev, props]);
    // In a real implementation, we would have timeout logic
  }, []);

  return { toast, toasts };
}
