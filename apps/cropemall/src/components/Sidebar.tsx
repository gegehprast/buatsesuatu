const Sidebar = () => {
    return (
        <aside className="static inset-0 left-0 z-50 w-64 border-l-2 shadow border-mf-500">
            <h1 className="p-4 text-xl font-semibold text-center text-mf-600">
                cropemall
            </h1>

            <nav className="p-4">
                {/* detect faces button */}
                <button className="w-full p-2 mb-4 text-white rounded-md bg-mf-500">
                    Detect Faces
                </button>

                {/*  */}

                {/* crop button */}
                <button className="w-full p-2 mb-4 text-white rounded-md bg-mf-500">
                    Crop
                </button>
            </nav>
        </aside>
    )
}

export default Sidebar
