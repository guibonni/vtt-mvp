"use client";

import { useWindowManager } from "./WindowManagerContext";
import { windowRegistry } from "./WindowRegistry";

export default function WindowRenderer() {
    const { windows, closeWindow, focusWindow } = useWindowManager();

    const highestZ = Math.max(...windows.map((w) => w.zIndex), 0);

    return (
        <>
            {windows.map((window) => {
                const Component = windowRegistry[window.data.type];

                return (
                    <Component
                        key={window.id}
                        isOpen={true}
                        {...window.data.props}
                        zIndex={window.zIndex}
                        isActive={window.zIndex === highestZ}
                        onFocus={() => focusWindow(window.id)}
                        onClose={() => closeWindow(window.id)}
                    />
                );
            })}
        </>
    );
}