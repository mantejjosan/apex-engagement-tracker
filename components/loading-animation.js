import Image from 'next/image';

export default function LoadingAnimation() {
    // The complex clip-path polygon data provided. 
    // This defines the starburst shape.
    const newstarburstclippath = "polygon(100% 50%,calc(99.73% - 0.99em) calc(55.23% - 0.1em),98.91% 60.4%,calc(97.55% - 0.95em) calc(65.45% - 0.31em),95.68% 70.34%,calc(93.3% - 0.87em) calc(75% - 0.5em),90.45% 79.39%,calc(87.16% - 0.74em) calc(83.46% - 0.67em),83.46% 87.16%,calc(79.39% - 0.59em) calc(90.45% - 0.81em),75% 93.3%,calc(70.34% - 0.41em) calc(95.68% - 0.91em),65.45% 97.55%,calc(60.4% - 0.21em) calc(98.91% - 0.98em),55.23% 99.73%,calc(50% - 0em) calc(100% - 1em),44.77% 99.73%,calc(39.6% - -0.21em) calc(98.91% - 0.98em),34.55% 97.55%,calc(29.66% - -0.41em) calc(95.68% - 0.91em),25% 93.3%,calc(20.61% - -0.59em) calc(90.45% - 0.81em),16.54% 87.16%,calc(12.84% - -0.74em) calc(83.46% - 0.67em),9.55% 79.39%,calc(6.7% - -0.87em) calc(75% - 0.5em),4.32% 70.34%,calc(2.45% - -0.95em) calc(65.45% - 0.31em),1.09% 60.4%,calc(0.27% - -0.99em) calc(55.23% - 0.1em),0% 50%,calc(0.27% - -0.99em) calc(44.77% - -0.1em),1.09% 39.6%,calc(2.45% - -0.95em) calc(34.55% - -0.31em),4.32% 29.66%,calc(6.7% - -0.87em) calc(25% - -0.5em),9.55% 20.61%,calc(12.84% - -0.74em) calc(16.54% - -0.67em),16.54% 12.84%,calc(20.61% - -0.59em) calc(9.55% - -0.81em),25% 6.7%,calc(29.66% - -0.41em) calc(4.32% - -0.91em),34.55% 2.45%,calc(39.6% - -0.21em) calc(1.09% - -0.98em),44.77% 0.27%,calc(50% - 0em) calc(0% - -1em),55.23% 0.27%,calc(60.4% - 0.21em) calc(1.09% - -0.98em),65.45% 2.45%,calc(70.34% - 0.41em) calc(4.32% - -0.91em),75% 6.7%,calc(79.39% - 0.59em) calc(9.55% - -0.81em),83.46% 12.84%,calc(87.16% - 0.74em) calc(16.54% - -0.67em),90.45% 20.61%,calc(93.3% - 0.87em) calc(25% - -0.5em),95.68% 29.66%,calc(97.55% - 0.95em) calc(34.55% - -0.31em),98.91% 39.6%,calc(99.73% - 0.99em) calc(44.77% - -0.1em))";
    // Set the custom duration for the slow spin
    // This value is now 28 seconds (28,000 milliseconds)
    const slowSpinDuration = '28000ms'; 

    return (
        <div
            // We keep 'animate-spin' but remove the 'duration-[...]' class
            className={`relative w-48 h-48 md:w-64 md:h-64 overflow-hidden shadow-2xl ring-4 ring-yellow-400/80 p-1 bg-yellow-500 animate-spin`}
            style={{
                // Apply the custom clip-path inline
                clipPath: newstarburstclippath,
                // FIX: Apply the duration using standard CSS inline style
                animationDuration: slowSpinDuration,
            }}
        >
            {/* 3. The Image Wrapper for Counter-Rotation */}
            <div
                // We keep 'animate-spin' but remove the 'duration-[...]' class
                className={`absolute inset-0 animate-spin`}
                style={{
                    // FIX: Apply the duration using standard CSS inline style
                    animationDuration: slowSpinDuration, 
                    // This CSS property makes the animation run backward (counter-clockwise)
                    animationDirection: 'reverse',
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