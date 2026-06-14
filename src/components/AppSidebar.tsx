import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  Banknote,
  CalendarClock,
  BarChart3,
  Boxes,
  CreditCard,
  Settings,
  Hexagon,
} from "lucide-react";
import logoImg from "../../img/hireledger.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Recruitment", url: "/recruitment", icon: BriefcaseBusiness },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Contracts PKWT", url: "/contracts", icon: FileText },
  { title: "Payroll", url: "/payroll", icon: Banknote },
  { title: "Attendance", url: "/attendance", icon: CalendarClock },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Blockchain", url: "/blockchain", icon: Boxes },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center px-2 py-3 ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-gradient-primary blur-md opacity-60" />
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl">
  <img
    src={logoImg}
    alt="HireLedger"
    className="h-full w-full object-contain"
  />
</div>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold tracking-tight">HireLedger</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                On-chain HR
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className={`group h-11 rounded-xl transition-all duration-300 data-[active=true]:bg-gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-[0_0_24px_hsl(var(--primary)/0.4)] hover:bg-sidebar-accent ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <NavLink to={item.url} className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                        {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                        {!collapsed && active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse-glow" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="rounded-xl border border-border/60 bg-gradient-card p-3 backdrop-blur">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs font-medium">Network: Solana Devnet</span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">Gas · 32 gwei</p>
          </div>
        ) : (
          <div className="flex justify-center rounded-lg border border-border/60 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse-glow" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
