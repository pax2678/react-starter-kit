import { UserProfile } from "@clerk/react-router";
import { getAuth } from "@clerk/react-router/ssr.server";
import { redirect } from "react-router";
import type { Route } from "./+types/mobile-profile";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    throw redirect("/sign-in");
  }
  
  return null;
}

export default function MobileProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>
            <p className="text-sm text-gray-600">Manage your profile and security</p>
          </div>
          <button 
            onClick={() => window.close()} 
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* UserProfile with mobile-optimized styling */}
      <div className="p-4">
        <UserProfile 
          appearance={{
            elements: {
              // Card container
              card: "w-full shadow-none border-0 bg-transparent p-0",
              
              // Header styling
              headerTitle: "text-lg font-semibold text-gray-900 mb-2",
              headerSubtitle: "text-sm text-gray-600 mb-4",
              
              // Form elements
              formFieldInput: "w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              formFieldLabel: "block text-sm font-medium text-gray-700 mb-2",
              
              // Buttons
              formButtonPrimary: "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-base transition-colors",
              formButtonSecondary: "w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg text-base transition-colors mt-2",
              
              // Avatar/profile photo
              avatarBox: "mx-auto mb-4",
              
              // Navigation/tabs
              navbar: "border-b border-gray-200 mb-6",
              navbarButton: "px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300",
              navbarButtonActive: "px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600",
              
              // Form field rows
              formFieldRow: "mb-4",
              
              // Profile sections
              profileSection: "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4",
              profileSectionTitle: "text-base font-semibold text-gray-900 mb-3",
              
              // Security/2FA sections
              securitySection: "bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4",
              securitySectionTitle: "text-base font-semibold text-gray-900 mb-3",
              
              // Alert/notification styles
              alert: "p-4 rounded-lg mb-4",
              alertSuccess: "bg-green-50 border border-green-200 text-green-800",
              alertError: "bg-red-50 border border-red-200 text-red-800",
              alertWarning: "bg-yellow-50 border border-yellow-200 text-yellow-800",
            }
          }}
        />
      </div>
    </div>
  );
}