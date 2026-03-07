import { metadata } from './metadata'
import LayoutClient from './LayoutClient'
import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'

export { metadata }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  )
}
