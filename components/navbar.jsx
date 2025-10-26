import Logo from "./logo"
import Menu from "./menu"

export default function Navbar({school=""}) {
    return (
        <div className="">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <Logo size="sm" />

              </div>
              <div>
                <h1 className="text-xl font-bold">Apex 2025</h1>
                {school && (
                    <p className="text-sm text-gray-600">special invitation to {school}</p>
                )}
              </div>
            </div>
            
            <Menu />
          </div>
        </div>
      </div>
    )
}