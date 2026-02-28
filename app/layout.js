import AuthWrapper from './AuthWrapper'
import './globals.css'

export const metadata = {
  title: 'TradieCheck',
  description: 'TradieCheck Internal Registers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  )
}