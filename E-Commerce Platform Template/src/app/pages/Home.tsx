import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, TrendingUp, Calendar, Shield, Zap, Star, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { mockProducts, mockEvents, categories, testimonials } from "../data/mockData";
import { formatCurrency, formatDate } from "../lib/utils";
import { recommendationService } from "../api/recommendation.service";
import { Product } from "../api/product.service";
import { getUserFromToken } from "../api/auth.service";
import { useProductInteraction } from "../hooks/useProductInteraction";

export function Home() {
  const featuredProducts = mockProducts.slice(0, 4);
  const featuredEvents = mockEvents.filter((e) => e.featured);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const { recordClick } = useProductInteraction();
  const user = getUserFromToken();

  useEffect(() => {
    recommendationService.getPopularProducts(8)
      .then(setPopularProducts)
      .catch(() => {})
      .finally(() => setLoadingPopular(false));

    if (user) {
      recommendationService.getPersonalizedRecommendations(6)
        .then(setRecommendations)
        .catch(() => {})
        .finally(() => setLoadingRecommendations(false));
    } else {
      setLoadingRecommendations(false);
    }
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FF6B35] via-[#FF6B35]/90 to-[#00D4FF] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl">
                Shop Smart,
                <br />
                Experience More
              </h1>
              <p className="text-xl text-white/90">
                Discover amazing products and unforgettable events all in one place. Your journey to extraordinary experiences starts here.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" variant="secondary">
                    Shop Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#FF6B35]">
                    Explore Events
                    <Calendar className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <p className="text-3xl">10K+</p>
                  <p className="text-white/80 text-sm">Products</p>
                </div>
                <div>
                  <p className="text-3xl">500+</p>
                  <p className="text-white/80 text-sm">Events</p>
                </div>
                <div>
                  <p className="text-3xl">50K+</p>
                  <p className="text-white/80 text-sm">Happy Customers</p>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
                alt="Shopping"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-[#16213E] to-transparent"></div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">Shop by Category</h2>
          <p className="text-gray-600 dark:text-gray-400">Explore our wide range of products</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`}>
              <Card hover className="text-center">
                <CardContent>
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} items</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white dark:bg-[#1A1A2E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400">Handpicked items just for you</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card hover className="h-full">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs">
                        Sale
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-[#FF6B35]">{formatCurrency(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products (Trending) */}
      {popularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">Trending Now 🔥</h2>
              <p className="text-gray-600 dark:text-gray-400">Most popular products based on recent activity</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} onClick={() => product.id && recordClick(product.id)}>
                <Card hover className="h-full">
                  <div className="relative">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/300x200"}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs">
                      🔥 Trending
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-[#FF6B35] font-bold">{formatCurrency(product.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Recommendations */}
      {user && recommendations.length > 0 && (
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#1A1A2E] dark:to-[#16213E] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-[#FF6B35]" />
                  Recommended for You
                </h2>
                <p className="text-gray-600 dark:text-gray-400">Based on your browsing history and preferences</p>
              </div>
              <Link to="/products">
                <Button variant="outline">
                  Explore More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} onClick={() => product.id && recordClick(product.id)}>
                  <Card hover className="h-full">
                    <div className="relative">
                      <img
                        src={product.imageUrl || "https://via.placeholder.com/300x200"}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <div className="absolute top-3 left-3 bg-[#FF6B35] text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> For You
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.category}</p>
                      <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl text-[#FF6B35] font-bold">{formatCurrency(product.price)}</span>
                        <Badge variant={product.status ? "success" : "danger"}>
                          {product.status ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-2">Upcoming Events</h2>
            <p className="text-gray-600 dark:text-gray-400">Don't miss out on these amazing experiences</p>
          </div>
          <Link to="/events">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card hover className="h-full">
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-3 left-3 bg-white dark:bg-[#0F3460] px-3 py-2 rounded-lg text-center">
                    <p className="text-2xl text-[#FF6B35]">
                      {new Date(event.date).getDate()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                    </p>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <p className="text-xs text-[#FF6B35] mb-1">{event.category}</p>
                  <h3 className="text-gray-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {event.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-[#FF6B35]">
                      {formatCurrency(event.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {event.attendees} attending
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-[#1A1A2E] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">Secure Shopping</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your data is protected with industry-standard encryption
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Quick and reliable shipping to your doorstep
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B35] to-[#00D4FF] rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl text-gray-900 dark:text-white mb-2">Easy Booking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Book event tickets in just a few clicks
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 dark:text-gray-400">Real feedback from real customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent>
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#FF6B35] to-[#00D4FF] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover the best shopping and event experience.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}