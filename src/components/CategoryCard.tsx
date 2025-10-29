import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  jobCount: string;
}

const CategoryCard = ({ icon: Icon, title, jobCount }: CategoryCardProps) => {
  return (
    <Card className="shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border group">
      <CardContent className="pt-6 pb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-hero rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{jobCount} jobs available</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
