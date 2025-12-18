
const DocRefModal = ({ entries }) => {
    if (!entries?.length) return <p>No documents available.</p>;
    return (
        <div>
            {entries && entries.length > 0 && entries.map((entry, index) => (
                <div key={entry.pdf_url} className=' border border-gray-300 rounded p-2 mb-2 '>
                    <h3 className="text-start  mb-2">{index + 1}: <a className="hover:text-blue-400" href={`/${entry.pdf_url}`} target="_blank" rel="noopener noreferrer">{(entry.pdf_url).split('/').pop()}</a></h3>
                    <div className="flex gap-1 overflow-x-auto">
                        <p className="w-20 sm:w-auto">Pages:</p>
                        {entry.pages && entry.pages.length > 0 && entry.pages.map((page) => (
                            <div key={`${entry.pdf_url}-page-${page}`} className='w-15 bg-green-400 text-white rounded px-2 py-1 mb-1 cursor-pointer hover:bg-green-500'>
                                <a href={`/${entry.pdf_url}#page=${page}`} target="_blank" rel="noopener noreferrer">{page}</a>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default DocRefModal