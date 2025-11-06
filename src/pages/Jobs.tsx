import { useState } from "react";
import Navigation from "@/components/Navigation";
import JobCard from "@/components/JobCard";
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
const JobCardSkeleton = () => (
  <Card>
    <CardContent className="pt-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="h-5 w-1/4" />
      <div className="space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-1/2" />
      </div>
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
const fetchJobs = async (
  searchQuery: string,
  selectedCategory: string,
  selectedLocation: string,
) => {
  let query = supabase.from("jobs").select(
    `
    *,
    profiles:employer_id (
      name,
      verified,
      trust_score
    )
  `,
  );

  query = query.eq("status", "open");

  if (searchQuery) {
    // Using `or` to search in title, description, and skills
    query = query.or(
      `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,required_skills.cs.{${searchQuery}}`,
    );
  }

  if (selectedCategory !== "all") {
    query = query.eq("category", selectedCategory);
  }

  if (selectedLocation !== "all") {
    query = query.ilike("location", `%${selectedLocation}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const {
    data: jobs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs", searchQuery, selectedCategory, selectedLocation],
    queryFn: () => fetchJobs(searchQuery, selectedCategory, selectedLocation),
    keepPreviousData: true, // Optional: for a smoother filtering experience
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Your Next Job</h1>
            <p className="text-lg text-white/90">
              Browse thousands of verified jobs with transparent wages
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
                placeholder="Search jobs, skills, or categories..."
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
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="agriculture">Agriculture</SelectItem>
                <SelectItem value="shop_renovation">Shop Renovation</SelectItem>
                <SelectItem value="apartment_association">Apartment Association</SelectItem>
                <SelectItem value="custom_craft">Custom Craft</SelectItem>
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
                <SelectItem value="Noida">Noida</SelectItem>
                {/* Add more locations as needed */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `${jobs?.length || 0} Jobs Available`
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
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : error ? (
              <p className="text-destructive col-span-3">Failed to load jobs.</p>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job: any) => (
                <Link to={`/jobs/${job.id}`} key={job.id}>
                  <JobCard
                    title={job.title}
                    category={job.category}
                    location={job.location}
                    duration={`${job.duration_days || "Varies"}${job.duration_days ? " days" : ""}`}
                    wage={String(job.wage)}
                    wageType={job.wage_type}
                    rating={job.profiles?.trust_score || 0}
                    employerName={job.profiles?.name || "Unknown Employer"}
                    isVerified={job.profiles?.verified || false}
                    skills={job.required_skills || []}
                  />
                </Link>
              ))
            ) : (
              <div className="text-center py-12 col-span-3">
                <p className="text-lg text-muted-foreground">
                  No jobs found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jobs;