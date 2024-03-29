import Head from 'next/head'
import Script from 'next/script'
import React from 'react'

const HeadTag = (): JSX.Element => {
    return (
        <>
            <Head>
                <title key="title">{process.env.NEXT_PUBLIC_TITLE}</title>
                <meta charSet="utf-8" />
                <meta name="viewport" content="minimal-ui, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></meta>

                <meta key="description" name="description" content={process.env.NEXT_PUBLIC_DESCRIPTION} />
                <meta key="keywords" name="keywords" content={process.env.NEXT_PUBLIC_KEYWORDS} />
                <meta key="author" name="author" content={process.env.NEXT_PUBLIC_AUTHOR} />

                <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
                <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
                <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
                <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
                <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
                <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
                <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
                <link rel="icon" type="image/png" sizes="192x192"  href="/android-icon-192x192.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="msapplication-TileColor" content="#ffffff" />
                <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />

                <meta key="og:site_name" property="og:site_name" content={process.env.NEXT_PUBLIC_OG_SITE_NAME} />
                <meta key="og:type" property="og:type" content="website" />
                <meta key="og:image" property="og:image" content={process.env.NEXT_PUBLIC_OG_IMAGE} />
                <meta key="og:image:alt" property="og:image:alt" content={process.env.NEXT_PUBLIC_OG_IMAGE_ALT} />
                <meta key="og:title" property="og:title" content={process.env.NEXT_PUBLIC_OG_TITLE} />
                <meta key="og:description" property="og:description" content={process.env.NEXT_PUBLIC_OG_DESCRIPTION} />
                <meta key="og:url" property="og:url" content={process.env.NEXT_PUBLIC_OG_URL} />

                <link key="canonical" rel="canonical" href={process.env.NEXT_PUBLIC_CANONICAL} />
                <link rel="search" type="application/opensearchdescription+xml" title={process.env.NEXT_PUBLIC_TITLE} href="/opensearch.xml" />
            </Head>

            <Script async={true} src="https://www.googletagmanager.com/gtag/js?id=UA-116660263-2" />

            <Script
                id="googletagmanager"
                dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            gtag('config', 'UA-116660263-2');`
                }}
            />
        </>
    )
}

export default HeadTag