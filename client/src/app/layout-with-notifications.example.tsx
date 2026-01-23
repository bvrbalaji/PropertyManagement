// Layout with Notification Integration Example
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NotificationBell from '@/components/Notifications/NotificationBell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Property Management - User Management & Authentication',
  description: 'User Management and Authentication System for Property Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Optional: Add header with notification bell */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">Property Management</h1>
              <div className="flex items-center gap-4">
                {/* Notification Bell - Add this to your header */}
                <NotificationBell />
                <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  👤 Profile
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        <Toaster position="top-right" />
      </body>
    </html>
  )
}
