import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const EmployerDashboard = () => {
  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: "3", color: "text-primary" },
    { icon: Users, label: "Total Applicants", value: "24", color: "text-secondary" },
    { icon: Clock, label: "Pending Reviews", value: "5", color: "text-accent" },
    { icon: CheckCircle, label: "Completed Jobs", value: "12", color: "text-trust-verified" },
  ];

  const activeJobs = [
    {
      title: "Construction Helper Needed",
      location: "Andheri West, Mumbai",
      wage: "600/day",
      applicants: 8,
      posted: "2 days ago",
      status: "active",
    },
    {
      title: "Plumber for Residential Work",
      location: "Bandra, Mumbai",
      wage: "750/day",
      applicants: 12,
      posted: "5 days ago",
      status: "active",
    },
    {
      title: "Painter for Office Space",
      location: "Andheri East, Mumbai",
      wage: "650/day",
      applicants: 4,
      posted: "1 week ago",
      status: "active",
    },
  ];

  const applicants = [
    {
      name: "Rajesh Kumar",
      category: "Construction Worker",
      rating: 4.9,
      experience: "5 years",
      location: "Mumbai",
      wage: "80/hour",
    },
    {
      name: "Suresh Patel",
      category: "Construction Worker",
      rating: 4.7,
      experience: "3 years",
      location: "Mumbai",
      wage: "75/hour",
    },
    {
      name: "Amit Sharma",
      category: "Construction Worker",
      rating: 4.8,
      experience: "4 years",
      location: "Mumbai",
      wage: "85/hour",
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
              <p className="text-lg text-white/90">Welcome back, Krishna Builders</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Active Job Postings</h2>
            </div>
            <div className="grid gap-4">
              {activeJobs.map((job, index) => (
                <Card key={index} className="shadow-card border-border hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
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
                            {job.wage}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-secondary" />
                            {job.applicants} applicants
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            Posted {job.posted}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">Edit</Button>
                        <Button>View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Applicants</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applicants.map((applicant, index) => (
                <Card key={index} className="shadow-card border-border">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{applicant.name}</h3>
                      <p className="text-sm text-muted-foreground">{applicant.category}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-trust-gold text-trust-gold" />
                          <span className="font-medium text-foreground">{applicant.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Experience</span>
                        <span className="font-medium text-foreground">{applicant.experience}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium text-accent">₹{applicant.wage}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1">
                        Reject
                      </Button>
                      <Button className="flex-1 bg-secondary hover:bg-secondary-hover">
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Completed Jobs</h2>
            <Card className="shadow-card border-border">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  Your completed job history will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default EmployerDashboard;
