import React from 'react'
import ReactMarkdown from 'react-markdown'
import slugify from 'react-slugify'

interface Props {
    children: string
    level?: number
}

const Heading2 = (props: Props): JSX.Element => {
    if (props.level === 2) {
        const href = slugify(props.children)

        return <h2 id={href}>
            <a href={`#${href}`} className="text-xl font-bold text-indigo-600 sm:text-2xl visited:text-purple-600 hover:text-indigo-800"># {props.children}</a>
        </h2>
    }

    const Heading = ReactMarkdown.renderers.heading
    return <Heading {...props} />
}

export default Heading2