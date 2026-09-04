import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: 'https://www.spotify.com/about-us/contact/' },
      { label: 'Jobs', href: 'https://www.lifeatspotify.com/' },
      { label: 'For the Record', href: 'https://newsroom.spotify.com/' },
    ],
  },
  {
    title: 'Communities',
    links: [
      { label: 'For Artists', href: 'https://artists.spotify.com/' },
      { label: 'Developers', href: 'https://developer.spotify.com/' },
      { label: 'Advertising', href: 'https://ads.spotify.com/' },
      { label: 'Investors', href: 'https://investors.spotify.com/' },
      { label: 'Vendors', href: 'https://spotifyforvendors.com/' },
    ],
  },
  {
    title: 'Useful links',
    links: [
      { label: 'Support', href: 'https://support.spotify.com/' },
      { label: 'Free Mobile App', href: 'https://www.spotify.com/download/' },
      { label: 'Popular by Country', href: 'https://charts.spotify.com/' },
      { label: 'Import your music', href: 'https://www.spotify.com/' },
    ],
  },
  {
    title: 'Spotify Plans',
    links: [
      { label: 'Premium Individual', href: 'https://www.spotify.com/premium/' },
      { label: 'Premium Student', href: 'https://www.spotify.com/student/' },
      { label: 'Spotify Free', href: 'https://www.spotify.com/free/' },
    ],
  },
];

const legalLinks = [
  { label: 'Legal', href: 'https://www.spotify.com/legal/' },
  { label: 'Safety & Privacy Center', href: 'https://www.spotify.com/safetyandprivacy/' },
  { label: 'Privacy Policy', href: 'https://www.spotify.com/legal/privacy-policy/' },
  { label: 'Cookies', href: 'https://www.spotify.com/legal/cookies-policy/' },
  { label: 'About Ads', href: 'https://www.spotify.com/legal/privacy-policy/#s3' },
  { label: 'Accessibility', href: 'https://www.spotify.com/accessibility/' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/spotify/', icon: <FaInstagram /> },
  { label: 'X', href: 'https://x.com/spotify', icon: <FaXTwitter /> },
  { label: 'Facebook', href: 'https://www.facebook.com/Spotify', icon: <FaFacebook /> },
];

export const AppFooter = () => {
  return (
    <footer className='app-footer'>
      <div className='app-footer__top'>
        <nav className='app-footer__columns' aria-label='Footer'>
          {footerColumns.map((column) => (
            <div className='app-footer__column' key={column.title}>
              <h2>{column.title}</h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} target='_blank' rel='noreferrer'>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className='app-footer__socials'>
          {socialLinks.map((social) => (
            <a
              href={social.href}
              aria-label={social.label}
              title={social.label}
              target='_blank'
              rel='noreferrer'
              key={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <div className='app-footer__bottom'>
        <nav aria-label='Legal links'>
          {legalLinks.map((link) => (
            <a href={link.href} target='_blank' rel='noreferrer' key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
        <span>&copy; 2026 Spotify AB</span>
      </div>
    </footer>
  );
};
