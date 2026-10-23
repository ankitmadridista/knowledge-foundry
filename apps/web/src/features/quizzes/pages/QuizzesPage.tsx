import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "@/features/quizzes/api";
import type { QuizSummaryDto } from "@/features/quizzes/types";
import type { PagedResponse } from "@/shared/types/pagination";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Card,
    Badge,
    LoadingState,
    ErrorState,
    Button,
} from "@/shared/components/ui";

export function QuizzesPage() {
    const navigate = useNavigate();
    const [pageInfo, setPageInfo] =
        useState<PagedResponse<QuizSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let isMounted = true;
        const fetchAssessments = async () => {
            setIsLoading(true);
            try {
                const response = await getQuizzes(currentPage, 9); // 9 per page
                if (isMounted) {
                    setPageInfo(response);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to load assessments:", err);
                if (isMounted)
                    setError("Failed to load assessments. Please try again.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAssessments();
        return () => {
            isMounted = false;
        };
    }, [currentPage]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Published":
                return <Badge variant="success">Published</Badge>;
            case "Failed":
                return <Badge variant="danger">Failed</Badge>;
            case "Review":
                return <Badge variant="warning">Needs Review</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <Section>
            <Container>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <PageHeader
                        title="Assessment Library"
                        description="Review, edit, and publish AI-generated quizzes across all your lessons."
                    />
                </div>

                {error && <ErrorState message={error} />}

                {isLoading ? (
                    <LoadingState message="Loading assessments..." />
                ) : !pageInfo?.items || pageInfo.items.length === 0 ? (
                    <Card className="p-12 text-center border-dashed bg-zinc-950/50">
                        <h3 className="text-xl font-bold text-zinc-300 mb-2">
                            No Assessments Found
                        </h3>
                        <p className="text-zinc-500 max-w-md mx-auto mb-6">
                            You haven't generated any quizzes yet. Go to a
                            completed lesson to create your first assessment!
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate("/lessons")}
                        >
                            Browse Lessons
                        </Button>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pageInfo.items.map((quiz) => (
                                <Card
                                    key={quiz.id}
                                    className="p-6 cursor-pointer hover:border-fuchsia-500/30 transition-colors group flex flex-col h-full"
                                    onClick={() =>
                                        navigate(`/quizzes/${quiz.id}`)
                                    }
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        {getStatusBadge(quiz.status)}
                                        {quiz.isManuallyEdited && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded">
                                                Edited
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-fuchsia-400 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/50">
                                        <span>
                                            {quiz.questionCount} Questions
                                        </span>
                                        <span>
                                            {new Date(
                                                quiz.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pageInfo.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12">
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={!pageInfo.hasPreviousPage}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium text-zinc-400">
                                    Page {pageInfo.pageNumber} of{" "}
                                    {pageInfo.totalPages}
                                </span>
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(
                                                pageInfo.totalPages,
                                                p + 1,
                                            ),
                                        )
                                    }
                                    disabled={!pageInfo.hasNextPage}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </Section>
    );
}
