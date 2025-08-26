import Image from "next/image";
import {
  Bars3Icon,           // replaces MenuIcon
  MagnifyingGlassIcon, // replaces SearchIcon
  ShoppingCartIcon     // still exists
} from "@heroicons/react/24/outline";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectItems } from "../slices/basketSlice";

function Header(props) {
  const { data: session } = useSession(); // ✅ FIXED
  const router = useRouter();
  const items = useSelector(selectItems);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* Top Nav */}
      <div className="flex items-center bg-amazon_blue p-1 flex-grow py-1.5">
        {/* Logo */}
        <div className="flex items-center flex-grow sm:flex-grow-0 mx-6">
          <img
            src="https://i.ibb.co/X21TYHy/riancci1-logo.png"
            width={120}
            height={40}
            className="cursor-pointer"
            onClick={() => router.push("/")}
            alt="Logo"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-yellow-400 hidden sm:flex items-center h-10 rounded-md flex-grow cursor-pointer hover:bg-yellow-500">
          <input
            type="text"
            className="p-2 h-full w-6 flex-grow rounded-l-md flex-shrink outline-none px-4"
            placeholder="Search for products, brands and more"
            onChange={props.handleChange}
          />
          <MagnifyingGlassIcon  className="h-12 p-4" />
        </div>

        {/* Right Section */}
        <div className="text-white flex items-center text-sm space-x-6 mx-6 whitespace-nowrap">
          {/* Account */}
          <div
            onClick={!session ? signIn : undefined}
            className="cursor-pointer"
          >
            <p className="link">
              {session ? `Hello, ${session.user?.name}` : "Sign in"}
            </p>
            {session ? (
              <p
                onClick={signOut}
                className="link font-extrabold md:text-sm"
              >
                Sign Out
              </p>
            ) : (
              <p className="link font-extrabold md:text-sm">
                Account & Lists
              </p>
            )}
          </div>

          {/* Orders */}
          <div
            className="link cursor-pointer"
            onClick={() => router.push("/orders")}
          >
            <p>Returns</p>
            <p className="font-extrabold md:text-sm">& Orders</p>
          </div>

          {/* Basket */}
          <div
            className="relative flex items-center cursor-pointer"
            onClick={() => router.push("/checkout")}
          >
            <span className="absolute top-0 right-0 left-8 md:right-10 sm:right-10 h-5 w-4 bg-yellow-400 text-center rounded-full text-black font-bold">
              {items.length}
            </span>
            <ShoppingCartIcon className="h-10" />
            <p className="link font-extrabold md:text-sm hidden sm:inline mt-2">
              Basket
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center bg-amazon_blue-light text-white text-sm p-2 space-x-3 pl-3">
        <p className="link flex items-center">
          <Bars3Icon  className="h-5 mr-1" />
          All
        </p>
        <p className="link">Top Outfits</p>
        <p className="link">Rianncci Business</p>
        <p className="link">Today's Deals</p>
        <p className="link hidden lg:flex">Electronics</p>
        <p className="link hidden lg:flex">Food & Grocery</p>
        <p className="link hidden lg:flex">Shirts</p>
        <p className="link hidden lg:flex">Buy Again</p>
        <p className="link hidden lg:flex">Shopper Toolkit</p>
        <p className="link hidden lg:flex">Health & Personal Care</p>
      </div>
    </header>
  );
}

export default Header;
