import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, DollarSign, Calendar, Clock, Briefcase, Star, CheckCircle, Loader2 } from "lucide-react";
import TrustBadge from "@/components/TrustBadge";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [expectedWage, setExpectedWage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [id, user]);

  // Fetch applications for this job (visible to the employer)
  const {
    data: jobApplications,
    isLoading: isLoadingJobApplications,
    refetch: refetchJobApplications,
  } = useQuery({
    queryKey: ["jobApplications", id],
    queryFn: async () => {
      if (!id) return [];
      const { data: apps, error } = await supabase
        .from("applications")
        .select(
          `*, profiles:laborer_id ( id, name, trust_score, avatar_url, completed_jobs_count )`
        )
        .eq("job_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return apps || [];
    },
    enabled: !!id && !!job && profile?.id === job?.employer_id,
  });

  const applicationMutation = useMutation({
    mutationFn: async ({ applicationId, newStatus }: { applicationId: string; newStatus: string }) => {
      const { data: appData, error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId)
        .select()
        .single();
      if (error) throw error;
      return appData;
    },
    onSuccess: async (data) => {
      toast({ title: `Application ${data.status}`, description: "Status updated" });
      // Refresh local and global caches
      queryClient.invalidateQueries({ queryKey: ["jobApplications", id] });
      queryClient.invalidateQueries({ queryKey: ["employerApplicants", user?.id] });
      if (data?.laborer_id) queryClient.invalidateQueries({ queryKey: ["workerApplications", data.laborer_id] });
      // Refresh job details to update applicants_count etc.
      await loadJobDetails();

      // If accepted, check if we reached positions_required and update job status if needed
      try {
        if (data?.status === "accepted" && data?.job_id) {
          const { data: jobData, error: jobFetchError } = await supabase
            .from("jobs")
            .select("positions_required")
            .eq("id", data.job_id)
            .maybeSingle();

          if (!jobFetchError) {
            const positions = jobData?.positions_required ?? 1;
            const { count: acceptedCount, error: countError } = await supabase
              .from("applications")
              .select("id", { count: "exact", head: true })
              .eq("job_id", data.job_id)
              .eq("status", "accepted");

            if (!countError) {
              const accepted = acceptedCount || 0;
              if (accepted >= positions) {
                const { error: jobError } = await supabase
                  .from("jobs")
                  .update({ status: "in_progress" })
                  .eq("id", data.job_id);
                if (jobError) console.warn("Failed to update job status:", jobError.message);
                queryClient.invalidateQueries({ queryKey: ["employerJobs", user?.id, "open"] });
                queryClient.invalidateQueries({ queryKey: ["employerStats", user?.id] });
              }
            }
          }
        }
      } catch (e) {
        console.warn("Error in post-accept logic:", e);
      }
    },
  });

  const loadJobDetails = async () => {
    if (!id) return;

    try {
      const { data: jobData } = await supabase
        .from("jobs")
        .select(`
          *,
          profiles:employer_id (
            id,
            name,
            verified,
            trust_score,
            location
          ),
          custom_craft_uploads (
            id,
            image_url
          )
        `)
        .eq("id", id)
        .single();

      setJob(jobData);

      // Check if user has already applied
      if (user) {
        const { data: applicationData } = await supabase
          .from("applications")
          .select("id")
          .eq("job_id", id)
          .eq("laborer_id", user.id)
          .maybeSingle();

        setHasApplied(!!applicationData);
      }
    } catch (error) {
      console.error("Error loading job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || !profile) {
      navigate("/auth");
      return;
    }

    if (profile.role === "employer") {
      toast({
        title: "Not Allowed",
        description: "Employers cannot apply to jobs",
        variant: "destructive",
      });
      return;
    }

    setApplying(true);

    try {
      const { error } = await supabase.from("applications").insert({
        job_id: id,
        laborer_id: user.id,
        message: applicationMessage,
        expected_wage: expectedWage ? parseFloat(expectedWage) : null,
        status: "submitted",
      });

      if (error) throw error;

      // Update job applicants count
      const { data: currentJob } = await supabase
        .from("jobs")
        .select("applicants_count")
        .eq("id", id)
        .single();

      if (currentJob) {
        await supabase
          .from("jobs")
          .update({ applicants_count: (currentJob.applicants_count || 0) + 1 })
          .eq("id", id);
      }

      toast({
        title: "Application Submitted!",
        description: "The employer will review your application soon.",
      });

      setHasApplied(true);
      setDialogOpen(false);
      setApplicationMessage("");
      setExpectedWage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Link to="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      construction: "bg-orange-500/10 text-orange-600",
      agriculture: "bg-green-500/10 text-green-600",
      shop_renovation: "bg-blue-500/10 text-blue-600",
      apartment_association: "bg-purple-500/10 text-purple-600",
      custom_craft: "bg-pink-500/10 text-pink-600",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Job Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-base">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    <Badge className={getCategoryColor(job.category)}>
                      {job.category.replace("_", " ")}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent mb-1">
                    ₹{job.wage}
                  </div>
                  <div className="text-sm text-muted-foreground">per {job.wage_type}</div>
                </div>
              </div>

              {/* Employer Info */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {job.profiles?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {job.profiles?.name}
                      {job.profiles?.verified && <TrustBadge type="verified" />}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 fill-trust-gold text-trust-gold" />
                      {job.profiles?.trust_score?.toFixed(1) || "New"}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground"> 
                  {job.applicants_count || 0} applicant(s) • {job.positions_required || 1} position(s) required
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" disabled={hasApplied || profile?.role === "employer"}>
                      {hasApplied ? (
                        <>
                          <CheckCircle className="mr-2 w-5 h-5" />
                          Applied
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>Submit your application to the employer</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Cover Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the employer why you're a good fit..."
                          value={applicationMessage}
                          onChange={(e) => setApplicationMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expectedWage">Expected Wage (Optional)</Label>
                        <Input
                          id="expectedWage"
                          type="number"
                          placeholder={`₹${job.wage}`}
                          value={expectedWage}
                          onChange={(e) => setExpectedWage(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleApply} disabled={applying}>
                        {applying && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        Submit Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            </Card>

            {/* Employer: Applicants management (visible to job owner) */}
            {profile?.id === job.employer_id && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Applicants</CardTitle>
                  <CardDescription>
                    Review applications and accept up to {job.positions_required || 1} worker(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingJobApplications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : jobApplications && jobApplications.length > 0 ? (
                    <div className="grid gap-4">
                      {jobApplications.map((app: any) => (
                        <div key={app.id} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold">{app.profiles?.name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">{app.status}</div>
                            </div>
                          </div>
                          {app.message && <div className="text-sm text-muted-foreground mb-2">{app.message}</div>}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => applicationMutation.mutate({ applicationId: app.id, newStatus: 'rejected' })}
                              disabled={applicationMutation.isLoading}
                            >
                              Reject
                            </Button>
                            <Button
                              className="bg-secondary hover:bg-secondary-hover"
                              onClick={() => applicationMutation.mutate({ applicationId: app.id, newStatus: 'accepted' })}
                              disabled={applicationMutation.isLoading || app.status === 'accepted'}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">No applicants yet.</div>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Job Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">{job.duration_days || "Flexible"} days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Applicants</div>
                    <div className="font-semibold">{job.applicants_count || 0} applied</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Posted</div>
                    <div className="font-semibold">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Required Skills */}
          {job.required_skills && job.required_skills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CustomCraft Images */}
          {job.custom_craft_uploads && job.custom_craft_uploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Design Reference Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.custom_craft_uploads.map((upload: any) => (
                    <img
                      key={upload.id}
                      src={upload.image_url}
                      alt="Design reference"
                      className="rounded-lg object-cover w-full h-48"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
