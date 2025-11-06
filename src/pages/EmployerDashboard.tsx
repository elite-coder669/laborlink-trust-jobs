import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Star,
  MapPin,
  IndianRupee,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// --- Helper Functions for Supabase ---

// Fetch employer stats
const fetchEmployerStats = async (employerId: string) => {
  const { count: activeJobsCount, error: jobsError } = await supabase
    .from("jobs")
    .select("id", { count: "exact" })
    .eq("employer_id", employerId)
    .eq("status", "open");

  const { count: completedJobsCount, error: completedJobsError } = await supabase
    .from("jobs")
    .select("id", { count: "exact" })
    .eq("employer_id", employerId)
    .eq("status", "completed");

  // Get all job IDs for this employer
  const { data: jobIds, error: jobIdsError } = await supabase
    .from("jobs")
    .select("id")
    .eq("employer_id", employerId);

  if (jobIdsError) throw jobIdsError;
  const ids = jobIds.map((j) => j.id);

  let totalApplicantsCount = 0;
  if (ids.length > 0) {
    const { count: applicantsCount, error: applicantsError } = await supabase
      .from("applications")
      .select("id", { count: "exact" })
      .in("job_id", ids)
      .eq("status", "submitted"); // Only count those *submitted* by workers
    if (applicantsError) throw applicantsError;
    totalApplicantsCount = applicantsCount || 0;
  }

  if (jobsError || completedJobsError) {
    throw jobsError || completedJobsError;
  }

  return {
    activeJobsCount: activeJobsCount || 0,
    totalApplicantsCount,
    completedJobsCount: completedJobsCount || 0,
  };
};

// Fetch employer's jobs by status
const fetchEmployerJobs = async (employerId: string, status: "open" | "completed") => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", employerId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// Fetch applicants for an employer's open jobs
const fetchEmployerApplicants = async (employerId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs ( id, title ),
      profiles:laborer_id ( * )
    `,
    )
    .eq("jobs.employer_id", employerId)
    // *** THIS IS THE KEY CHANGE ***
    // Fetch submitted, under_review, AND invited applications
    .in("status", ["submitted", "under_review", "invited"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// --- Dashboard Component ---

const EmployerDashboard = () => {
  const { profile, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for Stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["employerStats", user?.id],
    queryFn: () => fetchEmployerStats(user!.id),
    enabled: !!user,
  });

  // Query for Active Jobs
  const {
    data: activeJobs,
    isLoading: isLoadingActiveJobs,
    error: activeJobsError,
  } = useQuery({
    queryKey: ["employerJobs", user?.id, "open"],
    queryFn: () => fetchEmployerJobs(user!.id, "open"),
    enabled: !!user,
  });

  // Query for Applicants
  const {
    data: applicants,
    isLoading: isLoadingApplicants,
    error: applicantsError,
  } = useQuery({
    queryKey: ["employerApplicants", user?.id],
    queryFn: () => fetchEmployerApplicants(user!.id),
    enabled: !!user,
  });

  // Query for Completed Jobs
  const {
    data: completedJobs,
    isLoading: isLoadingCompletedJobs,
    error: completedJobsError,
  } = useQuery({
    queryKey: ["employerJobs", user?.id, "completed"],
    queryFn: () => fetchEmployerJobs(user!.id, "completed"),
    enabled: !!user,
  });

  // Mutation for updating application status
  const applicationMutation = useMutation({
    mutationFn: async ({
      applicationId,
      newStatus,
    }: {
      applicationId: string;
      newStatus: "accepted" | "rejected";
    }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  onSuccess: async (data) => {
      toast({
        title: `Application ${data.status}!`,
        description: "The applicant has been notified.",
      });
      // Refresh applicants and stats for the employer
      queryClient.invalidateQueries({ queryKey: ["employerApplicants", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["employerStats", user?.id] });

      // Also notify the worker's client by invalidating their applications query so
      // they see the updated status (and employer info) without needing a manual refresh.
      try {
        const laborerId = data?.laborer_id;
        if (laborerId) {
          queryClient.invalidateQueries({ queryKey: ["workerApplications", laborerId] });
        }
      } catch (e) {
        // Non-fatal: if the returned data shape doesn't include laborer_id, skip.
        console.warn("Could not invalidate workerApplications for laborer:", e);
      }

      // If the employer accepted the application, move the job to in_progress so
      // the employer clearly sees an accepted worker for that job.
      try {
        if (data?.status === "accepted" && data?.job_id) {
          // Fetch job to determine positions_required
          const { data: jobData, error: jobFetchError } = await supabase
            .from("jobs")
            .select("positions_required")
            .eq("id", data.job_id)
            .maybeSingle();

          if (jobFetchError) {
            console.warn("Failed to fetch job for positions check:", jobFetchError.message);
          } else {
            const positions = jobData?.positions_required ?? 1;
            // Count how many accepted applications exist for this job
            const { count: acceptedCount, error: countError } = await supabase
              .from("applications")
              .select("id", { count: "exact", head: true })
              .eq("job_id", data.job_id)
              .eq("status", "accepted");

            if (countError) {
              console.warn("Failed to count accepted applications:", countError.message);
            } else {
              const accepted = acceptedCount || 0;
              // If we've reached the required positions, move the job to in_progress
              if (accepted >= positions) {
                const { error: jobError } = await supabase
                  .from("jobs")
                  .update({ status: "in_progress" })
                  .eq("id", data.job_id);
                if (jobError) console.warn("Failed to update job status after acceptance:", jobError.message);

                // Refresh employer jobs and stats to reflect the change.
                queryClient.invalidateQueries({ queryKey: ["employerJobs", user?.id, "open"] });
                queryClient.invalidateQueries({ queryKey: ["employerJobs", user?.id, "completed"] });
                queryClient.invalidateQueries({ queryKey: ["employerStats", user?.id] });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Error while updating job after application acceptance:", e);
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApplicationUpdate = (applicationId: string, newStatus: "accepted" | "rejected") => {
    applicationMutation.mutate({ applicationId, newStatus });
  };

  // Realtime subscription: notify employer when new applications or updates happen
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("public:applications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        async (payload) => {
          try {
            const jobId = payload.new?.job_id;
            if (!jobId) return;
            const { data: jobData } = await supabase.from("jobs").select("employer_id, title").eq("id", jobId).single();
            if (jobData?.employer_id === user.id) {
              queryClient.invalidateQueries({ queryKey: ["employerApplicants", user.id] });
              queryClient.invalidateQueries({ queryKey: ["employerStats", user.id] });
              toast({ title: "New Application", description: `A worker applied for ${jobData.title}` });
            }
          } catch (e) {
            console.warn("Realtime handler error (INSERT):", e);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications" },
        async (payload) => {
          try {
            const jobId = payload.new?.job_id;
            if (!jobId) return;
            const { data: jobData } = await supabase.from("jobs").select("employer_id, title").eq("id", jobId).single();
            if (jobData?.employer_id === user.id) {
              queryClient.invalidateQueries({ queryKey: ["employerApplicants", user.id] });
              queryClient.invalidateQueries({ queryKey: ["employerStats", user.id] });
            }
          } catch (e) {
            console.warn("Realtime handler error (UPDATE):", e);
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, [user, queryClient, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      icon: Briefcase,
      label: "Active Jobs",
      value: stats?.activeJobsCount ?? "0",
      color: "text-primary",
      loading: isLoadingStats,
    },
    {
      icon: Users,
      label: "Pending Applicants",
      value: stats?.totalApplicantsCount ?? "0",
      color: "text-secondary",
      loading: isLoadingStats,
    },
    {
      icon: CheckCircle,
      label: "Completed Jobs",
      value: stats?.completedJobsCount ?? "0",
      color: "text-trust-verified",
      loading: isLoadingStats,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Employer Dashboard</h1>
              <p className="text-lg text-white/90">Welcome back, {profile?.name}</p>
            </div>
            <Link to="/post-job">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-elevated"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="shadow-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stat.loading ? <Skeleton className="h-8 w-12" /> : stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Active Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Active Job Postings</h2>
            </div>
            {isLoadingActiveJobs ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : activeJobsError ? (
              <p className="text-destructive">Failed to load jobs.</p>
            ) : activeJobs && activeJobs.length > 0 ? (
              <div className="grid gap-4">
                {activeJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="shadow-card border-border hover:shadow-elevated transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {job.title}
                            </h3>
                            <Badge className="bg-trust-verified/10 text-trust-verified">
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-primary" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="w-4 h-4 text-accent" />
                              {job.wage}/{job.wage_type}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-secondary" />
                              {job.applicants_count || 0} applicants
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Posted {new Date(job.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/jobs/${job.id}`}>
                            <Button>View Details</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Jobs</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Post New Job" to get started.
                  </p>
                  <Link to="/post-job">
                    <Button>Post New Job</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Applicants & Invitations</h2>
            {isLoadingApplicants ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : applicantsError ? (
              <p className="text-destructive">Failed to load applicants.</p>
            ) : applicants && applicants.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicants.map((app) => {
                  const worker = app.profiles;
                  const initials =
                    worker.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U";
                  return (
                    <Card key={app.id} className="shadow-card border-border">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={worker.avatar_url} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              <Link
                                to={`/workers/${worker.id}`}
                                className="hover:underline"
                              >
                                {worker.name}
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              For:{" "}
                              <Link
                                to={`/jobs/${app.jobs.id}`}
                                className="text-primary hover:underline"
                              >
                                {app.jobs.title}
                              </Link>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-trust-gold text-trust-gold" />
                              <span className="font-medium text-foreground">
                                {worker.trust_score?.toFixed(1) || "New"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Jobs</span>
                            <span className="font-medium text-foreground">
                              {worker.completed_jobs_count || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rate</span>
                            <span className="font-medium text-accent">
                              {worker.hourly_rate ? `₹${worker.hourly_rate}/hr` : "N/A"}
                            </span>
                          </div>
                        </div>
                        {app.message && (
                          <div className="text-sm text-muted-foreground border-t pt-2 max-h-20 overflow-y-auto">
                            <strong>Message:</strong> {app.message}
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          {/* *** THIS IS THE KEY CHANGE *** */}
                          {app.status === "invited" ? (
                            <Badge
                              className="flex-1 justify-center bg-purple-500/10 text-purple-600"
                              variant="outline"
                            >
                              <Send className="w-3 h-3 mr-1.5" />
                              Pending Worker Response
                            </Badge>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  handleApplicationUpdate(app.id, "rejected")
                                }
                                disabled={applicationMutation.isPending}
                              >
                                Reject
                              </Button>
                              <Button
                                className="flex-1 bg-secondary hover:bg-secondary-hover"
                                onClick={() =>
                                  handleApplicationUpdate(app.id, "accepted")
                                }
                                disabled={applicationMutation.isPending}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Applicants Yet</h3>
                  <p className="text-muted-foreground">
                    New applicants for your jobs will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Completed Jobs</h2>
            {isLoadingCompletedJobs ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : completedJobsError ? (
              <p className="text-destructive">Failed to load job history.</p>
            ) : completedJobs && completedJobs.length > 0 ? (
              <div className="grid gap-4">
                {completedJobs.map((job) => (
                  <Card key={job.id} className="shadow-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-trust-verified" />
                            Completed on {new Date(job.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Jobs</h3>
                  <p className="text-muted-foreground">
                    Your completed job history will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

// Wrap the page with the ProtectedRoute
const ProtectedEmployerDashboard = () => (
  <ProtectedRoute requireRole="employer">
    <EmployerDashboard />
  </ProtectedRoute>
);

export default ProtectedEmployerDashboard;