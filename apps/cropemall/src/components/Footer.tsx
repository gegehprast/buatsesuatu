const Footer = () => {
    return (
        <footer
            className={`absolute bottom-0 left-0 w-full p-4 text-center text-xs text-gray-500`}
        >
            <p>
                <label className="font-semibold">
                    All your files never leave your browser.
                </label>{' '}
                <label>Mobile currently not supported.</label>{' '}
                <label>
                    Source code available on{' '}
                    <a
                        href="https://github.com/gegehprast/buatsesuatu/tree/main/apps/cropemall"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500"
                    >
                        Github
                    </a>
                    .
                </label>
            </p>
        </footer>
    )
}

export default Footer
