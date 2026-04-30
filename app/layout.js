import './globals.css'

export const metadata = {
  title: 'INS MARKET - Bridgeland Station',
  description: 'Order ahead for pickup at INS MARKET Bridgeland Memorial C-Train',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
