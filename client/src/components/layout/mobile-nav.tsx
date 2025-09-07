import { Link, useLocation } from "wouter";

const navigation = [
  { name: 'Home', href: '/', icon: 'fas fa-home' },
  { name: 'Transactions', href: '/transactions', icon: 'fas fa-exchange-alt' },
  { name: 'Goals', href: '/goals', icon: 'fas fa-bullseye' },
  { name: 'Budget', href: '/budget', icon: 'fas fa-calculator' },
  { name: 'Analytics', href: '/analytics', icon: 'fas fa-chart-pie' },
];

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border fixed bottom-0 left-0 right-0 z-50 shadow-lg">
      <div className="flex justify-around py-3">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <button 
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all min-w-[60px] ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
              >
                <i className={`${item.icon} text-base mb-1`}></i>
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}