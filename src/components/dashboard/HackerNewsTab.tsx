
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ApiErrorFallback } from '@/components/ApiErrorFallback';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { StoryRow } from './StoryRow';
import { StorySkeleton } from './StorySkeleton';

type RTKQueryError = FetchBaseQueryError | SerializedError | undefined;

// Hacker News Tab Component
export function HackerNewsTab({ storyIds, isLoading, error, searchQuery }: Readonly<{ storyIds: number[], isLoading: boolean, error: RTKQueryError, searchQuery: string }>) {
  if (isLoading) return <StorySkeleton />;
  if (error) return <ApiErrorFallback error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Stories</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Score</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storyIds.map(id => <StoryRow key={id} id={id} searchQuery={searchQuery} />)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
