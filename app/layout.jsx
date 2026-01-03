import './globals.css';

export const metadata = {
  title: 'Panel Store',
  description: 'Panel Pterodactyl Store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
