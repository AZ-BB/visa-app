import { ChevronRightIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function ArrowButton({ children }: { children: React.ReactNode }) {
    return (
        <Button
            className="flex gap-3 group items-center pl-6 pr-4 py-4 rounded-full text-lg"
        >
            {children}
            <div className="w-9 h-9 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200 flex items-center justify-center">
                <ChevronRightIcon className="size-6" />
            </div>
        </Button>
    )
}