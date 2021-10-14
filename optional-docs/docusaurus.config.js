// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Optional Finance',
  tagline: 'Documentation for Optional Finance',
  url: 'https://docs.optional.finance',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/optional.png',
  organizationName: 'alpha-serpentis-developments', // Usually your GitHub org/user name.
  projectName: 'project-mimic', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/Alpha-Serpentis-Developments/Project-Mimic/optional-docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Optional Finance',
        logo: {
          alt: 'Optional Finance logo',
          src: 'img/optional.png',
        },
        items: [
          {
            to: '/optional/deployments',
            label: 'Deployments',
            position: 'left'
          },
          {
            to: '/optional/factory',
            label: 'Factory',
            position: 'left'
          },
          {
            to: '/optional/vaulttoken',
            label: 'Vault Token',
            position: 'left'
          },
          {
            to: '/security',
            label: 'Security',
            position: 'left'
          },
          {
            href: 'https://github.com/Alpha-Serpentis-Developments/Project-Mimic',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Deployments',
                to: '/optional/deployments'
              },
              {
                label: 'Security',
                to: '/security',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.optional.finance',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/OptionalFinance',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Alpha-Serpentis-Developments/Project-Mimic',
              },
              {
                label: 'Optional Finance',
                href: 'https://optional.finance'
              }
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Optional Finance, Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
