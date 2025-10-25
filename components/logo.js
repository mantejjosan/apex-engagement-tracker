import Image from 'next/image';

export default function Logo({ className = "", size = "md", animated = false }) {
    // Define sizes
    const sizeClasses = {
        sm: "w-16 h-16",
        md: "w-24 h-24",
        lg: "w-32 h-32",
        xl: "w-48 h-48"
    };

    const selectedSize = sizeClasses[size] || sizeClasses.md;
    
    // The complex clip-path polygon data provided.
    // This defines the starburst shape.
    const goodstarburstclippath = "polygon(100% 50%,92.66% 55.39%,98.43% 62.43%,89.98% 65.83%,93.82% 74.09%,84.79% 75.27%,86.45% 84.23%,77.41% 83.13%,76.79% 92.22%,68.31% 88.91%,65.45% 97.55%,58.06% 92.24%,53.14% 99.9%,47.3% 92.92%,40.63% 99.11%,36.71% 90.9%,28.71% 95.24%,26.96% 86.31%,18.13% 88.53%,18.65% 79.44%,9.55% 79.39%,12.32% 70.72%,3.51% 68.41%,8.35% 60.69%,0.39% 56.27%,7% 50%,0.39% 43.73%,8.35% 39.31%,3.51% 31.59%,12.32% 29.28%,9.55% 20.61%,18.65% 20.56%,18.13% 11.47%,26.96% 13.69%,28.71% 4.76%,36.71% 9.1%,40.63% 0.89%,47.3% 7.08%,53.14% 0.1%,58.06% 7.76%,65.45% 2.45%,68.31% 11.09%,76.79% 7.78%,77.41% 16.87%,86.45% 15.77%,84.79% 24.73%,93.82% 25.91%,89.98% 34.17%,98.43% 37.57%,92.66% 44.61%)"
    // This value is now 28 seconds (28,000 milliseconds)
    const slowSpinDuration = '28000ms';

    if (animated) {
        return (
            <div
                // We keep 'animate-spin' but remove the 'duration-[...]' class
                className={`relative ${selectedSize} overflow-hidden shadow-2xl ring-4 ring-yellow-400/80 p-1 bg-yellow-500 ${animated ? 'animate-spin' : ''}`}
                style={{
                    // Apply the custom clip-path inline
                    clipPath: goodstarburstclippath,
                    // Apply the duration using standard CSS inline style only if animated
                    ...(animated && { animationDuration: slowSpinDuration }),
                }}
            >
                {/* The Image Wrapper for Counter-Rotation if animated */}
                <div
                    // We keep 'animate-spin' but remove the 'duration-[...]' class
                    className={`absolute inset-0 ${animated ? 'animate-spin' : ''}`}
                    style={{
                        // Apply the duration using standard CSS inline style only if animated
                        ...(animated && { animationDuration: slowSpinDuration }),
                        // This CSS property makes the animation run backward (counter-clockwise)
                        ...(animated && { animationDirection: 'reverse' }),
                    }}
                >
                    <Image
                        src="/loading_image.png"
                        alt="Application Loading Image"
                        fill // Crucial: Ensures the image covers the entire starburst shape
                        sizes="(max-width: 768px) 48vw, 64vw" // Good practice for performance
                        className="object-cover" // Ensure it covers the area without distortion
                        priority // Load immediately
                        unoptimized // Prevents Next.js optimization for quick display
                    />
                </div>
            </div>
        );
    }

    // Non-animated version
    return (
        <div
            className={`${selectedSize} ${className} relative`}
            style={{
                clipPath: goodstarburstclippath,
            }}
        >
            <Image
                src="/loading_image.png"
                alt="ApexEngage Logo"
                fill
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                className="object-cover"
                priority
            />
        </div>
    );
}
