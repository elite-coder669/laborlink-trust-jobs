import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, IndianRupee, Clock, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Database } from "@/integrations/supabase/types";

type JobFormData = {
  title: string;
  category: Database["public"]["Enums"]["job_category"] | "";
  description: string;
  location: string;
  duration_days: string;
  wage: string;
  wage_type: Database["public"]["Enums"]["wage_type"];
  skills: string;
  positions: string;
};

const PostJobForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    category: "",
    description: "",
    location: "",
    duration_days: "",
    wage: "",
    wage_type: "daily",
    skills: "",
    positions: "1",
  });

  const jobMutation = useMutation({
    mutationFn: async (newJob: Database["public"]["Tables"]["jobs"]["Insert"]) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.from("jobs").insert(newJob).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Job Posted Successfully!",
        description: "Your job listing is now live and visible to workers.",
      });
      navigate(`/jobs/${data.id}`); // Navigate to the new job's detail page
    },
    onError: (error) => {
      toast({
        title: "Error Posting Job",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "You must be logged in to post a job.", variant: "destructive" });
      return;
    }

    const skillsArray = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);

    jobMutation.mutate({
      title: formData.title,
      category: formData.category as Database["public"]["Enums"]["job_category"],
      description: formData.description,
      location: formData.location,
      duration_days: formData.duration_days ? parseInt(formData.duration_days, 10) : null,
      wage: parseFloat(formData.wage),
      wage_type: formData.wage_type,
      required_skills: skillsArray.length > 0 ? skillsArray : null,
      positions_required: formData.positions ? parseInt(formData.positions, 10) : 1,
      employer_id: user.id,
      status: "open", // Set a default status
    });
  };

  const handleChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Post a New Job</h1>
            <p className="text-lg text-white/90">
              Find the right worker for your project with transparent job details
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Construction Helper Needed"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                      className="h-12"
                      disabled={jobMutation.isPending}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleChange("category", value as Database["public"]["Enums"]["job_category"])
                      }
                      required
                      disabled={jobMutation.isPending}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select job category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="shop_renovation">Shop Renovation</SelectItem>
                        <SelectItem value="apartment_association">Apartment Association</SelectItem>
                        <SelectItem value="custom_craft">Custom Craft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the work requirements, responsibilities, and any specific instructions..."
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      required
                      rows={5}
                      className="resize-none"
                      disabled={jobMutation.isPending}
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Andheri West, Mumbai"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      required
                      className="h-12"
                      disabled={jobMutation.isPending}
                    />
                  </div>

                  {/* Duration (Fixed) */}
                  <div className="space-y-2">
                    <Label htmlFor="duration_days" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      Estimated Duration (in days)
                    </Label>
                    <Input
                      id="duration_days"
                      type="number"
                      placeholder="e.g., 14"
                      value={formData.duration_days}
                      onChange={(e) => handleChange("duration_days", e.target.value)}
                      className="h-12"
                      disabled={jobMutation.isPending}
                    />
                  </div>

                  {/* Wage */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wage" className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-accent" />
                        Wage Amount *
                      </Label>
                      <Input
                        id="wage"
                        type="number"
                        placeholder="e.g., 600"
                        value={formData.wage}
                        onChange={(e) => handleChange("wage", e.target.value)}
                        required
                        className="h-12"
                        disabled={jobMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wageType">Wage Type *</Label>
                      <Select
                        value={formData.wage_type}
                        onValueChange={(value) =>
                          handleChange("wage_type", value as Database["public"]["Enums"]["wage_type"])
                        }
                        disabled={jobMutation.isPending}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Per Hour</SelectItem>
                          <SelectItem value="daily">Per Day</SelectItem>
                          <SelectItem value="project">Per Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <Label htmlFor="skills" className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Required Skills
                    </Label>
                    <Input
                      id="skills"
                      placeholder="e.g., Masonry, Labor, Material Handling"
                      value={formData.skills}
                      onChange={(e) => handleChange("skills", e.target.value)}
                      className="h-12"
                      disabled={jobMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {/* Submit */}
                  {/* Positions required */}
                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Workers Required</Label>
                    <Input
                      id="positions"
                      type="number"
                      min={1}
                      value={formData.positions}
                      onChange={(e) => handleChange("positions", e.target.value)}
                      className="h-12"
                      disabled={jobMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">How many workers do you need for this job? Default is 1.</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/employer-dashboard")}
                      disabled={jobMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary-hover"
                      size="lg"
                      disabled={jobMutation.isPending || !formData.category || !formData.title}
                    >
                      {jobMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Post Job
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">Tips for posting a great job:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Be clear and specific about job requirements</li>
                  <li>• Offer fair and competitive wages</li>
                  <li>• Include detailed location information</li>
                  <li>• Specify the duration and working hours</li>
                  <li>• List all required skills and qualifications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

// Wrap the page with the ProtectedRoute
const ProtectedPostJobPage = () => (
  <ProtectedRoute requireRole="employer">
    <PostJobForm />
  </ProtectedRoute>
);

export default ProtectedPostJobPage;