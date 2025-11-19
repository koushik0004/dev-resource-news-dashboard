// src/components/ApiErrorFallback.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

type RTKQueryError = FetchBaseQueryError | SerializedError;

interface ApiErrorFallbackProps {
  error: RTKQueryError;
}

export function ApiErrorFallback({ error }: ApiErrorFallbackProps) {
  // Attempt to parse a meaningful message from RTK Query error object
  let message = 'An unexpected API error occurred during data fetch.';

  if (error) {
    if ('status' in error) { // FetchBaseQueryError
      message = `Error ${error.status}: ${JSON.stringify(error.data || error.error)}`;
    } else { // SerializedError
      message = error.message || message;
    }
  }

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
