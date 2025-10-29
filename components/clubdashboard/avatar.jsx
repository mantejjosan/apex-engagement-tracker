export default function StudentAvatar({initials="XY", name="", institute="", points=0}) {
    return (
        <div className="flex w-12 h-12 font-medium text-xl rounded-full border-3 border-gradient-to-r from-blue-500 to-purple-500">
            {initials}
        </div>
    )
}