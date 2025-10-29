import { useState } from "react";
import Navigation from "@/components/Navigation";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const allJobs = [
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
    {
      title: "Electrician for New Building",
      category: "Electrical",
      location: "Whitefield, Bangalore",
      duration: "1 month",
      wage: "800",
      wageType: "day",
      rating: 4.9,
      employerName: "Tech Park Developers",
      isVerified: true,
      skills: ["Wiring", "Panel Installation", "Safety"],
    },
    {
      title: "Housekeeping Staff Required",
      category: "Housekeeping",
      location: "Bandra West, Mumbai",
      duration: "Ongoing",
      wage: "500",
      wageType: "day",
      rating: 4.6,
      employerName: "Elite Residences",
      isVerified: true,
      skills: ["Cleaning", "Organization", "Laundry"],
    },
    {
      title: "Delivery Driver Needed",
      category: "Delivery",
      location: "Sector 18, Noida",
      duration: "Full-time",
      wage: "18000",
      wageType: "month",
      rating: 4.5,
      employerName: "QuickCart Logistics",
      isVerified: true,
      skills: ["Driving License", "City Navigation", "Time Management"],
    },
    {
      title: "Mason for Villa Construction",
      category: "Construction",
      location: "Juhu, Mumbai",
      duration: "3 months",
      wage: "700",
      wageType: "day",
      rating: 4.8,
      employerName: "Premium Homes",
      isVerified: true,
      skills: ["Bricklaying", "Plastering", "Tiling"],
    },
    {
      title: "AC Repair Technician",
      category: "Electrical",
      location: "Indiranagar, Bangalore",
      duration: "2-3 days",
      wage: "900",
      wageType: "day",
      rating: 5.0,
      employerName: "Cool Comfort Services",
      isVerified: true,
      skills: ["AC Repair", "Gas Filling", "Maintenance"],
    },
  ];

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || job.location.includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Your Next Job</h1>
            <p className="text-lg text-white/90">
              Browse thousands of verified jobs with transparent wages
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-card shadow-soft -mt-8 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs, skills, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <Briefcase className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Painting">Painting</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Noida">Noida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredJobs.length} Jobs Available
            </h2>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No jobs found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Jobs;
