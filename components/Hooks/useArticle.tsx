import { useState, useEffect } from 'react'
import axios from 'axios'

interface Props {
    slug: string
}

type ArticleHook = {
    loading: boolean,
    error: boolean,
    article: Article,
}

const useArticle = ({ slug }: Props): ArticleHook => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [article, setarticle] = useState<Article | any>({})

    useEffect(() => {
        let cancel: () => void

        setLoading(true)

        setError(false)

        axios({
            method: 'GET',
            url: `/api/articles/${slug}`,
            cancelToken: new axios.CancelToken(c => cancel = c)
        }).then(res => {
            setarticle(res.data)
            
            setLoading(false)
        }).catch(e => {
            if (axios.isCancel(e)) return

            setLoading(false)

            setError(true)
        })

        return () => cancel()
    }, [slug])

    return {
        loading,
        error,
        article,
    }
}

export default useArticle