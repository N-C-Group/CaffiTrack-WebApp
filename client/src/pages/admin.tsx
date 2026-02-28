import { motion } from "framer-motion";
import { 
  ArrowLeft, Coffee, Building2, Check, X, Clock, Lock, Search, Database, 
  Zap, ChevronLeft, ChevronRight, Bell, Send, Calendar, History, FileText, 
  XCircle, LayoutDashboard, MessageSquare, Users, TrendingUp, LogOut, Menu
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FeatureRequest, CaffeineItem, NotificationHistory, NotificationTemplate } from "@shared/schema";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "requests" | "drinks" | "notifications">("dashboard");
  const [drinkSearch, setDrinkSearch] = useState("");
  const [drinksPage, setDrinksPage] = useState(1);
  const drinksPerPage = 25;
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [notificationTab, setNotificationTab] = useState<"compose" | "templates" | "history" | "scheduled">("compose");
  const [requestFilter, setRequestFilter] = useState<"all" | "pending" | "accepted" | "rejected">("pending");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem("adminPin");
    if (savedPin) {
      // Verify the saved PIN is still valid
      apiRequest("POST", "/api/admin/verify", { pin: savedPin })
        .then(() => {
          setIsAuthenticated(true);
          setAdminPin(savedPin);
        })
        .catch(() => {
          sessionStorage.removeItem("adminPin");
        });
    }
  }, []);

  const verifyMutation = useMutation({
    mutationFn: async (pin: string) => {
      await apiRequest("POST", "/api/admin/verify", { pin });
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      setAdminPin(pin);
      sessionStorage.setItem("adminPin", pin);
      toast({
        title: "Welcome back",
        description: "You've successfully signed into the admin panel.",
      });
    },
    onError: () => {
      toast({
        title: "Access denied",
        description: "Invalid PIN. Please try again.",
        variant: "destructive",
      });
      setPin("");
    },
  });

  const { data: requests = [], isLoading } = useQuery<FeatureRequest[]>({
    queryKey: ["/api/requests"],
    enabled: isAuthenticated,
  });

  const { data: drinksCount } = useQuery<{ count: number }>({
    queryKey: ["/api/admin/caffeineItems/count"],
    enabled: isAuthenticated,
  });

  const { data: drinks = [], isLoading: drinksLoading } = useQuery<CaffeineItem[]>({
    queryKey: ["/api/admin/caffeineItems", drinkSearch],
    queryFn: async () => {
      const url = drinkSearch 
        ? `/api/admin/caffeineItems?q=${encodeURIComponent(drinkSearch)}`
        : "/api/admin/caffeineItems";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch drinks");
      return response.json();
    },
    enabled: isAuthenticated && activeTab === "drinks",
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      await apiRequest("PATCH", `/api/requests/${id}`, { status, pin: adminPin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({
        title: "Request updated",
        description: "The request status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ title, body, scheduledFor }: { title: string; body: string; scheduledFor?: string }) => {
      return await apiRequest("POST", "/api/admin/sendNotification", { pin: adminPin, title, body, scheduledFor: scheduledFor || undefined });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/scheduled"] });
      toast({
        title: variables.scheduledFor ? "Notification scheduled" : "Notification sent",
        description: variables.scheduledFor ? "Push notification has been scheduled." : "Push notification has been sent to all users.",
      });
      setNotificationTitle("");
      setNotificationBody("");
      setScheduledFor("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/notifications/${id}/cancel`, { pin: adminPin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/scheduled"] });
      toast({
        title: "Notification cancelled",
        description: "The scheduled notification has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: notificationHistoryData = [] } = useQuery<NotificationHistory[]>({
    queryKey: ["/api/admin/notifications", adminPin],
    queryFn: async () => {
      const response = await fetch(`/api/admin/notifications?pin=${encodeURIComponent(adminPin)}`);
      if (!response.ok) throw new Error("Failed to fetch notification history");
      return response.json();
    },
    enabled: isAuthenticated && !!adminPin,
  });

  const { data: scheduledNotifications = [] } = useQuery<NotificationHistory[]>({
    queryKey: ["/api/admin/notifications/scheduled", adminPin],
    queryFn: async () => {
      const response = await fetch(`/api/admin/notifications/scheduled?pin=${encodeURIComponent(adminPin)}`);
      if (!response.ok) throw new Error("Failed to fetch scheduled notifications");
      return response.json();
    },
    enabled: isAuthenticated && !!adminPin,
  });

  const { data: templates = [] } = useQuery<NotificationTemplate[]>({
    queryKey: ["/api/admin/notifications/templates"],
    enabled: isAuthenticated && activeTab === "notifications",
  });

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const rejectedRequests = requests.filter((r) => r.status === "rejected");
  const sentNotifications = notificationHistoryData.filter((n) => n.status === "sent");

  const filteredRequests = requestFilter === "all" 
    ? requests 
    : requests.filter(r => r.status === requestFilter);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Enter your PIN to access the control panel</p>
          </div>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyMutation.mutate(pin);
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80">Security PIN</label>
                  <Input
                    type="password"
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-primary h-12 text-center text-xl tracking-[0.5em] font-mono"
                    data-testid="input-admin-pin"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold text-base"
                  disabled={verifyMutation.isPending || !pin}
                  data-testid="button-verify-pin"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Website
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const SidebarItem = ({ 
    icon: Icon, 
    label, 
    tab, 
    badge 
  }: { 
    icon: any; 
    label: string; 
    tab: typeof activeTab; 
    badge?: number 
  }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        activeTab === tab 
          ? "bg-primary/10 text-primary border border-primary/20" 
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      }`}
      data-testid={`nav-${tab}`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          activeTab === tab ? "bg-primary/20 text-primary" : "bg-slate-700 text-foreground/80"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    trend, 
    color = "primary" 
  }: { 
    icon: any; 
    label: string; 
    value: number | string; 
    trend?: string; 
    color?: "primary" | "green" | "yellow" | "blue" 
  }) => {
    const colors = {
      primary: "from-primary/20 to-primary/5 border-primary/20 text-primary",
      green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-500",
      yellow: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-500",
      blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-500",
    };
    
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p className="text-3xl font-bold text-white">{value}</p>
              {trend && (
                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br border ${colors[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-white">CaffiTrack</span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          data-testid="button-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 border-r border-white/10 p-6 flex flex-col fixed h-screen bg-background z-50 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="mb-8">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div>
                <span className="font-bold text-lg text-white">CaffiTrack</span>
                <span className="block text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </div>
          </Link>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" tab="dashboard" />
          <SidebarItem icon={MessageSquare} label="Feature Requests" tab="requests" badge={pendingRequests.length} />
          <SidebarItem icon={Database} label="Drinks Database" tab="drinks" badge={drinksCount?.count} />
          <SidebarItem icon={Bell} label="Notifications" tab="notifications" badge={scheduledNotifications.length} />
        </nav>

        <div className="pt-6 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5"
            onClick={() => {
              sessionStorage.removeItem("adminPin");
              setIsAuthenticated(false);
            }}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8">
        {activeTab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's an overview of your app.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Database} 
                label="Total Drinks" 
                value={drinksCount?.count || 0} 
                color="primary"
              />
              <StatCard 
                icon={Clock} 
                label="Pending Requests" 
                value={pendingRequests.length} 
                color="yellow"
              />
              <StatCard 
                icon={Check} 
                label="Accepted Requests" 
                value={acceptedRequests.length} 
                color="green"
              />
              <StatCard 
                icon={Bell} 
                label="Notifications Sent" 
                value={sentNotifications.length} 
                color="blue"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Recent Requests</CardTitle>
                  <CardDescription>Latest feature requests from users</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No pending requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingRequests.slice(0, 5).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            {request.type === "drink" ? (
                              <Coffee className="h-4 w-4 text-primary" />
                            ) : (
                              <Building2 className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-white font-medium">{request.name}</span>
                          </div>
                          <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                            Pending
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Scheduled Notifications</CardTitle>
                  <CardDescription>Upcoming push notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {scheduledNotifications.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No scheduled notifications</p>
                  ) : (
                    <div className="space-y-3">
                      {scheduledNotifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                          <div>
                            <span className="text-white font-medium block">{notification.title}</span>
                            <span className="text-muted-foreground text-xs">
                              {notification.scheduledFor && formatDate(notification.scheduledFor)} at {notification.scheduledFor && formatTime(notification.scheduledFor)}
                            </span>
                          </div>
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Feature Requests</h1>
                <p className="text-muted-foreground">Manage drink and chain requests from users</p>
              </div>
            </div>

            <div className="flex gap-2">
              {(["all", "pending", "accepted", "rejected"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={requestFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRequestFilter(filter)}
                  className={requestFilter === filter ? "" : "border-white/20 text-muted-foreground hover:text-white"}
                  data-testid={`filter-${filter}`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  {filter === "pending" && pendingRequests.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-500">
                      {pendingRequests.length}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-16 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">No {requestFilter} requests</h3>
                  <p className="text-muted-foreground">Requests will appear here when users submit them.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                request.type === "drink" 
                                  ? "bg-primary/10 text-primary" 
                                  : "bg-blue-500/10 text-blue-500"
                              }`}>
                                {request.type === "drink" ? (
                                  <Coffee className="h-4 w-4" />
                                ) : (
                                  <Building2 className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-white text-lg" data-testid={`text-request-name-${request.id}`}>
                                  {request.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {request.type === "drink" ? "Drink Request" : "Chain Request"} • {formatDate(request.createdAt)}
                                </p>
                              </div>
                            </div>
                            {request.details && (
                              <p className="text-sm text-muted-foreground ml-12">{request.details}</p>
                            )}
                            {request.submitterEmail && (
                              <p className="text-xs text-muted-foreground ml-12">
                                Submitted by: {request.submitterEmail}
                              </p>
                            )}
                          </div>
                          
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                                onClick={() => updateMutation.mutate({ id: request.id, status: "accepted" })}
                                disabled={updateMutation.isPending}
                                data-testid={`button-accept-${request.id}`}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                onClick={() => updateMutation.mutate({ id: request.id, status: "rejected" })}
                                disabled={updateMutation.isPending}
                                data-testid={`button-reject-${request.id}`}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {request.status === "accepted" && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <Check className="h-3 w-3 mr-1" /> Accepted
                            </Badge>
                          )}

                          {request.status === "rejected" && (
                            <Badge className="bg-red-500/10 text-red-500 border border-red-500/20">
                              <X className="h-3 w-3 mr-1" /> Rejected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "drinks" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Drinks Database</h1>
              <p className="text-muted-foreground">Browse and manage {drinksCount?.count || 0} caffeinated drinks</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search drinks by name..."
                value={drinkSearch}
                onChange={(e) => {
                  setDrinkSearch(e.target.value);
                  setDrinksPage(1);
                }}
                className="pl-12 h-12 bg-slate-900/50 border-white/20 focus:border-primary text-white"
                data-testid="input-drink-search"
              />
            </div>

            {drinksLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading drinks...</div>
            ) : drinks.length === 0 ? (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-16 text-center">
                  <Database className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="font-semibold text-white mb-2">
                    {drinkSearch ? `No results for "${drinkSearch}"` : "No drinks in database"}
                  </h3>
                  <p className="text-muted-foreground">Try a different search term.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-3">
                  {drinks.slice((drinksPage - 1) * drinksPerPage, drinksPage * drinksPerPage).map((drink) => (
                    <Card key={drink.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {drink.imageUrl ? (
                            <img
                              src={drink.imageUrl}
                              alt={drink.name}
                              className="w-14 h-14 rounded-xl object-cover bg-white/10"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                              <Coffee className="h-6 w-6 text-muted-foreground/60" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate" data-testid={`text-drink-name-${drink.id}`}>
                              {drink.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                {drink.caffeine}mg
                              </span>
                              <span>{drink.floz}oz</span>
                              {drink.calories !== null && <span>{drink.calories} cal</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {drink.mgFloz?.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">mg/oz</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {drinks.length > drinksPerPage && (
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDrinksPage(p => Math.max(1, p - 1))}
                      disabled={drinksPage === 1}
                      className="border-white/20 text-muted-foreground hover:text-white"
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {drinksPage} of {Math.ceil(drinks.length / drinksPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDrinksPage(p => Math.min(Math.ceil(drinks.length / drinksPerPage), p + 1))}
                      disabled={drinksPage >= Math.ceil(drinks.length / drinksPerPage)}
                      className="border-white/20 text-muted-foreground hover:text-white"
                      data-testid="button-next-page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Push Notifications</h1>
              <p className="text-muted-foreground">Send messages to all CaffiTrack users</p>
            </div>

            <div className="flex gap-2 border-b border-white/10 pb-4">
              {([
                { id: "compose" as const, icon: Send, label: "Compose", badge: undefined as number | undefined },
                { id: "templates" as const, icon: FileText, label: "Templates", badge: undefined as number | undefined },
                { id: "scheduled" as const, icon: Calendar, label: "Scheduled", badge: scheduledNotifications.length },
                { id: "history" as const, icon: History, label: "History", badge: undefined as number | undefined },
              ]).map(({ id, icon: Icon, label, badge }) => (
                <Button
                  key={id}
                  variant={notificationTab === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setNotificationTab(id)}
                  className={notificationTab === id ? "" : "text-muted-foreground hover:text-white"}
                  data-testid={`tab-notification-${id}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                  {badge !== undefined && badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                      {badge}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {notificationTab === "compose" && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Compose Notification
                  </CardTitle>
                  <CardDescription>Send immediately or schedule for later</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Title</label>
                    <Input
                      placeholder="e.g., New drinks added!"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="bg-white/5 border-white/20 focus:border-primary text-white"
                      data-testid="input-notification-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Message</label>
                    <Textarea
                      placeholder="e.g., We've added 10 new energy drinks to our database!"
                      value={notificationBody}
                      onChange={(e) => setNotificationBody(e.target.value)}
                      className="bg-white/5 border-white/20 focus:border-primary text-white min-h-[120px] resize-none"
                      data-testid="input-notification-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80">Schedule (optional)</label>
                    <Input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="bg-white/5 border-white/20 focus:border-primary text-white"
                      data-testid="input-scheduled-for"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty to send immediately</p>
                  </div>
                  <Button
                    onClick={() => sendNotificationMutation.mutate({ title: notificationTitle, body: notificationBody, scheduledFor: scheduledFor || undefined })}
                    disabled={sendNotificationMutation.isPending || !notificationTitle.trim() || !notificationBody.trim()}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-semibold"
                    data-testid="button-send-notification"
                  >
                    {sendNotificationMutation.isPending ? (
                      "Processing..."
                    ) : scheduledFor ? (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Notification
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {notificationTab === "templates" && (
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="bg-white/5 border-white/10 hover:border-primary/50 cursor-pointer transition-all group"
                    onClick={() => {
                      setNotificationTitle(template.title);
                      setNotificationBody(template.body);
                      setNotificationTab("compose");
                    }}
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1" data-testid={`text-template-title-${template.id}`}>
                            {template.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{template.body}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {notificationTab === "scheduled" && (
              <div className="space-y-4">
                {scheduledNotifications.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="py-16 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                      <h3 className="font-semibold text-white mb-2">No Scheduled Notifications</h3>
                      <p className="text-muted-foreground">Schedule a notification to send it later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  scheduledNotifications.map((notification) => (
                    <Card key={notification.id} className="bg-white/5 border-white/10" data-testid={`card-scheduled-${notification.id}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="text-sm text-blue-400" data-testid={`text-scheduled-time-${notification.id}`}>
                                {notification.scheduledFor && formatDate(notification.scheduledFor)} at {notification.scheduledFor && formatTime(notification.scheduledFor)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-white" data-testid={`text-scheduled-title-${notification.id}`}>{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            onClick={() => cancelNotificationMutation.mutate(notification.id)}
                            disabled={cancelNotificationMutation.isPending}
                            data-testid={`button-cancel-scheduled-${notification.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {notificationTab === "history" && (
              <div className="space-y-4">
                {notificationHistoryData.length === 0 ? (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="py-16 text-center">
                      <History className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                      <h3 className="font-semibold text-white mb-2">No Notification History</h3>
                      <p className="text-muted-foreground">Sent notifications will appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  notificationHistoryData.map((notification) => (
                    <Card key={notification.id} className="bg-white/5 border-white/10" data-testid={`card-history-${notification.id}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge
                                variant="outline"
                                className={
                                  notification.status === "sent"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                                    : notification.status === "failed"
                                    ? "bg-red-500/10 text-red-500 border-red-500/30"
                                    : notification.status === "scheduled"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                                    : "bg-slate-500/10 text-muted-foreground border-slate-500/30"
                                }
                                data-testid={`badge-status-${notification.id}`}
                              >
                                {notification.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground" data-testid={`text-history-time-${notification.id}`}>
                                {notification.sentAt
                                  ? formatDate(notification.sentAt) + " at " + formatTime(notification.sentAt)
                                  : notification.createdAt
                                  ? formatDate(notification.createdAt) + " at " + formatTime(notification.createdAt)
                                  : ""}
                              </span>
                            </div>
                            <h3 className="font-semibold text-white" data-testid={`text-history-title-${notification.id}`}>{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                            {notification.error && (
                              <p className="text-xs text-red-400 mt-2 bg-red-500/10 px-2 py-1 rounded">
                                Error: {notification.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
