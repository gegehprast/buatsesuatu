import { useState, useEffect, useContext } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import ReactPlaceholder from 'react-placeholder'
import Card from '../components/Card'
import MyPagination from '../components/Pagination'
import useArticles from '../components/Hooks/useArticles'
import { useRouter } from 'next/dist/client/router'
import { pushRouterQueries } from '../utils/util'
import { LoadingProgressContext } from '../components/Context/LoadingProgress'
import { getArticles, deleteArticle, updateArticle as updateArticleApi } from '../utils/articles'
import { AuthContext } from '../components/Context/AuthContext'
import CardsPlaceHolder from '../components/CardsPlaceHolder'

const limit = 12

interface Props {
    initial?: {
        articles: Article[]
        total: number
        totalPage: number
    }
}

const Home: NextPage<Props> = ({ initial }) => {
    const router = useRouter()
    const [search, setSearch] = useState<string>(router.query.search ? router.query.search as string : '')
    const [tags, setTags] = useState<string>(router.query.tags ? router.query.tags as string : '')
    const [page, setPage] = useState(router.query.page ? parseInt(router.query.page as string) : 1)
    const { articles, total, loading, removeArticle, totalPage, updateArticle } = useArticles({ page, limit, search, tags, initial })
    const { setPageLoading } = useContext(LoadingProgressContext)
    const { user } = useContext(AuthContext)

    useEffect(() => {
        setSearch(router.query.search ? router.query.search as string : '')
    }, [router.query.search])

    useEffect(() => {
        setTags(router.query.tags ? router.query.tags as string : '')
    }, [router.query.tags])

    useEffect(() => {
        setPage(router.query.page ? parseInt(router.query.page as string) : 1)
    }, [router.query.page])

    useEffect(() => {
        if (!loading) {
            setPageLoading(false)
        }
    }, [loading, setPageLoading])

    const handlePageChange = (pageNumber: number) => {
        if (page === pageNumber) {
            return
        }
        
        setPageLoading(true)
        pushRouterQueries(router, {
            params: { page: pageNumber },
            resetScroll: true,
        })
    }

    const handlePublishArticle = async (article: Article, status: 'published' | 'preview') => {
        if (confirm('Update postingan ini?')) {
            await updateArticleApi({
                id: article._id || '',
                title: article.title, 
                desc: article.desc, 
                cover: article.cover || '', 
                caption: article.caption || '', 
                content: article.content, 
                tags: article.tags && article.tags.join(',') || '', 
                status: status
            })
            
            updateArticle(article._id as string, { status })
        }
    }

    const handleDeleteArticle = async (id: string) => {
        if (confirm('Hapus postingan ini?')) {
            const destroy = await deleteArticle(id)

            if (destroy === true) {
                removeArticle(id)
            }
        }
    }
    
    return (
        <div className="w-full">
            <main className="p-3 mx-auto mt-3 md:w-3/4 lg:w-5/6 xl:w-1/2 xxl-1344:w-4/6 xxl-1920:w-1/2 xxl-4k:w-1/3">
                {/* Title */}
                <h1 className="px-1 text-lg font-bold leading-none">
                    Postingan
                </h1>

                {/* Container */}
                <ReactPlaceholder ready={!loading} customPlaceholder={<CardsPlaceHolder />}>
                    <>
                    </>
                </ReactPlaceholder>

                <div className={`flex flex-wrap w-full min-h-full mt-6 ${loading && 'hidden'}`}>
                    {articles.length < 1 && <div className="w-full mt-4 text-lg font-bold text-center">Belum ada postingan.</div>}

                    {/* Cards */}
                    {articles.map((article) => (
                        <Card key={article._id}
                            title={article.title}
                            cover={article.cover}
                            text={article.desc}
                            tags={article.tags || []}
                            link={{ href: '/articles/[slug]', as: `/articles/${article.slug}` }}
                            search={search}
                        >
                            <div className="bg-gray-500">
                                {user && <div className="p-2">
                                    <div className="flex">
                                        <Link href="/articles/[slug]/edit" as={`/articles/${article.slug}/edit`}>
                                            <a className="p-2 leading-none text-white bg-indigo-500 rounded dark-text-white hover:bg-indigo-600 active:bg-indigo-700">
                                                Edit
                                            </a>
                                        </Link>

                                        <button
                                            className={
                                                `p-2 ml-2 leading-none text-white dark-text-white rounded ${
                                                    article.status === 'published' ?
                                                        'bg-orange-500 hover:bg-orange-600 active:bg-orange-700' :
                                                        'bg-green-500 hover:bg-green-600 active:bg-green-700'
                                                }`
                                            }
                                            onClick={() => handlePublishArticle(article, article.status === 'published' ? 'preview' : 'published')}
                                        >
                                            {article.status === 'published' ? 'Unpublish' : 'Publish'}
                                        </button>

                                        <button className="p-2 ml-2 leading-none text-white bg-red-600 rounded dark-text-white hover:bg-red-700 active:bg-red-500"
                                            onClick={() => handleDeleteArticle(article._id as string)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Secondary container */}
                {totalPage > 1 && <div className="flex flex-wrap w-full min-h-full mt-6">
                    <MyPagination onChange={handlePageChange} totalItemsCount={total} activePage={page} itemsCountPerPage={limit} />
                </div>}
            </main>
        </div>
    )
}

Home.getInitialProps = async ({ req, query }) => {
    let initial = {
        articles: [],
        total: 0,
        totalPage: 0
    }

    if (req) {
        const res: any = await new Promise(resolve => {
            getArticles({
                page: query.page ? parseInt(query.page as string) : 1,
                search: query.search ? query.search as string : '',
                tags: query.tags ? query.tags as string : '',
                limit,
                onSuccess: (res) => {
                    resolve(res.data)
                },
                onError: () => {
                    resolve({})
                }
            })
        })

        initial = {
            articles: res.docs || [],
            total: res.totalDocs || 0,
            totalPage: res.totalPages || 0
        }
    }

    return { initial }
}

export default Home
