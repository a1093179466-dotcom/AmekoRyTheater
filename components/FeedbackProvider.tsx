"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type FeedbackContextValue = {
  toast: (message: string, type?: ToastType) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider");
  }

  return context;
}

export default function FeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();

    setToasts((current) => [
      ...current,
      {
        id,
        type,
        message,
      },
    ]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        ...options,
        resolve,
      });
    });
  }, []);

  function handleConfirm(value: boolean) {
    if (!confirmState) {
      return;
    }

    confirmState.resolve(value);
    setConfirmState(null);
  }

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="fixed right-5 top-5 z-[200] flex w-[min(360px,calc(100vw-40px))] flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={
              item.type === "success"
                ? "rounded-2xl border border-emerald-400/30 bg-emerald-950/90 px-5 py-4 text-sm text-emerald-100 shadow-2xl shadow-black/50 backdrop-blur"
                : item.type === "error"
                  ? "rounded-2xl border border-red-400/30 bg-red-950/90 px-5 py-4 text-sm text-red-100 shadow-2xl shadow-black/50 backdrop-blur"
                  : "rounded-2xl border border-white/10 bg-zinc-950/90 px-5 py-4 text-sm text-zinc-100 shadow-2xl shadow-black/50 backdrop-blur"
            }
          >
            {item.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <section className="w-full max-w-sm rounded-[28px] border border-white/10 bg-[#090909] p-6 text-white shadow-2xl shadow-black/80">
            <h2 className="mb-3 text-2xl font-black">
              {confirmState.title || "确认操作"}
            </h2>

            <p className="mb-6 leading-7 text-zinc-400">
              {confirmState.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleConfirm(false)}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition"
              >
                {confirmState.cancelText || "取消"}
              </button>

              <button
                type="button"
                onClick={() => handleConfirm(true)}
                className={
                  confirmState.danger
                    ? "rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-400 transition"
                    : "rounded-full bg-white px-5 py-2 text-sm font-medium text-black hover:bg-rose-100 transition"
                }
              >
                {confirmState.confirmText || "确认"}
              </button>
            </div>
          </section>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}