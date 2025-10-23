import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

// Background and logo in /public/images
import heroImage from "../app/assets/hero.png";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="hero-section min-h-[90vh] flex items-center relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Tarpum Bay church"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Location */}
        <div className="flex items-center justify-center mb-6">
          <MapPin className="h-8 w-8 text-primary-foreground mr-3" />
          <span className="text-primary-foreground/90 text-lg font-medium">
            Eleuthera, Bahamas
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
          Tarpum Bay
          <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 text-primary-foreground/90">
            Commonage Committee
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto leading-relaxed">
          Preserving our heritage, managing our land, and serving our community
          through transparent governance and sustainable development in
          beautiful Tarpum Bay.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            asChild
            size="lg"
            className="btn-hero text-lg px-8 py-6 group">
            <Link href="/portal">
              Apply for Commonage
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        {/* Quick stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <Users className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary-foreground">500+</p>
            <p className="text-primary-foreground/80">Community Members</p>
          </div>
          <div className="text-center">
            <FileCheck className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary-foreground">50+</p>
            <p className="text-primary-foreground/80">Years of Service</p>
          </div>
          <div className="text-center">
            <MapPin className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary-foreground">1000+</p>
            <p className="text-primary-foreground/80">Acres Protected</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
        {/*  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/70 rounded-full mt-2 animate-pulse"></div>
        </div>*/}
      </div>
    </section>
  );
};

export default HeroSection;
