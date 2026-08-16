import { useState } from "react";
import {
    Card,
    Text,
    MarkdownRenderer,
    Button,
    Textarea,
} from "@/shared/components/ui";
import type { LessonDto } from "@/features/lessons/types";
import toast from "react-hot-toast";

interface LessonContentProps {
    lesson: LessonDto;
    onRetry: () => void;
    onUpdateContent: (newContent: string) => Promise<void>;
}

export function LessonContent({
    lesson,
    onRetry,
    onUpdateContent,
}: LessonContentProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftContent, setDraftContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = () => {
        setDraftContent(lesson.content || "");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setDraftContent("");
    };

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            await onUpdateContent(draftContent);
            setIsEditing(false);
        } catch {
            // Error is handled by parent
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = async () => {
        if (!lesson.content) return;
        try {
            await navigator.clipboard.writeText(lesson.content);
            toast.success("Lesson copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy:", err);
            toast.error(
                "Failed to copy text. Your browser might block this action.",
            );
        }
    };

    return (
        <Card className="p-6 md:p-10 min-h-125 relative group">
            {lesson.status === "Generating" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-zinc-100 mb-2">
                        AI is writing your lesson...
                    </h2>
                    <Text className="text-zinc-400 max-w-md">
                        This usually takes 10-30 seconds depending on the
                        complexity of the topic and the length of the context
                        pack.
                    </Text>
                </div>
            )}

            {lesson.status === "Failed" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="text-rose-500 mb-4">
                        <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-rose-400 mb-2">
                        Generation Failed
                    </h2>
                    <Text className="text-zinc-400 max-w-md mb-6">
                        {lesson.errorMessage ||
                            "The AI encountered an error while generating this lesson."}
                    </Text>
                    <Button variant="secondary" onClick={onRetry}>
                        Try Again
                    </Button>
                </div>
            )}

            {lesson.status === "Completed" && lesson.content && (
                <>
                    {/* EDITING MODE */}
                    {isEditing ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-zinc-100">
                                    Edit Lesson Markdown
                                </h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveEdit}
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={draftContent}
                                onChange={(e) =>
                                    setDraftContent(e.target.value)
                                }
                                className="font-mono text-sm h-150 w-full"
                                placeholder="Edit the markdown here..."
                            />
                        </div>
                    ) : (
                        /* VIEWING MODE */
                        <div className="flex flex-col">
                            {/* --- ALWAYS VISIBLE ACTION BAR --- */}
                            <div className="flex justify-end gap-2 mb-6 border-b border-zinc-800/50 pb-4">
                                {/* COPY ICON BUTTON */}
                                <button
                                    onClick={handleCopy}
                                    title="Copy raw markdown"
                                    className="flex items-center justify-center w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all shadow-sm"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.75}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                                        />
                                    </svg>
                                </button>

                                {/* EDIT ICON BUTTON */}
                                <button
                                    onClick={handleEditClick}
                                    title="Edit Content"
                                    className="flex items-center justify-center w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all shadow-sm"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.75}
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <MarkdownRenderer content={lesson.content} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
