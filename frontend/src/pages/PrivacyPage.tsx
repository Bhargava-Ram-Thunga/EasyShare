import { PageLayout } from '../components/layout';
import { Card, Icon } from '../components/common';

export function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: 'info',
      content: [
        'We are committed to protecting your privacy. Easy Share operates on a peer-to-peer basis, which means your files are transferred directly between devices without being stored on our servers.',
        'We do not collect, store, or have access to the content of your files. When you share a file, it is encrypted end-to-end and transferred directly to the recipient.',
        'We may collect minimal technical information such as IP addresses for connection establishment, but this data is not stored or linked to any personal information.',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: 'settings',
      content: [
        'Connection facilitation: We use temporary session data to establish peer-to-peer connections between senders and recipients.',
        'Service improvement: We may collect anonymous usage statistics to improve the service, such as transfer success rates and connection times.',
        'Security: We monitor for abuse and maintain the security and integrity of our service.',
      ],
    },
    {
      title: 'Data Storage and Security',
      icon: 'lock',
      content: [
        'End-to-end encryption: All files are encrypted in your browser before any transfer occurs.',
        'No server storage: Files are never stored on our servers. They are transferred directly between peers.',
        'Temporary links: Share links expire after use or after a set time period, typically 24 hours.',
        'No logs: We do not maintain logs of file transfers, file contents, or user activity.',
      ],
    },
    {
      title: 'Third-Party Services',
      icon: 'extension',
      content: [
        'Easy Share does not share your data with third parties for advertising or marketing purposes.',
        'We may use third-party services for infrastructure (such as WebRTC signaling servers) but these services do not have access to your file contents.',
      ],
    },
    {
      title: 'Your Rights',
      icon: 'verified_user',
      content: [
        'You have the right to know what data we collect and how it is used.',
        'You can request deletion of any data associated with your account at any time.',
        'You control who has access to your files through the share links you generate.',
        'You can cancel any active transfer at any time.',
      ],
    },
    {
      title: 'Cookies and Tracking',
      icon: 'cookie',
      content: [
        'We use minimal cookies necessary for the service to function, such as session management.',
        'We do not use tracking cookies or third-party analytics that identify individual users.',
        'You can disable cookies in your browser settings, though this may affect service functionality.',
      ],
    },
    {
      title: 'Changes to This Policy',
      icon: 'update',
      content: [
        'We may update this privacy policy from time to time to reflect changes in our practices or legal requirements.',
        'We will notify users of any material changes through our website or service notifications.',
        'Continued use of the service after changes constitutes acceptance of the updated policy.',
      ],
    },
    {
      title: 'Contact Us',
      icon: 'mail',
      content: [
        'If you have any questions or concerns about this privacy policy or our data practices, please contact us at privacy@easyshare.app.',
        'We are committed to addressing your concerns and will respond to inquiries within 7 business days.',
      ],
    },
  ];

  return (
    <PageLayout headerVariant="default" footerVariant="default">
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
              <Icon name="privacy_tip" size="lg" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Privacy Policy
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Last updated: January 24, 2026
          </p>
        </div>

        <Card variant="glow" padding="lg" className="mb-8">
          <div className="flex items-start gap-4">
            <Icon name="shield" className="text-primary text-3xl mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">
                Your Privacy is Our Priority
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Easy Share is built with privacy at its core. We believe your files
                are yours alone. Our peer-to-peer architecture ensures that your
                data never touches our servers, and our end-to-end encryption means
                that only you and your intended recipient can access your files.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} variant="default" padding="lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="size-10 bg-border-dark rounded-lg flex items-center justify-center text-primary border border-border-dark-alt shrink-0">
                  <Icon name={section.icon} size="md" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {section.title}
                </h2>
              </div>
              <div className="ml-14 space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card variant="default" padding="lg" className="mt-12 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Icon name="gavel" className="text-primary text-3xl" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Questions About Privacy?
                </h3>
                <p className="text-gray-400 text-sm">
                  We're here to help clarify our practices
                </p>
              </div>
            </div>
            <a
              href="mailto:privacy@easyshare.app"
              className="px-6 py-3 bg-primary hover:bg-[#33ffeb] text-background-dark font-bold rounded-lg transition-colors"
            >
              Contact Us
            </a>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}