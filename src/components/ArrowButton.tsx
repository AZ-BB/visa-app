import { ChevronRightIcon } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function ArrowButton({ children, variant = "default", className, iconClassName, iconContainerClassName, ...rest }: { children: React.ReactNode, variant?: "default" | "outline", className?: string, iconClassName?: string, iconContainerClassName?: string } & React.ComponentProps<typeof Button>) {
    return (
        <Button
            className={cn("flex gap-3 group items-center pl-6 pr-4 py-8 rounded-full text-lg", className)}
            variant={variant}
            {...rest}
        >
            {children}

            {
                variant === "default" && (
                    <div className={cn("w-9 h-9 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200 flex items-center justify-center", iconContainerClassName)}>
                        <ChevronRightIcon className={cn("size-6", iconClassName)} />
                    </div>
                )
            }

            {
                variant === "outline" && (
                    <div className={cn("w-9 h-9 rounded-full bg-[#F3F6FC] group-hover:bg-white/60 transition-colors duration-100 flex items-center justify-center", iconContainerClassName)}>
                        <ChevronRightIcon className={cn("size-6", iconClassName)} />
                    </div>
                )
            }
        </Button>
    )
}