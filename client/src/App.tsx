import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import AppointmentDetails from "@/pages/AppointmentDetails";
import AppForm from "@/pages/AppForm";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/not-found";
import { ClipboardList, FileText, BarChart } from "lucide-react";

function NavigationMenu() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-[hsl(var(--surface))] shadow-md mb-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-lg mr-8">Appointments App</span>
            <div className="flex space-x-4">
              <Link href="/">
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  location === "/" ? "bg-[hsl(var(--accent))] text-white" : "hover:bg-[hsl(var(--surface2))]"
                }`}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Dashboard
                </div>
              </Link>
              <Link href="/analytics">
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  location === "/analytics" ? "bg-[hsl(var(--accent))] text-white" : "hover:bg-[hsl(var(--surface2))]"
                }`}>
                  <BarChart className="w-4 h-4 mr-2" />
                  Analytics
                </div>
              </Link>
              <Link href="/appform">
                <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                  location === "/appform" ? "bg-[hsl(var(--accent))] text-white" : "hover:bg-[hsl(var(--surface2))]"
                }`}>
                  <FileText className="w-4 h-4 mr-2" />
                  AppForm
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <NavigationMenu />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/appointments/:id" component={AppointmentDetails} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/appform" component={AppForm} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
