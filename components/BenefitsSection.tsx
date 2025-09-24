import { Shield, Users, Leaf, HandHeart, FileText, Home } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Home,
      title: "Land Access Rights",
      description:
        "Secure your family's traditional rights to commonage land for residential and agricultural use.",
    },
    {
      icon: Shield,
      title: "Legal Protection",
      description:
        "Documented land use rights provide legal security for your family's future generations.",
    },
    {
      icon: Users,
      title: "Community Voice",
      description:
        "Participate in decisions affecting Tarpum Bay's development and preservation.",
    },
    {
      icon: Leaf,
      title: "Environmental Stewardship",
      description:
        "Help protect our natural heritage while ensuring sustainable community growth.",
    },
    {
      icon: HandHeart,
      title: "Heritage Preservation",
      description:
        "Maintain cultural traditions and family connections to our ancestral lands.",
    },
    {
      icon: FileText,
      title: "Clear Governance",
      description:
        "Transparent processes ensure fair and accountable management of community resources.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Benefits of Membership
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our community and secure your place in Tarpum Bay&apos;s future
            while preserving our shared heritage and natural environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="card-coastal p-6 rounded-lg group cursor-pointer">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <benefit.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
