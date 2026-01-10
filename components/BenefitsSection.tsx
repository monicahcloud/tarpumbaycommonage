"use client";
import { motion } from "framer-motion";
import { Shield, Users, Leaf, HandHeart, FileText, Home } from "lucide-react";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Home,
      title: "Land Rights",
      desc: "Secure traditional family rights for generations.",
    },
    {
      icon: Shield,
      title: "Legal Security",
      desc: "Official documentation for residential use.",
    },
    {
      icon: Users,
      title: "Your Voice",
      desc: "Voter rights in community development.",
    },
    {
      icon: Leaf,
      title: "Stewardship",
      desc: "Sustainable management of natural resources.",
    },
    {
      icon: HandHeart,
      title: "Heritage",
      desc: "Preserve cultural family connections.",
    },
    {
      icon: FileText,
      title: "Transparency",
      desc: "Real-time updates on land governance.",
    },
  ];

  return (
    <section className="py-32 bg-[#F8FAFC]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl text-left">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4">
              Membership
            </h2>
            <p className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              A Legacy Protected by <br /> Modern Governance.
            </p>
          </div>
          <p className="text-slate-500 max-w-sm text-lg leading-relaxed">
            We combine tradition with technology to ensure every member of
            Tarpum Bay has a secure future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-[2rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 transition-colors">
                <benefit.icon className="h-7 w-7 text-slate-400 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
