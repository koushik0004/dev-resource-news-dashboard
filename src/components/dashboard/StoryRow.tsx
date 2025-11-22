
import { useState } from 'react';
import { useGetStoryDetailsQuery } from '@/lib/store/hackerNewsApi';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import { ResourceDetailDialog } from '@/components/ResourceDetailDialog';
import { ApiErrorFallback } from '@/components/ApiErrorFallback';

// Single Story Row for HN
export function StoryRow({ id, searchQuery }: Readonly<{ id: number, searchQuery: string }>) {
  const { data: story, isLoading, error } = useGetStoryDetailsQuery(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ title: string; description?: string | null; url: string } | null>(null);

  const openDialog = (resource: { title: string; description?: string | null; url: string }) => {
    setSelectedResource(resource);
    setDialogOpen(true);
  };

  if (isLoading) return null; // Or a row skeleton
  if (error) return <TableRow><TableCell colSpan={4}><ApiErrorFallback error={error} /></TableCell></TableRow>;
  if (!story) return null;

  if (searchQuery !== '' && !story.title.toLowerCase().includes(searchQuery.toLowerCase())) {
    return null;
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{story.title}</TableCell>
      <TableCell>{story.by}</TableCell>
      <TableCell>{story.score}</TableCell>
      <TableCell>
        {story.url ? (
          <Button variant="outline" onClick={() => openDialog({ title: story.title, description: `Author: ${story.by}, Score: ${story.score}`, url: story.url })}>
            View
          </Button>
        ) : (
          <Button variant="outline" disabled>No URL</Button>
        )}
      </TableCell>
      {selectedResource && (
        <ResourceDetailDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={selectedResource.title}
          description={selectedResource.description}
          url={selectedResource.url}
        />
      )}
    </TableRow>
  );
}
