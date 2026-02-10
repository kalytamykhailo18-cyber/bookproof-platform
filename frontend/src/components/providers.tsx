import { Toaster } from 'sonner';
import { LoadingProvider } from './providers/LoadingProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LoadingProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </LoadingProvider>
  );
}
