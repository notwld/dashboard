import { useState } from "react";

export default function Sidebar() {
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div className="flex fixed">
            <div className="h-screen bg-black w-fit">
                <div className="hidden flex-col p-10 text-white lg:flex">
                    <div className="flex flex-col">
                        <a href="#" className="p-4">Home</a>
                        <a href="#" className="p-4">About</a>
                        <a href="#" className="p-4">Contact</a>

                    </div>
                </div>
            </div>
            <div className="w-screen bg-red-400 h-24">
                <div className="flex w-screen h-full justify-between items-center">
                    <div className="p-10 text-white">Logo</div>
                    <div className="p-10 text-white lg:hidden md:flex sm:flex" onClick={() => setShowMenu(!showMenu)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>

                    </div>
                </div>
            </div>
            {showMenu && <div>
                <div className="flex-col p-10 text-white bg-black absolute inset-0 z-10 top-0 left-0 h-screen w-screen lg:hidden ">
                    <div className="flex flex-col text-center">
                       <div className="flex justify-end">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={() => setShowMenu(!showMenu)}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />                      
                            </svg>
                       </div>
                       <div className="mt-10 flex flex-col">
                       <a href="#" className="p-4">Home</a>
                        <a href="#" className="p-4">About</a>
                        <a href="#" className="p-4">Contact</a>
                       </div>

                    </div>
                </div>
            </div>}
        </div>
    )
}
