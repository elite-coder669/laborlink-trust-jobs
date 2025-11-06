import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, TrendingUp, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const WorkerDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch applications
  const {
    data: applications,
    isLoading: isLoadingApplications,
  } = useQuery({
    queryKey: ["workerApplications", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data: appsData, error } = await supabase
        .from("applications")
        .select(
          `
          *,
          jobs (
            id,
            title,
            wage,
            wage_type,
            location,
            category,
            profiles:employer_id (name, verified)
          )
        `,
        )
        .eq("laborer_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return appsData || [];
    },
    enabled: !!profile,
  });

  // Query to fetch earnings
  const { data: earnings } = useQuery({
    queryKey: ["workerEarnings", profile?.id],
    queryFn: async () => {
      if (!profile) return 0;
      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select("amount")
        .eq("payee_id", profile.id)
        .eq("status", "completed");
      if (error) throw error;
      const totalEarnings =
        paymentsData?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
      return totalEarnings;
    },
    enabled: !!profile,
  });

  // Mutation to update application status (Accept/Reject)
  const useApplicationUpdate = useMutation({
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
    onSuccess: (data) => {
      toast({
        title: `Invitation ${data.status}!`,
        description: `You have ${data.status} the job offer.`,
      });
      queryClient.invalidateQueries({ queryKey: ["workerApplications", profile?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application.",
        variant: "destructive",
      });
    },
  });

  // Redirect logic
  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }
    if (profile?.role === "employer") {
      navigate("/employer-dashboard");
      return;
    }
  }, [profile, authLoading, navigate]);

  if (authLoading || isLoadingApplications) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeJobs = applications?.filter((app) => app.status === "accepted") || [];
  const submittedOrPending =
    applications?.filter((a) => a.status === "submitted" || a.status === "under_review").length ||
    0;

  const stats = [
    {
      title: "Pending Applications",
      value: submittedOrPending,
      icon: Briefcase,
      change: "Waiting for review",
    },
    {
      title: "Jobs Completed",
      value: profile?.completed_jobs_count || 0,
      icon: TrendingUp,
      change: "All time",
    },
    {
      title: "Total Earnings",
      value: `₹${(earnings || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "Total completed",
    },
    {
      title: "Current Rating",
      value: profile?.trust_score?.toFixed(1) || "N/A",
      icon: Star,
      change: "Based on reviews",
    },
  ];

  const getStatusComponent = (app: any) => {
    const status = app.status;
    const colors: Record<string, string> = {
      invited: "bg-purple-500/10 text-purple-600",
      submitted: "bg-blue-500/10 text-blue-600",
      under_review: "bg-yellow-500/10 text-yellow-600",
      accepted: "bg-green-500/10 text-green-600",
      rejected: "bg-red-500/10 text-red-600",
      default: "bg-gray-500/10 text-gray-600",
    };
    const colorClass = colors[status] || colors.default;

    if (status === "invited") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() =>
              useApplicationUpdate.mutate({ applicationId: app.id, newStatus: "rejected" })
            }
            disabled={useApplicationUpdate.isPending}
          >
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-secondary hover:bg-secondary-hover"
            onClick={() =>
              useApplicationUpdate.mutate({ applicationId: app.id, newStatus: "accepted" })
            }
            disabled={useApplicationUpdate.isPending}
          >
            Accept
          </Button>
        </div>
      );
    }

    if (status === "submitted" || status === "under_review") {
      return <Badge className={colorClass}>Pending Employer</Badge>;
    }

    return <Badge className={colorClass}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name}</h1>
          <p className="text-muted-foreground">Track your applications and manage your work</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start applying to jobs to see them here
                  </p>
                  <Link to="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-2">{app.jobs?.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.jobs?.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ₹{app.jobs?.wage}/{app.jobs?.wage_type}
                          </span>
                        </CardDescription>
                      </div>
                      {/* This now renders buttons or a badge based on status */}
                      {getStatusComponent(app)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {app.status === "invited" ? "Invited" : "Applied"}{" "}
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      <Link to={`/jobs/${app.job_id}`}>
                        <Button variant="outline" size="sm">
                          View Job
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Jobs</h3>
                  <p className="text-muted-foreground">
                    Accepted applications will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeJobs.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <CardTitle>{app.jobs?.title}</CardTitle>
                    <CardDescription>
                      Employer: {app.jobs?.profiles?.name}
                      {app.jobs?.profiles?.verified && (
                        <Badge variant="secondary" className="ml-2">
                          Verified
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/jobs/${app.job_id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="browse">
            <Card>
              <CardContent className="py-12 text-center">
                <Link to="/jobs">
                  <Button size="lg">
                    <Briefcase className="mr-2" />
                    Browse All Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Wrap the page with the ProtectedRoute
const ProtectedWorkerDashboard = () => (
  <ProtectedRoute requireRole="laborer">
    <WorkerDashboard />
  </ProtectedRoute>
);

export default ProtectedWorkerDashboard;