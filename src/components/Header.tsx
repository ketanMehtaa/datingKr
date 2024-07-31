import Link from 'next/link';
import Container from './ui/container';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

const routes = [
  {
    href: '',
    label: 'Home',
  },
  {
    href: '',
    label: 'Matches',
  },
  {
    href: '',
    label: 'Browse',
  },
  {
    href: '',
    label: 'Messages',
  },
  {
    href: '',
    label: 'My Profile',
  },
  // {
  //   href: '',
  //   label: 'Upgrade',
  // },
];
const Header = () => {
  return (
    <header className="fixed top-2 left-0 right-0 w-11/12 bg-pink-700 shadow-md z-50 rounded-xl mx-auto">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger>
                <Menu className="h-6 md:hidden w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {routes.map((route, i) => (
                    <Link key={i} href={route.href} className="block px-2 py-1 text-lg ">
                      {route.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="ml-4 lg:ml-0">
              <h1 className=" tracking-tight  text-xl font-bold text-white"> Hamy</h1>
            </Link>
          </div>
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6  lg:block hidden">
            {routes.map((route, i) => (
              <Button asChild variant="ghost" key={i}>
                <Link href={route.href} className="text-sm font-medium text-white transition-colors">
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </Container>
    </header>
  );
};

export default Header;
