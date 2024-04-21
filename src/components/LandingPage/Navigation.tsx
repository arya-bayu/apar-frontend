import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { clsx } from "clsx";
import React from "react";

type NavigationMenuProps = {};

const LandingPageNavigation = (props: NavigationMenuProps) => {
    return (
        <NavigationMenuPrimitive.Root className="relative max-w-7xl">
            <NavigationMenuPrimitive.List className="flex flex-row rounded-lg bg-white dark:bg-gray-800 space-x-2 py-2">
                <NavigationMenuPrimitive.Item>
                    <NavigationMenuPrimitive.Trigger
                        className={clsx(
                            "px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-900",
                            "text-sm font-medium",
                            "text-gray-700 dark:text-gray-100",
                            "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                        )}
                    >
                        Layanan
                    </NavigationMenuPrimitive.Trigger>

                    <NavigationMenuPrimitive.Content
                        className={clsx(
                            "absolute w-auto top-0 left-0 rounded-lg",
                            "radix-motion-from-start:animate-enter-from-left",
                            "radix-motion-from-end:animate-enter-from-right",
                            "radix-motion-to-start:animate-exit-to-left",
                            "radix-motion-to-end:animate-exit-to-right",
                        )}
                    >
                        <div className="w-[21rem] lg:w-[23rem] p-3">
                            <div className="grid grid-cols-10 gap-4">
                                <div className="col-span-4 w-full bg-gray-100 dark:bg-gray-900 p-4 rounded-md"></div>

                                <div className="col-span-6 w-full flex flex-col space-y-3 bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                                    <div className="w-full bg-white dark:bg-gray-700 h-6 rounded-md"></div>
                                    <div className="w-full bg-white dark:bg-gray-700 h-6 rounded-md"></div>
                                    <div className="w-full bg-white dark:bg-gray-700 h-6 rounded-md"></div>
                                    <div className="w-full bg-white dark:bg-gray-700 h-6 rounded-md"></div>
                                </div>
                            </div>
                        </div>
                    </NavigationMenuPrimitive.Content>
                </NavigationMenuPrimitive.Item>

                <NavigationMenuPrimitive.Item>
                    <NavigationMenuPrimitive.Trigger
                        className={clsx(
                            "px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-900",
                            "text-sm font-medium text-gray-700 dark:text-gray-100",
                            "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                        )}
                    >
                        Store
                    </NavigationMenuPrimitive.Trigger>

                    <NavigationMenuPrimitive.Content
                        className={clsx(
                            "absolute w-auto top-0 left-0 rounded-lg",
                            "radix-motion-from-start:animate-enter-from-left",
                            "radix-motion-from-end:animate-enter-from-right",
                            "radix-motion-to-start:animate-exit-to-left",
                            "radix-motion-to-end:animate-exit-to-right",
                        )}
                    >
                        <div className="w-[16rem] lg:w-[18rem] p-3">
                            <div className="w-full flex flex-col space-y-2">
                                <NavigationMenuPrimitive.Link
                                    className={clsx(
                                        "w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md",
                                        "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                                    )}
                                    href=""
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Kategori 1
                                    </span>

                                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                                        Duis vestibulum massa eget magna laoreet cursus. Vivamus sit amet nibh dictum, bibendum nunc vitae, efficitur diam.
                                    </div>
                                </NavigationMenuPrimitive.Link>

                                <NavigationMenuPrimitive.Link
                                    className={clsx(
                                        "w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md",
                                        "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
                                    )}
                                    href="https://www.radix-ui.com"
                                >
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Kategori 2
                                    </span>
                                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                                        Nulla eget tortor nec lectus consectetur iaculis. Pellentesque placerat eros nec arcu blandit iaculis. Suspendisse rhoncus ipsum id urna semper ornare.
                                    </div>
                                </NavigationMenuPrimitive.Link>
                            </div>
                        </div>
                    </NavigationMenuPrimitive.Content>
                </NavigationMenuPrimitive.Item>

                <NavigationMenuPrimitive.Item asChild>
                    <NavigationMenuPrimitive.Link
                        href=""
                        className={clsx(
                            "px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-900",
                            "text-sm font-medium text-gray-700 dark:text-gray-100",
                        )}
                    >
                        Hubungi Kami
                    </NavigationMenuPrimitive.Link>
                </NavigationMenuPrimitive.Item>

                <NavigationMenuPrimitive.Indicator
                    className={clsx(
                        "z-10",
                        "top-[100%] flex items-end justify-center h-2 overflow-hidden",
                        "radix-state-visible:animate-fade-in",
                        "radix-state-hidden:animate-fade-out",
                        "transition-[width_transform] duration-[250ms] ease-[ease]",
                    )}
                >
                    <div className="top-1 relative bg-white dark:bg-gray-800 w-2 h-2 rotate-45" />
                </NavigationMenuPrimitive.Indicator>
            </NavigationMenuPrimitive.List>

            <div
                className={clsx(
                    "absolute flex justify-center",
                    "w-[140%] left-[-20%] top-[100%]",
                )}
                style={{
                    perspective: "2000px",
                }}
            >
                <NavigationMenuPrimitive.Viewport
                    className={clsx(
                        "relative mt-2 shadow-lg rounded-md bg-white dark:bg-gray-800 overflow-hidden",
                        "w-radix-navigation-menu-viewport",
                        "h-radix-navigation-menu-viewport",
                        "radix-state-open:animate-scale-in-content",
                        "radix-state-closed:animate-scale-out-content",
                        "origin-[top_center] transition-[width_height] duration-300 ease-[ease]",
                    )}
                />
            </div>
        </NavigationMenuPrimitive.Root>
    );
};

export { LandingPageNavigation };