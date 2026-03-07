import { ChevronRightIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function ArrowButton({ children, variant = "default", isLoading = false, className, iconClassName, iconContainerClassName, ...rest }: { children: React.ReactNode, variant?: "default" | "outline", isLoading?: boolean, className?: string, iconClassName?: string, iconContainerClassName?: string } & React.ComponentProps<typeof Button>) {
    return (
        <Button
            className={cn("flex gap-3 group items-center pl-6 pr-4 py-10 rounded-full text-xl sm:text-lg sm:py-8 relative sm:static w-full", className)}
            variant={variant}
            {...rest}
            disabled={isLoading || rest.disabled}
        >
            <span className="mr-2">
                {children}
            </span>

            {(variant === "default" || variant === "outline") && (
                <div className={cn(
                    "size-12 sm:size-9 rounded-full flex items-center justify-center absolute sm:static right-4",
                    variant === "default" && "bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200",
                    variant === "outline" && "bg-[#F3F6FC] group-hover:bg-white/60 transition-colors duration-100",
                    iconContainerClassName
                )}>
                    {isLoading ? (
                        <Loader2 className={cn("size-8 sm:size-6 animate-spin", iconClassName)} />
                    ) : (
                        <ChevronRightIcon className={cn("size-8 sm:size-6", iconClassName)} />
                    )}
                </div>
            )}
        </Button>
    )
}