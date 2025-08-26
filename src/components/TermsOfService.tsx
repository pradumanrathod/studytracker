import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Terms Content */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 leading-relaxed">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Welcome to <span className="font-semibold">StudyTracker</span>. By accessing or using our application, you agree to be
            bound by these Terms of Service. If you do not agree to these terms, do not use the service.
          </p>

          {/* Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Use of Service</h2>
              <p className="text-gray-700 dark:text-gray-300">
                You may use StudyTracker only for lawful purposes and in accordance with these Terms. You are responsible for
                maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Accounts and Authentication</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We provide Google authentication via Firebase. You agree to provide accurate information and notify us of any unauthorized
                use of your account. We may suspend or terminate access if we detect suspicious or abusive activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. User Data and Sessions</h2>
              <p className="text-gray-700 dark:text-gray-300">
                The app stores session data locally in your browser and, if you sign in, aggregates statistics in the cloud under your
                account. You are responsible for exporting or backing up your data as needed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Webcam and Detection</h2>
              <p className="text-gray-700 dark:text-gray-300">
                StudyTracker processes webcam video locally in your browser to detect presence for automatic timer control. We do not
                transmit or store your video frames on our servers. You must ensure you have the right to use the webcam on your device.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Acceptable Use</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>No reverse engineering, scraping, or interfering with the service.</li>
                <li>No unauthorized access to other users' data or the platform infrastructure.</li>
                <li>No use of the service in violation of applicable laws or regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Intellectual Property</h2>
              <p className="text-gray-700 dark:text-gray-300">
                All rights, title, and interest in and to StudyTracker, including software, text, graphics, logos, and trademarks, are owned
                by their respective owners. These Terms do not grant you any rights to the trademarks or branding.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Disclaimers</h2>
              <p className="text-gray-700 dark:text-gray-300">
                StudyTracker is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service
                or accuracy of computed statistics. You use the service at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300">
                To the maximum extent permitted by law, in no event shall we be liable for any indirect, incidental, special, consequential,
                or punitive damages, or any loss of data, revenue, or profits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Changes to the Terms</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update these Terms from time to time. Changes will be effective upon posting. Your continued use indicates
                acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Contact</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Questions about these Terms can be directed to <a href="mailto:hello@focuslabs.app" className="text-primary-600 dark:text-primary-400 hover:underline">hello@focuslabs.app</a>.
              </p>
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
