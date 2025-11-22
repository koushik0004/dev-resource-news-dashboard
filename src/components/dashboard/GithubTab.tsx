
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResourceDetailDialog } from '@/components/ResourceDetailDialog';
import { ApiErrorFallback } from '@/components/ApiErrorFallback';
import type { GithubRepo } from '@/lib/store/githubApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';
import { RepoSkeleton } from './RepoSkeleton';

type RTKQueryError = FetchBaseQueryError | SerializedError | undefined;

// GitHub Tab Component
export function GithubTab({ repos, isLoading, error }: Readonly<{ repos: GithubRepo[], isLoading: boolean, error: RTKQueryError }>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ title: string; description?: string | null; url: string } | null>(null);

  const openDialog = (resource: { title: string; description?: string | null; url: string }) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  if (isLoading) return <RepoSkeleton />;
  if (error) return <ApiErrorFallback error={error} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Repositories</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Stars</TableHead>
              <TableHead>Language</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repos.map(repo => (
              <TableRow key={repo.id}>
                <TableCell className="font-medium">{repo.name}</TableCell>
                <TableCell>{repo.description}</TableCell>
                <TableCell>{repo.stargazers_count}</TableCell>
                <TableCell>{repo.language}</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => openDialog({ title: repo.name, description: repo.description, url: repo.html_url })}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {selectedResource && (
        <ResourceDetailDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={selectedResource.title}
          description={selectedResource.description}
          url={selectedResource.url}
        />
      )}
    </Card>
  );
}
