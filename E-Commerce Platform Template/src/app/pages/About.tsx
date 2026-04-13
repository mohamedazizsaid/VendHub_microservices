import { Users, Target, Award, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { teamMembers } from "../data/mockData";

export function About() {
  const stats = [
    { label: "Years of Experience", value: "10+", icon: Award },
    { label: "Products Sold", value: "500K+", icon: TrendingUp },
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Events Hosted", value: "1K+", icon: Target },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2C3E50] to-[#1A1A2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl mb-6">About EventShop</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            We're on a mission to revolutionize online shopping and event experiences by bringing everything you need into one seamless platform.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-[#FF6B35]" />
                  <p className="text-3xl text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Founded in 2016, EventShop began with a simple vision: to create a platform that seamlessly combines the convenience of online shopping with the excitement of live events.
              </p>
              <p>
                What started as a small startup has grown into a thriving community of over 50,000 customers who trust us for their shopping and entertainment needs. We've sold over 500,000 products and hosted more than 1,000 unforgettable events.
              </p>
              <p>
                Today, we continue to innovate and expand our offerings, always keeping our customers at the heart of everything we do. Our commitment to quality, security, and exceptional customer service remains unwavering.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
              alt="Team collaboration"
              className="rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-white dark:bg-[#1A1A2E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">Our Mission & Values</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're driven by core principles that guide everything we do
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent>
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-3">Customer First</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Every decision we make is guided by what's best for our customers. Your satisfaction is our success.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-3">Quality Assurance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We carefully curate every product and event to ensure the highest standards of quality and value.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-3">Innovation</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We continuously evolve our platform with cutting-edge technology to enhance your experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The passionate people behind EventShop
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="text-center">
              <CardContent>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-xl text-gray-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sm text-[#FF6B35] mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-white dark:bg-[#1A1A2E] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">Our Journey</h2>
            <p className="text-gray-600 dark:text-gray-400">Key milestones that shaped EventShop</p>
          </div>
          <div className="space-y-8">
            {[
              { year: "2016", title: "Company Founded", description: "EventShop was born with a vision to revolutionize online commerce" },
              { year: "2018", title: "10,000 Customers", description: "Reached our first major milestone with a growing community" },
              { year: "2020", title: "Events Platform Launch", description: "Expanded into event management and ticket sales" },
              { year: "2022", title: "100,000 Products", description: "Catalog grew exponentially with diverse product categories" },
              { year: "2024", title: "Global Expansion", description: "Extended services to international markets" },
              { year: "2026", title: "50K+ Happy Customers", description: "Continuing to grow and serve our amazing community" },
            ].map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] flex items-center justify-center text-white shrink-0">
                    {milestone.year.slice(2)}
                  </div>
                  {index < 5 && <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-600 mt-2"></div>}
                </div>
                <div className="pb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{milestone.year}</p>
                  <h3 className="text-xl text-gray-900 dark:text-white mb-2">{milestone.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
