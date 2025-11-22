'use client';

import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTrendingReposQuery } from '@/lib/store/githubApi';
import { useGetTopStoryIdsQuery, useGetStoryDetailsQuery } from '@/lib/store/hackerNewsApi';
import { setSearchQuery, setLanguageFilter } from '@/lib/store/filterSlice';
import type { RootState } from '@/lib/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceDetailDialog } from '@/components/ResourceDetailDialog';
import { ApiErrorFallback } from '@/components/ApiErrorFallback';
import type { GithubRepo } from '@/lib/store/githubApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

type RTKQueryError = FetchBaseQueryError | SerializedError | undefined;

// Main Dashboard Page
export default function DashboardPage() {
  const dispatch = useDispatch();
  const { searchQuery, languageFilter } = useSelector((state: RootState) => state.filter);
  const [activeTab, setActiveTab] = useState('github');

  const { data: reposData, isLoading: isLoadingRepos, error: reposError } = useGetTrendingReposQuery();
  const { data: storyIds, isLoading: isLoadingStoryIds, error: storyIdsError } = useGetTopStoryIdsQuery();

  const languages = useMemo(() => {
    if (!reposData) return [];
    const langSet = new Set(reposData.map(repo => repo.language).filter(Boolean) as string[]);
    return ['All', ...Array.from(langSet)];
  }, [reposData]);

  const filteredRepos = useMemo(() => {
    if (!reposData) return [];
    return reposData.filter(repo => {
      const matchesSearch = searchQuery === '' || 
                            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            repo?.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = languageFilter === 'All' || repo.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });
  }, [reposData, searchQuery, languageFilter]);

  return (
    <div className="container mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">Developer Resource Dashboard</h1>
      </header>

      <div className="mb-4 flex gap-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="max-w-sm"
        />
        {activeTab === 'github' && (
          <Select
            value={languageFilter}
            onValueChange={(value) => dispatch(setLanguageFilter(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="github" onValueChange={(value) => setActiveTab(value)}>
        <TabsList>
          <TabsTrigger value="github">GitHub Trending</TabsTrigger>
          <TabsTrigger value="hackernews">Hacker News</TabsTrigger>
        </TabsList>
        <TabsContent value="github">
          <GithubTab repos={filteredRepos} isLoading={isLoadingRepos} error={reposError} />
        </TabsContent>
        <TabsContent value="hackernews">
          <HackerNewsTab
            storyIds={storyIds?.slice(0, 10) || []}
            isLoading={isLoadingStoryIds}
            error={storyIdsError}
            searchQuery={searchQuery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// GitHub Tab Component
function GithubTab({ repos, isLoading, error }: Readonly<{ repos: GithubRepo[], isLoading: boolean, error: RTKQueryError }>) {
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

// Hacker News Tab Component
function HackerNewsTab({ storyIds, isLoading, error, searchQuery }: Readonly<{ storyIds: number[], isLoading: boolean, error: RTKQueryError, searchQuery: string }>) {
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

// Single Story Row for HN
function StoryRow({ id, searchQuery }: Readonly<{ id: number, searchQuery: string }>) {
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

// Skeleton Loaders
function RepoSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[250px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[50px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[50px]" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-[55px]" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function StorySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-[300px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[50px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[50px]" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(10)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                                <TableCell><Skeleton className="h-9 w-[55px]" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}