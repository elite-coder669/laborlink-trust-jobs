import { useState } from "react";
import Navigation from "@/components/Navigation";
import WorkerCard from "@/components/WorkerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, Filter } from "lucide-react";

const Workers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const allWorkers = [
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
    {
      name: "Suresh Reddy",
      category: "Painter",
      location: "Hyderabad, Telangana",
      rating: 4.7,
      completedJobs: 156,
      hourlyRate: "75",
      skills: ["Interior Painting", "Exterior Painting", "Texture Work"],
      isVerified: true,
    },
    {
      name: "Meena Devi",
      category: "Housekeeping",
      location: "Delhi, NCR",
      rating: 4.9,
      completedJobs: 320,
      hourlyRate: "60",
      skills: ["Deep Cleaning", "Laundry", "Organization"],
      isVerified: true,
    },
    {
      name: "Vikram Singh",
      category: "Driver",
      location: "Mumbai, Maharashtra",
      rating: 4.8,
      completedJobs: 178,
      hourlyRate: "70",
      skills: ["Safe Driving", "City Navigation", "Vehicle Maintenance"],
      isVerified: true,
    },
    {
      name: "Lakshmi Iyer",
      category: "Cook",
      location: "Chennai, Tamil Nadu",
      rating: 5.0,
      completedJobs: 245,
      hourlyRate: "90",
      skills: ["South Indian Cuisine", "Multi-Cuisine", "Hygiene"],
      isVerified: true,
    },
    {
      name: "Mohammed Ansari",
      category: "Carpenter",
      location: "Bangalore, Karnataka",
      rating: 4.9,
      completedJobs: 198,
      hourlyRate: "110",
      skills: ["Furniture Making", "Repairs", "Wood Finishing"],
      isVerified: true,
    },
    {
      name: "Sunita Yadav",
      category: "Electrician",
      location: "Pune, Maharashtra",
      rating: 4.8,
      completedJobs: 167,
      hourlyRate: "105",
      skills: ["Home Wiring", "Appliance Repair", "Solar Installation"],
      isVerified: true,
    },
  ];

  const filteredWorkers = allWorkers.filter((worker) => {
    const matchesSearch =
      searchQuery === "" ||
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || worker.category.includes(selectedCategory);
    const matchesLocation = selectedLocation === "all" || worker.location.includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Find Skilled Workers</h1>
            <p className="text-lg text-white/90">
              Connect with verified professionals with proven track records
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
                placeholder="Search workers, skills, or categories..."
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
                <SelectItem value="Plumber">Plumber</SelectItem>
                <SelectItem value="Electrician">Electrician</SelectItem>
                <SelectItem value="Painter">Painter</SelectItem>
                <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                <SelectItem value="Driver">Driver</SelectItem>
                <SelectItem value="Cook">Cook</SelectItem>
                <SelectItem value="Carpenter">Carpenter</SelectItem>
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
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Workers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredWorkers.length} Workers Available
            </h2>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker, index) => (
              <WorkerCard key={index} {...worker} />
            ))}
          </div>
          {filteredWorkers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No workers found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Workers;
