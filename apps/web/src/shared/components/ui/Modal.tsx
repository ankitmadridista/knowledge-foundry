import { useEffect } from "react";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    // Action props
    primaryActionLabel?: string;
    onPrimaryAction?: () => void;
    isPrimaryActionDestructive?: boolean;
    isPrimaryActionLoading?: boolean;
    secondaryActionLabel?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    primaryActionLabel,
    onPrimaryAction,
    isPrimaryActionDestructive = false,
    isPrimaryActionLoading = false,
    secondaryActionLabel = "Cancel",
}: ModalProps) {
    // Prevent scrolling on the body when the modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel */}
            <div
                className="relative bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-zinc-100 mb-2">
                        {title}
                    </h3>

                    {description && (
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {children && <div className="mb-6">{children}</div>}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={isPrimaryActionLoading}
                            className="w-full sm:w-auto"
                        >
                            {secondaryActionLabel}
                        </Button>

                        {primaryActionLabel && onPrimaryAction && (
                            <Button
                                variant="primary"
                                onClick={onPrimaryAction}
                                disabled={isPrimaryActionLoading}
                                className={`w-full sm:w-auto ${
                                    isPrimaryActionDestructive
                                        ? "bg-red-500 hover:bg-red-600 text-white border-transparent"
                                        : ""
                                }`}
                            >
                                {isPrimaryActionLoading
                                    ? "Processing..."
                                    : primaryActionLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
