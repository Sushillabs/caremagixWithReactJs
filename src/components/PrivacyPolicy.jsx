export default function PrivacyPolicy() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl p-8 md:p-12">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Caremagix Extension — Last updated: April 2026
        </p>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            What This Extension Does
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The Caremagix browser extension provides healthcare staff with quick
            access to the Caremagix platform directly from their browser,
            without needing to open a separate tab.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Microphone Access
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The extension requests microphone access only when the user clicks
            the voice input button. Voice input is converted to text locally
            using the browser's built-in Speech Recognition API. We do not
            record, store, or transmit any audio data.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Website Access
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The extension injects a sidebar UI onto webpages the user visits. It
            does not read, collect, or transmit any data from those websites. It
            only displays the Caremagix sidebar interface on top of the page.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Data Usage
          </h2>
          <p className="text-gray-600 leading-relaxed">
            All data shown inside the extension comes directly from the
            Caremagix backend — the same data the user sees on the Caremagix web
            application. No additional data is collected beyond what the web app
            already uses.
          </p>
        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Data We Do Not Collect
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>We do not collect browsing history</li>
            <li>We do not read content from other websites</li>
            <li>We do not store voice recordings</li>
            <li>We do not sell or share data with third parties</li>
          </ul>
        </section>

        {/* Divider */}
        <div className="border-t my-10"></div>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Contact Us
          </h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact
            us at{" "}
            <a
              href="mailto:privacy@caremagix.com"
              className="text-blue-600 hover:underline"
            >
              support@caremagix.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}