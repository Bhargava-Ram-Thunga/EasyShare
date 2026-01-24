import { PageLayout } from '../components/layout';
import { Card, Icon } from '../components/common';

export function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: 'task_alt',
      content: [
        'By accessing and using Easy Share, you accept and agree to be bound by the terms and provisions of this agreement.',
        'If you do not agree to these terms, please do not use this service.',
        'We reserve the right to update these terms at any time, and your continued use of the service constitutes acceptance of any changes.',
      ],
    },
    {
      title: 'Use of Service',
      icon: 'cloud_upload',
      content: [
        'Easy Share provides a peer-to-peer file sharing platform for legitimate purposes only.',
        'You are responsible for all files you share and must ensure you have the legal right to share them.',
        'You agree not to use the service to share illegal content, malware, or content that infringes on intellectual property rights.',
        'You must not attempt to compromise the security or integrity of our systems or other users\' data.',
      ],
    },
    {
      title: 'User Responsibilities',
      icon: 'person',
      content: [
        'You are solely responsible for the content of files you share through Easy Share.',
        'You must ensure that your use of the service complies with all applicable laws and regulations.',
        'You agree to use the service in a manner that does not harm, disrupt, or interfere with other users or the service itself.',
        'You must not share files containing viruses, malware, or other harmful code.',
      ],
    },
    {
      title: 'Prohibited Content',
      icon: 'block',
      content: [
        'You may not use Easy Share to share copyrighted material without proper authorization.',
        'Sharing of illegal content, including but not limited to child exploitation material, is strictly prohibited and will be reported to authorities.',
        'Content that violates privacy rights, harassment, hate speech, or terrorist content is not permitted.',
        'Malware, viruses, or any code designed to harm recipients or their systems is prohibited.',
      ],
    },
    {
      title: 'Service Availability',
      icon: 'schedule',
      content: [
        'We strive to maintain high availability of Easy Share, but we do not guarantee uninterrupted service.',
        'We may suspend or terminate the service at any time for maintenance, updates, or other reasons.',
        'We are not liable for any damages resulting from service interruptions or data loss.',
        'Share links may expire after 24 hours or after the file has been downloaded, whichever comes first.',
      ],
    },
    {
      title: 'Intellectual Property',
      icon: 'copyright',
      content: [
        'Easy Share and its original content, features, and functionality are owned by Easy Share Inc. and are protected by international copyright, trademark, and other intellectual property laws.',
        'You may not copy, modify, distribute, or reverse engineer any part of our service without explicit permission.',
        'User-generated content remains the property of the user, and we claim no ownership over files shared through our service.',
      ],
    },
    {
      title: 'Limitation of Liability',
      icon: 'warning',
      content: [
        'Easy Share is provided "as is" without warranties of any kind, either express or implied.',
        'We are not liable for any damages arising from the use or inability to use the service.',
        'We are not responsible for the content of files shared through our platform or any damages resulting from such content.',
        'Our total liability shall not exceed the amount you paid for the service (if applicable).',
      ],
    },
    {
      title: 'Privacy and Data Protection',
      icon: 'privacy_tip',
      content: [
        'Your use of Easy Share is also governed by our Privacy Policy.',
        'We are committed to protecting your privacy and securing your data through end-to-end encryption.',
        'We do not store the content of your files on our servers.',
        'For more details, please refer to our Privacy Policy.',
      ],
    },
    {
      title: 'Termination',
      icon: 'cancel',
      content: [
        'We reserve the right to terminate or suspend your access to the service immediately, without prior notice, for any violation of these terms.',
        'You may stop using the service at any time without notice.',
        'Upon termination, your right to use the service will immediately cease.',
      ],
    },
    {
      title: 'Governing Law',
      icon: 'gavel',
      content: [
        'These terms shall be governed by and construed in accordance with the laws of the United States.',
        'Any disputes arising from these terms or your use of the service shall be resolved in the courts of the United States.',
        'If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full effect.',
      ],
    },
    {
      title: 'Contact Information',
      icon: 'contact_support',
      content: [
        'If you have any questions about these Terms of Service, please contact us at legal@easyshare.app.',
        'For general inquiries, you can reach us at support@easyshare.app.',
      ],
    },
  ];

  return (
    <PageLayout headerVariant="default" footerVariant="default">
      <div className="w-full max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
              <Icon name="description" size="lg" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Terms of Service
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Last updated: January 24, 2026
          </p>
        </div>

        <Card variant="glow" padding="lg" className="mb-8">
          <div className="flex items-start gap-4">
            <Icon name="info" className="text-primary text-3xl mt-1" />
            <div>
              <h2 className="text-xl font-bold text-white mb-3">
                Welcome to Easy Share
              </h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms of Service govern your use of Easy Share. By using our
                service, you agree to these terms. Please read them carefully. Our
                service is designed to provide secure, peer-to-peer file sharing
                while respecting your privacy and rights.
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
                  {index + 1}. {section.title}
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
              <Icon name="help" className="text-primary text-3xl" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Have Questions?
                </h3>
                <p className="text-gray-400 text-sm">
                  We're here to help clarify any concerns
                </p>
              </div>
            </div>
            <a
              href="mailto:legal@easyshare.app"
              className="px-6 py-3 bg-primary hover:bg-[#33ffeb] text-background-dark font-bold rounded-lg transition-colors"
            >
              Contact Legal Team
            </a>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}