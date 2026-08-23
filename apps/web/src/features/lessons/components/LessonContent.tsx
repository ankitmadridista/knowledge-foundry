import { useState } from "react";
import {
    Card,
    Text,
    MarkdownRenderer,
    Button,
    Textarea,
    Badge,
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

    // Helper to determine if we are in one of the active pipeline states
    const isProcessing = [
        "Generating",
        "Drafting",
        "Critiquing",
        "Refining",
    ].includes(lesson.status);

    return (
        <Card className="p-6 md:p-10 min-h-75 relative group">
            {isProcessing && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in fade-in duration-500">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />

                    {/* Dynamic Real-Time Status Header */}
                    <h2 className="text-xl font-bold text-zinc-100 mb-2 tracking-wide">
                        {lesson.status === "Generating" &&
                            "Initializing AI Engine..."}
                        {lesson.status === "Drafting" &&
                            "1/3: Drafting Initial Lesson..."}
                        {lesson.status === "Critiquing" &&
                            "2/3: Critic is Reviewing Draft..."}
                        {lesson.status === "Refining" &&
                            "3/3: Applying Final Polish..."}
                    </h2>

                    {/* Dynamic Subtext */}
                    <Text className="text-zinc-400 max-w-md h-12">
                        {lesson.status === "Drafting" &&
                            "The Actor is reading the Context Pack and writing the first draft."}
                        {lesson.status === "Critiquing" &&
                            "The Critic persona is analyzing the draft against its strict rules."}
                        {lesson.status === "Refining" &&
                            "The Actor is rewriting the lesson based on the Critic's feedback."}
                        {lesson.status === "Generating" &&
                            "Warming up the background workers."}
                    </Text>

                    {/* Visual Progress Steps */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <div
                            className={`h-2 w-16 rounded-full transition-colors duration-500 ${["Drafting", "Critiquing", "Refining"].includes(lesson.status) ? "bg-indigo-500" : "bg-zinc-800"}`}
                        />
                        <div
                            className={`h-2 w-16 rounded-full transition-colors duration-500 ${["Critiquing", "Refining"].includes(lesson.status) ? "bg-indigo-500" : "bg-zinc-800"}`}
                        />
                        <div
                            className={`h-2 w-16 rounded-full transition-colors duration-500 ${lesson.status === "Refining" ? "bg-indigo-500" : "bg-zinc-800"}`}
                        />
                    </div>
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
                        <div className="flex flex-col h-full animate-in fade-in duration-700">
                            {/* --- OPTIONAL: SHOW CRITIC FEEDBACK IF IT EXISTS --- */}
                            {lesson.critiqueNotes && (
                                <div className="mb-8 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg
                                            className="w-4 h-4 text-indigo-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                                            Critic Feedback Applied
                                        </span>
                                    </div>
                                    <Text className="text-sm text-zinc-300 italic">
                                        "{lesson.critiqueNotes}"
                                    </Text>
                                </div>
                            )}

                            {/* --- ACTION BAR --- */}
                            <div className="flex justify-end gap-2 mb-6 border-b border-zinc-800/50 pb-4 shrink-0">
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

                            <div className="prose prose-invert max-w-none flex-1">
                                <MarkdownRenderer content={lesson.content} />
                            </div>

                            {/* --- TELEMETRY FOOTER --- */}
                            {lesson.model && (
                                <div className="mt-8 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-3 shrink-0 opacity-80">
                                    <Badge variant="neutral">
                                        Model:{" "}
                                        <span className="text-zinc-100 ml-1">
                                            {lesson.model}
                                        </span>
                                    </Badge>
                                    {lesson.tokensUsed !== null && (
                                        <Badge variant="neutral">
                                            Total Tokens:{" "}
                                            <span className="text-zinc-100 ml-1">
                                                {lesson.tokensUsed}
                                            </span>
                                        </Badge>
                                    )}
                                    {lesson.executionTimeMs !== null && (
                                        <Badge variant="neutral">
                                            Total Time:{" "}
                                            <span className="text-zinc-100 ml-1">
                                                {lesson.executionTimeMs}ms
                                            </span>
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
