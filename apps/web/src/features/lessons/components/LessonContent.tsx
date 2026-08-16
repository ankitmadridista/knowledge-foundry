import { useState } from "react";
import { Card, Text, MarkdownRenderer, Button, Textarea } from "@/shared/components/ui";
import type { LessonDto } from "@/features/lessons/types";

interface LessonContentProps {
    lesson: LessonDto;
    onRetry: () => void;
    onUpdateContent: (newContent: string) => Promise<void>;
}

export function LessonContent({ lesson, onRetry, onUpdateContent }: LessonContentProps) {
    // State for editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [draftContent, setDraftContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Enter edit mode and copy the current content into the draft
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
            // Error is handled/alerted by the parent component
        } finally {
            setIsSaving(false);
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
                        This usually takes 10-30 seconds depending on the complexity of the topic and the length of the context pack.
                    </Text>
                </div>
            )}

            {lesson.status === "Failed" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="text-rose-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-rose-400 mb-2">Generation Failed</h2>
                    <Text className="text-zinc-400 max-w-md mb-6">
                        {lesson.errorMessage || "The AI encountered an error while generating this lesson."}
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
                                <h3 className="text-lg font-bold text-zinc-100">Edit Lesson Markdown</h3>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleSaveEdit} disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                className="font-mono text-sm h-150 w-full"
                                placeholder="Edit the markdown here..."
                            />
                        </div>
                    ) : (
                        /* VIEWING MODE */
                        <div className="relative">
                            {/* Hidden Edit Button that appears on hover */}
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <Button 
                                    variant="secondary" 
                                    onClick={handleEditClick}
                                    className="bg-zinc-900/80 backdrop-blur-sm border-zinc-700 hover:border-indigo-500/50 hover:text-indigo-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                    </svg>
                                    Edit Content
                                </Button>
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