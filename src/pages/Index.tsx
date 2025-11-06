import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import CategoryCard from "@/components/CategoryCard";
import JobCard from "@/components/JobCard";
import WorkerCard from "@/components/WorkerCard";
import {
  Hammer,
  Wrench,
  Paintbrush,
  Truck,
  Zap,
  Home,
  Search,
  Shield,
  IndianRupee,
  Users,
  Star,
  Loader2,
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

// Helper components for loading skeletons
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

// Function to fetch featured jobs
const fetchFeaturedJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      profiles:employer_id (
        name,
        verified,
        trust_score
      )
    `,
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  return data;
};

// Function to fetch top workers
const fetchTopWorkers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["laborer", "artisan"])
    .order("trust_score", { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  return data;
};

const Index = () => {
  const categories = [
    { icon: Hammer, title: "Construction", jobCount: "150+" },
    { icon: Wrench, title: "Plumbing", jobCount: "85+" },
    { icon: Paintbrush, title: "Painting", jobCount: "120+" },
    { icon: Truck, title: "Delivery", jobCount: "200+" },
    { icon: Zap, title: "Electrical", jobCount: "95+" },
    { icon: Home, title: "Housekeeping", jobCount: "180+" },
  ];

  const {
    data: jobs,
    isLoading: isLoadingJobs,
    error: jobsError,
  } = useQuery({
    queryKey: ["featuredJobs"],
    queryFn: fetchFeaturedJobs,
  });

  const {
    data: workers,
    isLoading: isLoadingWorkers,
    error: workersError,
  } = useQuery({
    queryKey: ["topWorkers"],
    queryFn: fetchTopWorkers,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Building Trust,
                <br />
                One Job at a Time
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                Empowering India's workforce with transparent wages, verified employers, and fair
                opportunities for daily workers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/jobs">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Find Jobs
                  </Button>
                </Link>
                <Link to="/workers">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Hire Workers
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src={heroImage}
                alt="Workers and employers collaborating"
                className="rounded-2xl shadow-elevated"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Verified Employers</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-secondary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Workers</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-accent/10 rounded-full flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-accent" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">₹2Cr+</div>
              <div className="text-sm text-muted-foreground">Wages Paid</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-trust-gold/10 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-trust-gold" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Job Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find work in your field or hire skilled workers across various trades
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Featured Jobs
              </h2>
              <p className="text-lg text-muted-foreground">
                Latest opportunities with verified employers
              </p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" size="lg">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingJobs ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : jobsError ? (
              <p className="text-destructive col-span-3">Failed to load jobs.</p>
            ) : (
              jobs?.map((job: any) => (
                <JobCard
                  key={job.id}
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Workers */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Top Rated Workers
              </h2>
              <p className="text-lg text-muted-foreground">
                Skilled professionals with proven track records
              </p>
            </div>
            <Link to="/workers">
              <Button variant="outline" size="lg">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingWorkers ? (
              <>
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
              </>
            ) : workersError ? (
              <p className="text-destructive col-span-3">Failed to load workers.</p>
            ) : (
              workers?.map((worker: any) => (
                <WorkerCard
                  key={worker.id}
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section (Rest of the page is static, so it remains unchanged) */}
      <section className="py-16 md:py-20 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90">
              Join thousands of workers and employers building trust and creating opportunities
              together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
                >
                  Register as Worker
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
                >
                  Register as Employer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl text-foreground">LaborLink</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Building trust between daily workers and employers across India
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Workers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/jobs" className="hover:text-primary transition-colors">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-primary transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Employers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/workers" className="hover:text-primary transition-colors">
                    Find Workers
                  </Link>
                </li>
                <li>
                  <Link to="/post-job" className="hover:text-primary transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 LaborLink. Empowering India's Workforce.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;