import Head from 'next/head'
import useArticle from '../../components/Hooks/useArticle'
import { useRouter } from 'next/dist/client/router'

const Article = (): React.ReactElement => {
    const router = useRouter()
    const { article } = useArticle({ slug: router.query.slug as string})

    return (
        <div className="w-full">
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="p-3 mx-auto mt-3 md:w-3/4 lg:w-5/6 xl:w-1/2 xxl-1344:w-4/6 xxl-1920:w-1/2 xxl-4k:w-1/3">
                {/* Title */}
                <h1 className="px-1 text-lg font-bold leading-none">
                    {article.title}
                </h1>

                {/* Container */}
                <div className="flex flex-col flex-wrap px-1 mt-6 w-100">
                    <div className="relative w-full min-h-full h-210-px md:h-480-px">
                        <img className="absolute object-cover w-full h-full" src={article.cover} alt="Sunset in the mountains" />
                        <div className="absolute object-cover w-full h-full bg-black opacity-25" />
                    </div>

                    <div className="mt-8">
                        <p>
                            {article.text}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Article