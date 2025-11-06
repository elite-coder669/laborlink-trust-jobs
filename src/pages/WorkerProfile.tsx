import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Loader2, MessageSquare } from "lucide-react";
import TrustBadge from "@/components/TrustBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const WorkerProfile = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");

  // Query to fetch worker profile, reviews, and existing applications
  const {
    data: workerData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workerProfile", id],
    queryFn: async () => {
      if (!id) throw new Error("No worker ID provided");

      // 1. Load worker profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (profileError) throw profileError;

      // 2. Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(
          `
          *,
          profiles:reviewer_id (name, avatar_url),
          jobs (title)
        `,
        )
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (reviewsError) console.error("Error fetching reviews:", reviewsError.message);

      // 3. Load worker's existing applications to prevent duplicate invites
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select("job_id")
        .eq("laborer_id", id);
      if (applicationsError) console.error("Error fetching applications:", applicationsError.message);

      const appliedJobIds = new Set(applicationsData?.map((app) => app.job_id) || []);

      return { profile: profileData, reviews: reviewsData || [], appliedJobIds };
    },
    enabled: !!id,
  });

  // Query to fetch the employer's open jobs, only when the dialog is opened
  const { data: employerJobs, isLoading: isLoadingEmployerJobs } = useQuery({
    queryKey: ["employerOpenJobs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user.id)
        .eq("status", "open");
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user && isHireDialogOpen, // Only fetch when dialog is open and user is logged in
  });

  // Mutation to send the job invitation (creates an application)
  const inviteMutation = useMutation({
    mutationFn: async ({
      jobId,
      workerId,
      message,
    }: {
      jobId: string;
      workerId: string;
      message: string;
    }) => {
      const { data, error } = await supabase.from("applications").insert({
        job_id: jobId,
        laborer_id: workerId,
        // *** THIS IS THE KEY CHANGE ***
        status: "invited", // Changed from "submitted" to "invited"
        message: message,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: `${workerData?.profile.name} has been invited to your job.`,
      });
      // Invalidate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["workerProfile", id] });
      setIsHireDialogOpen(false);
      setSelectedJobId("");
      setInvitationMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Error Sending Invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendInvitation = () => {
    if (!selectedJobId || !id || !profile) return;
    const message =
      invitationMessage || `${profile.name} has invited you to apply for this job.`;
    inviteMutation.mutate({ jobId: selectedJobId, workerId: id, message });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workerData?.profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Worker Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error?.message || "The worker profile you are looking for does not exist."}
          </p>
          <Link to="/workers">
            <Button>Browse All Workers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile: worker, reviews, appliedJobIds } = workerData;
  const initials =
    worker.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const canHire = profile?.role === "employer";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={worker.avatar_url} />
                  <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        {worker.name}
                        {worker.verified && <TrustBadge type="verified" />}
                      </h1>
                      <p className="text-muted-foreground capitalize">{worker.role}</p>
                    </div>
                    <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="lg"
                          disabled={!canHire}
                          title={
                            !canHire
                              ? "You must be an employer to hire workers"
                              : `Hire ${worker.name}`
                          }
                        >
                          Hire Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite {worker.name} to a Job</DialogTitle>
                          <DialogDescription>
                            Select one of your open jobs to send an invitation.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {isLoadingEmployerJobs ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          ) : !employerJobs || employerJobs.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-md">
                              <p className="mb-2">You have no open jobs.</p>
                              <Link to="/post-job">
                                <Button>Post a Job First</Button>
                              </Link>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="job-select">Select Job</Label>
                                <Select onValueChange={setSelectedJobId} value={selectedJobId}>
                                  <SelectTrigger id="job-select">
                                    <SelectValue placeholder="Choose an open job..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employerJobs.map((job) => {
                                      const hasApplied = appliedJobIds.has(job.id);
                                      return (
                                        <SelectItem
                                          key={job.id}
                                          value={job.id}
                                          disabled={hasApplied}
                                        >
                                          {job.title} {hasApplied && "(Already Applied/Invited)"}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="invitation-message">
                                  Optional Message
                                </Label>
                                <Textarea
                                  id="invitation-message"
                                  placeholder="I think you'd be a great fit for..."
                                  value={invitationMessage}
                                  onChange={(e) => setInvitationMessage(e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={handleSendInvitation}
                            disabled={
                              !selectedJobId ||
                              inviteMutation.isPending ||
                              isLoadingEmployerJobs ||
                              !employerJobs ||
                              employerJobs.length === 0
                            }
                          >
                            {inviteMutation.isPending && (
                              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            )}
                            Send Invitation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-trust-gold text-trust-gold" />
                        {worker.trust_score?.toFixed(1) || "New"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Jobs Completed</div>
                      <div className="font-semibold">{worker.completed_jobs_count || 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Hourly Rate</div>
                      <div className="font-semibold">
                        {worker.hourly_rate ? `₹${worker.hourly_rate}` : "Negotiable"}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Location</div>
                      <div className="font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {worker.location || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {worker.bio && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{worker.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {worker.skills && worker.skills.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.profiles?.avatar_url} />
                            <AvatarFallback>
                              {review.profiles?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">
                              {review.profiles?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {review.jobs?.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-trust-gold text-trust-gold"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfile;