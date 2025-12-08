import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Shield, UserPlus, Crown, Loader2, Search } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
}

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [promoteEmail, setPromoteEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAdminUsers();
    }
  }, [open]);

  const fetchAdminUsers = async () => {
    setLoading(true);
    try {
      // Fetch all admin user_ids
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      const adminIds = adminRoles?.map(r => r.user_id) || [];

      // Fetch profiles for admins
      if (adminIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", adminIds);

        if (profilesError) throw profilesError;

        // Get current user's email for display
        const { data: { user } } = await supabase.auth.getUser();
        
        const adminUsers: UserWithRole[] = (profiles || []).map(profile => ({
          id: profile.id,
          email: profile.id === user?.id ? (user?.email || "Unknown") : "Hidden",
          name: profile.name,
          isAdmin: true
        }));

        setUsers(adminUsers);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching admin users:", error);
      toast({
        title: "Error loading admins",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!promoteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    setPromoting(promoteEmail);
    try {
      const { data, error } = await supabase.rpc("promote_user_to_admin", {
        user_email: promoteEmail.trim()
      });

      if (error) throw error;

      toast({
        title: "User promoted!",
        description: `${promoteEmail} is now an admin`
      });
      
      setPromoteEmail("");
      fetchAdminUsers();
    } catch (error: any) {
      toast({
        title: "Error promoting user",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setPromoting(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Panel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Promote User Section */}
          <Card className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Promote User to Admin
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="promote-email">User Email</Label>
                <Input
                  id="promote-email"
                  type="email"
                  placeholder="user@example.com"
                  value={promoteEmail}
                  onChange={(e) => setPromoteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePromoteUser()}
                />
              </div>
              <Button 
                onClick={handlePromoteUser} 
                disabled={!!promoting}
                className="w-full"
              >
                {promoting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Make Admin
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Current Admins Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Current Admins ({users.length})
            </h3>
            
            {users.length > 3 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <ScrollArea className="h-[200px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {users.length === 0 ? "No admins found" : "No matching admins"}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.name || "Unnamed"}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
