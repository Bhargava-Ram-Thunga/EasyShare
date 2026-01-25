import { PageLayout } from '../components/layout';
import { Card, Icon } from '../components/common';

export function DocsPage() {
  const sections = [
    {
      title: 'About Easy Share',
      icon: 'info',
      content: [
        'Easy Share is a modern web application that simplifies file sharing between users. Whether you need to share documents, images, or any other files, Easy Share provides a fast and secure way to transfer files using simple sharing codes.',
        'Built with modern web technologies, Easy Share offers a clean, intuitive interface that works seamlessly across all devices. No registration required - just upload, share the code, and you\'re done.',
      ],
    },
    {
      title: 'Core Features',
      icon: 'star',
      items: [
        'Simple File Sharing - Upload files and get a shareable code instantly',
        'Secure Transfers - End-to-end encrypted file transfers',
        'No Registration Required - Start sharing immediately without creating an account',
        'Code-Based Access - Share files using simple, easy-to-remember codes',
        'Real-time Progress - Track upload and download progress in real-time',
        'File History - Keep track of your shared and received files',
        'Multi-File Support - Share multiple files at once',
        'Responsive Design - Works perfectly on desktop, tablet, and mobile devices',
      ],
    },
    {
      title: 'Tech Stack',
      icon: 'code',
      items: [
        'React 19 - UI library for building interactive interfaces',
        'TypeScript - Type-safe JavaScript',
        'Vite - Next-generation frontend tooling',
        'React Router - Declarative routing for React',
        'Tailwind CSS - Utility-first CSS framework',
      ],
    },
    {
      title: 'Getting Started',
      icon: 'rocket_launch',
      content: [
        'Before you begin, ensure you have Node.js (v18 or higher) and npm installed on your system.',
      ],
      steps: [
        {
          title: 'Clone the repository',
          code: 'git clone https://github.com/Bhargava-Ram-Thunga/easy-share.git\ncd easy-share',
        },
        {
          title: 'Navigate to frontend directory',
          code: 'cd frontend',
        },
        {
          title: 'Install dependencies',
          code: 'npm install',
        },
        {
          title: 'Start the development server',
          code: 'npm run dev',
        },
      ],
    },
    {
      title: 'How to Share Files',
      icon: 'upload',
      steps: [
        { text: 'Navigate to the Share page by clicking "Share Files" on the homepage' },
        { text: 'Upload your files by dragging and dropping or clicking to browse' },
        { text: 'Get your share code - A unique code will be generated' },
        { text: 'Share the code with the recipient via email, message, or any other method' },
      ],
    },
    {
      title: 'How to Receive Files',
      icon: 'download',
      steps: [
        { text: 'Navigate to the Receive page by clicking "Receive Files" on the homepage' },
        { text: 'Enter the share code provided by the sender' },
        { text: 'Download your files - Files will be available for download immediately' },
      ],
    },
    {
      title: 'Contributing',
      icon: 'group',
      content: [
        'We welcome contributions to Easy Share! Whether you want to report bugs, suggest features, or submit pull requests, your help is appreciated.',
      ],
      items: [
        'Fork the repository on GitHub',
        'Create a new branch for your feature',
        'Make your changes and commit them',
        'Push to your branch and open a Pull Request',
        'Ensure your code follows the existing style',
        'Update documentation as needed',
      ],
    },
  ];

  return (
    <PageLayout headerVariant="default" footerVariant="default">
      <div className="w-full max-w-5xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
              <Icon name="description" size="lg" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Documentation
              </h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Everything you need to know about Easy Share
          </p>
        </div>

        <Card variant="glow" padding="lg" className="mb-12">
          <div className="flex items-start gap-4">
            <Icon name="lightbulb" className="text-primary text-3xl mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                A Modern, Secure File Sharing Platform
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Fast, simple, and secure file sharing made easy. Share files with anyone using a simple code.
                No registration required, no complicated setup - just upload and share.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} variant="default" padding="lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="size-10 bg-border-dark rounded-lg flex items-center justify-center text-primary border border-border-dark-alt shrink-0">
                  <Icon name={section.icon} size="md" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {section.title}
                </h2>
              </div>

              <div className="ml-14 space-y-4">
                {section.content?.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.items && (
                  <ul className="space-y-3">
                    {section.items.map((item, iIndex) => (
                      <li key={iIndex} className="flex items-start gap-3 text-gray-300">
                        <Icon name="check_circle" className="text-primary mt-0.5 shrink-0" size="sm" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.steps && (
                  <div className="space-y-4">
                    {section.steps.map((step, sIndex) => (
                      <div key={sIndex} className="flex gap-4">
                        <div className="size-7 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/30">
                          {sIndex + 1}
                        </div>
                        <div className="flex-1">
                          {step.text && (
                            <p className="text-gray-300 leading-relaxed mt-0.5">{step.text}</p>
                          )}
                          {step.title && (
                            <p className="text-gray-300 font-medium mb-2">{step.title}</p>
                          )}
                          {step.code && (
                            <pre className="bg-surface-darker p-4 rounded-lg border border-white/10 overflow-x-auto mt-2">
                              <code className="text-primary text-sm font-mono">{step.code}</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card variant="default" padding="lg" className="mt-12 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Icon name="library_books" className="text-primary text-3xl" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  View Full README
                </h3>
                <p className="text-gray-400 text-sm">
                  Check out the complete documentation on GitHub
                </p>
              </div>
            </div>
            <a
              href="https://github.com/Bhargava-Ram-Thunga/easy-share"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary hover:bg-[#33ffeb] text-background-dark font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="open_in_new" size="sm" />
              Visit GitHub
            </a>
          </div>
        </Card>

        <div className="mt-8 p-6 bg-border-dark/30 rounded-lg border border-white/5">
          <div className="flex items-start gap-3">
            <Icon name="contact_support" className="text-primary mt-1" />
            <div>
              <h3 className="text-white font-bold mb-2">Need Help?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                If you have questions or run into issues, feel free to open an issue on our{' '}
                <a
                  href="https://github.com/Bhargava-Ram-Thunga/easy-share/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-white transition-colors underline"
                >
                  GitHub repository
                </a>
                {' '}or reach out to the maintainer{' '}
                <a
                  href="https://github.com/Bhargava-Ram-Thunga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-white transition-colors underline"
                >
                  @Bhargava-Ram-Thunga
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
