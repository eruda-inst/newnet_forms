import "./globals.css";

export const metadata = {
  title: "Painel Newnet",
  description: "Painel de administração de formulários da Newnet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}