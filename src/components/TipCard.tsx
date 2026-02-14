import { cn } from "@/lib/utils";
import InfoIcon from "@/components/svgs/info";

export default function TipCard({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("border-2 border-primary/75 bg-[#F0FAFF] rounded-2xl p-5 text-base flex items-start gap-2 shadow-sm", className)}>
            <InfoIcon className="size-5 fill-primary mt" />
            {
                children
            }
        </div>
    )
}