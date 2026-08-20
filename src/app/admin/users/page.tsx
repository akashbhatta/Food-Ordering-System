import { requireAdmin } from "@/server/auth/guards";
import { getAdminUsers } from "@/server/db/queries/admin";
import { Users, Search, Shield, Store, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { UserActions } from "@/components/admin/user-actions";
import Link from "next/link";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const admin = await requireAdmin({ redirectTo: "/login" });
  const { search, role, status, page = "1" } = await searchParams;

  const pageNumber = parseInt(page, 10) || 1;
  const { users, pagination } = await getAdminUsers({
    search,
    role,
    status,
    page: pageNumber,
    limit: 10,
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">
              Platform Accounts
            </span>
            <Badge variant="secondary">
              {pagination.total} total {pagination.total === 1 ? "user" : "users"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Users & Permissions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage customer accounts, assign restaurant owner roles, and moderate platform access.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="border-border/60 bg-card rounded-2xl p-4">
        <form method="GET" className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              name="search"
              defaultValue={search || ""}
              placeholder="Search by name, email, or phone..."
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          <select
            name="role"
            defaultValue={role || ""}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs w-full sm:w-44"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="OWNER">Restaurant Owners</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <select
            name="status"
            defaultValue={status || ""}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs w-full sm:w-36"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
          </select>

          <Button type="submit" size="sm" className="h-9 rounded-xl text-xs font-bold px-4">
            Filter
          </Button>

          {(search || role || status) && (
            <Link href="/admin/users">
              <Button type="button" variant="ghost" size="sm" className="h-9 rounded-xl text-xs">
                Clear
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Users Table */}
      <Card className="border-border/60 bg-card rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-4 pl-6">User / Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Affiliation / Activity</th>
                <th className="p-4">Joined</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs shrink-0">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block truncate">{u.name}</span>
                          <span className="text-muted-foreground text-[11px] truncate block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize font-bold ${
                          u.role === "ADMIN"
                            ? "bg-destructive/15 text-destructive border-none"
                            : u.role === "OWNER"
                            ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-none"
                            : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-none"
                        }`}
                      >
                        {u.role.toLowerCase().replace(/_/g, " ")}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.isBanned
                            ? "bg-destructive/15 text-destructive"
                            : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {u.isBanned ? "● Suspended / Banned" : "● Active"}
                      </span>
                    </td>

                    <td className="p-4 text-muted-foreground">
                      {u.restaurant ? (
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Store className="h-3.5 w-3.5 text-primary" />
                          {u.restaurant.name}
                        </span>
                      ) : (
                        <span>{u._count.orders} orders placed</span>
                      )}
                    </td>

                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <UserActions
                        userId={u.id}
                        userName={u.name}
                        isBanned={u.isBanned}
                        currentRole={u.role}
                        isCurrentAdmin={u.id === admin.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 pt-0">
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
          />
        </div>
      </Card>
    </div>
  );
}
