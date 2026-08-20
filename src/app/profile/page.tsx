import { requireAuth } from "@/server/auth/guards";
import { getUserById } from "@/server/db/queries/user";
import { User, Mail, Phone, Shield, MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const sessionUser = await requireAuth({ redirectTo: "/profile" });
  const user = await getUserById(sessionUser.id);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline">Account Profile</Badge>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Profile & Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information and saved delivery addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <Card className="md:col-span-1 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Your registered account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Full Name
              </span>
              <p className="font-medium text-foreground">{user.name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email
              </span>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> Phone
              </span>
              <p className="font-medium text-foreground">{user.phone || "Not set"}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" /> Account Role
              </span>
              <p className="font-medium text-foreground">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card className="md:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Saved Delivery Addresses</CardTitle>
              <CardDescription>Addresses available at checkout</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Address
            </Button>
          </CardHeader>
          <CardContent>
            {user.addresses.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-sm">
                No addresses saved yet. Add an address for faster checkout.
              </div>
            ) : (
              <div className="space-y-3">
                {user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          {address.label}
                        </span>
                        {address.isDefault && (
                          <Badge variant="outline" className="text-[10px]">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
