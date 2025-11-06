import { useState } from "react";
import Navigation from "@/components/Navigation";
import WorkerCard from "@/components/WorkerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Filter, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";

// Loading Skeleton
const WorkerCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-11 w-full" />
    </CardFooter>
  </Card>
);

// Fetch function
const fetchWorkers = async (
  searchQuery: string,
  selectedCategory: string,
  selectedLocation: string,
) => {
  let query = supabase.from("profiles").select("*");

  // Always filter for worker roles
  query = query.in("role", ["laborer", "artisan"]);

  if (searchQuery) {
    // Using `or` to search in name, bio, and skills
    query = query.or(
      `name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%,skills.cs.{${searchQuery}}`,
    );
  }

  if (selectedCategory !== "all") {
    // Category for a worker is their role
    query = query.eq("role", selectedCategory);
  }

  if (selectedLocation !== "all") {
    query = query.ilike("location", `%${selectedLocation}%`);
  }

  const { data, error } = await query.order("trust_score", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const Workers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const {
    data: workers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workers", searchQuery, selectedCategory, selectedLocation],
    queryFn: () => fetchWorkers(searchQuery, selectedCategory, selectedLocation),
    keepPreviousData: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Skilled Workers</h1>
            <p className="text-lg text-white/90">
              Connect with verified professionals with proven track records
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-card shadow-soft -mt-8 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search workers, skills, or roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <Briefcase className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="laborer">Laborer</SelectItem>
                <SelectItem value="artisan">Artisan</SelectItem>
                {/* Add other roles if needed, or query them from your schema */}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Workers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `${workers?.length || 0} Workers Available`
              )}
            </h2>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <>
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
              </>
            ) : error ? (
              <p className="text-destructive col-span-3">Failed to load workers.</p>
            ) : workers && workers.length > 0 ? (
              workers.map((worker: any) => (
                <Link to={`/workers/${worker.id}`} key={worker.id}>
                  <WorkerCard
                    name={worker.name}
                    category={worker.role.charAt(0).toUpperCase() + worker.role.slice(1)}
                    location={worker.location || "N/A"}
                    rating={worker.trust_score || 0}
                    completedJobs={worker.completed_jobs_count || 0}
                    hourlyRate={String(worker.hourly_rate || "N/A")}
                    skills={worker.skills || []}
                    isVerified={worker.verified || false}
                    avatarUrl={worker.avatar_url}
                  />
                </Link>
              ))
            ) : (
              <div className="text-center py-12 col-span-3">
                <p className="text-lg text-muted-foreground">
                  No workers found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Workers;