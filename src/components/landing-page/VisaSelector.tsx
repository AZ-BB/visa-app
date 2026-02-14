import { ChevronDown } from "../svgs/chevron-down"
import { HorizontalDivider } from "../svgs/horizontal-divider"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"

export function VisaSelector({ rounded = true, shadow = true }: { rounded?: boolean, shadow?: boolean }) {
  return (
    <div className={cn("flex flex-col  sm:mt-0 md:w-full w-full overflow-hidden bg-white sm:flex-row py-1.5 ", rounded && "rounded-xl", shadow && "shadow-[0_24px_48px_0_rgba(0,0,0,0.08)]")}>
      <div className="flex flex-col md:flex-row w-full items-center">
        {/* Where am I from? */}

        <div className="w-full flex flex-1 p-5 items-center justify-between">
          <div className="flex  flex-col">
            <span className="mb-2 block text-base font-semibold text-primary-copy">
              Where am I from?
            </span>
            <button
              type="button"
              className="flex w-full items-center gap-2 text-left text-base text-primary-copy"
              aria-haspopup="listbox"
              aria-expanded={false}
            >
              <span className="text-xl" aria-hidden>
                <svg
                  width="24"
                  height="16"
                  viewBox="0 0 24 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M22.2024 0.00012207H1.79741C0.804698 0.00012207 0 0.818934 0 1.82906V14.171C0 15.1811 0.804698 16 1.79741 16H22.2024C23.1951 16 23.9999 15.1812 23.9999 14.171V1.82906C23.9999 0.818934 23.1952 0.00012207 22.2024 0.00012207Z"
                    fill="#41479B"
                  />
                  <path
                    d="M23.975 1.52663C23.8333 0.660506 23.0939 0 22.2024 0H21.7348L14.0689 5.11057V4.76706e-05H9.93097V5.11062L2.26508 4.76706e-05H1.79741C0.905995 4.76706e-05 0.166546 0.660506 0.0248905 1.52668L6.57695 5.89476H0V10.1052H6.57695L0.0248905 14.4732C0.166546 15.3394 0.905995 15.9999 1.79741 15.9999H2.26508L9.93097 10.8893V15.9999H14.0689V10.8893L21.7348 15.9999H22.2024C23.0939 15.9999 23.8333 15.3394 23.975 14.4732L17.4229 10.1051H23.9999V5.89466H17.4229L23.975 1.52663Z"
                    fill="white"
                  />
                  <path
                    d="M13.2413 0.00012207H10.7585V6.73687H0V9.26318H10.7585V15.9999H13.2413V9.26318H23.9999V6.73687H13.2413V0.00012207Z"
                    fill="#FF4B55"
                  />
                  <path
                    d="M1.1623 15.882L9.90833 10.1052H8.38828L0.43251 15.3601C0.627181 15.5913 0.877351 15.7724 1.1623 15.882Z"
                    fill="#FF4B55"
                  />
                  <path
                    d="M16.2371 10.1052H14.7171L23.1881 15.7003C23.4251 15.5419 23.6229 15.3279 23.764 15.0767L16.2371 10.1052Z"
                    fill="#FF4B55"
                  />
                  <path
                    d="M0.190033 1.01127L7.58358 5.89481H9.10364L0.725624 0.361023C0.500672 0.531396 0.316595 0.75414 0.190033 1.01127Z"
                    fill="#FF4B55"
                  />
                  <path
                    d="M15.589 5.89465L23.5593 0.630109C23.3625 0.399686 23.1103 0.219583 22.8234 0.112122L14.0689 5.89465H15.589Z"
                    fill="#FF4B55"
                  />
                </svg>
              </span>
              <span className="flex-1">United kingdom</span>
            </button>
          </div>

          <div className="">
            <ChevronDown />
          </div>
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />



        {/* Where am I travelling? */}
        <div className="w-full flex  flex-1 p-5 items-center justify-between">
          <div className="flex flex-col">
            <span className="mb-2 block text-base font-semibold text-primary-copy">
              Where am I travelling?
            </span>
            <button
              type="button"
              className="flex w-full items-center gap-2 text-left text-base"
              aria-haspopup="listbox"
              aria-expanded={false}
            >
              <span className="flex-1 text-secondary-copy">Choose location</span>
            </button>
          </div>

          <div className="">
            <ChevronDown />
          </div>
        </div>

        <Separator orientation="vertical" className="h-[70%]! md:block hidden" />
        <Separator orientation="horizontal" className="w-[95%]! block md:hidden" />

        {/* Choose your visa button */}
        <div className="shrink-0 p-3 md:w-fit w-full">
          <a
            href="#visa"
            className="flex items-center justify-between gap-3 rounded-full bg-primary px-6 py-4 text-base font-medium text-white transition hover:bg-primary-dark "
          >
            <span className="w-8 block md:hidden"></span>
            <span>Choose your visa</span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A8EFF]"
              aria-hidden
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <title>Next</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
