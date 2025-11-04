import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, DollarSign, Star, TrendingUp, MapPin, Calendar, Clock } from "lucide-react";
import { Loader2 } from "lucide-react";

const WorkerDashboard = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate("/auth");
      return;
    }

    if (profile?.role === "employer") {
      navigate("/employer-dashboard");
      return;
    }

    if (profile) {
      loadDashboardData();
    }
  }, [profile, authLoading, navigate]);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      // Load applications
      const { data: appsData } = await supabase
        .from("applications")
        .select(`
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
        `)
        .eq("laborer_id", profile.id)
        .order("created_at", { ascending: false });

      setApplications(appsData || []);

      // Load active jobs (accepted applications)
      const activeApps = appsData?.filter((app) => app.status === "accepted") || [];
      setActiveJobs(activeApps);

      // Calculate earnings from completed payments
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount")
        .eq("payee_id", profile.id)
        .eq("status", "completed");

      const totalEarnings = paymentsData?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
      setEarnings(totalEarnings);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "Active Applications",
      value: applications.filter((a) => a.status === "submitted" || a.status === "under_review").length,
      icon: Briefcase,
      change: "+2 this week",
    },
    {
      title: "Jobs Completed",
      value: profile?.completed_jobs_count || 0,
      icon: TrendingUp,
      change: "All time",
    },
    {
      title: "Earnings This Month",
      value: `₹${earnings.toLocaleString()}`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500/10 text-blue-600";
      case "under_review":
        return "bg-yellow-500/10 text-yellow-600";
      case "accepted":
        return "bg-green-500/10 text-green-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
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
                  <p className="text-muted-foreground mb-4">Start applying to jobs to see them here</p>
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
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </div>
                      <Link to={`/jobs/${app.job_id}`}>
                        <Button variant="outline" size="sm">View Job</Button>
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
                  <p className="text-muted-foreground">Accepted applications will appear here</p>
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
                        <Badge variant="secondary" className="ml-2">Verified</Badge>
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

export default WorkerDashboard;
