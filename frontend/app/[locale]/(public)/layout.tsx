/**
 * Public Layout - For publicly accessible pages
 * No authentication required
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
