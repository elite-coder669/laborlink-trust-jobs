import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, Star, Briefcase, CheckCircle, Loader2 } from "lucide-react";
import TrustBadge from "@/components/TrustBadge";

const WorkerProfile = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkerProfile();
  }, [id]);

  const loadWorkerProfile = async () => {
    if (!id) return;

    try {
      // Load worker profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      setWorker(profileData);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles:reviewer_id (name, avatar_url),
          jobs (title)
        `)
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Worker Not Found</h1>
          <Link to="/workers">
            <Button>Browse All Workers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initials = worker.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
                    <Button size="lg">Hire Now</Button>
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
                            <div className="font-semibold text-sm">{review.profiles?.name}</div>
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
