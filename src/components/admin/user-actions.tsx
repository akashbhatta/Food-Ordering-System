"use client";

import * as React from "react";
import { toggleUserBanAction, changeUserRoleAction } from "@/server/actions/admin";
import { Role } from "@prisma/client";
import { Ban, CheckCircle2, Shield, Loader2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserActionsProps {
  userId: string;
  userName: string;
  isBanned: boolean;
  currentRole: Role;
  isCurrentAdmin: boolean;
}

export function UserActions({
  userId,
  userName,
  isBanned,
  currentRole,
  isCurrentAdmin,
}: UserActionsProps) {
  const [banned, setBanned] = React.useState(isBanned);
  const [role, setRole] = React.useState<Role>(currentRole);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleToggleBan = async () => {
    const action = banned ? "reactivate" : "suspend/ban";
    if (!confirm(`Are you sure you want to ${action} ${userName}?`)) return;

    setIsUpdating(true);
    try {
      const res = await toggleUserBanAction(userId);
      if (!res.success) {
        toast.error(res.message || "Failed to update user status.");
        return;
      }
      setBanned(res.data?.isBanned ?? !banned);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error updating user status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === role) return;
    if (!confirm(`Change role of ${userName} from ${role} to ${newRole}?`)) return;

    setIsUpdating(true);
    try {
      const res = await changeUserRoleAction(userId, newRole);
      if (!res.success) {
        toast.error(res.message || "Failed to update user role.");
        return;
      }
      setRole(newRole);
      toast.success(res.message);
    } catch (err) {
      console.error(err);
      toast.error("Error updating user role.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCurrentAdmin) {
    return (
      <Badge variant="outline" className="text-[10px] bg-muted">
        Your Account
      </Badge>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Role Selector */}
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        disabled={isUpdating}
        className="h-8 rounded-lg border border-input bg-background px-2 text-[11px] font-medium"
      >
        <option value={Role.CUSTOMER}>Customer</option>
        <option value={Role.OWNER}>Restaurant Owner</option>
        <option value={Role.ADMIN}>Admin</option>
      </select>

      {/* Ban / Unban Toggle Button */}
      <Button
        size="sm"
        variant={banned ? "default" : "outline"}
        onClick={handleToggleBan}
        disabled={isUpdating || currentRole === Role.ADMIN}
        className={`h-8 rounded-lg text-xs gap-1 cursor-pointer ${
          banned
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "text-destructive hover:bg-destructive/10 hover:border-destructive/30"
        }`}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : banned ? (
          <>
            <UserCheck className="h-3.5 w-3.5" />
            Unban
          </>
        ) : (
          <>
            <UserX className="h-3.5 w-3.5" />
            Ban
          </>
        )}
      </Button>
    </div>
  );
}
