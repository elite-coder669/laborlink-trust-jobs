import { MapPin, Clock, IndianRupee, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrustBadge from "./TrustBadge";

interface JobCardProps {
  title: string;
  category: string;
  location: string;
  duration: string;
  wage: string;
  wageType: string;
  rating: number;
  employerName: string;
  isVerified: boolean;
  skills: string[];
}

const JobCard = ({
  title,
  category,
  location,
  duration,
  wage,
  wageType,
  rating,
  employerName,
  isVerified,
  skills,
}: JobCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border">
      <CardContent className="pt-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{employerName}</p>
          </div>
          {isVerified && <TrustBadge type="verified" />}
        </div>

        {/* Category */}
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
          {category}
        </Badge>

        {/* Details */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-secondary" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-accent" />
            <span className="font-bold text-lg text-accent">
              ₹{wage}
            </span>
            <span className="text-sm text-muted-foreground">/ {wageType}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-trust-gold text-trust-gold" />
          <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">rating</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full bg-primary hover:bg-primary-hover" size="lg">
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
