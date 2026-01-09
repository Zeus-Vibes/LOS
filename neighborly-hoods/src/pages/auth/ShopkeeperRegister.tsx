import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Store, ArrowLeft, ArrowRight, Check, MapPin, User, Eye, EyeOff, Lock, Mail, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { id: 1, title: "Account", icon: User },
  { id: 2, title: "Business", icon: Building },
  { id: 3, title: "Location", icon: MapPin },
];

const ShopkeeperRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerShopkeeper } = useAuth();

  const [formData, setFormData] = useState({
    // Account details
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
    password_confirm: "",
    // Business details
    business_name: "",
    business_license: "",
    business_phone: "",
    business_address: "",
    // Location
    city: "",
    pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.username || !formData.email || !formData.password || !formData.first_name || !formData.last_name) {
        toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
        return;
      }
      if (formData.password !== formData.password_confirm) {
        toast({ title: "Passwords don't match", description: "Please make sure your passwords match", variant: "destructive" });
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.business_name || !formData.business_phone) {
        toast({ title: "Missing fields", description: "Please fill business name and phone", variant: "destructive" });
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.business_address) {
      toast({ title: "Missing address", description: "Please enter your business address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await registerShopkeeper({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        business_name: formData.business_name,
        business_license: formData.business_license,
        business_phone: formData.business_phone,
        business_address: `${formData.business_address}, ${formData.city} - ${formData.pincode}`,
      });
      
      toast({
        title: "Registration submitted!",
        description: "Your shop is under review. We'll notify you once approved.",
      });
      navigate("/shopkeeper/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.username?.[0] || 
                          error.response?.data?.email?.[0] || 
                          error.response?.data?.password?.[0] ||
                          error.response?.data?.business_name?.[0] ||
                          "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="flex items-center gap-2 justify-center mb-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">Register Your Shop</h1>
          <p className="text-muted-foreground">Join LOS and reach customers in your neighborhood</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  currentStep > step.id ? "gradient-primary text-primary-foreground" :
                  currentStep === step.id ? "bg-primary text-primary-foreground shadow-lg" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 rounded-full transition-all ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Card variant="elevated" className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && "Create your shopkeeper account"}
              {currentStep === 2 && "Tell us about your business"}
              {currentStep === 3 && "Set your business location"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input id="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="username" placeholder="johndoe" className="pl-10" value={formData.username} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="phone_number" type="tel" placeholder="+91 98765 43210" className="pl-10" value={formData.phone_number} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={formData.password} onChange={handleChange} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirm">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="password_confirm" type="password" placeholder="••••••••" className="pl-10" value={formData.password_confirm} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="business_name" placeholder="My Awesome Shop" className="pl-10" value={formData.business_name} onChange={handleChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_license">Business License / GST Number</Label>
                  <Input id="business_license" placeholder="22AAAAA0000A1Z5" value={formData.business_license} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_phone">Business Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="business_phone" type="tel" placeholder="+91 98765 43210" className="pl-10" value={formData.business_phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Your shop will be reviewed by our team before it goes live. This usually takes 24-48 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_address">Full Address *</Label>
                  <Textarea id="business_address" placeholder="Shop number, building, street..." rows={3} value={formData.business_address} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Ahmedabad" value={formData.city} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" placeholder="380015" maxLength={6} value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Almost Done!</h4>
                  <p className="text-sm text-green-700">
                    After submission, our team will review your application. You'll receive an email once your shop is approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button variant="hero" onClick={handleNext} className="flex-1" disabled={isLoading}>
                {currentStep === 3 ? (
                  isLoading ? "Submitting..." : "Submit for Review"
                ) : (
                  <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in to your account</Link>
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperRegister;
