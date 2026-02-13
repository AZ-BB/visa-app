export default function Terms() {
    return (
        <main className="min-h-screen bg-bg-light-grey pt-16 flex justify-center items-start">
            <div className="max-w-3xl space-y-10 px-6 sm:px-0">
                <h2 className="text-4xl font-bold text-primary-copy">
                    Terms of Service
                </h2>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        Introduction
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        Welcome to [Your Company Name]. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please review them carefully before using our services.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        User Responsibilities
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        As a user of our website, you agree not to engage in any activities that may harm or disrupt our services, violate applicable laws, or infringe on the rights of others. Unauthorised use of our platform may result in the termination of your access.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-bold text-primary-copy">
                        Limitation of Liability
                    </h3>

                    <p className="text-secondary-copy text-lg">
                        [Your Company Name] will not be liable for any damages arising from the use or inability to use our services. We do not guarantee the accuracy, completeness, or reliability of any content on our website.
                    </p>
                </section>
            </div>
        </main>
    );
}