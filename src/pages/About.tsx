import Navigation from "@/components/Navigation";
import { Shield, Users, IndianRupee, Award, Heart, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "Every employer is verified and every wage is clearly displayed upfront.",
    },
    {
      icon: Users,
      title: "Fair Opportunities",
      description: "Creating equal access to dignified work for all daily wage workers.",
    },
    {
      icon: IndianRupee,
      title: "Secure Payments",
      description: "Digital payment tracking ensures workers get paid on time, every time.",
    },
    {
      icon: Award,
      title: "Quality Work",
      description: "Ratings and reviews help maintain high standards across the platform.",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Workers" },
    { number: "5,000+", label: "Verified Employers" },
    { number: "₹2 Crore+", label: "Wages Paid" },
    { number: "50,000+", label: "Jobs Completed" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">About LaborLink</h1>
            <p className="text-xl text-white/90">
              Empowering India's workforce through trust, transparency, and technology
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground text-center leading-relaxed mb-8">
              LaborLink was founded with a simple but powerful vision: to create a fair, transparent
              marketplace where daily wage workers can find dignified employment and employers can
              connect with skilled, reliable workers. We believe that technology can bridge the trust
              gap and create opportunities for millions of hardworking Indians.
            </p>
            <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
              <div className="flex items-start gap-4">
                <Heart className="w-12 h-12 text-accent flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    Building Trust, One Job at a Time
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Every day, millions of workers across India seek fair employment opportunities,
                    while employers struggle to find reliable workers. Traditional systems lack
                    transparency, leading to wage disputes and broken trust. LaborLink solves this
                    by bringing both parties together on a platform built on verification, clear
                    communication, and secure payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="shadow-card border-border">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Together, we're making a difference in the lives of workers and employers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Verify & Register
              </h3>
              <p className="text-sm text-muted-foreground">
                Workers and employers complete a simple verification process to join the platform
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Connect & Match
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse jobs or workers, with transparent wages and clear requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Work & Get Paid
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete work, rate each other, and receive secure digital payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-gradient-hero rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-white/90 mb-8">
              Be part of India's most trusted platform for daily workers and employers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-lg font-semibold transition-colors">
                Register as Worker
              </button>
              <button className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition-colors">
                Register as Employer
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
