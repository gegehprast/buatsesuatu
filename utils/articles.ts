import Axios, { AxiosResponse, CancelToken } from 'axios'
import cookie from 'js-cookie'
import { isServer } from './util'

interface GetArticlesParams {
    page: number
    limit: number
    search?: string
    tags?: string
    cancelToken?: CancelToken
    onSuccess: (res: AxiosResponse) => void
    onError: (e: any) => void
}

interface GetOneArticlesParams {
    slug: string
    cancelToken?: CancelToken
    onSuccess: (res: AxiosResponse) => void
    onError: (e: any) => void
}

interface StoreArticleParams {
    title: string
    desc: string 
    cover: string
    caption: string
    content: string
    tags: string
    status: string
}

interface UpdateArticleParams extends StoreArticleParams {
    id: string
}

/** Get paginated article list. */
export const getArticles = ({ page, limit, search, tags, cancelToken, onSuccess, onError }: GetArticlesParams): void => {
    let headers = {}

    if (!isServer() && cookie.get('loggedinToken')) {
        headers = {
            Authorization: cookie.get('loggedinToken'),
        }
    }

    Axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_API_HOST}/articles/`,
        params: { page, limit, search, tags },
        cancelToken: cancelToken,
        headers: headers,
    })
        .then((res: AxiosResponse) => {
            onSuccess(res)
        })
        .catch((e: any) => {
            if (Axios.isCancel(e)) return

            onError(e)
        })
}

/** Get one article by slug */
export const getOneArticle = ({ slug, cancelToken, onSuccess, onError }: GetOneArticlesParams): void => {
    Axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_API_HOST}/articles/${slug}`,
        cancelToken: cancelToken
    }).then(res => {
        onSuccess(res)
    }).catch(e => {
        if (Axios.isCancel(e)) return

        onError(e)
    })
}

export const storeArticle = ({ title, desc, cover, caption, content, tags, status }: StoreArticleParams): Promise<Article> => {
    return new Promise((resolve, reject) => {
        Axios({
            method: 'POST',
            url: `${process.env.NEXT_PUBLIC_API_HOST}/articles/`,
            data: { title, desc, cover, caption, content, tags, status },
            headers: {
                Authorization: cookie.get('loggedinToken')
            }
        }).then((res: AxiosResponse) => {
            resolve(res.data)
        }).catch((e) => {
            reject(e)
        })
    })
}

export const updateArticle = ({ id, title, desc, cover, caption, content, tags, status }: UpdateArticleParams): Promise<Article> => {
    return new Promise((resolve, reject) => {
        Axios({
            method: 'PUT',
            url: `${process.env.NEXT_PUBLIC_API_HOST}/articles/${id}`,
            data: { title, desc, cover, caption, content, tags, status },
            headers: {
                Authorization: cookie.get('loggedinToken')
            }
        }).then((res: AxiosResponse) => {
            resolve(res.data)
        }).catch((e) => {
            reject(e)
        })
    })
}

export const deleteArticle = (id: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        Axios({
            method: 'DELETE',
            url: `${process.env.NEXT_PUBLIC_API_HOST}/articles/${id}`,
            headers: {
                Authorization: cookie.get('loggedinToken')
            }
        }).then((res: AxiosResponse) => {
            resolve(res.status === 200)
        }).catch((e) => {
            reject(e)
        })
    })
}