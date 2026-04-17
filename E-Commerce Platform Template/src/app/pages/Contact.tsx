import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! (This is a demo)");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#2C3E50] to-[#1A1A2E] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl mb-6">Get in Touch</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="text-center">
              <Mail className="w-8 h-8 mx-auto mb-3 text-[#FF6B35]" />
              <h3 className="text-sm text-gray-900 dark:text-white mb-1">Email Us</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">support@VendHub.com</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Phone className="w-8 h-8 mx-auto mb-3 text-[#FF6B35]" />
              <h3 className="text-sm text-gray-900 dark:text-white mb-1">Call Us</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">+1 (555) 123-4567</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 text-[#FF6B35]" />
              <h3 className="text-sm text-gray-900 dark:text-white mb-1">Visit Us</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">123 Market St, SF, CA</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-3 text-[#FF6B35]" />
              <h3 className="text-sm text-gray-900 dark:text-white mb-1">Working Hours</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Mon-Fri: 9AM-6PM</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Subject"
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1F4068] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map & Offices */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Our Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600"
                    alt="Map"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">San Francisco HQ</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      123 Market Street, Suite 500<br />
                      San Francisco, CA 94103
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">New York Office</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      456 Fifth Avenue, Floor 10<br />
                      New York, NY 10018
                    </p>
                  </div>
                  <div>
                    <h4 className="text-gray-900 dark:text-white mb-1">Los Angeles Office</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      789 Sunset Boulevard<br />
                      Los Angeles, CA 90028
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-[#1A1A2E] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What are your shipping times?",
                a: "Standard shipping takes 3-5 business days. Express shipping is 1-2 business days.",
              },
              {
                q: "Can I return a product?",
                a: "Yes, we offer 30-day returns on most items. See our return policy for details.",
              },
              {
                q: "How do I cancel an event ticket?",
                a: "Event tickets can be cancelled up to 48 hours before the event for a full refund.",
              },
              {
                q: "Do you ship internationally?",
                a: "Yes, we ship to most countries worldwide. Shipping costs vary by location.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent>
                  <h3 className="text-lg text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
