// ================================================================
//  NestVault — Terms of Service page
// ================================================================
import { footerHtml } from '../utils/helpers.js';

export function renderTerms(el) {
  el.innerHTML = `
  <div class="page-section" style="max-width:760px;margin:0 auto">
    <div class="page-title">Terms of Service</div>
    <p class="page-subtitle">
      Last updated: ${new Date().toLocaleDateString('en-LK', { year:'numeric', month:'long', day:'numeric' })}
    </p>

    <div style="background:var(--surface);border:1px solid var(--bdr);border-radius:var(--radius-lg);padding:36px">
      <div class="legal-body">

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using NestVault ("the Platform"), you agree to be bound by these
          Terms of Service and all applicable laws. If you do not agree with any of these terms,
          you are prohibited from using or accessing the Platform.
        </p>

        <h2>2. User Accounts</h2>
        <p>
          You must register for an account to access most features of NestVault. You are
          responsible for maintaining the confidentiality of your login credentials and for all
          activity that occurs under your account. You must be at least 18 years of age to use
          NestVault. You agree to provide accurate and complete information during registration
          and to keep this information up to date.
        </p>

        <h2>3. User Roles</h2>
        <p>
          NestVault offers two primary user roles:
        </p>
        <ul>
          <li><strong>Buyers</strong> may browse listings and send inquiries to sellers.</li>
          <li><strong>Sellers</strong> may create, manage, and publish property listings.</li>
        </ul>
        <p>
          Users agree to use their role responsibly and honestly. Creating a Seller account
          to send inquiries, or a Buyer account to list fake properties, is a violation of
          these Terms and may result in account suspension.
        </p>

        <h2>4. Property Listings</h2>
        <p>
          Sellers are solely responsible for the accuracy, completeness, and legality of
          their property listings. NestVault does not verify listing information and is not
          liable for inaccuracies. Fraudulent, misleading, duplicate, or illegal listings are
          strictly prohibited and will result in immediate account termination.
        </p>
        <p>
          NestVault reserves the right to remove any listing at any time, with or without notice,
          for any reason including but not limited to violation of these Terms.
        </p>

        <h2>5. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Post false, misleading, deceptive, or fraudulent content</li>
          <li>Harass, threaten, abuse, or harm other users in any way</li>
          <li>Impersonate any person or entity</li>
          <li>Attempt to gain unauthorised access to any part of the Platform or its systems</li>
          <li>Use the Platform for any unlawful purpose or in violation of any regulations</li>
          <li>Scrape, harvest, or systematically extract data from the Platform</li>
          <li>Transmit any viruses, malware, or other harmful code</li>
          <li>Use automated bots or scripts to interact with the Platform</li>
        </ul>

        <h2>6. Inquiries and Messaging</h2>
        <p>
          The messaging system is provided solely to facilitate genuine communication between
          buyers and sellers regarding listed properties. You agree not to use the messaging
          system to send spam, unsolicited advertisements, scams, or any content unrelated
          to the property in question.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content, branding, design elements, and software on NestVault are the
          intellectual property of NestVault or its licensors. You may not copy, reproduce,
          distribute, or create derivative works without express written permission.
          By uploading images or content to the Platform, you grant NestVault a
          non-exclusive, royalty-free licence to display that content on the Platform.
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          The Platform is provided "as is" and "as available" without warranties of any kind,
          either express or implied. NestVault does not guarantee the accuracy, reliability,
          completeness, or availability of the Platform. NestVault is not a licensed real estate
          agent and is not responsible for any transactions between buyers and sellers.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, NestVault shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising from
          your use of the Platform, including but not limited to loss of profits, data, or
          goodwill.
        </p>

        <h2>10. Account Termination</h2>
        <p>
          NestVault reserves the right to suspend or permanently terminate any account at any
          time, with or without notice, for conduct that we believe violates these Terms or is
          harmful to other users, the Platform, or third parties.
        </p>

        <h2>11. Modifications to Terms</h2>
        <p>
          NestVault reserves the right to modify these Terms at any time. Changes will be
          posted on this page with an updated date. Continued use of the Platform after
          changes are posted constitutes your acceptance of the revised Terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms of Service are governed by and construed in accordance with the laws
          of the Democratic Socialist Republic of Sri Lanka. Any disputes arising under these
          Terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
        </p>

        <div style="margin-top:32px;padding-top:24px;border-top:1px solid var(--bdr);display:flex;gap:20px;flex-wrap:wrap">
          <a href="#" onclick="router.navigate('home');return false;"    style="color:var(--pur);font-size:13px">← Back to Home</a>
          <a href="#" onclick="router.navigate('privacy');return false;" style="color:var(--pur);font-size:13px">Privacy Policy →</a>
        </div>
      </div>
    </div>
  </div>
  ${footerHtml()}`;
}
