import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Fetch top stories IDs
const fetchTopStories = async () => {
  const res = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  return res.json();
};

// Fetch story details by ID
const fetchStory = async (storyId) => {
  const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
  return res.json();
};

const HackerNewsTopStories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: storyIds, error: storyIdsError, isLoading: isLoadingStoryIds } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  const { data: stories, error: storiesError, isLoading: isLoadingStories } = useQuery({
    queryKey: ["stories", storyIds],
    queryFn: async () => {
      if (!storyIds) return [];
      const storyPromises = storyIds.slice(0, 100).map((id) => fetchStory(id));
      return Promise.all(storyPromises);
    },
    enabled: !!storyIds,
  });

  const filteredStories = stories?.filter((story) =>
    story?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (storyIdsError || storiesError) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to fetch stories. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {isLoadingStoryIds || isLoadingStories ? (
        <Skeleton className="w-full h-20 mb-4" count={10} />
      ) : (
        filteredStories?.map((story) => (
          <Card key={story.id} className="mb-4">
            <CardHeader>
              <CardTitle>{story.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Upvotes: {story.score}</p>
              <a href={story.url} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default HackerNewsTopStories;