'use client';

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetTrendingReposQuery } from '@/lib/store/githubApi';
import { useGetTopStoryIdsQuery } from '@/lib/store/hackerNewsApi';
import type { RootState } from '@/lib/store/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/dashboard/Header';
import Filter from '@/components/dashboard/Filter';
import { GithubTab } from '@/components/dashboard/GithubTab';
import { HackerNewsTab } from '@/components/dashboard/HackerNewsTab';


// Main Dashboard Page
export default function DashboardPage() {
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
      <Header />
      <Filter 
        searchQuery={searchQuery}
        activeTab={activeTab}
        languageFilter={languageFilter}
        languages={languages}
      />

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