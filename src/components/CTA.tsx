import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Make Your
            <br />
            <span className="text-primary">Voice Heard?</span>
          </h2>

          <p className="text-xl text-muted-foreground">
            Join hundreds of students already using BrocampSupport to improve their campus experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 shadow-glow group"
              onClick={() => navigate('/login')}
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border text-foreground hover:bg-secondary text-lg px-8"
              onClick={() => window.location.href = 'mailto:support@brototype.com'}
            >
              Contact Support
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            No credit card required • Free for all Brototype students
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
