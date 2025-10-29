import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, User, Menu } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl md:text-2xl text-foreground">
              LaborLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-foreground hover:text-primary transition-colors font-medium">
              Find Jobs
            </Link>
            <Link to="/workers" className="text-foreground hover:text-primary transition-colors font-medium">
              Find Workers
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button size="lg" className="bg-primary hover:bg-primary-hover">
                Get Started
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            <Link
              to="/jobs"
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              to="/workers"
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Workers
            </Link>
            <Link
              to="/about"
              className="block text-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="outline" size="lg" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button size="lg" className="w-full bg-primary hover:bg-primary-hover">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
