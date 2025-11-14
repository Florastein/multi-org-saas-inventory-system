"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BarChart3, Users, Shield, Zap, Globe, Check, Menu } from "lucide-react";

export default function LandingPage() {
  // 1. State to manage the mobile menu's open/closed state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the menu state
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Function to close the menu (used when navigating)
  const closeMenu = () => setIsMenuOpen(false);


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container flex h-16 items-center justify-between mx-auto">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">InvenSaaS</span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <a href="/login">
              <Button variant="ghost">Log in</Button>
            </a>
            <a href="#pricing">
              <Button variant="ghost">Pricing</Button>
            </a>
            <a href="/register">
              <Button>Get Started</Button>
            </a>
          </nav>
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <a href="/register">
              <Button size="sm">Get Started</Button>
            </a>
            {/* 2. Toggle the menu when the icon is clicked */}
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>


       {/* 3. Mobile Navigation Menu (Conditional Overlay) */}
      {isMenuOpen && (
        <nav className="fixed inset-x-0 top-16 z-40 bg-background shadow-xl md:hidden transition-all duration-300">
          <div className="flex flex-col p-4 space-y-2 border-t">
            <a href="/login" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-base">Log in</Button>
            </a>
            <a href="#pricing" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-base">Pricing</Button>
            </a>
            <a href="/register" onClick={closeMenu}>
              <Button className="w-full text-base">Get Started</Button>
            </a>
          </div>
        </nav>
      )}


      {/* Hero Section */}
      <section className="flex-1">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container flex flex-col items-center justify-between gap-8 py-20 sm:py-24 md:py-32 mx-auto">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Inventory Management
              <br />
              <span className="text-muted-foreground">Made Simple</span>
            </h1>
            {/* mx-auto is correctly applied here to center the paragraph block */}
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl mx-auto">
              Track, manage, and optimize your inventory across multiple organizations.
              Real-time insights, low-stock alerts, and powerful analytics at your fingertips.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
              <a href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </a>
              <a href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </a>
            </div>
          </div>

          {/* Feature Grid - Added mx-auto here to center this max-width grid within the container */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mt-16 mx-auto">
            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Package className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Monitor your inventory levels in real-time with instant updates and accurate stock counts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Get actionable insights with comprehensive reports on inventory value, trends, and performance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Users className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Multi-Organization</CardTitle>
                <CardDescription>
                  Manage multiple organizations with role-based access control and team collaboration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Shield className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                  Never run out of stock with automated alerts when inventory levels drop below thresholds.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Zap className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with modern technology for instant response times and seamless user experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader className="flex flex-col items-center">
                <Globe className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Access Anywhere</CardTitle>
                <CardDescription>
                  Cloud-based platform accessible from any device, anywhere in the world, anytime.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - Entire section content is centered */}
      <section id="pricing" className="border-t bg-muted/50">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container py-16 sm:py-20 md:py-24 mx-auto">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg mx-auto">
              Choose the perfect plan for your business needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>Perfect for small businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">GHS 150</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center">
                <ul className="space-y-3 flex-1 mb-6 w-full max-w-xs mx-auto">
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Up to 5 users</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>1 organization</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Basic inventory tracking</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Activity logs</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Email support</span>
                  </li>
                </ul>
                <a href="/register" className="w-full">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </a>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="flex flex-col border-primary shadow-lg relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>For growing teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">GHS 275</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center">
                <ul className="space-y-3 flex-1 mb-6 w-full max-w-xs mx-auto">
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Up to 15 users</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>3 organizations</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Advanced inventory tracking</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Low stock alerts</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Export reports</span>
                  </li>
                </ul>
                <a href="/register" className="w-full">
                  <Button className="w-full">Get Started</Button>
                </a>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">GHS 400</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center">
                <ul className="space-y-3 flex-1 mb-6 w-full max-w-xs mx-auto">
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Up to 50 users</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>10 organizations</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Advanced inventory tracking</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Custom reports</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Priority phone & email support</span>
                  </li>
                  <li className="flex items-start gap-2 justify-center">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>Dedicated account manager</span>
                  </li>

                </ul>
                <a href="/register" className="w-full">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section - Entire section content is centered */}
      <section className="border-t">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container py-16 sm:py-20 md:py-24 mx-auto">
          <div className="flex flex-col items-center gap-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose InvenSaaS?
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg mx-auto">
              Everything you need to manage your inventory efficiently
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:gap-16 max-w-5xl mx-auto">
            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-2xl font-bold">Simple Yet Powerful</h3>
              <p className="text-muted-foreground">
                Intuitive interface designed for everyone from small businesses to enterprise teams.
                No complex training required - start managing inventory in minutes.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-2xl font-bold">Scalable Solution</h3>
              <p className="text-muted-foreground">
                Grow from managing a single warehouse to multiple locations across different organizations.
                Our platform scales with your business needs.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-2xl font-bold">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Invite team members with customizable roles and permissions. Track who made changes
                with detailed activity logs and audit trails.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <h3 className="text-2xl font-bold">Cost Effective</h3>
              <p className="text-muted-foreground">
                Reduce waste, optimize stock levels, and make data-driven purchasing decisions.
                Save time and money with automated inventory management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Entire section content is centered */}
      <section className="border-t bg-muted/50">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container py-16 sm:py-20 md:py-24 mx-auto">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Get Started?
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-lg mx-auto">
              Join thousands of businesses managing their inventory smarter with InvenSaaS
            </p>
            <a href="/register" className="mt-4">
              <Button size="lg">
                Create Your Free Account
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Content is centered using flex utilities */}
      <footer className="border-t">
        {/* Added mx-auto here to ensure the container is centered */}
        <div className="container py-8 md:py-12 mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-semibold">InvenSaaS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 InvenSaaS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}