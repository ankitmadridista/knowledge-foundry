import { Card, Text } from "@/shared/components/ui";
import type { PLATFORM_FEATURES } from "../data/platform-features";

export function FeatureCard({ feature, onClick }: { feature: typeof PLATFORM_FEATURES[0]; onClick: () => void }) {
    return (
        <Card
            className={`p-8 cursor-pointer transition-all hover:-translate-y-1 bg-zinc-900/50 group ${feature.styles.hoverBorder}`}
            onClick={onClick}
        >
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-6 text-2xl ${feature.styles.iconBg}`}>
                {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-100 mb-3">
                {feature.title}
            </h3>
            <Text className="text-zinc-400 mb-6 flex-1">
                {feature.description}
            </Text>
            <span className={`font-medium text-sm transition-colors ${feature.styles.actionText}`}>
                {feature.actionText}
            </span>
        </Card>
    );
}