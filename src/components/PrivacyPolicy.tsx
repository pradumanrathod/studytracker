import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Policy Content */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 leading-relaxed">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This Privacy Policy describes how <span className="font-semibold">StudyTracker</span> ("we", "us") 
            collects, uses, and protects your information when you use our application.
          </p>

          {/* Sections */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Account information when you sign in with Google (display name, email, UID).</li>
                <li>Study session metadata and aggregated statistics (e.g., total focus time, streaks).</li>
                <li>Local device data stored in your browser's localStorage for faster loading and offline use.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Provide and improve the core features of the app (timers, stats, achievements).</li>
                <li>Sync your statistics to your account when signed in.</li>
                <li>Maintain authentication and secure access to your data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Webcam Processing</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Presence detection runs entirely in your browser. Webcam video frames are processed locally and are <strong>not</strong>
                transmitted or stored on our servers. You can disable the webcam at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Local Storage</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We store session history and settings in your browser's localStorage to enhance performance and reliability. You can
                clear this data from your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We use Firebase Authentication for sign-in and Firestore to store per-user statistics. Your use of these services is
                subject to Google's terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Data Retention</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We retain your account statistics while your account remains active. You may request deletion of your account data by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Security</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We implement reasonable safeguards to protect your data. However, no method of transmission or storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Your Rights</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Depending on your location, you may have rights to access, correct, or delete your personal data. Contact us to exercise
                these rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                StudyTracker is not intended for children under 13. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time. Continued use of the app after changes indicates acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Contact</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Questions about this Policy can be directed to <a href="mailto:hello@focuslabs.app" className="text-primary-600 dark:text-primary-400 hover:underline">hello@focuslabs.app</a>.
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

export default PrivacyPolicy;
