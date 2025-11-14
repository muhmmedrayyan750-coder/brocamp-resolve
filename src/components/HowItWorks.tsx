import { Card } from "@/components/ui/card";
import { LogIn, FileText, Eye, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    step: "01",
    title: "Sign In",
    description: "Login with Gmail or phone number using secure OTP authentication."
  },
  {
    icon: FileText,
    step: "02",
    title: "Submit Complaint",
    description: "Fill out a simple form with your issue, category, and detailed description."
  },
  {
    icon: Eye,
    step: "03",
    title: "Track Progress",
    description: "Monitor your complaint status in real-time: Pending, In Progress, or Resolved."
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Get Resolved",
    description: "Receive updates and resolution details from admins with full transparency."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How <span className="text-primary">BrocampSupport</span> Works
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple 4-step process to get your issues resolved quickly and efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>

          {steps.map((item, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border relative group hover:border-primary/50 transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-glow">
                {item.step}
              </div>

              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
