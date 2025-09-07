
import { Link, useLocation } from "wouter";

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'fas fa-home' },
  { name: 'Transactions', href: '/transactions', icon: 'fas fa-exchange-alt' },
  { name: 'Goals', href: '/goals', icon: 'fas fa-bullseye' },
  { name: 'Budget', href: '/budget', icon: 'fas fa-calculator' },
  { name: 'Analytics', href: '/analytics', icon: 'fas fa-chart-pie' },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">₹</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="app-title">SpendWise</h1>
            <p className="text-sm text-muted-foreground">Personal Finance</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <button 
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    <i className={`${item.icon} w-5 mr-3`}></i>
                    <span>{item.name}</span>
                  </button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
