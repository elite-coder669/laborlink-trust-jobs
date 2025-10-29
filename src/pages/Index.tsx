import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";

const Index = () => {
  const categories = [
    { icon: Hammer, title: "Construction", jobCount: "150+" },
    { icon: Wrench, title: "Plumbing", jobCount: "85+" },
    { icon: Paintbrush, title: "Painting", jobCount: "120+" },
    { icon: Truck, title: "Delivery", jobCount: "200+" },
    { icon: Zap, title: "Electrical", jobCount: "95+" },
    { icon: Home, title: "Housekeeping", jobCount: "180+" },
  ];

  const featuredJobs = [
    {
      title: "Construction Helper Needed",
      category: "Construction",
      location: "Andheri West, Mumbai",
      duration: "2-3 weeks",
      wage: "600",
      wageType: "day",
      rating: 4.8,
      employerName: "Krishna Builders",
      isVerified: true,
      skills: ["Masonry", "Labor", "Material Handling"],
    },
    {
      title: "Plumber for Residential Work",
      category: "Plumbing",
      location: "Koramangala, Bangalore",
      duration: "1 week",
      wage: "750",
      wageType: "day",
      rating: 4.9,
      employerName: "Home Care Services",
      isVerified: true,
      skills: ["Pipe Fitting", "Repairs", "Installation"],
    },
    {
      title: "Painter for Office Space",
      category: "Painting",
      location: "Connaught Place, Delhi",
      duration: "5 days",
      wage: "650",
      wageType: "day",
      rating: 4.7,
      employerName: "Office Interiors Ltd",
      isVerified: false,
      skills: ["Wall Painting", "Finishing", "Color Mixing"],
    },
  ];

  const topWorkers = [
    {
      name: "Rajesh Kumar",
      category: "Construction Worker",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      completedJobs: 145,
      hourlyRate: "80",
      skills: ["Masonry", "Concrete Work", "Carpentry"],
      isVerified: true,
    },
    {
      name: "Priya Sharma",
      category: "Plumber",
      location: "Bangalore, Karnataka",
      rating: 4.8,
      completedJobs: 89,
      hourlyRate: "100",
      skills: ["Pipe Installation", "Repairs", "Maintenance"],
      isVerified: true,
    },
    {
      name: "Amit Patel",
      category: "Electrician",
      location: "Ahmedabad, Gujarat",
      rating: 5.0,
      completedJobs: 210,
      hourlyRate: "120",
      skills: ["Wiring", "Panel Installation", "Troubleshooting"],
      isVerified: true,
    },
  ];

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
                <Link to="/employers">
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
            {featuredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
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
            {topWorkers.map((worker, index) => (
              <WorkerCard key={index} {...worker} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
              >
                Register as Worker
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-lg px-8 py-6"
              >
                Register as Employer
              </Button>
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
                  <Link to="/register" className="hover:text-primary transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-primary transition-colors">
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
                  <Link to="/pricing" className="hover:text-primary transition-colors">
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
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary transition-colors">
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
