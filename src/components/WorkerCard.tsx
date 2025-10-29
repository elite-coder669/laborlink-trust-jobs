import { MapPin, Star, Briefcase } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrustBadge from "./TrustBadge";

interface WorkerCardProps {
  name: string;
  category: string;
  location: string;
  rating: number;
  completedJobs: number;
  hourlyRate: string;
  skills: string[];
  isVerified: boolean;
  avatarUrl?: string;
}

const WorkerCard = ({
  name,
  category,
  location,
  rating,
  completedJobs,
  hourlyRate,
  skills,
  isVerified,
  avatarUrl,
}: WorkerCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border">
      <CardContent className="pt-6 space-y-4">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground truncate">{name}</h3>
              {isVerified && <TrustBadge type="verified" />}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{category}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{location}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-trust-gold text-trust-gold" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{completedJobs} jobs completed</span>
          </div>
        </div>

        {/* Rate */}
        <div className="bg-accent/10 rounded-lg p-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-accent">₹{hourlyRate}</span>
            <span className="text-sm text-muted-foreground">/ hour</span>
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
      </CardContent>

      <CardFooter>
        <Button className="w-full bg-secondary hover:bg-secondary-hover" size="lg">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkerCard;
