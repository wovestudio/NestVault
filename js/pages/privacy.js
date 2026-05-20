// ================================================================
//  NestVault — Privacy Policy page
// ================================================================
import { footerHtml } from '../utils/helpers.js';

export function renderPrivacy(el) {
  el.innerHTML = `
  <div class="page-section" style="max-width:760px;margin:0 auto">
    <div class="page-title">Privacy Policy</div>
    <p class="page-subtitle">
      Last updated: ${new Date().toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' })}
    </p>

    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);padding:36px">
      <div class="legal-body">

        <h2>1. Introduction</h2>
        <p>
          NestVault ("we", "us", or "our") is committed to protecting your personal information
          and your right to privacy. This Privacy Policy explains how we collect, use, store,
          and share your information when you use our Platform.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect information you provide directly to us when you:</p>
        <ul>
          <li><strong>Register an account:</strong> name, email address, phone number, and chosen role (Buyer or Seller)</li>
          <li><strong>Create a listing:</strong> property title, description, price, address, images, and contact details</li>
          <li><strong>Send messages:</strong> content of messages sent between buyers and sellers via our chat system</li>
          <li><strong>Update your profile:</strong> any changes to the above information</li>
        </ul>
        <p>
          We do not collect payment information. NestVault does not process any financial
          transactions between users.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create and manage your account</li>
          <li>Display property listings and facilitate buyer–seller communication</li>
          <li>Send authentication and account-related emails via Supabase</li>
          <li>Enforce our Terms of Service and protect the safety of our users</li>
          <li>Improve the Platform and understand how it is used</li>
          <li>Comply with applicable legal obligations</li>
        </ul>

        <h2>4. Password Security</h2>
        <p>
          Your password is <strong>never stored in plain text</strong>. All authentication is
          handled by Supabase Auth, which uses industry-standard bcrypt hashing and salting.
          NestVault administrators cannot view, retrieve, or reset your password on your behalf —
          password resets are done exclusively through the automated email link system.
        </p>

        <h2>5. Row-Level Security (RLS)</h2>
        <p>
          NestVault uses Supabase Row Level Security (RLS) to enforce data access controls at
          the database level. This means:
        </p>
        <ul>
          <li>You can only read and modify your own profile data</li>
          <li>Only the buyer and seller involved in an inquiry can read its messages</li>
          <li>Sellers can only edit or delete their own listings</li>
          <li>Administrators can moderate content but cannot view your password</li>
        </ul>

        <h2>6. Data Sharing</h2>
        <p>
          We do not sell, trade, rent, or share your personal information with third parties
          for marketing purposes. Your information may be shared in the following limited circumstances:
        </p>
        <ul>
          <li>
            <strong>Between users:</strong> Your name and phone number (if provided on a listing)
            are visible to other users viewing that listing. Your name is shared with the
            seller when you send an inquiry.
          </li>
          <li>
            <strong>Supabase:</strong> Your data is stored on Supabase infrastructure. Please
            review <a href="https://supabase.com/privacy" target="_blank" rel="noopener"
            style="color:var(--pur)">Supabase's Privacy Policy</a> for more information.
          </li>
          <li>
            <strong>Legal requirements:</strong> We may disclose your information if required
            to do so by law or in response to valid requests by public authorities.
          </li>
        </ul>

        <h2>7. Data Storage and Retention</h2>
        <p>
          All data is stored securely on Supabase servers. Property images are stored in
          Supabase Storage (object storage). We retain your data for as long as your account
          is active. When you delete your account, your profile, listings, and associated
          messages are permanently deleted.
        </p>

        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>
            <strong>Access and update</strong> your personal information at any time via your
            Profile page
          </li>
          <li>
            <strong>Delete your account</strong> and all associated data at any time from the
            Danger Zone section of your Profile page
          </li>
          <li>
            <strong>Request a copy</strong> of your data by contacting us through the Platform
          </li>
        </ul>

        <h2>9. Cookies and Local Storage</h2>
        <p>
          NestVault uses browser <code>localStorage</code> solely to remember your theme
          preference (light or dark mode). Authentication session tokens are stored securely
          by the Supabase client library and are not accessible to other websites (same-origin
          policy). We do not use advertising cookies or third-party tracking.
        </p>

        <h2>10. Children's Privacy</h2>
        <p>
          NestVault is not directed at children under the age of 18. We do not knowingly
          collect personal information from children. If we become aware that a child under
          18 has provided us with personal information, we will take steps to delete such
          information promptly.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any
          significant changes by updating the date at the top of this page. Continued use of
          the Platform after changes are posted constitutes your acceptance of the revised policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or
          your personal data, please contact us through the NestVault Platform.
        </p>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--bdr);display:flex;gap:20px;flex-wrap:wrap">
          <a href="#" onclick="router.navigate('home');return false;"  style="color:var(--pur);font-size:13px">← Back to Home</a>
          <a href="#" onclick="router.navigate('terms');return false;" style="color:var(--pur);font-size:13px">Terms of Service →</a>
        </div>
      </div>
    </div>
  </div>
  ${footerHtml()}`;
}
