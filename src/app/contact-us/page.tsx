import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon } from "lucide-react";

export default function ContactUs() {
    return (
        <div className="min-h-screen max-w-7xl mx-auto flex flex-col sm:flex-row gap-10 py-16 px-6 sm:px-0 scale-95">

            <div className="w-full sm:w-1/2 space-y-10">
                <section className="space-y-4">
                    <h2 className="text-4xl font-bold text-primary-copy">
                        Contact Us
                    </h2>

                    <p className="text-secondary-copy text-lg">
                        Drop us an email, and we’ll aim to respond to your enquiry as soon as possible. Alternatively, you can give us ring on the number shown below.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-secondary-copy">
                        Phone
                    </h3>

                    <p className="text-primary text-xl font-bold">
                        0800 00 10 66
                    </p>
                </section>

                <section className="space-y-4">

                    <h3 className="text-xl font-bold text-secondary-copy">
                        Registered address
                    </h3>

                    <p className="text-primary text-xl font-bold">
                        202a1 2nd floor <br /> 146 - 150 Hagley Road Edgbaston <br /> Birmingham <br /> B16 9NX
                    </p>
                </section>
            </div>


            <div className="w-full sm:w-1/2">
                <form className="space-y-5">
                    <section className="flex flex-col gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            required
                            placeholder="Enter your name"
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="example@email.com"
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="phone">Phone <span className="text-secondary-copy text-lg italic font-normal">(Optional)</span></Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            placeholder="Enter your phone number"
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            type="text"
                            id="subject"
                            name="subject"
                            required
                            placeholder="Enter the subject of your message"
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            required
                            placeholder="Enter your message"
                            className="resize-none h-[150px] overflow-y-auto"
                            rows={5}
                        />
                    </section>

                    <section className="w-full flex justify-end">
                        <Button
                            className="flex gap-3 group items-center pl-6 pr-4 py-4 rounded-full text-lg"
                        >
                            Send email
                            <div className="w-9 h-9 rounded-full bg-[#0A8EFF] group-hover:bg-[#0A8EFF]/10 transition-colors duration-200 flex items-center justify-center">
                                <ChevronRightIcon className="size-6" />
                            </div>
                        </Button>
                    </section>
                </form>
            </div>
        </div>
    );
}