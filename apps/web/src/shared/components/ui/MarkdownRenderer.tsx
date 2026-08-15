import ReactMarkdown, { type Components } from "react-markdown";

// Fully type-safe helper: No 'any', no unused variables!
const cleanProps = <T extends object>(props: T) => {
    const rest = { ...props } as Record<string, unknown>;
    delete rest.node;
    delete rest.inline;
    return rest as Omit<T, "node" | "inline">;
};

// Premium Markdown styling using your Zinc/Indigo theme
const markdownComponents: Components = {
    h1: (props) => (
        <h1
            className="text-2xl font-bold mb-4 text-zinc-100"
            {...cleanProps(props)}
        />
    ),
    h2: (props) => (
        <h2
            className="text-xl font-bold mb-3 mt-6 text-zinc-100 border-b border-zinc-800 pb-2"
            {...cleanProps(props)}
        />
    ),
    h3: (props) => (
        <h3
            className="text-lg font-bold mb-2 mt-4 text-zinc-100"
            {...cleanProps(props)}
        />
    ),
    p: (props) => (
        <p
            className="mb-4 leading-relaxed text-zinc-300"
            {...cleanProps(props)}
        />
    ),
    ul: (props) => (
        <ul
            className="list-disc pl-6 mb-4 space-y-1 text-zinc-300"
            {...cleanProps(props)}
        />
    ),
    ol: (props) => (
        <ol
            className="list-decimal pl-6 mb-4 space-y-1 text-zinc-300"
            {...cleanProps(props)}
        />
    ),
    li: (props) => <li className="pl-1" {...cleanProps(props)} />,
    strong: (props) => (
        <strong
            className="font-semibold text-zinc-100"
            {...cleanProps(props)}
        />
    ),
    blockquote: (props) => (
        <blockquote
            className="border-l-4 border-indigo-500 pl-4 py-2 mb-4 bg-indigo-500/10 italic text-zinc-300 rounded-r-lg"
            {...cleanProps(props)}
        />
    ),
    code: (props) => {
        const rest = cleanProps(props);
        const isInline =
            !props.className && !String(props.children).includes("\n");

        return isInline ? (
            <code
                className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300"
                {...rest}
            >
                {props.children}
            </code>
        ) : (
            <pre className="bg-zinc-950 border border-zinc-800 text-zinc-300 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono shadow-inner">
                <code className={props.className} {...rest}>
                    {props.children}
                </code>
            </pre>
        );
    },
};

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    );
}
