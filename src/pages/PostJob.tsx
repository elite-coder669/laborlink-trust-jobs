import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, IndianRupee, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    duration: "",
    wage: "",
    wageType: "day",
    skills: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Job Posted Successfully!",
      description: "Your job listing is now live and visible to workers.",
    });
    navigate("/employer-dashboard");
  };

  const handleChange = (field: string, value: string) => {
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
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select job category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Painting">Painting</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                        <SelectItem value="Delivery">Delivery</SelectItem>
                        <SelectItem value="Carpentry">Carpentry</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      Duration *
                    </Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2-3 weeks, 1 month, Ongoing"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
                      required
                      className="h-12"
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wageType">Wage Type *</Label>
                      <Select value={formData.wageType} onValueChange={(value) => handleChange("wageType", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Per Hour</SelectItem>
                          <SelectItem value="day">Per Day</SelectItem>
                          <SelectItem value="week">Per Week</SelectItem>
                          <SelectItem value="month">Per Month</SelectItem>
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
                      placeholder="e.g., Masonry, Labor, Material Handling (comma-separated)"
                      value={formData.skills}
                      onChange={(e) => handleChange("skills", e.target.value)}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple skills with commas
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/employer-dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover" size="lg">
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

export default PostJob;
