import Image from "next/image";

export default function PoweredBy() {
    return (
        <div className="flex flex-col mx-auto">
            <div className="text-md text-muted-foreground mb-2 text-center">Powered By</div>
            <div className="flex items-center justify-center gap-3">
                <div className="rounded-full">
                    <Image
                        src="/causmic_logo.ico"
                        alt="causmic logo"
                        height={50}
                        width={50}
                    />
                </div>
                <span className="text-muted">&</span>
                <div className="rounded-full border-3">
                    <Image
                        src="/gne_logo.png"
                        alt="gndec logo"
                        height={50}
                        width={50}
                    />
                </div>
            </div>
        </div>
    )
}