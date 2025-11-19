// src/components/ApiErrorFallback.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ApiErrorFallbackProps {
  error: any;
}

export function ApiErrorFallback({ error }: ApiErrorFallbackProps) {
  // Attempt to parse a meaningful message from RTK Query error object
  const message = error?.data?.message || error?.error || 'An unexpected API error occurred during data fetch.';

  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
      <AlertTitle>API Fetch Error</AlertTitle>
      <AlertDescription>
        Failed to fetch data from the API: {message}
      </AlertDescription>
    </Alert>
  );
}
