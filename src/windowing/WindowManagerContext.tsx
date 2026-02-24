"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";
import { ManagedWindow, WindowData, WindowKind } from "./windowTypes";

type WindowManagerContextType = {
    windows: ManagedWindow[];
    openWindow: <K extends WindowKind>(data: WindowData<K>) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
};

const WindowManagerContext = createContext<
    WindowManagerContextType | undefined
>(undefined);

export function WindowManagerProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [windows, setWindows] = useState<ManagedWindow[]>([]);
    const [topZIndex, setTopZIndex] = useState(100);

    function openWindow<K extends WindowKind>(data: WindowData<K>) {
        setWindows((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                zIndex: topZIndex + 1,
                data,
            },
        ]);

        setTopZIndex((prev) => prev + 1);
    }

    function closeWindow(id: string) {
        setWindows((prev) => prev.filter((w) => w.id !== id));
    }

    function focusWindow(id: string) {
        setWindows((prev) =>
            prev.map((w) =>
                w.id === id ? { ...w, zIndex: topZIndex + 1 } : w
            )
        );

        setTopZIndex((prev) => prev + 1);
    }

    return (
        <WindowManagerContext.Provider
            value={{ windows, openWindow, closeWindow, focusWindow }}
        >
            {children}
        </WindowManagerContext.Provider>
    );
}

export function useWindowManager() {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error(
            "useWindowManager must be used within WindowManagerProvider"
        );
    }
    return context;
}