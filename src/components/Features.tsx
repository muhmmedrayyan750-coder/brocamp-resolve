import { Card } from "@/components/ui/card";
import { MessageSquare, Clock, Bell, BarChart3, Users, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Easy Complaint Submission",
    description: "Submit your concerns in seconds with our intuitive interface. Choose categories and track everything in one place."
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description: "Monitor the status of your complaints from submission to resolution with live updates."
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get notified via SMS and email when your complaint status changes or admins respond."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Admins get powerful insights into complaint patterns, response times, and resolution rates."
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Secure authentication for students and admins with proper permission management."
  },
  {
    icon: Shield,
    title: "Data Security",
    description: "Your complaints are stored securely with industry-standard encryption and privacy measures."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to
            <span className="text-primary"> Manage Complaints</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive platform designed for seamless communication between students and administration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
