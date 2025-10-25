import Logo from "./logo";

export default function LoadingScreen() {
    return (
        <div className="food-texture fixed inset-0 z-50 flex items-center justify-center w-full h-full backdrop-blur-sm">
            <Logo />
            <div className="sr-only">
                This is a loading screen
            </div>
        </div>
    )
}