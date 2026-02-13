import { InstagramIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-2xl font-bold">
          logo <span className="text-orange-500 -ml-1">.</span>
        </div>

        <div className="flex justify-between items-center">
          <span className=" font-normal text-base">
            © 2025 Visa Pro LTD. All rights reserved. Company Number 123456
          </span>

          <div className="flex gap-5">
            <a href="https://twitter.com" target="_blank">
              <TwitterIcon />
            </a>
            <a href="https://instagram.com" target="_blank">
              <InstagramIcon />
            </a>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-4 font-semibold text-base">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/contact-us" className="hover:underline">Contact Us</Link>
          </div>

          <div className="flex gap-4">
            <span className="flex items-center gap-2">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.2024 0.00012207H1.79741C0.804698 0.00012207 0 0.818934 0 1.82906V14.171C0 15.1811 0.804698 16 1.79741 16H22.2024C23.1951 16 23.9999 15.1812 23.9999 14.171V1.82906C23.9999 0.818934 23.1952 0.00012207 22.2024 0.00012207Z" fill="#41479B" />
                <path d="M23.975 1.52663C23.8333 0.660506 23.0939 0 22.2024 0H21.7348L14.0689 5.11057V4.76706e-05H9.93097V5.11062L2.26508 4.76706e-05H1.79741C0.905995 4.76706e-05 0.166546 0.660506 0.0248905 1.52668L6.57695 5.89476H0V10.1052H6.57695L0.0248905 14.4732C0.166546 15.3394 0.905995 15.9999 1.79741 15.9999H2.26508L9.93097 10.8893V15.9999H14.0689V10.8893L21.7348 15.9999H22.2024C23.0939 15.9999 23.8333 15.3394 23.975 14.4732L17.4229 10.1051H23.9999V5.89466H17.4229L23.975 1.52663Z" fill="white" />
                <path d="M13.2413 0.00012207H10.7585V6.73687H0V9.26318H10.7585V15.9999H13.2413V9.26318H23.9999V6.73687H13.2413V0.00012207Z" fill="#FF4B55" />
                <path d="M1.16241 15.882L9.90844 10.1052H8.38838L0.432617 15.3601C0.627288 15.5913 0.877458 15.7724 1.16241 15.882Z" fill="#FF4B55" />
                <path d="M16.2371 10.1052H14.717L23.1881 15.7003C23.4251 15.5419 23.6229 15.3279 23.764 15.0767L16.2371 10.1052Z" fill="#FF4B55" />
                <path d="M0.189941 1.01121L7.58349 5.89475H9.10355L0.725532 0.360962C0.50058 0.531335 0.316503 0.754079 0.189941 1.01121Z" fill="#FF4B55" />
                <path d="M15.5889 5.89471L23.5592 0.63017C23.3624 0.399747 23.1103 0.219644 22.8234 0.112183L14.0688 5.89471H15.5889Z" fill="#FF4B55" />
              </svg>


              English
            </span>

            <span className="flex items-center gap-2">
              <span className="font-semibold">£</span>
              GBP
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
